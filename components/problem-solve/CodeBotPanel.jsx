"use client";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useQueryClient } from "@tanstack/react-query";
import { useAssistantStore } from "@/store/assistantStore";
import { useEditorStore } from "@/store/editorStore";
import { useAssistantConversations, useAssistantQuota, fetchConversationMessages } from "@/hooks/useAssistant";
import { streamAssistant } from "@/lib/assistantStream";
import { toast } from "sonner";

// Pull the first fenced code block out of a markdown answer (for "Generate").
function extractCode(markdown) {
    const match = markdown.match(/```[a-zA-Z0-9+#]*\n([\s\S]*?)```/);
    return match ? match[1].replace(/\n$/, "") : null;
}

const mdComponents = {
    p: (props) => <p className="mb-2 leading-relaxed" {...props} />,
    ul: (props) => <ul className="mb-2 ml-4 list-disc space-y-1" {...props} />,
    ol: (props) => <ol className="mb-2 ml-4 list-decimal space-y-1" {...props} />,
    li: (props) => <li className="leading-relaxed" {...props} />,
    h1: (props) => <h1 className="mt-2 mb-1 text-base font-bold" {...props} />,
    h2: (props) => <h2 className="mt-2 mb-1 text-sm font-bold" {...props} />,
    h3: (props) => <h3 className="mt-2 mb-1 text-sm font-semibold" {...props} />,
    a: (props) => <a className="text-emerald-400 underline" target="_blank" rel="noreferrer" {...props} />,
    strong: (props) => <strong className="font-semibold text-white" {...props} />,
    pre: (props) => (
        <pre className="my-2 overflow-auto rounded-lg border border-zinc-800 bg-[#0d0d0f] p-3 text-xs" {...props} />
    ),
    // react-markdown v10 dropped the `inline` prop; fenced blocks carry a
    // `language-*` className, inline code does not.
    code: ({ className, ...props }) =>
        className
            ? <code className={`font-mono text-zinc-200 ${className}`} {...props} />
            : <code className="rounded bg-zinc-800 px-1 py-0.5 text-[12px] text-emerald-300" {...props} />,
};

function MessageBubble({ message }) {
    const isUser = message.role === "user";
    return (
        <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
            <div
                className={`max-w-[88%] rounded-2xl px-3 py-2 text-sm ${
                    isUser
                        ? "bg-emerald-600 text-white rounded-br-sm"
                        : "bg-zinc-800/80 text-zinc-100 rounded-bl-sm"
                }`}
            >
                {isUser ? (
                    <span className="whitespace-pre-wrap">{message.content}</span>
                ) : message.content ? (
                    <div className="cb-md break-words">
                        <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
                            {message.content}
                        </ReactMarkdown>
                    </div>
                ) : (
                    <span className="inline-flex gap-1 py-1">
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400 [animation-delay:-0.3s]" />
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400 [animation-delay:-0.15s]" />
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400" />
                    </span>
                )}
            </div>
        </div>
    );
}

