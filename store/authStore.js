import { create } from "zustand";
import { persist } from "zustand/middleware";
import { setApiToken } from "@/lib/tokenStore";

export const useAuthStore = create(
    persist(
        (set) => ({
            user: null,
            token: null,
            isLoggedIn: false,

            setAuth: (user, token) => {
                setApiToken(token);
                set({ user, token, isLoggedIn: true });
            },

            logout: async () => {
                await fetch("/api/auth/logout", { method: "POST" });
                setApiToken(null);
                set({ user: null, token: null, isLoggedIn: false });
            },
        }),
        {
            name: "auth-storage",
            // Rehydrate token into module store after page reload
            onRehydrateStorage: () => (state) => {
                if (state?.token) setApiToken(state.token);
            },
        }
    )
);
