import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";

const fetchSampleTestCases = async (problemId) => {
    const { data } = await api.get(`/test-cases/problem/${problemId}/samples`);
    return data;
};

export const useSampleTestCases = (problemId) =>
    useQuery({
        queryKey: ["testcases", "samples", problemId],
        queryFn: () => fetchSampleTestCases(problemId),
        enabled: !!problemId,
        staleTime: 1000 * 60 * 10,
    });
