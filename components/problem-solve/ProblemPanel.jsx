"use client";
import { useState } from "react";
import { useProblemSubmissions } from "@/hooks/useProblemSubmissions";
import { useLanguages } from "@/hooks/useLanguages";

function StatusBadge({ status }) {
    const s = String(status || "").toUpperCase();
    const styles =
        s === "ACCEPTED" ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" :
        s === "QUEUED" || s === "RUNNING" ? "text-blue-400 bg-blue-500/10 border-blue-500/20" :
        s === "WRONG_ANSWER" ? "text-rose-400 bg-rose-500/10 border-rose-500/20" :
        s === "TIME_LIMIT_EXCEEDED" || s === "MEMORY_LIMIT_EXCEEDED" ? "text-amber-400 bg-amber-500/10 border-amber-500/20" :
        s === "COMPILATION_ERROR" || s === "RUNTIME_ERROR" ? "text-orange-400 bg-orange-500/10 border-orange-500/20" :
        "text-zinc-400 bg-zinc-500/10 border-zinc-500/20";
    const label = s.replace(/_/g, " ");
    return (
        <span className={`text-[11px] px-2 py-0.5 rounded-full border font-medium ${styles}`}>
            {label || "—"}
        </span>
    );
}

function formatDate(iso) {
    if (!iso) return "—";
    try {
        const d = new Date(iso);
        return d.toLocaleString(undefined, {
            month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
        });
    } catch {
        return String(iso);
    }
}

