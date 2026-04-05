import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

export const useLogin = () => {
    const { setAuth } = useAuthStore();
    const router = useRouter();

    return useMutation({
        mutationFn: async (payload) => {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || err.error || "Login failed");
            }
            return res.json();
        },
        onSuccess: ({ user, token }) => {
            setAuth(user, token);
            router.push("/problems");
        },
    });
};

export const useRegister = () => {
    const { setAuth } = useAuthStore();
    const router = useRouter();

    return useMutation({
        mutationFn: async (payload) => {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || err.error || "Registration failed");
            }
            return res.json();
        },
        onSuccess: ({ user, token }) => {
            setAuth(user, token);
            router.push("/problems");
        },
    });
};
