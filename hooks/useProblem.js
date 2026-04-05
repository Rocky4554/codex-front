import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";

const fetchProblem = async (slug) => {
    const { data } = await api.get(`/problems/${slug}`);
    return data;
};

export const useProblem = (slug) =>
    useQuery({
        queryKey: ["problem", slug],
        queryFn: () => fetchProblem(slug),
        enabled: !!slug,
        staleTime: 1000 * 60 * 10, // 10 min
    });
