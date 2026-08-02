"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { forgotPasswordAction } from "@/app/actions/auth";

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
            {pending ? "Sending code..." : "Send reset code"}
        </button>
    );
}

export function ForgotPasswordForm() {
    const router = useRouter();
    const [state, action] = useActionState(forgotPasswordAction, null);

    useEffect(() => {
        if (state?.success && state.email) {
            sessionStorage.setItem("password-reset-email", state.email);
            router.push("/auth/verify-otp");
        }
    }, [state, router]);

    return (
        <form action={action} className="space-y-4" autoComplete="on">
            <input
                name="email"
                type="email"
                autoComplete="email"
                placeholder="Email"
                className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-green-500 transition-colors"
                required
            />
            {state?.error && <p className="text-red-400 text-sm">{state.error}</p>}
            {state?.success && state?.message && (
                <p className="text-green-400 text-sm">{state.message}</p>
            )}
            <SubmitButton />
            <p className="text-zinc-500 text-sm text-center">
                Remembered your password?{" "}
                <Link href="/auth/login" className="text-green-400 hover:text-green-300">
                    Sign in
                </Link>
            </p>
        </form>
    );
}
