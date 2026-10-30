"use client";
import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
    questionsByTrack,
    trackById,
    trackColors,
    subscribeProgress,
    getProgressSnapshot,
    getServerProgressSnapshot,
    setQuestionProgress,
} from "@/lib/interview";

// true after hydration (server snapshot is false) — lets us render
// progress-dependent UI without a mismatch.
const useHydrated = () =>
    useSyncExternalStore(
        () => () => {},
        () => true,
        () => false,
    );

const mdComponents = {
    p: (props) => <p className="mb-3 last:mb-0 leading-relaxed" {...props} />,
    ul: (props) => <ul className="mb-3 ml-4 list-disc space-y-1.5" {...props} />,
    ol: (props) => <ol className="mb-3 ml-4 list-decimal space-y-1.5" {...props} />,
    li: (props) => <li className="leading-relaxed" {...props} />,
    strong: (props) => <strong className="font-semibold text-white" {...props} />,
    code: ({ className, ...props }) =>
        className
            ? <code className={`font-mono text-zinc-200 ${className}`} {...props} />
            : <code className="rounded bg-zinc-800 px-1 py-0.5 text-[12px] text-emerald-300" {...props} />,
    pre: (props) => (
        <pre className="mb-3 overflow-auto rounded-lg border border-zinc-800 bg-[#09090b] p-3 text-xs" {...props} />
    ),
    table: (props) => (
        <div className="mb-3 overflow-x-auto rounded-lg border border-zinc-800">
            <table className="w-full border-collapse text-left text-xs" {...props} />
        </div>
    ),
    th: (props) => <th className="border-b border-zinc-800 bg-zinc-900 px-3 py-2 font-semibold text-white" {...props} />,
    td: (props) => <td className="border-b border-zinc-800/60 px-3 py-2 text-zinc-300" {...props} />,
};

const DIFF_STYLE = {
    easy: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    medium: "text-amber-400 bg-amber-400/10 border-amber-400/20",
    hard: "text-rose-400 bg-rose-500/10 border-rose-500/20",
};

const MOCK_SECONDS = 120; // thinking time per question in mock mode

