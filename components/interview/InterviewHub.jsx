"use client";
import { useSyncExternalStore } from "react";
import Link from "next/link";
import {
    tracks,
    trackColors,
    allQuestions,
    questionsByTrack,
    subscribeProgress,
    getProgressSnapshot,
    getServerProgressSnapshot,
} from "@/lib/interview";

export function InterviewHub() {
    const progress = useSyncExternalStore(subscribeProgress, getProgressSnapshot, getServerProgressSnapshot);
    const hydrated = useSyncExternalStore(
        () => () => {},
        () => true,
        () => false,
    );

    const total = allQuestions.length;
    const done = allQuestions.filter((q) => progress[q.id] === "done").length;
    const review = allQuestions.filter((q) => progress[q.id] === "again").length;

    return (
        <div className="mx-auto max-w-5xl px-4 py-10">
            <div className="mb-8">
                <p className="text-[10px] uppercase tracking-widest text-zinc-500">Interview Prep</p>
                <h1 className="text-3xl font-bold text-white mt-1">Everything for the switch, in one place.</h1>
                <p className="text-sm text-zinc-400 mt-2 max-w-2xl">
                    Rapid-fire question banks across every round — DSA, SQL, LLD, system design, frontend,
                    backend, Spring and AI systems. Reveal, rate yourself, and drill the ones you missed.
                    Mock mode puts a clock on each question like a real interviewer.
                </p>
                {hydrated && (
                    <div className="mt-4 flex items-center gap-4 text-sm">
                        <span className="text-zinc-300"><span className="font-semibold text-emerald-400">{done}</span>/{total} done</span>
                        {review > 0 && <span className="text-amber-400">{review} marked for review</span>}
                        <div className="flex-1 max-w-xs h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                            <div className="h-full bg-emerald-500 transition-all" style={{ width: `${total ? (done / total) * 100 : 0}%` }} />
                        </div>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {tracks.map((t) => {
                    const qs = questionsByTrack(t.id);
                    const c = trackColors[t.color];
                    const tDone = qs.filter((q) => progress[q.id] === "done").length;
                    const tAgain = qs.filter((q) => progress[q.id] === "again").length;
                    return (
                        <Link
                            key={t.id}
                            href={`/interview/${t.id}`}
                            className={`group rounded-xl border border-zinc-800 bg-[#18181b] p-5 hover:border-zinc-600 transition-colors`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${c.bg}`}>
                                    <span className={`material-symbols-outlined text-[22px] ${c.text}`}>{t.icon}</span>
                                </div>
                                <div className="min-w-0">
                                    <h2 className="font-semibold text-white group-hover:text-white truncate">{t.label}</h2>
                                    <p className="text-[11px] text-zinc-500 truncate">{t.blurb}</p>
                                </div>
                            </div>
                            <div className="mt-4 flex items-center justify-between text-[11px] font-mono">
                                <span className="text-zinc-500">
                                    {hydrated ? `${tDone}/${qs.length} done` : `${qs.length} questions`}
                                    {hydrated && tAgain > 0 && <span className="text-amber-400"> · {tAgain} ↻</span>}
                                </span>
                                <span className={`${c.text} opacity-0 group-hover:opacity-100 transition-opacity`}>drill →</span>
                            </div>
                            <div className="mt-2 h-1 rounded-full bg-zinc-800 overflow-hidden">
                                <div
                                    className={`h-full ${c.bar} transition-all`}
                                    style={{ width: hydrated && qs.length ? `${(tDone / qs.length) * 100}%` : 0 }}
                                />
                            </div>
                        </Link>
                    );
                })}
            </div>

            <div className="mt-8 rounded-xl border border-zinc-800 bg-[#18181b] p-5 flex items-start gap-3">
                <span className="material-symbols-outlined text-[20px] text-indigo-400 mt-0.5">smart_toy</span>
                <div className="text-sm">
                    <p className="text-zinc-300 font-medium">AI mock interviewer — coming next</p>
                    <p className="text-zinc-500 text-xs mt-1">
                        The CodeBot assistant will run full mock rounds here: it asks from these banks, probes your
                        answer with follow-ups, and grades you against the model answer. Needs one backend endpoint
                        (a track-scoped assistant chat); the UI and question data are already in place.
                    </p>
                </div>
            </div>
        </div>
    );
}
