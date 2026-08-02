"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { resetPasswordAction } from "@/app/actions/auth";
import { useAuthStore } from "@/store/authStore";
import { queryClient } from "@/lib/queryClient";
import { PasswordInput } from "@/components/auth/PasswordInput";
import {
    PasswordRequirements,
    isPasswordStrong,
} from "@/components/auth/PasswordRequirements";

function SubmitButton({ disabled }) {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending || disabled}
            className="w-full py-2.5 bg-green-500 hover:bg-green-400 text-black font-semibold rounded-lg disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
        >
            {pending && (
                <span className="w-4 h-4 border-2 border-black/60 border-t-transparent rounded-full animate-spin" />
            )}
            {pending ? "Updating..." : "Update password"}
        </button>
    );
}

export function ResetPasswordForm() {
    const router = useRouter();
    const clearAuth = useAuthStore((s) => s.clearAuth);
    const [resetToken, setResetToken] = useState("");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [state, action] = useActionState(resetPasswordAction, null);

    useEffect(() => {
        const token = sessionStorage.getItem("password-reset-token") || "";
        setResetToken(token);
        if (!token) {
            router.replace("/auth/forgot-password");
        }
    }, [router]);

    useEffect(() => {
        if (state?.success) {
            sessionStorage.removeItem("password-reset-token");
            sessionStorage.removeItem("password-reset-email");
            clearAuth();
            queryClient.clear();
            router.push("/auth/login");
        }
    }, [state, clearAuth, router]);

    if (!resetToken) {
        return <p className="text-zinc-500 text-sm">Redirecting...</p>;
    }

    const strong = isPasswordStrong(password);
    const matches = password.length > 0 && password === confirm;

    return (
        <form action={action} className="space-y-4" autoComplete="on">
            <input type="hidden" name="resetToken" value={resetToken} />
            <div className="space-y-2">
                <PasswordInput
                    name="password"
                    autoComplete="new-password"
                    placeholder="New password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    minLength={8}
                />
                <PasswordRequirements password={password} />
            </div>
            <PasswordInput
                name="confirmPassword"
                autoComplete="new-password"
                placeholder="Confirm new password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                minLength={8}
            />
            {confirm && !matches && (
                <p className="text-red-400 text-sm">Passwords do not match</p>
            )}
            {state?.error && <p className="text-red-400 text-sm">{state.error}</p>}
            <SubmitButton disabled={!strong || !matches} />
            <p className="text-zinc-500 text-sm text-center">
                <Link href="/auth/login" className="text-green-400 hover:text-green-300">
                    Back to sign in
                </Link>
            </p>
        </form>
    );
}
