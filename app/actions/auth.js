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
    cookieStore.delete("auth_token");
    redirect("/auth/login");
}
