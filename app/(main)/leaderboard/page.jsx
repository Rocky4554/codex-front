"use client";

import Link from "next/link";
import { Trophy } from "lucide-react";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { useAuthStore } from "@/store/authStore";
import { AppHeader } from "@/components/shared/AppHeader";

function UserAvatar({ username }) {
    const initials = username ? username.slice(0, 2).toUpperCase() : "??";
    return (
        <div className="w-full h-full bg-emerald-500 flex items-center justify-center text-white font-bold text-sm">
            {initials}
        </div>
    );
}

function ScoreCell({ value, className = "" }) {
    return (
        <td className={`px-6 py-4 text-sm text-slate-600 dark:text-slate-300 ${className}`}>
            {value}
        </td>
    );
}

export default function LeaderboardPage() {
    const { user } = useAuthStore();
    const { data: leaderboard, isLoading } = useLeaderboard();

    return (
        <div className="bg-[#f4f4f5] dark:bg-[#09090b] text-slate-900 dark:text-slate-100 font-sans min-h-screen flex flex-col antialiased selection:bg-emerald-500 selection:text-white">
            <AppHeader active="leaderboard" />

            <main className="grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                <section>
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 text-sm font-medium mb-4">
                            <Trophy className="w-4 h-4" />
                            All-time leaderboard
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight mb-2">Top solvers</h1>
                    </div>
                </section>

                <section className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#18181b] shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800">
                                <tr>
                                    <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400 w-20">Rank</th>
                                    <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400 min-w-[220px]">User</th>
                                    <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400 w-24">Easy</th>
                                    <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400 w-24">Medium</th>
                                    <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400 w-24">Hard</th>
                                    <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400 w-32">Score</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                                {isLoading && Array.from({ length: 8 }).map((_, index) => (
                                    <tr key={index}>
                                        <td colSpan={6} className="px-6 py-4">
                                            <div className="h-5 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
                                        </td>
                                    </tr>
                                ))}

                                {!isLoading && (leaderboard || []).map((entry) => {
                                    const isCurrentUser = entry.userId === user?.id;
                                    return (
                                        <tr
                                            key={entry.userId}
                                            className={isCurrentUser ? "bg-emerald-50/70 dark:bg-emerald-500/5" : ""}
                                        >
                                            <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">
                                                #{entry.rank}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-full overflow-hidden">
                                                        <UserAvatar username={entry.username} />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-slate-900 dark:text-white">
                                                            {entry.username}
                                                            {isCurrentUser && <span className="ml-2 text-xs text-emerald-500">(You)</span>}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <ScoreCell value={entry.solvedEasy} />
                                            <ScoreCell value={entry.solvedMedium} />
                                            <ScoreCell value={entry.solvedHard} />
                                            <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">
                                                {entry.totalScore}
                                            </td>
                                        </tr>
                                    );
                                })}

                                {!isLoading && (!leaderboard || leaderboard.length === 0) && (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                                            No leaderboard data yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </main>
        </div>
    );
}
