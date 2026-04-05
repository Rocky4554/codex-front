import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";

const fetchLanguages = async () => {
    const { data } = await api.get("/languages");
    return data;
};

export const useLanguages = () =>
    useQuery({
        queryKey: ["languages"],
        queryFn: fetchLanguages,
        staleTime: 1000 * 60 * 60, // 1 hour — languages rarely change
    });
