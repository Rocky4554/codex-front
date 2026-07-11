import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { logoutAction } from "@/app/actions/auth";
import { queryClient } from "@/lib/queryClient";

export function useLogout() {
    const clearAuth = useAuthStore((s) => s.clearAuth);
    const router = useRouter();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const signOut = async (redirectTo = "/") => {
        if (isLoggingOut) return;
        setIsLoggingOut(true);
        try {
            await logoutAction();
            clearAuth();
            queryClient.clear();
            router.push(redirectTo);
        } catch {
            clearAuth();
            queryClient.clear();
            setIsLoggingOut(false);
            router.push(redirectTo);
        }
    };

    return { signOut, isLoggingOut };
}
