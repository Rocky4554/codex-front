"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { useProblems } from "@/hooks/useProblems";
import {
    useAdminUsers, useAdminUserSubmissions, useAdminUserProblems,
    useUpdateUserRole, useCreateProblem, useUpdateProblem, useDeleteProblem,
    useAddExample, useDeleteExample, useCreateTestCase, useDeleteTestCase,
} from "@/hooks/useAdmin";

// ─── Shared helpers ──────────────────────────────────────────────────────────

function DifficultyBadge({ difficulty }) {
    const styles = {
        EASY: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
        MEDIUM: "text-amber-400 bg-amber-400/10 border-amber-400/20",
        HARD: "text-rose-400 bg-rose-500/10 border-rose-500/20",
    };
    return (
        <span className={`text-[11px] px-2 py-0.5 rounded-full border font-medium ${styles[difficulty] || styles.MEDIUM}`}>
            {difficulty?.charAt(0) + difficulty?.slice(1).toLowerCase()}
        </span>
    );
}

function StatusBadge({ status }) {
    const s = String(status || "").toUpperCase();
    const styles =
        s === "ACCEPTED" ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" :
        s === "WRONG_ANSWER" ? "text-rose-400 bg-rose-500/10 border-rose-500/20" :
        "text-zinc-400 bg-zinc-500/10 border-zinc-500/20";
    return (
        <span className={`text-[11px] px-2 py-0.5 rounded-full border font-medium ${styles}`}>
            {s.replace(/_/g, " ") || "—"}
        </span>
    );
}

function formatDate(iso) {
    if (!iso) return "—";
    try {
        return new Date(iso).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
    } catch { return String(iso); }
}

// ─── Problem Form ─────────────────────────────────────────────────────────────

const EMPTY_PROBLEM = {
    title: "", description: "", difficulty: "EASY",
    timeLimitMs: 2000, memoryLimitMb: 256, orderNum: "",
    constraints: "", topics: "",
};

function ProblemForm({ initial, onSave, onCancel, saving }) {
    const [form, setForm] = useState(initial || EMPTY_PROBLEM);
    const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            title: form.title.trim(),
            description: form.description.trim(),
            difficulty: form.difficulty,
            timeLimitMs: Number(form.timeLimitMs),
            memoryLimitMb: Number(form.memoryLimitMb),
            orderNum: form.orderNum !== "" ? Number(form.orderNum) : null,
            constraints: form.constraints ? form.constraints.split("\n").map((s) => s.trim()).filter(Boolean) : [],
            topics: form.topics ? form.topics.split(",").map((s) => s.trim()).filter(Boolean) : [],
        });
    };

    const inputCls = "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500";
    const labelCls = "block text-xs font-medium text-zinc-400 mb-1";

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                    <label className={labelCls}>Title *</label>
                    <input className={inputCls} value={form.title} onChange={(e) => set("title", e.target.value)} required placeholder="Two Sum" />
                </div>
                <div>
                    <label className={labelCls}>Difficulty</label>
                    <select className={inputCls} value={form.difficulty} onChange={(e) => set("difficulty", e.target.value)}>
                        <option value="EASY">Easy</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HARD">Hard</option>
                    </select>
                </div>
                <div>
                    <label className={labelCls}>Order #</label>
                    <input className={inputCls} type="number" value={form.orderNum} onChange={(e) => set("orderNum", e.target.value)} placeholder="1" />
                </div>
                <div>
                    <label className={labelCls}>Time Limit (ms)</label>
                    <input className={inputCls} type="number" value={form.timeLimitMs} onChange={(e) => set("timeLimitMs", e.target.value)} />
                </div>
                <div>
                    <label className={labelCls}>Memory Limit (MB)</label>
                    <input className={inputCls} type="number" value={form.memoryLimitMb} onChange={(e) => set("memoryLimitMb", e.target.value)} />
                </div>
                <div className="col-span-2">
                    <label className={labelCls}>Description *</label>
                    <textarea className={`${inputCls} h-40 resize-y font-mono text-xs`} value={form.description} onChange={(e) => set("description", e.target.value)} required placeholder="Problem statement..." />
                </div>
                <div className="col-span-2">
                    <label className={labelCls}>Constraints (one per line)</label>
                    <textarea className={`${inputCls} h-20 resize-y font-mono text-xs`} value={form.constraints} onChange={(e) => set("constraints", e.target.value)} placeholder={"1 <= n <= 10^4\n-10^9 <= nums[i] <= 10^9"} />
                </div>
                <div className="col-span-2">
                    <label className={labelCls}>Topics (comma-separated)</label>
                    <input className={inputCls} value={form.topics} onChange={(e) => set("topics", e.target.value)} placeholder="Array, Hash Table, Two Pointers" />
                </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={onCancel} className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors">Cancel</button>
                <button type="submit" disabled={saving} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg disabled:opacity-50 transition-colors">
                    {saving ? "Saving…" : "Save Problem"}
                </button>
            </div>
        </form>
    );
}

