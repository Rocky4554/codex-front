"use client";
import { ProblemPanel } from "./ProblemPanel";
import { SolvePanel } from "./SolvePanel";
import { useProblem } from "@/hooks/useProblem";
import Link from "next/link";

export function ProblemSolvePage({ slug }) {
    const { data: problem, isLoading, error } = useProblem(slug);

    return (
        <div className="bg-[#f6f8f7] dark:bg-[#09090b] text-slate-900 dark:text-slate-100 font-sans overflow-hidden h-screen flex flex-col">
            {/* Top Navigation Bar */}
            <header className="h-14 flex items-center justify-between px-4 border-b border-zinc-800 bg-[#18181b] shrink-0 z-10">
                <div className="flex items-center gap-4">
                    <Link href="/problems" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <div className="size-6 bg-zinc-800 rounded flex items-center justify-center text-emerald-500">
                            <span className="material-symbols-outlined text-[18px]">code</span>
                        </div>
                        <span className="font-bold text-lg tracking-tight text-white">Codex</span>
                    </Link>
                    <div className="w-px h-5 bg-zinc-700" />
                    <Link href="/problems" className="text-zinc-400 hover:text-white transition-colors text-sm flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                        Problems
                    </Link>
                </div>
            </header>

            {/* Loading state */}
            {isLoading && (
                <main className="flex-1 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3 text-zinc-400">
                        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                        <span className="text-sm">Loading problem...</span>
                    </div>
                </main>
            )}

            {/* Error state */}
            {error && !isLoading && (
                <main className="flex-1 flex items-center justify-center">
                    <div className="text-center space-y-3">
                        <p className="text-zinc-400 text-lg">Problem not found</p>
                        <Link href="/problems" className="text-emerald-500 hover:underline text-sm">
                            ← Back to problems
                        </Link>
                    </div>
                </main>
            )}

            {/* Main Content */}
            {problem && !isLoading && (
                <main className="flex-1 flex overflow-hidden">
                    <div className="w-1/2 flex flex-col h-full border-r border-zinc-800">
                        <ProblemPanel problem={problem} />
                    </div>
                    <div className="w-1/2 flex flex-col h-full bg-[#1e1e1e]">
                        <SolvePanel problem={problem} />
                    </div>
                </main>
            )}
        </div>
    );
}
