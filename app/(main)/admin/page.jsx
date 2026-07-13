"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { useProblems } from "@/hooks/useProblems";
import {
    useAdminUsers, useAdminUserSubmissions, useAdminUserProblems,
    useUpdateUserRole, useCreateProblem, useUpdateProblem, useDeleteProblem,
    useAdminProblemDetail, useGenerateProblemAI, useEditProblemAI, useVerifyProblemAI,
} from "@/hooks/useAdmin";
import { AppHeader } from "@/components/shared/AppHeader";

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
    examples: [],
    testCases: [{ input: "", expectedOutput: "", isSample: false }],
};

const createEmptyExample = () => ({
    id: null,
    input: "",
    output: "",
    explanation: "",
    displayOrder: "",
});

const createEmptyTestCase = () => ({
    id: null,
    input: "",
    expectedOutput: "",
    isSample: false,
});

function normalizeProblemForm(initial) {
    if (!initial) {
        return {
            ...EMPTY_PROBLEM,
            examples: [],
            testCases: [createEmptyTestCase()],
            referenceSolution: null,
            meta: null,
        };
    }

    return {
        title: initial.title || "",
        description: initial.description || "",
        difficulty: initial.difficulty || "EASY",
        timeLimitMs: initial.timeLimitMs ?? 2000,
        memoryLimitMb: initial.memoryLimitMb ?? 256,
        orderNum: initial.orderNum ?? "",
        constraints: Array.isArray(initial.constraints) ? initial.constraints.join("\n") : (initial.constraints || ""),
        topics: Array.isArray(initial.topics) ? initial.topics.join(", ") : (initial.topics || ""),
        examples: Array.isArray(initial.examples) && initial.examples.length > 0
            ? initial.examples.map((example, index) => ({
                id: example.id ?? null,
                input: example.input || "",
                output: example.output || "",
                explanation: example.explanation || "",
                displayOrder: example.displayOrder ?? index,
            }))
            : [],
        testCases: Array.isArray(initial.testCases) && initial.testCases.length > 0
            ? initial.testCases.map((testCase) => ({
                id: testCase.id ?? null,
                input: testCase.input || "",
                expectedOutput: testCase.expectedOutput || "",
                isSample: Boolean(testCase.isSample),
                // AI-only fields (ignored on save); used to show verified badges.
                verified: Boolean(testCase.verified),
                note: testCase.note || "",
            }))
            : [createEmptyTestCase()],
        // Carried through AI edits so re-verification keeps working. Ignored on save.
        referenceSolution: initial.referenceSolution || null,
        meta: initial.meta || null,
    };
}