// ─── Test Case Form ───────────────────────────────────────────────────────────

function TestCaseForm({ problemId, onClose }) {
    const [input, setInput] = useState("");
    const [output, setOutput] = useState("");
    const [isSample, setIsSample] = useState(false);
    const createTC = useCreateTestCase();

    const handleSubmit = async (e) => {
        e.preventDefault();
        await createTC.mutateAsync({ problemId, input, expectedOutput: output, isSample });
        setInput(""); setOutput(""); setIsSample(false);
        onClose();
    };

    const inputCls = "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 font-mono";

    return (
        <form onSubmit={handleSubmit} className="space-y-3">
            <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Input</label>
                <textarea className={`${inputCls} h-20 resize-y`} value={input} onChange={(e) => setInput(e.target.value)} required placeholder="[2,7,11,15]&#10;9" />
            </div>
            <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Expected Output</label>
                <textarea className={`${inputCls} h-16 resize-y`} value={output} onChange={(e) => setOutput(e.target.value)} required placeholder="[0,1]" />
            </div>
            <label className="flex items-center gap-2 text-sm text-zinc-400 cursor-pointer">
                <input type="checkbox" checked={isSample} onChange={(e) => setIsSample(e.target.checked)} className="accent-emerald-500" />
                Sample test case (shown to user)
            </label>
            <div className="flex justify-end gap-2">
                <button type="button" onClick={onClose} className="px-3 py-1.5 text-sm text-zinc-400 hover:text-white transition-colors">Cancel</button>
                <button type="submit" disabled={createTC.isPending} className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm rounded-lg disabled:opacity-50">
                    {createTC.isPending ? "Adding…" : "Add Test Case"}
                </button>
            </div>
        </form>
    );
}

// ─── Example Form ─────────────────────────────────────────────────────────────

function ExampleForm({ problemId, onClose }) {
    const [input, setInput] = useState("");
    const [output, setOutput] = useState("");
    const [explanation, setExplanation] = useState("");
    const addExample = useAddExample();

    const handleSubmit = async (e) => {
        e.preventDefault();
        await addExample.mutateAsync({ problemId, input, output, explanation: explanation || null });
        onClose();
    };

    const inputCls = "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 font-mono";

    return (
        <form onSubmit={handleSubmit} className="space-y-3">
            <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Input</label>
                <input className={inputCls} value={input} onChange={(e) => setInput(e.target.value)} required placeholder="nums = [2,7,11,15], target = 9" />
            </div>
            <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Output</label>
                <input className={inputCls} value={output} onChange={(e) => setOutput(e.target.value)} required placeholder="[0,1]" />
            </div>
            <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Explanation (optional)</label>
                <input className={inputCls} value={explanation} onChange={(e) => setExplanation(e.target.value)} placeholder="nums[0] + nums[1] == 9" />
            </div>
            <div className="flex justify-end gap-2">
                <button type="button" onClick={onClose} className="px-3 py-1.5 text-sm text-zinc-400 hover:text-white transition-colors">Cancel</button>
                <button type="submit" disabled={addExample.isPending} className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm rounded-lg disabled:opacity-50">
                    {addExample.isPending ? "Adding…" : "Add Example"}
                </button>
            </div>
        </form>
    );
}