function SubmissionsList({ problemId }) {
    const { data: submissions, isLoading, error } = useProblemSubmissions(problemId);
    const { data: languages } = useLanguages();

    const languageName = (id) => {
        const lang = (languages || []).find((l) => l.id === id);
        return lang?.name || "—";
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-16 text-zinc-400">
                <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                <span className="ml-3 text-sm">Loading submissions...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="py-16 text-center text-rose-400 text-sm">
                Failed to load submissions.
            </div>
        );
    }

    if (!submissions || submissions.length === 0) {
        return (
            <div className="py-16 text-center text-zinc-500 text-sm">
                No submissions yet. Submit your code to see results here.
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
                <thead className="bg-zinc-900/50 border-b border-zinc-800">
                    <tr>
                        <th className="px-4 py-3 font-medium text-zinc-400 text-xs uppercase">Status</th>
                        <th className="px-4 py-3 font-medium text-zinc-400 text-xs uppercase">Language</th>
                        <th className="px-4 py-3 font-medium text-zinc-400 text-xs uppercase">Tests</th>
                        <th className="px-4 py-3 font-medium text-zinc-400 text-xs uppercase">Time</th>
                        <th className="px-4 py-3 font-medium text-zinc-400 text-xs uppercase">Memory</th>
                        <th className="px-4 py-3 font-medium text-zinc-400 text-xs uppercase">Submitted</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                    {submissions.map((sub) => (
                        <tr key={sub.id} className="hover:bg-zinc-800/30 transition-colors">
                            <td className="px-4 py-3">
                                <StatusBadge status={sub.status} />
                            </td>
                            <td className="px-4 py-3 text-zinc-300">{languageName(sub.languageId)}</td>
                            <td className="px-4 py-3 text-zinc-400 text-xs">
                                {sub.passedTestCases != null && sub.totalTestCases != null
                                    ? `${sub.passedTestCases}/${sub.totalTestCases}`
                                    : "—"}
                            </td>
                            <td className="px-4 py-3 text-zinc-400 text-xs">
                                {sub.executionTimeMs != null ? `${sub.executionTimeMs} ms` : "—"}
                            </td>
                            <td className="px-4 py-3 text-zinc-400 text-xs">
                                {sub.memoryUsedMb != null ? `${sub.memoryUsedMb} MB` : "—"}
                            </td>
                            <td className="px-4 py-3 text-zinc-500 text-xs">{formatDate(sub.createdAt)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export function ProblemPanel({ problem }) {
    const [activeTab, setActiveTab] = useState("description");

    // Normalize difficulty to title case for display
    const difficulty = problem.difficulty
        ? problem.difficulty.charAt(0) + problem.difficulty.slice(1).toLowerCase()
        : "Medium";

    const difficultyStyle =
        difficulty === "Easy" ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" :
        difficulty === "Medium" ? "text-amber-400 bg-amber-400/10 border-amber-400/20" :
        "text-rose-500 bg-rose-500/10 border-rose-500/20";

    // Support both array and single string for constraints
    const constraints = Array.isArray(problem.constraints)
        ? problem.constraints
        : problem.constraints ? [problem.constraints] : [];

    // Support both array and single string for topics/tags
    const topics = problem.topics || problem.tags || [];

    // Support examples array or fallback
    const examples = problem.examples || problem.testCases?.slice(0, 2) || [];

    const tabButtonCls = (tab) =>
        tab === activeTab
            ? "px-4 py-2 bg-[#27272a] rounded-t-lg border-t border-x border-zinc-700 text-white text-sm font-medium flex items-center gap-2 cursor-pointer"
            : "px-4 py-2 hover:bg-[#27272a]/50 rounded-t-lg text-zinc-400 hover:text-white text-sm font-medium cursor-pointer transition-colors flex items-center gap-2";

    return (
        <section className="flex flex-col border-r border-zinc-800 bg-[#18181b] h-full overflow-hidden text-slate-100">
            {/* Tabs */}
            <div className="flex items-center gap-1 bg-[#18181b] border-b border-zinc-800 px-2 pt-2">
                <button
                    type="button"
                    onClick={() => setActiveTab("description")}
                    className={tabButtonCls("description")}
                >
                    <span className={`material-symbols-outlined text-[16px] ${activeTab === "description" ? "text-emerald-500" : ""}`}>description</span>
                    Description
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab("submissions")}
                    className={tabButtonCls("submissions")}
                >
                    <span className={`material-symbols-outlined text-[16px] ${activeTab === "submissions" ? "text-emerald-500" : ""}`}>history</span>
                    Submissions
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
                {activeTab === "description" && (
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h1 className="text-2xl font-bold text-white">{problem.title}</h1>
                            <div className="flex items-center gap-3">
                                <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${difficultyStyle}`}>
                                    {difficulty}
                                </span>
                                <div className="flex gap-1">
                                    <button className="text-zinc-500 hover:text-white"><span className="material-symbols-outlined text-[18px]">favorite</span></button>
                                    <button className="text-zinc-500 hover:text-white"><span className="material-symbols-outlined text-[18px]">share</span></button>
                                </div>
                            </div>
                        </div>

                        <div className="text-zinc-300 text-sm leading-relaxed space-y-4 whitespace-pre-wrap">
                            <p>{problem.description}</p>
                        </div>

                        {/* Examples */}
                        {examples.length > 0 && (
                            <div className="mt-8 space-y-6">
                                {examples.map((ex, i) => (
                                    <div key={i}>
                                        <h3 className="text-white font-semibold text-sm mb-3">Example {i + 1}:</h3>
                                        <div className="bg-[#09090b] border-l-2 border-zinc-700 p-4 rounded-r-lg font-mono text-xs text-zinc-300 space-y-2">
                                            {ex.input != null && <p><span className="text-zinc-500">Input:</span> {String(ex.input)}</p>}
                                            {ex.output != null && <p><span className="text-zinc-500">Output:</span> {String(ex.output)}</p>}
                                            {ex.explanation && <p><span className="text-zinc-500">Explanation:</span> {ex.explanation}</p>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Constraints */}
                        {constraints.length > 0 && (
                            <div className="mt-8 mb-4">
                                <h3 className="text-white font-semibold text-sm mb-3">Constraints:</h3>
                                <ul className="list-disc pl-5 space-y-2 text-zinc-400 text-xs">
                                    {constraints.map((c, i) => (
                                        <li key={i}><code className="bg-[#09090b] px-1 rounded text-zinc-300 font-mono">{c}</code></li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === "submissions" && (
                    <SubmissionsList problemId={problem.id} />
                )}
            </div>

            {/* Tags Footer — only on description tab */}
            {activeTab === "description" && topics.length > 0 && (
                <div className="p-4 border-t border-zinc-800 flex gap-2 flex-wrap">
                    {topics.map((topic, i) => (
                        <span key={i} className="text-xs bg-zinc-800 text-zinc-400 px-2 py-1 rounded hover:bg-zinc-700 hover:text-white transition-colors cursor-pointer">
                            {topic}
                        </span>
                    ))}
                </div>
            )}
        </section>
    );
}
