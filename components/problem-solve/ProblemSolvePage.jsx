"use client";
import { Group, Panel, Separator } from "react-resizable-panels";
import { ProblemPanel } from "./ProblemPanel";
import { SolvePanel } from "./SolvePanel";
import { CodeBotPanel } from "./CodeBotPanel";
import { useProblem } from "@/hooks/useProblem";
import { useProblems } from "@/hooks/useProblems";
import { usePlaylist } from "@/hooks/usePlaylists";
import { useAuthStore } from "@/store/authStore";
import { useAssistantStore } from "@/store/assistantStore";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useMemo } from "react";

function ResizeHandle() {
    return (
        <Separator
            className="relative w-1.5 shrink-0 cursor-col-resize bg-zinc-800 transition-colors hover:bg-emerald-500/60 focus-visible:bg-emerald-500 focus-visible:outline-none data-[resize-handle-state=drag]:bg-emerald-500"
        />
    );
}

export function ProblemSolvePage({ slug }) {
    const { data: problem, isLoading, error } = useProblem(slug);
    const { data: allProblems } = useProblems();
    const searchParams = useSearchParams();
    const playlistId = searchParams.get("playlist");
    const { data: playlist } = usePlaylist(playlistId);
    const { user, isLoggedIn } = useAuthStore();
    const isCodeBotOpen = useAssistantStore((s) => s.isOpen);
    const toggleCodeBot = useAssistantStore((s) => s.toggle);
    const router = useRouter();

    const withPlaylist = (problemId) =>
        playlistId ? `/problems/${problemId}?playlist=${playlistId}` : `/problems/${problemId}`;

    // Prefer playlist order when opened from a playlist; otherwise catalog orderNum.
    const sorted = useMemo(() => {
        if (playlist?.problems?.length) {
            return [...playlist.problems].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
        }
        return (allProblems || []).slice().sort((a, b) => (a.orderNum ?? 0) - (b.orderNum ?? 0));
    }, [playlist, allProblems]);

    const currentIdx = sorted.findIndex((p) => p.id === slug);
    const prevProblem = currentIdx > 0 ? sorted[currentIdx - 1] : null;
    const nextProblem = currentIdx >= 0 && currentIdx < sorted.length - 1 ? sorted[currentIdx + 1] : null;

    const backHref = playlistId ? `/playlists/${playlistId}` : "/problems";
    const backLabel = playlistId
        ? (playlist?.title ? `Playlist: ${playlist.title}` : "Playlist")
        : (problem?.orderNum != null ? `#${problem.orderNum}` : "Problems");

    return (
        <div className="bg-[#f6f8f7] dark:bg-[#09090b] text-slate-900 dark:text-slate-100 font-sans overflow-hidden h-screen flex flex-col">
            {/* Top Navigation Bar */}
            <header className="h-14 flex items-center justify-between px-4 border-b border-zinc-800 bg-[#18181b] shrink-0 z-10">
                <div className="flex items-center gap-4">
                    <Link href="/problems" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-500">
                            <span className="material-symbols-outlined text-[20px]">code</span>
                        </div>
                        <span className="font-bold text-lg tracking-tight text-white">SprintCode</span>
                    </Link>
                    <div className="w-px h-5 bg-zinc-700" />
                    {/* Prev / Next navigation */}
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => prevProblem && router.push(withPlaylist(prevProblem.id))}
                            disabled={!prevProblem}
                            className="p-1.5 rounded text-zinc-400 hover:text-white hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            title={prevProblem ? prevProblem.title : "No previous problem"}
                        >
                            <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                        </button>
                        <Link href={backHref} className="text-zinc-300 hover:text-white transition-colors text-sm font-medium px-1 max-w-[180px] truncate">
                            {backLabel}
                        </Link>
                        <button
                            onClick={() => nextProblem && router.push(withPlaylist(nextProblem.id))}
                            disabled={!nextProblem}
                            className="p-1.5 rounded text-zinc-400 hover:text-white hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            title={nextProblem ? nextProblem.title : "No next problem"}
                        >
                            <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                        </button>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {isLoggedIn && (
                        <button
                            onClick={toggleCodeBot}
                            className="flex items-center gap-1.5 rounded-lg border border-indigo-500/40 bg-indigo-500/10 px-2.5 py-1.5 text-xs font-medium text-indigo-300 transition-colors hover:bg-indigo-500/20"
                            title="Open CodeBot assistant"
                        >
                            <span className="material-symbols-outlined text-[16px]">smart_toy</span>
                            CodeBot
                        </button>
                    )}
                    {isLoggedIn && (
                        <Link href="/playlists" className="text-xs text-zinc-400 hover:text-white font-medium transition-colors">
                            Playlists
                        </Link>
                    )}
                    {user?.role === "ADMIN" && (
                        <Link href="/admin" className="text-xs text-amber-400 hover:text-amber-300 font-medium transition-colors">
                            Admin
                        </Link>
                    )}
                    <Link href="/problems" className="text-zinc-400 hover:text-white transition-colors text-sm">
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
                        <Link href={backHref} className="text-emerald-500 hover:underline text-sm">
                            ← Back
                        </Link>
                    </div>
                </main>
            )}

            {/* Main Content */}
            {problem && !isLoading && (
                <main className="flex-1 overflow-hidden">
                    <Group orientation="horizontal" className="h-full">
                        <Panel id="problem" defaultSize="38%" minSize="20%" className="flex h-full flex-col">
                            <ProblemPanel key={problem.id} problem={problem} />
                        </Panel>
                        <ResizeHandle />
                        <Panel id="editor" defaultSize={isCodeBotOpen ? "38%" : "62%"} minSize="25%" className="flex h-full flex-col bg-[#1e1e1e]">
                            <SolvePanel key={problem.id} problem={problem} />
                        </Panel>
                        {isCodeBotOpen && (
                            <>
                                <ResizeHandle />
                                <Panel id="codebot" defaultSize="24%" minSize="18%" maxSize="45%" className="flex h-full flex-col border-l border-zinc-800 bg-[#101012]">
                                    <CodeBotPanel problem={problem} />
                                </Panel>
                            </>
                        )}
                    </Group>
                </main>
            )}
        </div>
    );
}
