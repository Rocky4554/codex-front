"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { CheckCircle2 } from "lucide-react";
import { useUserProblems } from "@/hooks/useUserProblems";

const DIFFICULTY_COLOR = {
    EASY: "text-emerald-400",
    MEDIUM: "text-amber-400",
    HARD: "text-rose-400",
};

/**
 * Slide-in panel from the left listing the problems you can move between —
 * the playlist's problems when opened from a playlist, otherwise the catalog.
 */
export function ProblemListDrawer({ open, onClose, problems, loading = false, currentId, title, titleHref, onSelect }) {
    const [search, setSearch] = useState("");
    const { data: userProblems } = useUserProblems();
    const currentRef = useRef(null);

    const solvedIds = useMemo(
        () => new Set((userProblems || [])
            .filter((up) => up.status === "ACCEPTED" || up.status === "SOLVED")
            .map((up) => up.problemId)),
        [userProblems],
    );

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        // Keep each problem's position in the full list so numbering doesn't shift while searching.
        return problems
            .map((p, i) => ({ p, n: i + 1 }))
            .filter(({ p }) => !q || p.title?.toLowerCase().includes(q));
    }, [problems, search]);

    useEffect(() => {
        if (!open) return;
        const onKey = (e) => { if (e.key === "Escape") onClose(); };
        window.addEventListener("keydown", onKey);
        // Bring the current problem into view once the panel has slid in.
        const t = setTimeout(() => currentRef.current?.scrollIntoView({ block: "center" }), 220);
        return () => { window.removeEventListener("keydown", onKey); clearTimeout(t); };
    }, [open, onClose, loading]);

    const solvedCount = problems.filter((p) => solvedIds.has(p.id)).length;

    return (
        <AnimatePresence>
            {open && (
                <>
                    <motion.div
                        key="backdrop"
                        className="fixed inset-0 top-14 z-40 bg-black/50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.18 }}
                        onClick={onClose}
                    />
                    <motion.aside
                        key="panel"
                        role="dialog"
                        aria-label={title}
                        className="fixed bottom-0 left-0 top-14 z-50 flex w-[min(400px,90vw)] flex-col border-r border-zinc-800 bg-[#18181b] shadow-[8px_0_30px_rgba(0,0,0,0.45)]"
                        initial={{ x: "-100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "-100%" }}
                        transition={{ type: "spring", stiffness: 380, damping: 38 }}
                    >
                        <div className="flex items-center justify-between gap-3 border-b border-zinc-800 px-4 py-3">
                            <div className="min-w-0">
                                {titleHref ? (
                                    <Link href={titleHref} className="block truncate text-sm font-semibold text-white hover:text-emerald-400">
                                        {title}
                                    </Link>
                                ) : (
                                    <p className="truncate text-sm font-semibold text-white">{title}</p>
                                )}
                                <p className="text-[11px] text-zinc-500">
                                    {loading ? "Loading…" : `${problems.length} problem${problems.length === 1 ? "" : "s"}`}
                                    {!loading && solvedCount > 0 && ` · ${solvedCount} solved`}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-800 hover:text-white"
                                title="Close (Esc)"
                                aria-label="Close problem list"
                            >
                                <span className="material-symbols-outlined text-[20px]">close</span>
                            </button>
                        </div>

                        <div className="border-b border-zinc-800 p-3">
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search problems…"
                                className="w-full rounded-lg border border-zinc-700 bg-[#09090b] px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-emerald-500/60 focus:outline-none"
                            />
                        </div>

                        <ul className="flex-1 overflow-y-auto py-1">
                            {filtered.map(({ p, n }) => {
                                const current = p.id === currentId;
                                return (
                                    <li key={p.id} ref={current ? currentRef : undefined}>
                                        <button
                                            type="button"
                                            onClick={() => onSelect(p.id)}
                                            aria-current={current ? "page" : undefined}
                                            className={`flex w-full items-center gap-3 border-l-2 px-4 py-2.5 text-left transition-colors ${
                                                current
                                                    ? "border-emerald-400 bg-emerald-500/10"
                                                    : "border-transparent hover:bg-zinc-800/70"
                                            }`}
                                        >
                                            <span className="w-7 shrink-0 text-right font-mono text-[11px] text-zinc-500">{n}</span>
                                            <span className={`min-w-0 flex-1 truncate text-sm ${current ? "font-semibold text-white" : "text-zinc-200"}`}>
                                                {p.title}
                                            </span>
                                            {solvedIds.has(p.id) && <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" aria-label="Solved" />}
                                            <span className={`w-14 shrink-0 text-right text-[11px] font-medium capitalize ${DIFFICULTY_COLOR[p.difficulty] || "text-zinc-400"}`}>
                                                {String(p.difficulty || "").toLowerCase()}
                                            </span>
                                        </button>
                                    </li>
                                );
                            })}
                            {loading && problems.length === 0 && Array.from({ length: 8 }).map((_, i) => (
                                <li key={i} className="px-4 py-2.5">
                                    <div className="h-5 animate-pulse rounded bg-zinc-800" />
                                </li>
                            ))}
                            {!loading && filtered.length === 0 && (
                                <li className="px-4 py-10 text-center text-xs text-zinc-500">No matching problems.</li>
                            )}
                        </ul>
                    </motion.aside>
                </>
            )}
        </AnimatePresence>
    );
}
