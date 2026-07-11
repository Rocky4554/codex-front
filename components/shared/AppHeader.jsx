"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useLogout } from "@/hooks/useLogout";

function Brand() {
    return (
        <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-500">
                <span className="material-symbols-outlined text-[20px]">code</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-white">SprintCode</span>
        </Link>
    );
}

function UserAvatar({ username }) {
    const letter = (username || "U").charAt(0).toUpperCase();
    return (
        <div className="flex h-full w-full items-center justify-center bg-emerald-600 text-xs font-bold text-white">
            {letter}
        </div>
    );
}

function navClass(active) {
    return active
        ? "text-sm font-medium text-emerald-500 transition-colors"
        : "text-sm font-medium text-zinc-400 hover:text-white transition-colors";
}

/**
 * Shared app header — same logo + SprintCode name everywhere
 * (landing, logged-in pages, admin).
 */
export function AppHeader({ active, badge }) {
    const pathname = usePathname();
    const { user, isLoggedIn, authReady } = useAuthStore();
    const { signOut, isLoggingOut } = useLogout();
    const [hydrated, setHydrated] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);

    useEffect(() => setHydrated(true), []);

    const current = active || (
        pathname?.startsWith("/admin") ? "admin"
            : pathname?.startsWith("/playlists") ? "playlists"
                : pathname?.startsWith("/leaderboard") ? "leaderboard"
                    : pathname?.startsWith("/problems") ? "problems"
                        : pathname === "/" ? "home"
                            : null
    );

    const showLoggedIn = hydrated && authReady && isLoggedIn && user;
    const showLoggedOut = hydrated && authReady && !isLoggedIn;

    return (
        <header className="sticky top-0 z-50 w-full border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-md">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-3 min-w-0">
                    <Brand />
                    {badge && (
                        <>
                            <div className="hidden sm:block w-px h-5 bg-zinc-700" />
                            <span className="hidden sm:inline text-sm font-semibold text-amber-400 truncate">{badge}</span>
                        </>
                    )}
                </div>

                <nav className="hidden md:flex items-center gap-6">
                    <Link className={navClass(current === "problems")} href="/problems">Problems</Link>
                    {showLoggedIn && (
                        <Link className={navClass(current === "playlists")} href="/playlists">Playlists</Link>
                    )}
                    <Link className={navClass(current === "leaderboard")} href="/leaderboard">Leaderboard</Link>
                    {showLoggedOut && (
                        <span className="text-sm font-medium text-zinc-600 cursor-not-allowed">Pricing</span>
                    )}
                    {showLoggedIn && user?.role === "ADMIN" && (
                        <Link className={navClass(current === "admin")} href="/admin">Admin</Link>
                    )}
                </nav>

                <div className="flex items-center gap-3">
                    {!showLoggedIn && !showLoggedOut ? (
                        <div className="h-8 w-20" />
                    ) : showLoggedIn ? (
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setShowUserMenu((v) => !v)}
                                className="flex items-center gap-2 pl-3 border-l border-zinc-800 cursor-pointer group"
                            >
                                <div className="relative h-8 w-8 overflow-hidden rounded-full ring-2 ring-transparent group-hover:ring-emerald-500 transition-all">
                                    <UserAvatar username={user?.username} />
                                </div>
                                <span className="hidden sm:block text-sm font-medium text-zinc-300">
                                    {user?.username || "User"}
                                </span>
                                <span className="material-symbols-outlined text-[20px] text-zinc-500">expand_more</span>
                            </button>
                            {showUserMenu && (
                                <div className="absolute right-0 mt-2 w-48 rounded-xl border border-zinc-800 bg-zinc-900 shadow-lg z-50">
                                    <div className="p-3 border-b border-zinc-800">
                                        <p className="text-sm font-semibold text-white">{user?.username}</p>
                                        <p className="text-xs text-zinc-500 truncate">{user?.email}</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => signOut("/")}
                                        disabled={isLoggingOut}
                                        className="w-full text-left px-4 py-3 text-sm text-rose-400 hover:bg-zinc-800 transition-colors flex items-center gap-2 disabled:opacity-60"
                                    >
                                        {isLoggingOut ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <span className="material-symbols-outlined text-[18px]">logout</span>
                                        )}
                                        {isLoggingOut ? "Signing out..." : "Sign out"}
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <>
                            <Link
                                href="/auth/login"
                                className="hidden sm:inline-flex text-sm font-medium text-zinc-400 hover:text-white transition-colors px-3 py-2"
                            >
                                Log In
                            </Link>
                            <Link
                                href="/auth/register"
                                className="inline-flex items-center rounded-lg bg-emerald-500 px-4 py-2 text-sm font-bold text-zinc-950 shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 transition-colors"
                            >
                                Sign Up
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}

/** @deprecated Use AppHeader — kept as alias for older imports */
export const Navbar = AppHeader;
