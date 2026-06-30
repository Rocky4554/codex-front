import { create } from "zustand";

/**
 * Live CodeBot panel state (open/closed, the current conversation, and the
 * on-screen messages). Durable history lives in Postgres; this is just the
 * active session in the browser.
 *
 * A message: { id, role: "user" | "assistant", kind, content }
 */
let idSeq = 0;
const nextId = () => `m${++idSeq}`;

export const useAssistantStore = create((set) => ({
    isOpen: false,
    conversationId: null,
    messages: [],
    streaming: false,
    remaining: null, // daily quota left, null until first response

    open: () => set({ isOpen: true }),
    close: () => set({ isOpen: false }),
    toggle: () => set((s) => ({ isOpen: !s.isOpen })),

    // Start a brand-new conversation (the "+" button).
    newChat: () => set({ conversationId: null, messages: [], streaming: false }),

    setConversationId: (conversationId) => set({ conversationId }),
    setRemaining: (remaining) => set({ remaining }),
    setStreaming: (streaming) => set({ streaming }),

    // Replace the whole message list (used when re-opening a past conversation).
    setMessages: (messages) => set({ messages }),

    addMessage: (role, kind, content) => {
        const id = nextId();
        set((s) => ({ messages: [...s.messages, { id, role, kind, content }] }));
        return id;
    },

    // Append a streamed token to a specific message (the live assistant bubble).
    appendToMessage: (id, text) =>
        set((s) => ({
            messages: s.messages.map((m) => (m.id === id ? { ...m, content: m.content + text } : m)),
        })),

    setMessageContent: (id, content) =>
        set((s) => ({
            messages: s.messages.map((m) => (m.id === id ? { ...m, content } : m)),
        })),
}));
