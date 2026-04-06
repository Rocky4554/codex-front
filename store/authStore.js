import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuthStore = create(
    persist(
        (set) => ({
            user: null,
            isLoggedIn: false,

            setAuth: (user) => {
                set({ user, isLoggedIn: true });
            },

            logout: async () => {
                await fetch("/api/auth/logout", { method: "POST" });
                set({ user: null, isLoggedIn: false });
            },
        }),
        {
            name: "auth-storage",
        }
    )
);
