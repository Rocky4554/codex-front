import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { logoutAction } from "@/app/actions/auth";

// Centralised sign-out handler that exposes an `isLoggingOut` flag so the UI
// can show a loading state while the cookie + client store are cleared.
export function useLogout() {
    const { logout } = useAuthStore();
    const router = useRouter();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const signOut = async (redirectTo = "/") => {
        if (isLoggingOut) return;
        setIsLoggingOut(true);
        try {
            await logoutAction(); // clear server-side cookie
            logout(); // clear Zustand store
            router.push(redirectTo);
        } catch {
            // Re-enable the button so the user can retry on failure
            setIsLoggingOut(false);
        }
    };

    return { signOut, isLoggingOut };
}
