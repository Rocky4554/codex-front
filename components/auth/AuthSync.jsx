"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { queryClient } from "@/lib/queryClient";

const PROTECTED_PREFIXES = ["/problems", "/playlists", "/leaderboard", "/admin", "/dashboard"];

/**
 * Keeps Zustand (localStorage) in sync with the real httpOnly cookie session.
 * Fixes: UI shows logged-in name from stale localStorage while APIs fail (no/invalid cookie).
 */
export function AuthSync() {
    const pathname = usePathname();
    const router = useRouter();
    const setAuth = useAuthStore((s) => s.setAuth);
    const clearAuth = useAuthStore((s) => s.clearAuth);
    const setAuthReady = useAuthStore((s) => s.setAuthReady);

    useEffect(() => {
        let cancelled = false;

        (async () => {
            try {
                const res = await fetch("/api/auth/session", { cache: "no-store" });
                const data = await res.json();
                if (cancelled) return;

                if (data.authenticated && data.user) {
                    setAuth(data.user);
                } else {
                    clearAuth();
                    queryClient.clear();
                    const isProtected = PROTECTED_PREFIXES.some((p) => pathname?.startsWith(p));
                    if (isProtected) {
                        router.replace("/auth/login");
                    }
                }
            } catch {
                if (!cancelled) setAuthReady(true);
            }
        })();

        return () => {
            cancelled = true;
        };
        // Run once on mount; pathname used only for redirect decision at that moment
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return null;
}