function ProblemForm({ initial, onSave, onCancel, saving, onAiEdit }) {
    const [form, setForm] = useState(() => normalizeProblemForm(initial));
    const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

    const [aiInstruction, setAiInstruction] = useState("");
    const [aiEditing, setAiEditing] = useState(false);
    const [aiError, setAiError] = useState("");

    const verifySqlAI = useVerifyProblemAI();
    const [sqlQuery, setSqlQuery] = useState("");
    const [verifySqlError, setVerifySqlError] = useState("");
    const [isSql, setIsSql] = useState(() => initial?.referenceSolution?.language === "SQL");

    useEffect(() => {
        setForm(normalizeProblemForm(initial));
        setSqlQuery(initial?.referenceSolution?.sourceCode || "");
        setIsSql(initial?.referenceSolution?.language === "SQL");
    }, [initial]);

    // Snapshot the current form as a draft (matching the backend ProblemDraft
    // shape) so the AI edit applies to the admin's latest manual tweaks too.
    const buildDraft = () => ({
        title: form.title,
        description: form.description,
        difficulty: form.difficulty,
        timeLimitMs: Number(form.timeLimitMs),
        memoryLimitMb: Number(form.memoryLimitMb),
        orderNum: form.orderNum !== "" ? Number(form.orderNum) : null,
        constraints: form.constraints ? form.constraints.split("\n").map((s) => s.trim()).filter(Boolean) : [],
        topics: form.topics ? form.topics.split(",").map((s) => s.trim()).filter(Boolean) : [],
        examples: form.examples.map((ex, index) => ({
            input: ex.input,
            output: ex.output,
            explanation: ex.explanation || null,
            displayOrder: ex.displayOrder !== "" ? Number(ex.displayOrder) : index,
        })),
        testCases: form.testCases.map((tc) => ({
            input: tc.input,
            expectedOutput: tc.expectedOutput,
            isSample: Boolean(tc.isSample),
        })),
        referenceSolution: form.referenceSolution || null,
    });

    const handleAiEdit = async () => {
        if (!aiInstruction.trim() || !onAiEdit) return;
        setAiError("");
        setAiEditing(true);
        try {
            const updated = await onAiEdit({ current: buildDraft(), instruction: aiInstruction.trim() });
            setForm(normalizeProblemForm(updated));
            setAiInstruction("");
        } catch (err) {
            setAiError(err?.response?.data?.message || err?.message || "AI edit failed. Try again.");
        } finally {
            setAiEditing(false);
        }
    };

    // Runs the reference SQL query against each test case's input on real SQLite
    // and fills in Expected Output. Missing ORDER BY is appended automatically
    // server-side so results are deterministic and stop flaking on grading.
    const handleVerifySql = async () => {
        if (!sqlQuery.trim()) return;
        setVerifySqlError("");
        try {
            const result = await verifySqlAI.mutateAsync({
                referenceSolution: { language: "SQL", sourceCode: sqlQuery.trim() },
                testCases: form.testCases.map((tc) => ({
                    input: tc.input,
                    expectedOutput: tc.expectedOutput,
                    isSample: Boolean(tc.isSample),
                })),
                timeLimitMs: Number(form.timeLimitMs),
                memoryLimitMb: Number(form.memoryLimitMb),
            });
            const normalized = normalizeProblemForm({ ...form, ...result });
            setForm((current) => ({ ...current, testCases: normalized.testCases, meta: normalized.meta }));
            if (result.referenceSolution?.sourceCode) {
                setSqlQuery(result.referenceSolution.sourceCode);
            }
        } catch (err) {
            setVerifySqlError(err?.response?.data?.message || err?.message || "Verification failed. Try again.");
        }
    };

    const updateExample = (index, key, value) => {
        setForm((current) => ({
            ...current,
            examples: current.examples.map((example, i) => (
                i === index ? { ...example, [key]: value } : example
            )),
        }));
    };

    const addExample = () => {
        setForm((current) => ({ ...current, examples: [...current.examples, createEmptyExample()] }));
    };

    const removeExample = (index) => {
        setForm((current) => ({
            ...current,
            examples: current.examples.filter((_, i) => i !== index),
        }));
    };

    const updateTestCase = (index, key, value) => {
        setForm((current) => ({
            ...current,
            testCases: current.testCases.map((testCase, i) => (
                i === index ? { ...testCase, [key]: value } : testCase
            )),
        }));
    };

    const addTestCase = () => {
        setForm((current) => ({ ...current, testCases: [...current.testCases, createEmptyTestCase()] }));
    };

    const removeTestCase = (index) => {
        setForm((current) => ({
            ...current,
            testCases: current.testCases.filter((_, i) => i !== index),
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const examples = form.examples
            .map((example, index) => ({
                id: example.id || undefined,
                input: example.input.trim(),
                output: example.output.trim(),
                explanation: example.explanation.trim(),
                displayOrder: example.displayOrder !== "" ? Number(example.displayOrder) : index,
            }))
            .filter((example) => example.input || example.output || example.explanation);

        if (examples.some((example) => !example.input || !example.output)) {
            window.alert("Each example needs both input and output.");
            return;
        }

        const testCases = form.testCases
            .map((testCase) => ({
                id: testCase.id || undefined,
                input: testCase.input.trim(),
                expectedOutput: testCase.expectedOutput.trim(),
                isSample: Boolean(testCase.isSample),
            }))
            .filter((testCase) => testCase.input || testCase.expectedOutput);

        if (testCases.length === 0) {
            window.alert("Add at least one test case before saving the problem.");
            return;
        }

        if (testCases.some((testCase) => !testCase.input || !testCase.expectedOutput)) {
            window.alert("Each test case needs both input and expected output.");
            return;
        }

        onSave({
            title: form.title.trim(),
            description: form.description.trim(),
            difficulty: form.difficulty,
            timeLimitMs: Number(form.timeLimitMs),
            memoryLimitMb: Number(form.memoryLimitMb),
            orderNum: form.orderNum !== "" ? Number(form.orderNum) : null,
            constraints: form.constraints ? form.constraints.split("\n").map((s) => s.trim()).filter(Boolean) : [],
            topics: form.topics ? form.topics.split(",").map((s) => s.trim()).filter(Boolean) : [],
            examples: examples.map((example) => ({
                ...example,
                explanation: example.explanation || null,
            })),
            testCases,
        });
    };

    const inputCls = "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500";
    const labelCls = "block text-xs font-medium text-zinc-400 mb-1";
    const sectionTitleCls = "text-xs font-semibold text-zinc-400 uppercase tracking-wide";
    const cardCls = "rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 space-y-3";

    const meta = form.meta;

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* AI edit box — "tell the AI to change it" */}
            {onAiEdit && (
                <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/5 p-3 space-y-2">
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-indigo-300">
                        <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
                        Ask AI to edit this problem
                    </label>
                    <div className="flex gap-2">
                        <input
                            className={inputCls}
                            value={aiInstruction}
                            onChange={(e) => setAiInstruction(e.target.value)}
                            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAiEdit(); } }}
                            placeholder='e.g. "make it Hard and add 3 more edge-case tests"'
                            disabled={aiEditing}
                        />
                        <button
                            type="button"
                            onClick={handleAiEdit}
                            disabled={aiEditing || !aiInstruction.trim()}
                            className="shrink-0 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg disabled:opacity-50 transition-colors"
                        >
                            {aiEditing ? "Editing…" : "Apply"}
                        </button>
                    </div>
                    <p className="text-[11px] text-indigo-300/70">
                        The AI rewrites the whole problem and re-runs the reference solution to re-verify test outputs.
                    </p>
                    {aiError && <p className="text-[11px] text-rose-400">{aiError}</p>}
                </div>
            )}

            {/* Verification report from the last AI generation/edit */}
            {meta && (
                <div className={`rounded-xl border p-3 text-xs ${meta.verified ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-300" : "border-amber-500/30 bg-amber-500/5 text-amber-300"}`}>
                    <div className="flex items-center gap-1.5 font-semibold">
                        <span className="material-symbols-outlined text-[16px]">{meta.verified ? "verified" : "warning"}</span>
                        {meta.verified
                            ? `All ${meta.totalTestCases} test cases verified by running the reference solution (${meta.referenceLanguage || "?"}).`
                            : `${meta.verifiedCount}/${meta.totalTestCases} test cases verified. Review the unverified ones before saving.`}
                    </div>
                    {Array.isArray(meta.warnings) && meta.warnings.length > 0 && (
                        <ul className="mt-1.5 list-disc pl-5 space-y-0.5 text-amber-300/80">
                            {meta.warnings.map((w, i) => <li key={i}>{w}</li>)}
                        </ul>
                    )}
                    {meta.compileError && (
                        <pre className="mt-1.5 max-h-32 overflow-auto whitespace-pre-wrap rounded bg-zinc-900/60 p-2 text-[11px] text-rose-300">{meta.compileError}</pre>
                    )}
                </div>
            )}

            <div className="flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900/60 p-1 w-fit">
                <button
                    type="button"
                    onClick={() => setIsSql(false)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${!isSql ? "bg-emerald-600 text-white" : "text-zinc-400 hover:text-white"}`}
                >
                    Coding problem
                </button>
                <button
                    type="button"
                    onClick={() => setIsSql(true)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${isSql ? "bg-sky-600 text-white" : "text-zinc-400 hover:text-white"}`}
                >
                    SQL problem
                </button>
            </div>
            {isSql && (
                <p className="text-xs text-sky-300/80">
                    Describe the query task below, then put each test case&apos;s <code className="mx-1 text-sky-200">CREATE TABLE</code> +
                    <code className="mx-1 text-sky-200">INSERT</code> setup and pipe-delimited expected rows in the Test Cases section.
                </p>
            )}

            <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                    <label className={labelCls}>Title *</label>
                    <input className={inputCls} value={form.title} onChange={(e) => set("title", e.target.value)} required placeholder={isSql ? "SQL: American Cities" : "Two Sum"} />
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
                    <textarea
                        className={`${inputCls} h-40 resize-y font-mono text-xs`}
                        value={form.description}
                        onChange={(e) => set("description", e.target.value)}
                        required
                        placeholder={isSql ? "Query all columns for all American cities in the CITY table with populations larger than 100000. The CountryCode for America is USA." : "Problem statement..."}
                    />
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

            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <h4 className={sectionTitleCls}>Examples</h4>
                    <button type="button" onClick={addExample} className="text-xs text-emerald-400 hover:text-emerald-300">
                        + Add Example
                    </button>
                </div>
                {form.examples.length === 0 ? (
                    <p className="text-xs text-zinc-500">Examples are optional, but adding at least one helps users understand the problem quickly.</p>
                ) : (
                    <div className="space-y-3">
                        {form.examples.map((example, index) => (
                            <div key={example.id || index} className={cardCls}>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-zinc-500">Example {index + 1}</span>
                                    <button type="button" onClick={() => removeExample(index)} className="text-xs text-zinc-500 hover:text-rose-400">
                                        Remove
                                    </button>
                                </div>
                                <div>
                                    <label className={labelCls}>Input</label>
                                    <textarea className={`${inputCls} h-20 resize-y font-mono text-xs`} value={example.input} onChange={(e) => updateExample(index, "input", e.target.value)} placeholder="nums = [2,7,11,15], target = 9" />
                                </div>
                                <div>
                                    <label className={labelCls}>Output</label>
                                    <textarea className={`${inputCls} h-16 resize-y font-mono text-xs`} value={example.output} onChange={(e) => updateExample(index, "output", e.target.value)} placeholder="[0,1]" />
                                </div>
                                <div className="grid grid-cols-[minmax(0,1fr)_120px] gap-3">
                                    <div>
                                        <label className={labelCls}>Explanation (optional)</label>
                                        <input className={inputCls} value={example.explanation} onChange={(e) => updateExample(index, "explanation", e.target.value)} placeholder="nums[0] + nums[1] == 9" />
                                    </div>
                                    <div>
                                        <label className={labelCls}>Order</label>
                                        <input className={inputCls} type="number" value={example.displayOrder} onChange={(e) => updateExample(index, "displayOrder", e.target.value)} placeholder={String(index)} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {isSql && (
                <div className="rounded-xl border border-sky-500/30 bg-sky-500/5 p-3 space-y-2">
                    <label className={labelCls}>SQL reference query (optional)</label>
                    <textarea
                        className={`${inputCls} h-20 resize-y font-mono text-xs`}
                        value={sqlQuery}
                        onChange={(e) => setSqlQuery(e.target.value)}
                        placeholder="SELECT name FROM employees WHERE department = 'Engineering';"
                    />
                    <div className="flex items-center justify-between gap-3">
                        <p className="text-[11px] text-sky-300/70">
                            Runs this query against each test case&apos;s Input on real SQLite and fills in Expected Output.
                            If it has no ORDER BY, one is added automatically so test cases pass consistently.
                        </p>
                        <button
                            type="button"
                            onClick={handleVerifySql}
                            disabled={verifySqlAI.isPending || !sqlQuery.trim()}
                            className="shrink-0 px-3 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-medium rounded-lg disabled:opacity-50 transition-colors"
                        >
                            {verifySqlAI.isPending ? "Verifying…" : "Verify Test Cases"}
                        </button>
                    </div>
                    {verifySqlError && <p className="text-[11px] text-rose-400">{verifySqlError}</p>}
                </div>
            )}

            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <h4 className={sectionTitleCls}>Test Cases</h4>
                    <button type="button" onClick={addTestCase} className="text-xs text-emerald-400 hover:text-emerald-300">
                        + Add Test Case
                    </button>
                </div>
                <p className="text-xs text-zinc-500">At least one test case is required. Mark visible ones as sample cases.</p>
                {isSql && (
                    <p className="text-xs text-amber-300/90 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2">
                        The database resets before every test case runs, so each test case&apos;s Input must repeat the full
                        <code className="mx-1 text-amber-200">CREATE TABLE</code> +
                        <code className="mx-1 text-amber-200">INSERT</code> statements in full — nothing carries over between cases.
                        Use single quotes for string literals (<code className="mx-1 text-amber-200">&apos;USA&apos;</code>), not double quotes —
                        SQLite treats <code className="mx-1 text-amber-200">&quot;USA&quot;</code> as an identifier and the query will fail to run.
                    </p>
                )}
                <div className="space-y-3">
                    {form.testCases.map((testCase, index) => (
                        <div key={testCase.id || index} className={cardCls}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-zinc-500">Test Case {index + 1}</span>
                                    {meta && (
                                        <span
                                            title={testCase.note || (testCase.verified ? "Output produced by running the reference solution" : "")}
                                            className={`rounded-full border px-2 py-0.5 text-[10px] ${testCase.verified ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300" : "border-amber-500/20 bg-amber-500/10 text-amber-300"}`}
                                        >
                                            {testCase.verified ? "Verified" : "Unverified"}
                                        </span>
                                    )}
                                </div>
                                <button type="button" onClick={() => removeTestCase(index)} disabled={form.testCases.length === 1} className="text-xs text-zinc-500 hover:text-rose-400 disabled:opacity-40 disabled:cursor-not-allowed">
                                    Remove
                                </button>
                            </div>
                            <div>
                                <label className={labelCls}>{isSql ? "Input (schema + seed data)" : "Input"}</label>
                                <textarea
                                    className={`${inputCls} h-20 resize-y font-mono text-xs`}
                                    value={testCase.input}
                                    onChange={(e) => updateTestCase(index, "input", e.target.value)}
                                    placeholder={isSql ? "CREATE TABLE employees (id INTEGER, name TEXT, department TEXT);\nINSERT INTO employees VALUES (1, 'Alice', 'Engineering');" : "[2,7,11,15]\n9"}
                                />
                            </div>
                            <div>
                                <label className={labelCls}>{isSql ? "Expected Output (pipe-delimited rows, no header)" : "Expected Output"}</label>
                                <textarea
                                    className={`${inputCls} h-16 resize-y font-mono text-xs`}
                                    value={testCase.expectedOutput}
                                    onChange={(e) => updateTestCase(index, "expectedOutput", e.target.value)}
                                    placeholder={isSql ? "1|Alice|Engineering" : "[0,1]"}
                                />
                            </div>
                            <label className="flex items-center gap-2 text-sm text-zinc-400 cursor-pointer">
                                <input type="checkbox" checked={testCase.isSample} onChange={(e) => updateTestCase(index, "isSample", e.target.checked)} className="accent-emerald-500" />
                                Visible sample case
                            </label>
                        </div>
                    ))}
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

// ─── AI Generator ─────────────────────────────────────────────────────────────

function AiProblemGenerator({ onGenerated, busy }) {
    const generateAI = useGenerateProblemAI();
    const [name, setName] = useState("");
    const [notes, setNotes] = useState("");
    const [error, setError] = useState("");

    const handleGenerate = async () => {
        if (!name.trim()) return;
        setError("");
        try {
            const draft = await generateAI.mutateAsync({ name: name.trim(), notes: notes.trim() });
            onGenerated(draft);
            setName("");
            setNotes("");
        } catch (err) {
            setError(err?.response?.data?.message || err?.message || "Generation failed. Try again.");
        }
    };

    const inputCls = "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500";

    return (
        <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/5 p-4 space-y-3">
            <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-indigo-300">auto_awesome</span>
                <h3 className="text-sm font-semibold text-white">Add a problem with AI</h3>
            </div>
            <p className="text-xs text-zinc-400">
                Type a problem name. The AI searches the web, writes the full problem in this app&apos;s format,
                and runs a reference solution to verify the test-case outputs. You review and save.
            </p>
            <div className="flex gap-2">
                <input
                    className={inputCls}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleGenerate(); } }}
                    placeholder="e.g. Two Sum, Kadane's maximum subarray, Valid Parentheses…"
                    disabled={generateAI.isPending || busy}
                />
                <button
                    type="button"
                    onClick={handleGenerate}
                    disabled={generateAI.isPending || busy || !name.trim()}
                    className="shrink-0 flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg disabled:opacity-50 transition-colors"
                >
                    {generateAI.isPending ? "Generating…" : "Generate"}
                </button>
            </div>
            <input
                className={inputCls}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional guidance — e.g. make it Hard, stdin is one line of integers"
                disabled={generateAI.isPending || busy}
            />
            {generateAI.isPending && (
                <p className="text-[11px] text-indigo-300/80">
                    Searching the web and verifying test cases — this can take up to a minute…
                </p>
            )}
            {error && <p className="text-xs text-rose-400">{error}</p>}
        </div>
    );
}

// ─── Problems Tab ─────────────────────────────────────────────────────────────

function ProblemsTab() {
    const { data: problems, isLoading } = useProblems();
    const createProblem = useCreateProblem();
    const updateProblem = useUpdateProblem();
    const deleteProblem = useDeleteProblem();
    const editAI = useEditProblemAI();
    const [showCreate, setShowCreate] = useState(false);
    const [aiDraft, setAiDraft] = useState(null);
    const [editId, setEditId] = useState(null);
    const [expandedId, setExpandedId] = useState(null);
    const { data: expandedProblemDetail, isLoading: detailLoading } = useAdminProblemDetail(expandedId);

    const sorted = (problems || []).slice().sort((a, b) => (a.orderNum ?? 9999) - (b.orderNum ?? 9999));

    // Shared handler the form's "Ask AI to edit" box calls; returns the updated draft.
    const aiEditHandler = (payload) => editAI.mutateAsync(payload);

    const handleAiGenerated = (draft) => {
        setAiDraft(draft);
        setEditId(null);
        setShowCreate(true);
    };

    const handleCreate = async (body) => {
        await createProblem.mutateAsync(body);
        setShowCreate(false);
        setAiDraft(null);
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
                    onClick={() => { setShowCreate(true); setEditId(null); setAiDraft(null); }}
                    className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg transition-colors"
                >
                    <span className="material-symbols-outlined text-[16px]">add</span>
                    New Problem
                </button>
            </div>

            {/* AI generator */}
            <AiProblemGenerator onGenerated={handleAiGenerated} busy={createProblem.isPending} />

            {/* Create form (pre-filled when an AI draft is present) */}
            {showCreate && (
                <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-5">
                    <h3 className="text-sm font-semibold text-white mb-4">
                        {aiDraft ? "Review AI-generated problem" : "Create Problem"}
                    </h3>
                    <ProblemForm
                        initial={aiDraft}
                        onSave={handleCreate}
                        onCancel={() => { setShowCreate(false); setAiDraft(null); }}
                        saving={createProblem.isPending}
                        onAiEdit={aiEditHandler}
                    />
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
                                    {detailLoading && (
                                        <div className="text-sm text-zinc-500">Loading full problem detail…</div>
                                    )}
                                    {/* Edit form */}
                                    {editId === problem.id && (
                                        <div className="bg-zinc-800/50 rounded-lg p-4">
                                            <h4 className="text-sm font-semibold text-white mb-3">Edit Problem</h4>
                                            <ProblemForm
                                                initial={expandedProblemDetail || problem}
                                                onSave={handleUpdate}
                                                onCancel={() => setEditId(null)}
                                                saving={updateProblem.isPending}
                                                onAiEdit={aiEditHandler}
                                            />
                                        </div>
                                    )}

                                    {/* Examples */}
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="text-xs font-semibold text-zinc-400 uppercase">Examples</h4>
                                            <span className="text-xs text-zinc-500">{expandedProblemDetail?.examples?.length ?? 0} total</span>
                                        </div>
                                        {(expandedProblemDetail?.examples || []).length === 0 ? (
                                            <p className="text-xs text-zinc-600">No examples yet.</p>
                                        ) : (
                                            <div className="space-y-2">
                                                {(expandedProblemDetail?.examples || []).map((ex, i) => (
                                                    <div key={ex.id || i} className="flex items-start gap-2 bg-zinc-800/30 rounded-lg p-2 font-mono text-xs text-zinc-400">
                                                        <div className="flex-1 space-y-0.5">
                                                            <div><span className="text-zinc-600">in:</span> {ex.input}</div>
                                                            <div><span className="text-zinc-600">out:</span> {ex.output}</div>
                                                            {ex.explanation && <div><span className="text-zinc-600">exp:</span> {ex.explanation}</div>}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Test Cases */}
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="text-xs font-semibold text-zinc-400 uppercase">Test Cases</h4>
                                            <span className="text-xs text-zinc-500">{expandedProblemDetail?.testCases?.length ?? 0} total</span>
                                        </div>
                                        {(expandedProblemDetail?.testCases || []).length === 0 ? (
                                            <p className="text-xs text-zinc-600">No hidden test cases yet. Edit the problem to add evaluation cases.</p>
                                        ) : (
                                            <div className="space-y-2">
                                                {(expandedProblemDetail?.testCases || []).map((testCase, index) => (
                                                    <div key={testCase.id || index} className="rounded-lg bg-zinc-800/30 p-2 font-mono text-xs text-zinc-400">
                                                        <div className="mb-1 flex items-center justify-between">
                                                            <span className="text-zinc-500">Case {index + 1}</span>
                                                            <span className={`rounded-full border px-2 py-0.5 text-[10px] ${testCase.isSample ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300" : "border-zinc-700 bg-zinc-800 text-zinc-400"}`}>
                                                                {testCase.isSample ? "Sample" : "Hidden"}
                                                            </span>
                                                        </div>
                                                        <div><span className="text-zinc-600">in:</span> {testCase.input}</div>
                                                        <div><span className="text-zinc-600">out:</span> {testCase.expectedOutput}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
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
            <AppHeader active="admin" badge="Admin Panel" />

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
