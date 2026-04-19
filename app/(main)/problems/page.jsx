"use client";
import Link from "next/link";
import { useProblems } from "@/hooks/useProblems";
import { useUserProblems } from "@/hooks/useUserProblems";
import { useAuthStore } from "@/store/authStore";
import { CheckCircle2, Circle } from "lucide-react";
import { useState } from "react";
import { logoutAction } from "@/app/actions/auth";
import { useRouter } from "next/navigation";

function DifficultyBadge({ difficulty }) {
    const styles = {
        EASY: "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20",
        MEDIUM: "bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20",
        HARD: "bg-rose-100 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/20",
    };
    const label = difficulty?.charAt(0) + difficulty?.slice(1).toLowerCase();
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[difficulty] || styles.MEDIUM}`}>
            {label || difficulty}
        </span>
    );
}

function UserAvatar({ username }) {
    const initials = username ? username.slice(0, 2).toUpperCase() : "??";
    return (
        <div className="w-full h-full bg-emerald-500 flex items-center justify-center text-white font-bold text-sm">
            {initials}
        </div>
    );
}

export default function ProblemsPage() {
    const { user, logout } = useAuthStore();
    const router = useRouter();
    const { data: problems, isLoading: problemsLoading } = useProblems();
    const { data: userProblems } = useUserProblems();
    const [search, setSearch] = useState("");
    const [difficultyFilter, setDifficultyFilter] = useState("ALL");
    const [showUserMenu, setShowUserMenu] = useState(false);

    // Build a Set of solved problem IDs for O(1) lookup
    const solvedIds = new Set(
        (userProblems || [])
            .filter((up) => up.status === "ACCEPTED" || up.status === "SOLVED")
            .map((up) => up.problemId)
    );

    const solvedCount = solvedIds.size;
    const totalCount = problems?.length || 0;
    const solvedPercent = totalCount ? Math.round((solvedCount / totalCount) * 100) : 0;

    const filtered = (problems || []).filter((p) => {
        const matchSearch = p.title?.toLowerCase().includes(search.toLowerCase());
        const matchDiff = difficultyFilter === "ALL" || p.difficulty === difficultyFilter;
        return matchSearch && matchDiff;
    });

    return (
        <div className="bg-[#f4f4f5] dark:bg-[#09090b] text-slate-900 dark:text-slate-100 font-sans min-h-screen flex flex-col antialiased selection:bg-emerald-500 selection:text-white">
            {/* Top Navigation */}
            <header className="sticky top-0 z-50 border-b border-zinc-200 dark:border-zinc-800 bg-[#f4f4f5]/80 dark:bg-[#09090b]/80 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 text-emerald-500">
                                <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M42.1739 20.1739L27.8261 5.82609C29.1366 7.13663 28.3989 10.1876 26.2002 13.7654C24.8538 15.9564 22.9595 18.3449 20.6522 20.6522C18.3449 22.9595 15.9564 24.8538 13.7654 26.2002C10.1876 28.3989 7.13663 29.1366 5.82609 27.8261L20.1739 42.1739C21.4845 43.4845 24.5355 42.7467 28.1133 40.548C30.3042 39.2016 32.6927 37.3073 35 35C37.3073 32.6927 39.2016 30.3042 40.548 28.1133C42.7467 24.5355 43.4845 21.4845 42.1739 20.1739Z" fill="currentColor"/>
                                    <path clipRule="evenodd" d="M7.24189 26.4066C7.31369 26.4411 7.64204 26.5637 8.52504 26.3738C9.59462 26.1438 11.0343 25.5311 12.7183 24.4963C14.7583 23.2426 17.0256 21.4503 19.238 19.238C21.4503 17.0256 23.2426 14.7583 24.4963 12.7183C25.5311 11.0343 26.1438 9.59463 26.3738 8.52504C26.5637 7.64204 26.4411 7.31369 26.4066 7.24189C26.345 7.21246 26.143 7.14535 25.6664 7.1918C24.9745 7.25925 23.9954 7.5498 22.7699 8.14278C20.3369 9.32007 17.3369 11.4915 14.4142 14.4142C11.4915 17.3369 9.32007 20.3369 8.14278 22.7699C7.5498 23.9954 7.25925 24.9745 7.1918 25.6664C7.14534 26.143 7.21246 26.345 7.24189 26.4066ZM29.9001 10.7285C29.4519 12.0322 28.7617 13.4172 27.9042 14.8126C26.465 17.1544 24.4686 19.6641 22.0664 22.0664C19.6641 24.4686 17.1544 26.465 14.8126 27.9042C13.4172 28.7617 12.0322 29.4519 10.7285 29.9001L21.5754 40.747C21.6001 40.7606 21.8995 40.931 22.8729 40.7217C23.9424 40.4916 25.3821 39.879 27.0661 38.8441C29.1062 37.5904 31.3734 35.7982 33.5858 33.5858C35.7982 31.3734 37.5904 29.1062 38.8441 27.0661C39.879 25.3821 40.4916 23.9425 40.7216 22.8729C40.931 21.8995 40.7606 21.6001 40.747 21.5754L29.9001 10.7285Z" fill="currentColor" fillRule="evenodd"/>
                                </svg>
                            </div>
                            <span className="text-lg font-bold tracking-tight">Codex</span>
                        </div>
                        <nav className="hidden md:flex items-center gap-8">
                            <Link className="text-sm font-medium text-emerald-500 transition-colors" href="/problems">Problems</Link>
                            <span className="text-sm font-medium text-slate-400 cursor-not-allowed">Contests</span>
                            <span className="text-sm font-medium text-slate-400 cursor-not-allowed">Discuss</span>
                            {user?.role === "ADMIN" && (
                                <Link className="text-sm font-medium text-amber-400 hover:text-amber-300 transition-colors" href="/admin">Admin</Link>
                            )}
                        </nav>
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <button
                                    onClick={() => setShowUserMenu(!showUserMenu)}
                                    className="flex items-center gap-2 pl-4 border-l border-zinc-200 dark:border-zinc-800 cursor-pointer group"
                                >
                                    <div className="relative w-8 h-8 overflow-hidden rounded-full ring-2 ring-transparent group-hover:ring-emerald-500 transition-all">
                                        <UserAvatar username={user?.username} />
                                    </div>
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300 hidden sm:block">
                                        {user?.username || "User"}
                                    </span>
                                    <span className="material-symbols-outlined text-slate-400 !text-[20px]">expand_more</span>
                                </button>
                                {showUserMenu && (
                                    <div className="absolute right-0 mt-2 w-48 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#18181b] shadow-lg z-50">
                                        <div className="p-3 border-b border-zinc-200 dark:border-zinc-800">
                                            <p className="text-sm font-semibold text-slate-900 dark:text-white">{user?.username}</p>
                                            <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                                        </div>
                                        <button
                                            onClick={async () => { await logoutAction(); logout(); router.push("/"); }}
                                            className="w-full text-left px-4 py-3 text-sm text-red-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors flex items-center gap-2"
                                        >
                                            <span className="material-symbols-outlined !text-[18px]">logout</span>
                                            Sign out
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                {/* Welcome Section */}
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2">
                        Welcome back, {user?.username || "Coder"}
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">Pick up where you left off and keep the streak alive.</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Problems Solved */}
                    <div className="group relative overflow-hidden rounded-xl bg-white dark:bg-[#18181b] p-6 border border-zinc-200 dark:border-zinc-800 hover:border-emerald-500/50 transition-all duration-300">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-500">
                                <span className="material-symbols-outlined">check_circle</span>
                            </div>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Problems Solved</p>
                            <div className="flex items-end gap-2">
                                <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{solvedCount}</h3>
                                <span className="text-sm text-slate-400 mb-1.5">/ {totalCount}</span>
                            </div>
                        </div>
                        <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-1.5 rounded-full mt-4 overflow-hidden">
                            <div className="bg-emerald-500 h-1.5 rounded-full transition-all" style={{ width: `${solvedPercent}%` }} />
                        </div>
                    </div>

                    {/* Submission Stats */}
                    <div className="group relative overflow-hidden rounded-xl bg-white dark:bg-[#18181b] p-6 border border-zinc-200 dark:border-zinc-800 hover:border-purple-500/50 transition-all duration-300">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-500/10 text-purple-600 dark:text-purple-500">
                                <span className="material-symbols-outlined">code</span>
                            </div>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Completion Rate</p>
                            <div className="flex items-end gap-2">
                                <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{solvedPercent}%</h3>
                            </div>
                        </div>
                        <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-1.5 rounded-full mt-4 overflow-hidden">
                            <div className="bg-gradient-to-r from-purple-500 to-indigo-500 h-1.5 rounded-full transition-all" style={{ width: `${solvedPercent}%` }} />
                        </div>
                    </div>
                </div>

                {/* Problems Table */}
                <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">All Problems</h2>
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 !text-[20px]">search</span>
                                <input
                                    className="pl-10 pr-4 py-2 bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 w-full sm:w-64"
                                    placeholder="Search problems..."
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                            <select
                                value={difficultyFilter}
                                onChange={(e) => setDifficultyFilter(e.target.value)}
                                className="p-2 bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                            >
                                <option value="ALL">All</option>
                                <option value="EASY">Easy</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="HARD">Hard</option>
                            </select>
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#18181b] shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800">
                                    <tr>
                                        <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400 w-16">Status</th>
                                        <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400">Title</th>
                                        <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400 w-40">Difficulty</th>
                                        <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400 w-40">Acceptance</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                                    {problemsLoading
                                        ? Array.from({ length: 8 }).map((_, i) => (
                                            <tr key={i}>
                                                <td colSpan={4} className="px-6 py-4">
                                                    <div className="h-5 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
                                                </td>
                                            </tr>
                                        ))
                                        : filtered.map((problem, i) => {
                                            const isSolved = solvedIds.has(problem.id);
                                            const slug = problem.slug || problem.id;
                                            return (
                                                <tr
                                                    key={problem.id}
                                                    className="group hover:bg-zinc-50 dark:hover:bg-[#27272a] transition-colors cursor-pointer"
                                                    onClick={() => window.location.href = `/problems/${slug}`}
                                                >
                                                    <td className="px-6 py-4">
                                                        {isSolved
                                                            ? <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                                            : <Circle className="w-5 h-5 text-zinc-400 dark:text-zinc-600" />
                                                        }
                                                    </td>
                                                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                                                        <Link href={`/problems/${slug}`} className="hover:text-emerald-500 transition-colors" onClick={(e) => e.stopPropagation()}>
                                                            {i + 1}. {problem.title}
                                                        </Link>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <DifficultyBadge difficulty={problem.difficulty} />
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                                                        {problem.acceptanceRate != null ? `${problem.acceptanceRate}%` : "—"}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    }
                                    {!problemsLoading && filtered.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                                                No problems found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
