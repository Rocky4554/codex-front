"use client";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export function Navbar() {
    const { user, isLoggedIn, logout } = useAuthStore();
    const router = useRouter();

    // Fix hydration mismatch with Zustand persist
    const [hydrated, setHydrated] = useState(false);
    useEffect(() => setHydrated(true), []);

    const handleLogout = async () => {
        await logout();
        router.push("/login");
    };

    return (
        <nav className="h-12 flex items-center justify-between px-6 border-b border-zinc-800 bg-zinc-900/50 backdrop-blur sticky top-0 z-50">
            <Link href="/problems" className="text-white font-bold text-lg">
                ⚡ CodeArena
            </Link>
            <div className="flex items-center gap-4">
                {!hydrated ? null : isLoggedIn ? (
                    <>
                        <span className="text-zinc-400 text-sm">{user?.username}</span>
                        {user?.role === "ADMIN" && (
                            <Link href="/admin" className="text-sm text-amber-400 hover:text-amber-300 transition-colors font-medium">
                                Admin
                            </Link>
                        )}
                        <button
                            onClick={handleLogout}
                            className="text-sm text-zinc-400 hover:text-white transition-colors"
                        >
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <Link href="/login" className="text-sm text-zinc-400 hover:text-white">
                            Login
                        </Link>
                        <Link
                            href="/register"
                            className="text-sm bg-green-500 text-black px-3 py-1 rounded font-medium hover:bg-green-400"
                        >
                            Register
                        </Link>
                    </>
                )}
            </div>
        </nav>
    );
}
