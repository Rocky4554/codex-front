import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuthStore = create(
    persist(
        (set) => ({
            user: null,
            isLoggedIn: false,
            /** False until we have checked the cookie against the server. */
            authReady: false,

            setAuth: (user) => {
                set({ user, isLoggedIn: true, authReady: true });
            },

            /** Clear client auth only (no network). Use after 401 or failed session check. */
            clearAuth: () => {
                set({ user: null, isLoggedIn: false, authReady: true });
            },

            setAuthReady: (authReady) => set({ authReady }),

            logout: async () => {
                try {
                    await fetch("/api/auth/logout", { method: "POST" });
                } catch {
                    // ignore network errors — still clear local state
                }
                set({ user: null, isLoggedIn: false, authReady: true });
            },
        }),
        {
            name: "auth-storage",
            // Don't persist authReady — always re-validate on load
            partialize: (state) => ({
                user: state.user,
                isLoggedIn: state.isLoggedIn,
            }),
        }
    )
);
