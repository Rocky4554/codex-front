import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";

const fetchProblems = async () => {
    // The API pages at 100 by default; the catalog is larger, so ask for all of it.
    const { data } = await api.get("/problems", { params: { size: 1000, sort: "orderNum" } });
    return data.content ?? data;
};

export const useProblems = () =>
    useQuery({
        queryKey: ["problems"],
        queryFn: fetchProblems,
    });