// ─── Problems Tab ─────────────────────────────────────────────────────────────

function ProblemsTab() {
    const { data: problems, isLoading } = useProblems();
    const createProblem = useCreateProblem();
    const updateProblem = useUpdateProblem();
    const deleteProblem = useDeleteProblem();
    const deleteExample = useDeleteExample();

    const [showCreate, setShowCreate] = useState(false);
    const [editId, setEditId] = useState(null);
    const [expandedId, setExpandedId] = useState(null);
    const [showExampleForm, setShowExampleForm] = useState(null);
    const [showTCForm, setShowTCForm] = useState(null);

    const sorted = (problems || []).slice().sort((a, b) => (a.orderNum ?? 9999) - (b.orderNum ?? 9999));

    const handleCreate = async (body) => {
        await createProblem.mutateAsync(body);
        setShowCreate(false);
    };

    const handleUpdate = async (body) => {
        await updateProblem.mutateAsync({ id: editId, ...body });
        setEditId(null);
    };

    const handleDelete = async (id, title) => {
        if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
        await deleteProblem.mutateAsync(id);
        if (expandedId === id) setExpandedId(null);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">Problems ({problems?.length ?? 0})</h2>
                <button
                    onClick={() => { setShowCreate(true); setEditId(null); }}
                    className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg transition-colors"
                >
                    <span className="material-symbols-outlined text-[16px]">add</span>
                    New Problem
                </button>
            </div>

            {/* Create form */}
            {showCreate && (
                <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-5">
                    <h3 className="text-sm font-semibold text-white mb-4">Create Problem</h3>
                    <ProblemForm onSave={handleCreate} onCancel={() => setShowCreate(false)} saving={createProblem.isPending} />
                </div>
            )}

            {isLoading ? (
                <div className="py-16 text-center text-zinc-400 text-sm">Loading problems…</div>
            ) : (
                <div className="space-y-2">
                    {sorted.map((problem) => (
                        <div key={problem.id} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                            {/* Row */}
                            <div className="flex items-center gap-3 px-4 py-3">
                                <span className="text-xs text-zinc-500 w-8 shrink-0">#{problem.orderNum ?? "—"}</span>
                                <button
                                    onClick={() => setExpandedId(expandedId === problem.id ? null : problem.id)}
                                    className="flex-1 text-left text-sm font-medium text-white hover:text-emerald-400 transition-colors truncate"
                                >
                                    {problem.title}
                                </button>
                                <DifficultyBadge difficulty={problem.difficulty} />
                                <div className="flex items-center gap-1 shrink-0">
                                    <button
                                        onClick={() => { setEditId(problem.id); setShowCreate(false); setExpandedId(problem.id); }}
                                        className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded transition-colors"
                                        title="Edit"
                                    >
                                        <span className="material-symbols-outlined text-[16px]">edit</span>
                                    </button>
                                    <button
                                        onClick={() => handleDelete(problem.id, problem.title)}
                                        className="p-1.5 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors"
                                        title="Delete"
                                    >
                                        <span className="material-symbols-outlined text-[16px]">delete</span>
                                    </button>
                                    <button
                                        onClick={() => setExpandedId(expandedId === problem.id ? null : problem.id)}
                                        className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-[16px]">
                                            {expandedId === problem.id ? "expand_less" : "expand_more"}
                                        </span>
                                    </button>
                                </div>
                            </div>

                            {/* Expanded detail */}
                            {expandedId === problem.id && (
                                <div className="border-t border-zinc-800 p-4 space-y-4">
                                    {/* Edit form */}
                                    {editId === problem.id && (
                                        <div className="bg-zinc-800/50 rounded-lg p-4">
                                            <h4 className="text-sm font-semibold text-white mb-3">Edit Problem</h4>
                                            <ProblemForm
                                                initial={{
                                                    ...problem,
                                                    constraints: Array.isArray(problem.constraints) ? problem.constraints.join("\n") : (problem.constraints || ""),
                                                    topics: Array.isArray(problem.topics) ? problem.topics.join(", ") : (problem.topics || ""),
                                                }}
                                                onSave={handleUpdate}
                                                onCancel={() => setEditId(null)}
                                                saving={updateProblem.isPending}
                                            />
                                        </div>
                                    )}

                                    {/* Examples */}
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="text-xs font-semibold text-zinc-400 uppercase">Examples</h4>
                                            <button
                                                onClick={() => setShowExampleForm(showExampleForm === problem.id ? null : problem.id)}
                                                className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                                            >
                                                <span className="material-symbols-outlined text-[14px]">add</span>
                                                Add
                                            </button>
                                        </div>
                                        {showExampleForm === problem.id && (
                                            <div className="mb-3 bg-zinc-800/50 rounded-lg p-3">
                                                <ExampleForm problemId={problem.id} onClose={() => setShowExampleForm(null)} />
                                            </div>
                                        )}
                                        {(problem.examples || []).length === 0 ? (
                                            <p className="text-xs text-zinc-600">No examples yet.</p>
                                        ) : (
                                            <div className="space-y-2">
                                                {(problem.examples || []).map((ex, i) => (
                                                    <div key={ex.id || i} className="flex items-start gap-2 bg-zinc-800/30 rounded-lg p-2 font-mono text-xs text-zinc-400">
                                                        <div className="flex-1 space-y-0.5">
                                                            <div><span className="text-zinc-600">in:</span> {ex.input}</div>
                                                            <div><span className="text-zinc-600">out:</span> {ex.output}</div>
                                                            {ex.explanation && <div><span className="text-zinc-600">exp:</span> {ex.explanation}</div>}
                                                        </div>
                                                        <button
                                                            onClick={() => deleteExample.mutate({ problemId: problem.id, exampleId: ex.id })}
                                                            className="text-zinc-600 hover:text-rose-400 transition-colors"
                                                        >
                                                            <span className="material-symbols-outlined text-[14px]">close</span>
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Test Cases */}
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="text-xs font-semibold text-zinc-400 uppercase">Test Cases</h4>
                                            <button
                                                onClick={() => setShowTCForm(showTCForm === problem.id ? null : problem.id)}
                                                className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                                            >
                                                <span className="material-symbols-outlined text-[14px]">add</span>
                                                Add
                                            </button>
                                        </div>
                                        {showTCForm === problem.id && (
                                            <div className="mb-3 bg-zinc-800/50 rounded-lg p-3">
                                                <TestCaseForm problemId={problem.id} onClose={() => setShowTCForm(null)} />
                                            </div>
                                        )}
                                        <p className="text-xs text-zinc-600">Expand test case list via the problem detail page.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                    {sorted.length === 0 && !isLoading && (
                        <p className="py-16 text-center text-zinc-500 text-sm">No problems yet. Create one above.</p>
                    )}
                </div>
            )}
        </div>
    );
}

// ─── User Detail Panel ────────────────────────────────────────────────────────

function UserDetailPanel({ user, onClose }) {
    const [tab, setTab] = useState("submissions");
    const { data: submissions, isLoading: subsLoading } = useAdminUserSubmissions(user.id);
    const { data: problems, isLoading: probsLoading } = useAdminUserProblems(user.id);
    const updateRole = useUpdateUserRole();

    const handleRoleToggle = async () => {
        const newRole = user.role === "ADMIN" ? "USER" : "ADMIN";
        if (!confirm(`Change ${user.username} to ${newRole}?`)) return;
        await updateRole.mutateAsync({ userId: user.id, role: newRole });
    };

    const tabCls = (t) => t === tab
        ? "px-3 py-1.5 bg-zinc-700 text-white text-xs font-medium rounded-lg"
        : "px-3 py-1.5 text-zinc-400 hover:text-white text-xs transition-colors";

    return (
        <div className="bg-zinc-900 border border-zinc-700 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-zinc-800">
                <div>
                    <h3 className="text-sm font-bold text-white">{user.username}</h3>
                    <p className="text-xs text-zinc-500">{user.email}</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`text-[11px] px-2 py-0.5 rounded-full border font-medium ${user.role === "ADMIN" ? "text-amber-400 bg-amber-400/10 border-amber-400/20" : "text-zinc-400 bg-zinc-500/10 border-zinc-500/20"}`}>
                        {user.role}
                    </span>
                    <button
                        onClick={handleRoleToggle}
                        disabled={updateRole.isPending}
                        className="text-xs text-zinc-400 hover:text-white border border-zinc-700 rounded px-2 py-1 transition-colors disabled:opacity-50"
                    >
                        {user.role === "ADMIN" ? "→ USER" : "→ ADMIN"}
                    </button>
                    <button onClick={onClose} className="p-1 text-zinc-400 hover:text-white">
                        <span className="material-symbols-outlined text-[18px]">close</span>
                    </button>
                </div>
            </div>

            <div className="p-4 grid grid-cols-3 gap-3 border-b border-zinc-800 text-center">
                <div>
                    <p className="text-xl font-bold text-white">{user.solvedCount ?? 0}</p>
                    <p className="text-xs text-zinc-500">Solved</p>
                </div>
                <div>
                    <p className="text-xl font-bold text-white">{user.submissionCount ?? 0}</p>
                    <p className="text-xs text-zinc-500">Submissions</p>
                </div>
                <div>
                    <p className="text-xl font-bold text-white">
                        {user.submissionCount ? Math.round((user.solvedCount / user.submissionCount) * 100) : 0}%
                    </p>
                    <p className="text-xs text-zinc-500">Acceptance</p>
                </div>
            </div>

            <div className="flex gap-1 p-3 border-b border-zinc-800">
                <button className={tabCls("submissions")} onClick={() => setTab("submissions")}>Submissions</button>
                <button className={tabCls("problems")} onClick={() => setTab("problems")}>Solved Problems</button>
            </div>

            <div className="max-h-80 overflow-y-auto">
                {tab === "submissions" && (
                    subsLoading ? (
                        <div className="py-8 text-center text-zinc-400 text-sm">Loading…</div>
                    ) : (submissions || []).length === 0 ? (
                        <div className="py-8 text-center text-zinc-500 text-sm">No submissions.</div>
                    ) : (
                        <table className="w-full text-sm">
                            <thead className="bg-zinc-900/50">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs text-zinc-500">Status</th>
                                    <th className="px-4 py-2 text-left text-xs text-zinc-500">Problem</th>
                                    <th className="px-4 py-2 text-left text-xs text-zinc-500">Tests</th>
                                    <th className="px-4 py-2 text-left text-xs text-zinc-500">Submitted</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800">
                                {(submissions || []).map((s) => (
                                    <tr key={s.id} className="hover:bg-zinc-800/30 transition-colors">
                                        <td className="px-4 py-2"><StatusBadge status={s.status} /></td>
                                        <td className="px-4 py-2 text-zinc-300 text-xs truncate max-w-32">{s.problemTitle || s.problemId?.slice(0, 8)}</td>
                                        <td className="px-4 py-2 text-zinc-400 text-xs">
                                            {s.passedTestCases != null ? `${s.passedTestCases}/${s.totalTestCases}` : "—"}
                                        </td>
                                        <td className="px-4 py-2 text-zinc-500 text-xs">{formatDate(s.createdAt)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )
                )}

                {tab === "problems" && (
                    probsLoading ? (
                        <div className="py-8 text-center text-zinc-400 text-sm">Loading…</div>
                    ) : (problems || []).length === 0 ? (
                        <div className="py-8 text-center text-zinc-500 text-sm">No solved problems.</div>
                    ) : (
                        <table className="w-full text-sm">
                            <thead className="bg-zinc-900/50">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs text-zinc-500">Problem</th>
                                    <th className="px-4 py-2 text-left text-xs text-zinc-500">Status</th>
                                    <th className="px-4 py-2 text-left text-xs text-zinc-500">Updated</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800">
                                {(problems || []).map((p) => (
                                    <tr key={p.problemId} className="hover:bg-zinc-800/30 transition-colors">
                                        <td className="px-4 py-2 text-zinc-300 text-xs">{p.problemTitle || p.problemId?.slice(0, 8)}</td>
                                        <td className="px-4 py-2"><StatusBadge status={p.status} /></td>
                                        <td className="px-4 py-2 text-zinc-500 text-xs">{formatDate(p.solvedAt)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )
                )}
            </div>
        </div>
    );
}

// ─── Users Tab ────────────────────────────────────────────────────────────────

function UsersTab() {
    const { data: users, isLoading } = useAdminUsers();
    const [selectedUser, setSelectedUser] = useState(null);
    const [search, setSearch] = useState("");

    const filtered = (users || []).filter((u) =>
        u.username?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">Users ({users?.length ?? 0})</h2>
                <input
                    className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 w-56"
                    placeholder="Search users…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {selectedUser && (
                <UserDetailPanel
                    user={selectedUser}
                    onClose={() => setSelectedUser(null)}
                />
            )}

            {isLoading ? (
                <div className="py-16 text-center text-zinc-400 text-sm">Loading users…</div>
            ) : (
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-zinc-900/50 border-b border-zinc-800">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400">User</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400">Role</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400">Solved</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400">Submissions</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400">Joined</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800">
                            {filtered.map((u) => (
                                <tr
                                    key={u.id}
                                    onClick={() => setSelectedUser(u)}
                                    className="hover:bg-zinc-800/30 transition-colors cursor-pointer"
                                >
                                    <td className="px-4 py-3">
                                        <div className="font-medium text-white">{u.username}</div>
                                        <div className="text-xs text-zinc-500">{u.email}</div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`text-[11px] px-2 py-0.5 rounded-full border font-medium ${u.role === "ADMIN" ? "text-amber-400 bg-amber-400/10 border-amber-400/20" : "text-zinc-400 bg-zinc-500/10 border-zinc-500/20"}`}>
                                            {u.role}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-zinc-300">{u.solvedCount ?? 0}</td>
                                    <td className="px-4 py-3 text-zinc-300">{u.submissionCount ?? 0}</td>
                                    <td className="px-4 py-3 text-zinc-500 text-xs">{formatDate(u.createdAt)}</td>
                                </tr>
                            ))}
                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-4 py-12 text-center text-zinc-500 text-sm">No users found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

// ─── Admin Page ───────────────────────────────────────────────────────────────

export default function AdminPage() {
    const { user } = useAuthStore();
    const router = useRouter();
    const [tab, setTab] = useState("problems");

    // Redirect non-admins
    if (typeof window !== "undefined" && user && user.role !== "ADMIN") {
        router.replace("/problems");
        return null;
    }

    const tabCls = (t) => t === tab
        ? "px-4 py-2 text-sm font-medium text-white border-b-2 border-emerald-500"
        : "px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white border-b-2 border-transparent transition-colors";

    return (
        <div className="min-h-screen bg-[#09090b] text-white">
            {/* Header */}
            <header className="h-14 flex items-center justify-between px-6 border-b border-zinc-800 bg-[#18181b] sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <Link href="/problems" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <span className="font-bold text-lg tracking-tight text-emerald-400">Codex</span>
                    </Link>
                    <div className="w-px h-5 bg-zinc-700" />
                    <span className="text-sm font-semibold text-amber-400">Admin Panel</span>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-xs text-zinc-500">{user?.username}</span>
                    <Link href="/problems" className="text-sm text-zinc-400 hover:text-white transition-colors">
                        ← Back to Problems
                    </Link>
                </div>
            </header>

            {/* Tabs */}
            <div className="border-b border-zinc-800 px-6 flex gap-0">
                <button className={tabCls("problems")} onClick={() => setTab("problems")}>Problems</button>
                <button className={tabCls("users")} onClick={() => setTab("users")}>Users</button>
            </div>

            {/* Content */}
            <div className="max-w-5xl mx-auto px-6 py-6">
                {tab === "problems" && <ProblemsTab />}
                {tab === "users" && <UsersTab />}
            </div>
        </div>
    );
}