export function DrillPage({ trackId }) {
    const track = trackById[trackId];
    const colors = trackColors[track?.color] ?? trackColors.emerald;
    const questions = useMemo(() => questionsByTrack(trackId), [trackId]);

    const progress = useSyncExternalStore(subscribeProgress, getProgressSnapshot, getServerProgressSnapshot);
    const hydrated = useHydrated();

    const [filter, setFilter] = useState("all"); // all | review | unseen
    const [idx, setIdx] = useState(0);
    const [revealed, setRevealed] = useState(false);

    // Mock mode: a countdown forces you to answer out loud before revealing.
    const [mock, setMock] = useState(false);
    const [secondsLeft, setSecondsLeft] = useState(MOCK_SECONDS);

    const visible = useMemo(() => {
        if (filter === "review") return questions.filter((q) => progress[q.id] === "again");
        if (filter === "unseen") return questions.filter((q) => !progress[q.id]);
        return questions;
    }, [questions, filter, progress]);

    const current = visible[Math.min(idx, Math.max(visible.length - 1, 0))];

    const go = useCallback(
        (delta) => {
            setIdx((i) => Math.max(0, Math.min(i + delta, visible.length - 1)));
            setRevealed(false);
            setSecondsLeft(MOCK_SECONDS);
        },
        [visible.length],
    );

    const mark = useCallback(
        (status) => {
            if (!current) return;
            setQuestionProgress(current.id, status);
            go(1);
        },
        [current, go],
    );

    // Mock countdown → auto-reveal at zero.
    useEffect(() => {
        if (!mock || revealed || !current) return;
        const t = setTimeout(() => {
            if (secondsLeft <= 1) setRevealed(true);
            else setSecondsLeft((s) => s - 1);
        }, 1000);
        return () => clearTimeout(t);
    }, [mock, revealed, secondsLeft, current]);

    // Keyboard: Space reveal, ←/→ navigate, 1 = again, 2 = got it.
    useEffect(() => {
        const onKey = (e) => {
            const t = e.target;
            if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
            if (e.key === " ") { e.preventDefault(); setRevealed((r) => !r); }
            else if (e.key === "ArrowRight") go(1);
            else if (e.key === "ArrowLeft") go(-1);
            else if (e.key === "1" && revealed) mark("again");
            else if (e.key === "2" && revealed) mark("done");
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [go, mark, revealed]);

    if (!track) {
        return (
            <div className="p-10 text-center text-zinc-400">
                Unknown track. <Link href="/interview" className="text-emerald-500 hover:underline">Back to tracks</Link>
            </div>
        );
    }

    const doneCount = questions.filter((q) => progress[q.id] === "done").length;
    const againCount = questions.filter((q) => progress[q.id] === "again").length;

    return (
        <div className="mx-auto max-w-3xl px-4 py-8">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
                <div>
                    <Link href="/interview" className="text-xs text-zinc-500 hover:text-white transition-colors">
                        ← All tracks
                    </Link>
                    <div className="flex items-center gap-2.5 mt-1">
                        <span className={`material-symbols-outlined text-[24px] ${colors.text}`}>{track.icon}</span>
                        <h1 className="text-2xl font-bold text-white">{track.label}</h1>
                    </div>
                    {hydrated && (
                        <p className="text-xs text-zinc-500 mt-1">
                            {doneCount}/{questions.length} done{againCount > 0 && <> · <span className="text-amber-400">{againCount} to review</span></>}
                        </p>
                    )}
                </div>
                <button
                    type="button"
                    onClick={() => { setMock((m) => !m); setRevealed(false); setSecondsLeft(MOCK_SECONDS); }}
                    className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                        mock
                            ? "border-rose-500/50 bg-rose-500/10 text-rose-300"
                            : "border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                    }`}
                >
                    <span className="material-symbols-outlined text-[16px]">timer</span>
                    {mock ? "Exit mock mode" : "Mock mode"}
                </button>
            </div>

            {/* Filters */}
            <div className="mb-4 flex items-center gap-2">
                {[["all", `All (${questions.length})`], ["review", `Review (${againCount})`], ["unseen", "Unseen"]].map(([key, label]) => (
                    <button
                        key={key}
                        type="button"
                        onClick={() => { setFilter(key); setIdx(0); setRevealed(false); }}
                        className={`px-2.5 py-1 rounded-full border text-xs font-medium transition-colors ${
                            filter === key
                                ? `${colors.border} ${colors.bg} ${colors.text}`
                                : "border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800"
                        }`}
                    >
                        {label}
                    </button>
                ))}
                {visible.length > 0 && (
                    <span className="ml-auto font-mono text-[11px] text-zinc-500 tabular-nums">
                        {Math.min(idx + 1, visible.length)}/{visible.length}
                    </span>
                )}
            </div>

            {visible.length === 0 ? (
                <div className="rounded-xl border border-zinc-800 bg-[#18181b] p-10 text-center text-zinc-400 text-sm">
                    {filter === "review" ? "Nothing marked for review — nice." : "No unseen questions left."}
                </div>
            ) : (
                <>
                    {/* Card */}
                    <div className="rounded-xl border border-zinc-800 bg-[#18181b] overflow-hidden">
                        <div className="px-5 pt-5 pb-4 border-b border-zinc-800">
                            <div className="flex items-center justify-between gap-3 mb-3">
                                <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium uppercase ${DIFF_STYLE[current.difficulty]}`}>
                                    {current.difficulty}
                                </span>
                                {mock && !revealed && (
                                    <span className={`font-mono text-sm tabular-nums ${secondsLeft <= 10 ? "text-rose-400" : "text-zinc-400"}`}>
                                        {String(Math.floor(secondsLeft / 60))}:{String(secondsLeft % 60).padStart(2, "0")}
                                    </span>
                                )}
                                {hydrated && progress[current.id] && (
                                    <span className={`text-[10px] font-mono uppercase ${progress[current.id] === "done" ? "text-emerald-500" : "text-amber-400"}`}>
                                        {progress[current.id] === "done" ? "✓ got it" : "↻ review"}
                                    </span>
                                )}
                            </div>
                            <h2 className="text-base font-semibold text-white leading-relaxed">{current.q}</h2>
                            {mock && !revealed && (
                                <p className="mt-2 text-xs text-zinc-500">Answer out loud — the clock is your interviewer.</p>
                            )}
                        </div>

                        {revealed ? (
                            <div className="px-5 py-4 text-sm text-zinc-300">
                                <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
                                    {current.a}
                                </ReactMarkdown>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={() => setRevealed(true)}
                                className="w-full px-5 py-10 text-sm text-zinc-500 hover:text-white hover:bg-zinc-800/40 transition-colors"
                            >
                                Show answer <span className="font-mono text-[11px]">(space)</span>
                            </button>
                        )}
                    </div>

                    {/* Controls */}
                    <div className="mt-4 flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => go(-1)}
                            disabled={idx === 0}
                            className="p-2 rounded-lg border border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-30 transition-colors"
                            title="Previous (←)"
                        >
                            <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                        </button>
                        {revealed ? (
                            <>
                                <button
                                    type="button"
                                    onClick={() => mark("again")}
                                    className="flex-1 py-2 rounded-lg border border-amber-500/40 bg-amber-500/10 text-amber-300 text-sm font-medium hover:bg-amber-500/20 transition-colors"
                                >
                                    Review again <span className="font-mono text-[11px] opacity-60">(1)</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => mark("done")}
                                    className="flex-1 py-2 rounded-lg border border-emerald-500/40 bg-emerald-500/10 text-emerald-300 text-sm font-medium hover:bg-emerald-500/20 transition-colors"
                                >
                                    Got it <span className="font-mono text-[11px] opacity-60">(2)</span>
                                </button>
                            </>
                        ) : (
                            <button
                                type="button"
                                onClick={() => setRevealed(true)}
                                className="flex-1 py-2 rounded-lg bg-emerald-500 text-black text-sm font-semibold hover:bg-emerald-400 transition-colors"
                            >
                                Show answer
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={() => go(1)}
                            disabled={idx >= visible.length - 1}
                            className="p-2 rounded-lg border border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-30 transition-colors"
                            title="Next (→)"
                        >
                            <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                        </button>
                    </div>
                    <p className="mt-3 text-[10px] text-zinc-600 font-mono">space reveal · ← → navigate · 1 review · 2 got it</p>
                </>
            )}
        </div>
    );
}
