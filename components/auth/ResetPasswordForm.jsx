"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { resetPasswordAction } from "@/app/actions/auth";
import { useAuthStore } from "@/store/authStore";
import { queryClient } from "@/lib/queryClient";

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending}
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

    return (
        <form action={action} className="space-y-4" autoComplete="on">
            <input type="hidden" name="resetToken" value={resetToken} />
            <input
                name="password"
                type="password"
                autoComplete="new-password"
                placeholder="New password"
                minLength={8}
                className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-green-500 transition-colors"
                required
            />
            <input
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                placeholder="Confirm new password"
                minLength={8}
                className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-green-500 transition-colors"
                required
            />
            <p className="text-zinc-500 text-xs">
                Use at least 8 characters with upper, lower, and a digit.
            </p>
            {state?.error && <p className="text-red-400 text-sm">{state.error}</p>}
            <SubmitButton />
            <p className="text-zinc-500 text-sm text-center">
                <Link href="/auth/login" className="text-green-400 hover:text-green-300">
                    Back to sign in
                </Link>
            </p>
        </form>
    );
}
