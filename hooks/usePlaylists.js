import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";

export const usePlaylists = () =>
    useQuery({
        queryKey: ["playlists"],
        queryFn: async () => {
            const { data } = await api.get("/playlists");
            return data;
        },
    });

export const usePlaylist = (id, { enabled = true } = {}) =>
    useQuery({
        queryKey: ["playlists", id],
        queryFn: async () => {
            const { data } = await api.get(`/playlists/${id}`);
            return data;
        },
        enabled: !!id && enabled,
    });

export const useCreatePlaylist = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (body) => api.post("/playlists", body).then((r) => r.data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["playlists"] }),
    });
};

export const useUpdatePlaylist = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, ...body }) => api.put(`/playlists/${id}`, body).then((r) => r.data),
        onSuccess: (data) => {
            qc.invalidateQueries({ queryKey: ["playlists"] });
            qc.invalidateQueries({ queryKey: ["playlists", data.id] });
        },
    });
};

export const useDeletePlaylist = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id) => api.delete(`/playlists/${id}`),
        onSuccess: (_, id) => {
            // Don't prefix-invalidate ["playlists"]: that refetches the deleted
            // playlist's detail query, which 404s with "Playlist not found".
            qc.setQueryData(["playlists"], (old) => old?.filter((p) => p.id !== id));
            qc.invalidateQueries({ queryKey: ["playlists"], exact: true });
            qc.removeQueries({ queryKey: ["playlists", id], exact: true });
        },
    });
};

export const useAddProblemToPlaylist = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ playlistId, problemId }) =>
            api.post(`/playlists/${playlistId}/problems`, { problemId }).then((r) => r.data),
        onSuccess: (data) => {
            qc.invalidateQueries({ queryKey: ["playlists"] });
            qc.invalidateQueries({ queryKey: ["playlists", data.id] });
        },
    });
};

export const useCreateProblemInPlaylist = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ playlistId, body }) =>
            api.post(`/playlists/${playlistId}/problems/create`, body).then((r) => r.data),
        onSuccess: (data) => {
            qc.invalidateQueries({ queryKey: ["playlists"] });
            qc.invalidateQueries({ queryKey: ["playlists", data.id] });
        },
    });
};

export const useRemoveProblemFromPlaylist = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ playlistId, problemId }) =>
            api.delete(`/playlists/${playlistId}/problems/${problemId}`).then((r) => r.data),
        onSuccess: (data) => {
            qc.invalidateQueries({ queryKey: ["playlists"] });
            qc.invalidateQueries({ queryKey: ["playlists", data.id] });
        },
    });
};

export const useReorderPlaylistProblems = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ playlistId, problemIds }) =>
            api.put(`/playlists/${playlistId}/problems/reorder`, { problemIds }).then((r) => r.data),
        onSuccess: (data) => {
            qc.invalidateQueries({ queryKey: ["playlists"] });
            qc.setQueryData(["playlists", data.id], data);
        },
    });
};
