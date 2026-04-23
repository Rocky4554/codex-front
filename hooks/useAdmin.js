import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";

export const useAdminUsers = () =>
    useQuery({
        queryKey: ["admin", "users"],
        queryFn: async () => {
            const { data } = await api.get("/admin/users");
            return data;
        },
    });

export const useAdminUserSubmissions = (userId) =>
    useQuery({
        queryKey: ["admin", "users", userId, "submissions"],
        queryFn: async () => {
            const { data } = await api.get(`/admin/users/${userId}/submissions`);
            return data;
        },
        enabled: !!userId,
    });

export const useAdminUserProblems = (userId) =>
    useQuery({
        queryKey: ["admin", "users", userId, "problems"],
        queryFn: async () => {
            const { data } = await api.get(`/admin/users/${userId}/problems`);
            return data;
        },
        enabled: !!userId,
    });

export const useUpdateUserRole = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ userId, role }) => api.put(`/admin/users/${userId}/role`, { role }),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "users"] }),
    });
};

export const useAdminProblemDetail = (problemId) =>
    useQuery({
        queryKey: ["admin", "problem", problemId],
        queryFn: async () => {
            const { data } = await api.get(`/problems/${problemId}/admin`);
            return data;
        },
        enabled: !!problemId,
    });

export const useCreateProblem = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (body) => api.post("/problems", body),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["problems"] });
            qc.invalidateQueries({ queryKey: ["admin", "problem"] });
        },
    });
};

export const useUpdateProblem = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, ...body }) => api.put(`/problems/${id}`, body),
        onSuccess: (_, variables) => {
            qc.invalidateQueries({ queryKey: ["problems"] });
            qc.invalidateQueries({ queryKey: ["admin", "problem", variables.id] });
        },
    });
};

export const useDeleteProblem = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id) => api.delete(`/problems/${id}`),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["problems"] });
            qc.invalidateQueries({ queryKey: ["admin", "problem"] });
        },
    });
};

export const useAddExample = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ problemId, ...body }) => api.post(`/problems/${problemId}/examples`, body),
        onSuccess: (_, { problemId }) => qc.invalidateQueries({ queryKey: ["problem", problemId] }),
    });
};

export const useDeleteExample = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ problemId, exampleId }) => api.delete(`/problems/${problemId}/examples/${exampleId}`),
        onSuccess: (_, { problemId }) => qc.invalidateQueries({ queryKey: ["problem", problemId] }),
    });
};

export const useCreateTestCase = () =>
    useMutation({
        mutationFn: (body) => api.post("/test-cases", body),
    });

export const useDeleteTestCase = () =>
    useMutation({
        mutationFn: (id) => api.delete(`/test-cases/${id}`),
    });
