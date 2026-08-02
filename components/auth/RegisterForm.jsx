"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { registerAction } from "@/app/actions/auth";
import Link from "next/link";
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
            {pending ? "Creating account..." : "Create Account"}
        </button>
    );
}

export function RegisterForm() {
    const { setAuth } = useAuthStore();
    const router = useRouter();
    const [state, action] = useActionState(registerAction, null);
    const [password, setPassword] = useState("");

    useEffect(() => {
        if (state?.user) {
            setAuth(state.user);
            queryClient.clear();
            router.push("/problems");
        }
    }, [state, setAuth, router]);

    const strong = isPasswordStrong(password);

    return (
        <form action={action} className="space-y-4" autoComplete="on">
            <input
                name="username"
                type="text"
                autoComplete="username"
                placeholder="Username"
                className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-green-500 transition-colors"
                required
            />
            <input
                name="email"
                type="email"
                autoComplete="email"
                placeholder="Email"
                className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-green-500 transition-colors"
                required
            />
            <div className="space-y-2">
                <PasswordInput
                    name="password"
                    autoComplete="new-password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    minLength={8}
                />
                <PasswordRequirements password={password} />
            </div>
            {state?.error && <p className="text-red-400 text-sm">{state.error}</p>}
            <SubmitButton disabled={!strong} />
            <p className="text-zinc-500 text-sm text-center">
                Already have an account?{" "}
                <Link href="/auth/login" className="text-green-400 hover:text-green-300">
                    Sign In
                </Link>
            </p>
        </form>
    );
}
