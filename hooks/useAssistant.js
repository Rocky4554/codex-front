import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";

// List of the user's past CodeBot conversations for a problem (history menu).
export const useAssistantConversations = (problemId, enabled = true) =>
    useQuery({
        queryKey: ["assistant", "conversations", problemId],
        queryFn: async () => {
            const { data } = await api.get(`/problems/${problemId}/assistant/conversations`);
            return data;
        },
        enabled: !!problemId && enabled,
    });

// Messages of one past conversation (loaded when the user reopens it).
export const fetchConversationMessages = async (conversationId) => {
    const { data } = await api.get(`/assistant/conversations/${conversationId}/messages`);
    return data;
};

// Remaining daily quota (the "N left" badge).
export const useAssistantQuota = (enabled = true) =>
    useQuery({
        queryKey: ["assistant", "quota"],
        queryFn: async () => {
            const { data } = await api.get(`/assistant/quota`);
            return data;
        },
        enabled,
    });
