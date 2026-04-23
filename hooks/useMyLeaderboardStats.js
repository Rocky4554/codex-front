import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { useAuthStore } from "@/store/authStore";

const fetchMyLeaderboardStats = async () => {
    const { data } = await api.get("/leaderboard/me");
    return data;
};

export const useMyLeaderboardStats = () => {
    const { isLoggedIn } = useAuthStore();

    return useQuery({
        queryKey: ["leaderboard", "me"],
        queryFn: fetchMyLeaderboardStats,
        enabled: isLoggedIn,
        staleTime: 1000 * 60,
    });
};
