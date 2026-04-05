import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { useAuthStore } from "@/store/authStore";

const fetchUserProblems = async () => {
    const { data } = await api.get("/user/problems");
    return Array.isArray(data) ? data : (data?.content ?? []);
};

export const useUserProblems = () => {
    const { isLoggedIn } = useAuthStore();
    return useQuery({
        queryKey: ["user-problems"],
        queryFn: fetchUserProblems,
        enabled: isLoggedIn,
        staleTime: 1000 * 60 * 5, // 5 min
    });
};
