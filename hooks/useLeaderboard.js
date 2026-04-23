import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { useAuthStore } from "@/store/authStore";

const fetchLeaderboard = async () => {
    const { data } = await api.get("/leaderboard");
    return Array.isArray(data) ? data : (data?.content ?? []);
};

export const useLeaderboard = () => {
    const { isLoggedIn } = useAuthStore();

    return useQuery({
        queryKey: ["leaderboard"],
        queryFn: fetchLeaderboard,
        enabled: isLoggedIn,
        staleTime: 1000 * 60,
    });
};
