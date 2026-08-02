"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { verifyOtpAction } from "@/app/actions/auth";

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
            {pending ? "Verifying..." : "Verify code"}
        </button>
    );
}

export function VerifyOtpForm() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [state, action] = useActionState(verifyOtpAction, null);

    useEffect(() => {
        const stored = sessionStorage.getItem("password-reset-email") || "";
        setEmail(stored);
        if (!stored) {
            router.replace("/auth/forgot-password");
        }
    }, [router]);

    useEffect(() => {
        if (state?.success && state.resetToken) {
            sessionStorage.setItem("password-reset-token", state.resetToken);
            router.push("/auth/reset-password");
        }
    }, [state, router]);

    if (!email) {
        return <p className="text-zinc-500 text-sm">Redirecting...</p>;
    }

    return (
        <form action={action} className="space-y-4" autoComplete="one-time-code">
            <input type="hidden" name="email" value={email} />
            <p className="text-zinc-400 text-sm">
                Enter the 6-digit code sent to{" "}
                <span className="text-zinc-200">{email}</span>
            </p>
            <input
                name="otp"
                type="text"
                inputMode="numeric"
                pattern="\d{6}"
                maxLength={6}
                autoComplete="one-time-code"
                placeholder="6-digit code"
                className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white tracking-[0.35em] text-center text-lg placeholder-zinc-500 focus:outline-none focus:border-green-500 transition-colors"
                required
            />
            {state?.error && <p className="text-red-400 text-sm">{state.error}</p>}
            <SubmitButton />
            <p className="text-zinc-500 text-sm text-center">
                Didn&apos;t get a code?{" "}
                <Link href="/auth/forgot-password" className="text-green-400 hover:text-green-300">
                    Request again
                </Link>
            </p>
        </form>
    );
}
