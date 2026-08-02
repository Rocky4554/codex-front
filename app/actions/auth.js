"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const BACKEND = process.env.BACKEND_URL;

export async function loginAction(prevState, formData) {
    const username = formData.get("username");
    const password = formData.get("password");

    let data;
    try {
        const res = await fetch(`${BACKEND}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
        });
        data = await res.json();
        if (!res.ok) return { error: data.message || data.error || "Login failed" };
    } catch {
        return { error: "Cannot reach server" };
    }

    const cookieStore = await cookies();
    cookieStore.set("auth_token", data.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
    });

    return {
        user: {
            id: data.userId,
            username: data.username,
            email: data.email,
            role: data.role,
        },
    };
}

export async function registerAction(prevState, formData) {
    const username = formData.get("username");
    const email = formData.get("email");
    const password = formData.get("password");

    let data;
    try {
        const res = await fetch(`${BACKEND}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, email, password }),
        });
        data = await res.json();
        if (!res.ok) return { error: data.message || data.error || "Registration failed" };
    } catch {
        return { error: "Cannot reach server" };
    }

    const cookieStore = await cookies();
    cookieStore.set("auth_token", data.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
    });

    return {
        user: {
            id: data.userId,
            username: data.username,
            email: data.email,
            role: data.role,
        },
    };
}

export async function logoutAction() {
    const cookieStore = await cookies();
    cookieStore.set("auth_token", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 0,
        path: "/",
    });
}

function errorMessage(data, fallback) {
    if (!data) return fallback;
    if (typeof data.message === "string" && data.message) return data.message;
    if (typeof data.error === "string" && data.error) return data.error;
    return fallback;
}

export async function forgotPasswordAction(prevState, formData) {
    const email = String(formData.get("email") || "").trim();
    if (!email) return { error: "Email is required" };

    try {
        const res = await fetch(`${BACKEND}/auth/forgot-password`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) return { error: errorMessage(data, "Could not send reset code") };
        return { success: true, message: data.message, email };
    } catch {
        return { error: "Cannot reach server" };
    }
}

export async function verifyOtpAction(prevState, formData) {
    const email = String(formData.get("email") || "").trim();
    const otp = String(formData.get("otp") || "").trim();
    if (!email || !otp) return { error: "Email and OTP are required" };

    try {
        const res = await fetch(`${BACKEND}/auth/verify-otp`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, otp }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) return { error: errorMessage(data, "Invalid OTP"), email };
        return { success: true, resetToken: data.resetToken, message: data.message, email };
    } catch {
        return { error: "Cannot reach server", email };
    }
}

export async function resetPasswordAction(prevState, formData) {
    const password = String(formData.get("password") || "");
    const confirm = String(formData.get("confirmPassword") || "");
    const resetToken = String(formData.get("resetToken") || "");

    if (!resetToken) return { error: "Reset session expired. Request a new OTP." };
    if (password !== confirm) return { error: "Passwords do not match" };

    try {
        const res = await fetch(`${BACKEND}/auth/reset-password`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${resetToken}`,
            },
            body: JSON.stringify({ password }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) return { error: errorMessage(data, "Could not reset password") };

        // Invalidate any leftover session cookie after password change
        const cookieStore = await cookies();
        cookieStore.set("auth_token", "", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 0,
            path: "/",
        });

        return { success: true, message: data.message };
    } catch {
        return { error: "Cannot reach server" };
    }
}
