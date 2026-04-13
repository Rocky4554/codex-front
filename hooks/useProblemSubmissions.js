import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { useAuthStore } from "@/store/authStore";

const fetchProblemSubmissions = async (problemId) => {
    const { data } = await api.get("/submissions", { params: { problemId } });
    return Array.isArray(data) ? data : [];
};

export const useProblemSubmissions = (problemId) => {
    const { isLoggedIn } = useAuthStore();
    return useQuery({
        queryKey: ["problem-submissions", problemId],
        queryFn: () => fetchProblemSubmissions(problemId),
        enabled: isLoggedIn && !!problemId,
        staleTime: 1000 * 10, // 10s — submissions update frequently
    });
};