export function CodeBotPanel({ problem }) {
    const problemId = problem?.id;
    const {
        isOpen, close, newChat, messages, conversationId, streaming, remaining,
        addMessage, appendToMessage, setMessageContent, setConversationId,
        setStreaming, setRemaining, setMessages,
    } = useAssistantStore();

    const { selectedLanguage } = useEditorStore();
    const queryClient = useQueryClient();
    const [input, setInput] = useState("");
    const [showHistory, setShowHistory] = useState(false);
    const scrollRef = useRef(null);

    const { data: quota } = useAssistantQuota(isOpen);
    const { data: conversations } = useAssistantConversations(problemId, isOpen && showHistory);

    useEffect(() => {
        if (quota?.remaining != null && remaining == null) setRemaining(quota.remaining);
    }, [quota, remaining, setRemaining]);

    // Auto-scroll to the newest content as it streams in.
    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [messages]);

    if (!isOpen) return null;

    const endpointFor = { explain: "explain", generate: "generate", review: "review", chat: "chat" };

    const runAction = async (kind, payload, userLabel) => {
        if (streaming) return;
        if (!problemId) return;

        addMessage("user", kind, userLabel);
        const botId = addMessage("assistant", kind, "");
        setStreaming(true);

        let assistantText = "";
        await streamAssistant(
            `/problems/${problemId}/assistant/${endpointFor[kind]}`,
            { ...payload, conversationId },
            {
                onMeta: (e) => e.conversationId && setConversationId(e.conversationId),
                onToken: (t) => { assistantText += t; appendToMessage(botId, t); },
                onDone: (e) => {
                    if (e.conversationId) setConversationId(e.conversationId);
                    if (e.remaining != null) setRemaining(e.remaining);
                },
                onError: (e) => {
                    setMessageContent(botId, `⚠️ ${e.message || "Something went wrong."}`);
                },
            },
        );

        setStreaming(false);

        if (kind === "generate" && assistantText && selectedLanguage) {
            const code = extractCode(assistantText);
            if (code) {
                useEditorStore.getState().loadSubmission(selectedLanguage, code);
                toast.success("Solution placed in the editor");
            }
        }

        queryClient.invalidateQueries({ queryKey: ["assistant", "conversations", problemId] });
    };

    const onExplain = () => runAction("explain", {}, "Explain this problem");

    const onGenerate = () => {
        if (!selectedLanguage) return toast.error("Pick a language first");
        runAction("generate", { language: selectedLanguage.name }, `Generate a solution in ${selectedLanguage.name}`);
    };

    const onReview = () => {
        if (!selectedLanguage) return toast.error("Pick a language first");
        const code = useEditorStore.getState().getCode();
        if (!code || !code.trim()) return toast.error("Write some code in the editor first");
        runAction("review", { language: selectedLanguage.name, code }, `Review my ${selectedLanguage.name} code`);
    };

    const onSend = () => {
        const text = input.trim();
        if (!text || streaming) return;
        setInput("");
        // Send the current editor code along so CodeBot can answer
        // "fix/edit my code" without a separate Review step.
        const code = useEditorStore.getState().getCode();
        runAction(
            "chat",
            { message: text, language: selectedLanguage?.name, code: code || undefined },
            text,
        );
    };

    const openConversation = async (id) => {
        try {
            const past = await fetchConversationMessages(id);
            setMessages(past.map((m) => ({
                id: m.id,
                role: m.role.toLowerCase(),
                kind: m.kind.toLowerCase(),
                content: m.content,
            })));
            setConversationId(id);
            setShowHistory(false);
        } catch {
            toast.error("Could not open that conversation");
        }
    };

    const isEmpty = messages.length === 0;

    return (
        <div className="fixed top-14 right-0 bottom-0 z-40 flex w-[400px] max-w-[92vw] flex-col border-l border-zinc-800 bg-[#101012] shadow-2xl">
            {/* Header */}
            <div className="flex h-12 items-center justify-between border-b border-zinc-800 px-3">
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[20px] text-indigo-400">smart_toy</span>
                    <span className="text-sm font-semibold text-white">CodeBot</span>
                    {remaining != null && (
                        <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-400">
                            {remaining} left
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-1 text-zinc-400">
                    <button onClick={() => { newChat(); setShowHistory(false); }} title="New chat"
                        className="rounded p-1.5 hover:bg-zinc-800 hover:text-white">
                        <span className="material-symbols-outlined text-[18px]">add</span>
                    </button>
                    <button onClick={() => setShowHistory((v) => !v)} title="History"
                        className="rounded p-1.5 hover:bg-zinc-800 hover:text-white">
                        <span className="material-symbols-outlined text-[18px]">history</span>
                    </button>
                    <button onClick={close} title="Close"
                        className="rounded p-1.5 hover:bg-zinc-800 hover:text-white">
                        <span className="material-symbols-outlined text-[18px]">close</span>
                    </button>
                </div>
            </div>

            {/* History dropdown */}
            {showHistory && (
                <div className="max-h-56 overflow-auto border-b border-zinc-800 bg-[#0d0d0f]">
                    {(conversations || []).length === 0 ? (
                        <p className="p-3 text-xs text-zinc-500">No past conversations yet.</p>
                    ) : (
                        conversations.map((c) => (
                            <button key={c.id} onClick={() => openConversation(c.id)}
                                className="flex w-full items-center gap-2 border-b border-zinc-800/60 px-3 py-2 text-left text-xs text-zinc-300 hover:bg-zinc-800/50">
                                <span className="material-symbols-outlined text-[14px] text-zinc-500">chat_bubble</span>
                                <span className="truncate">{c.title || "Untitled"}</span>
                            </button>
                        ))
                    )}
                </div>
            )}

            {/* Body */}
            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-3">
                {isEmpty ? (
                    <div className="flex h-full flex-col">
                        <div className="mt-6 mb-4 text-center">
                            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-500/15">
                                <span className="material-symbols-outlined text-[26px] text-indigo-400">smart_toy</span>
                            </div>
                            <p className="text-sm font-semibold text-white">CodeBot</p>
                            <p className="text-xs text-zinc-500">Your assistant for this problem</p>
                        </div>
                        <div className="space-y-2">
                            <ActionButton color="indigo" icon="lightbulb" label="Explain this problem" onClick={onExplain} />
                            <ActionButton color="emerald" icon="code" label="Generate code" onClick={onGenerate} />
                            <ActionButton color="amber" icon="rate_review" label="Review my code" onClick={onReview} />
                        </div>
                    </div>
                ) : (
                    messages.map((m) => <MessageBubble key={m.id} message={m} />)
                )}
            </div>

            {/* Quick actions when in a conversation */}
            {!isEmpty && (
                <div className="flex gap-1.5 border-t border-zinc-800 px-3 pt-2">
                    <MiniAction icon="lightbulb" label="Explain" onClick={onExplain} disabled={streaming} />
                    <MiniAction icon="code" label="Generate" onClick={onGenerate} disabled={streaming} />
                    <MiniAction icon="rate_review" label="Review" onClick={onReview} disabled={streaming} />
                </div>
            )}

            {/* Input */}
            <div className="border-t border-zinc-800 p-3">
                <div className="flex items-end gap-2 rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 focus-within:border-indigo-500">
                    <textarea
                        rows={1}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSend(); } }}
                        placeholder="Ask CodeBot about this problem…"
                        disabled={streaming}
                        className="max-h-28 flex-1 resize-none bg-transparent text-sm text-white placeholder-zinc-500 focus:outline-none disabled:opacity-50"
                    />
                    <button onClick={onSend} disabled={streaming || !input.trim()}
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-40">
                        <span className="material-symbols-outlined text-[16px]">arrow_upward</span>
                    </button>
                </div>
                <p className="mt-1 text-center text-[10px] text-zinc-600">Shift+Enter for a new line · answers only cover this problem</p>
            </div>
        </div>
    );
}

function ActionButton({ color, icon, label, onClick }) {
    const colors = {
        indigo: "border-indigo-500/30 hover:bg-indigo-500/10 text-indigo-300",
        emerald: "border-emerald-500/30 hover:bg-emerald-500/10 text-emerald-300",
        amber: "border-amber-500/30 hover:bg-amber-500/10 text-amber-300",
    };
    return (
        <button onClick={onClick}
            className={`flex w-full items-center gap-2 rounded-xl border bg-zinc-900/40 px-3 py-2.5 text-sm font-medium transition-colors ${colors[color]}`}>
            <span className="material-symbols-outlined text-[18px]">{icon}</span>
            {label}
        </button>
    );
}

function MiniAction({ icon, label, onClick, disabled }) {
    return (
        <button onClick={onClick} disabled={disabled}
            className="flex items-center gap-1 rounded-lg border border-zinc-700 px-2 py-1 text-[11px] text-zinc-300 hover:bg-zinc-800 disabled:opacity-40">
            <span className="material-symbols-outlined text-[14px]">{icon}</span>
            {label}
        </button>
    );
}
