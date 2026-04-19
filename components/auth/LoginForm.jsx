"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { loginAction } from "@/app/actions/auth";
import Link from "next/link";

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending}
            className="w-full py-2.5 bg-green-500 hover:bg-green-400 text-black font-semibold rounded-lg disabled:opacity-50 transition-colors"
        >
            {pending ? "Signing in..." : "Sign In"}
        </button>
    );
}

export function LoginForm() {
    const { setAuth } = useAuthStore();
    const router = useRouter();
    const [state, action] = useActionState(loginAction, null);

    useEffect(() => {
        if (state?.user) {
            setAuth(state.user);
            router.push("/problems");
        }
    }, [state]);

    return (
        <form action={action} className="space-y-4">
            <input
                name="username"
                type="text"
                placeholder="Username"
                className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-green-500 transition-colors"
                required
            />
            <input
                name="password"
                type="password"
                placeholder="Password"
                className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-green-500 transition-colors"
                required
            />
            {state?.error && (
                <p className="text-red-400 text-sm">{state.error}</p>
            )}
            <SubmitButton />
            <p className="text-zinc-500 text-sm text-center">
                Don&apos;t have an account?{" "}
                <Link href="/auth/register" className="text-green-400 hover:text-green-300">
                    Register
                </Link>
            </p>
        </form>
    );
}
