import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";

const fetchProblems = async () => {
    const { data } = await api.get("/problems");
    return data.content ?? data;
};

export const useProblems = () =>
    useQuery({
        queryKey: ["problems"],
        queryFn: fetchProblems,
    });
