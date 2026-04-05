"use client";
import { useState } from "react";
import { useRegister } from "@/hooks/useAuth";
import Link from "next/link";

export function RegisterForm() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { mutate: register, isPending, error } = useRegister();

    const handleSubmit = (e) => {
        e.preventDefault();
        register({ username, email, password });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-green-500 transition-colors"
                required
            />
            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-green-500 transition-colors"
                required
            />
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-green-500 transition-colors"
                required
                minLength={6}
            />
            {error && (
                <p className="text-red-400 text-sm">
                    {error.message || "Registration failed"}
                </p>
            )}
            <button
                type="submit"
                disabled={isPending}
                className="w-full py-2.5 bg-green-500 hover:bg-green-400 text-black font-semibold rounded-lg disabled:opacity-50 transition-colors"
            >
                {isPending ? "Creating account..." : "Create Account"}
            </button>
            <p className="text-zinc-500 text-sm text-center">
                Already have an account?{" "}
                <Link href="/login" className="text-green-400 hover:text-green-300">
                    Sign In
                </Link>
            </p>
        </form>
    );
}
