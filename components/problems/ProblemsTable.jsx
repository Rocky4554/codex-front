"use client";
import { useProblems } from "@/hooks/useProblems";
import { DifficultyBadge } from "./DifficultyBadge";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export function ProblemsTable() {
    const { data: problems, isLoading, error } = useProblems();

    if (isLoading) return <LoadingSkeleton />;
    if (error)
        return <div className="text-red-400">Failed to load problems</div>;

    return (
        <table className="w-full">
            <thead>
                <tr className="text-left text-zinc-500 border-b border-zinc-800">
                    <th className="pb-3 font-medium w-12">Status</th>
                    <th className="pb-3 font-medium">Title</th>
                    <th className="pb-3 font-medium">Difficulty</th>
                    <th className="pb-3 font-medium">Acceptance</th>
                </tr>
            </thead>
            <tbody>
                {problems?.map((problem, i) => (
                    <tr
                        key={problem.id}
                        className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors"
                    >
                        <td className="py-3">
                            {problem.isSolved && (
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                            )}
                        </td>
                        <td className="py-3">
                            <Link
                                href={`/problems/${problem.slug}`}
                                className="text-white hover:text-green-400 transition-colors font-medium"
                            >
                                {i + 1}. {problem.title}
                            </Link>
                        </td>
                        <td className="py-3">
                            <DifficultyBadge difficulty={problem.difficulty} />
                        </td>
                        <td className="py-3 text-zinc-400 text-sm">
                            {problem.acceptanceRate}%
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

function LoadingSkeleton() {
    return (
        <div className="space-y-2">
            {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="h-12 bg-zinc-800/50 rounded animate-pulse" />
            ))}
        </div>
    );
}
