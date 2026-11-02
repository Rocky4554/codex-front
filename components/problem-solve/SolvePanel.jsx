"use client";
import Editor from "@monaco-editor/react";
import { useState, useEffect } from "react";
import { Group, Panel, Separator } from "react-resizable-panels";
import { useEditorStore } from "@/store/editorStore";
import { useAuthStore } from "@/store/authStore";
import { useCodeExecution } from "@/hooks/useCodeExecution";
import { useRunExecution } from "@/hooks/useRunExecution";
import { LanguageSelector } from "@/components/editor/LanguageSelector";
import { ErrorDisplay } from "@/components/ErrorDisplay";
import { useSampleTestCases } from "@/hooks/useSampleTestCases";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { SqlResultTable, SqlSetupTables } from "./SqlResultTable";
import { isSqlProblem, outputColumns } from "@/lib/sqlSetup";
import { monacoLanguage, starterCode } from "@/lib/starterCode";

const STATUS_STYLES = {
    ACCEPTED: "text-emerald-400",
    WRONG_ANSWER: "text-red-400",
    TIME_LIMIT_EXCEEDED: "text-amber-400",
    MEMORY_LIMIT_EXCEEDED: "text-amber-400",
    RUNTIME_ERROR: "text-red-400",
    COMPILATION_ERROR: "text-red-400",
    PENDING: "text-zinc-400",
    RUNNING: "text-blue-400",
    QUEUED: "text-blue-400",
};

export function SolvePanel({ problem }) {
    const { selectedLanguage, code, setCode, theme, currentProblemId, submissionVersion } = useEditorStore();
    const { execute, isRunning, result, error, reset } = useCodeExecution();
    const { run, isRunning: isRunCodeRunning, result: runResult, error: runError, reset: runReset } = useRunExecution();
    const { isLoggedIn } = useAuthStore();
    const router = useRouter();
    const [consoleTab, setConsoleTab] = useState("testcase");
    const { data: sampleTestCases, isLoading: testCasesLoading } = useSampleTestCases(problem?.id);

    useEffect(() => {
        if (problem?.id) {
            useEditorStore.getState().setProblemId(problem.id);
        }
    }, [problem?.id]);

    const sqlProblem = isSqlProblem(problem);
    const isSql = sqlProblem || selectedLanguage?.name?.toLowerCase().includes("sql");
    const sqlColumns = sqlProblem ? outputColumns(problem?.description) : null;
    const [caseIdx, setCaseIdx] = useState(0);
    const [resultCaseIdx, setResultCaseIdx] = useState(0);

    // Untouched problem/language → starter template; anything the user typed (even "") wins.
    const savedCode = selectedLanguage && currentProblemId ? code[currentProblemId]?.[selectedLanguage.id] : undefined;
    const currentCode = savedCode ?? (selectedLanguage && currentProblemId ? starterCode(selectedLanguage) : "");

    const handleCodeChange = (val) => {
        if (selectedLanguage) setCode(selectedLanguage.id, val || "");
    };

    // Detect language from code content
    const detectLanguageFromCode = (code) => {
        if (!code || code.trim().length === 0) return null;

        const codeLower = code.toLowerCase();

        // Check C++ first — most distinctive markers
        if (codeLower.includes('#include') ||
            codeLower.includes('using namespace') ||
            codeLower.includes('cout') ||
            codeLower.includes('cin') ||
            codeLower.includes('vector<') ||
            codeLower.includes('int main()')) {
            return 'cpp';
        }

        // Check Java before Python — `import java.` is unambiguous
        if (codeLower.includes('public class') ||
            codeLower.includes('public static void main') ||
            codeLower.includes('system.out.') ||
            codeLower.includes('import java.') ||
            codeLower.includes('import javax.')) {
            return 'java';
        }

        // Check Python — only after ruling out C++ and Java
        if (codeLower.includes('def ') ||
            codeLower.includes('elif ') ||
            codeLower.includes('print(') ||
            codeLower.includes(':#') ||
            codeLower.match(/\blist\(|\bdict\(|\btuple\(/) ||
            codeLower.match(/^from\s+\S+\s+import\s+/m) ||
            (codeLower.includes('import ') && !codeLower.includes('import java') && !codeLower.includes('import javax') && !codeLower.includes('#include'))) {
            return 'python';
        }

        // Check JavaScript last — many keywords overlap with other languages
        if (codeLower.includes('console.log') ||
            codeLower.includes('=>') ||
            codeLower.match(/\bconst\s+\w+\s*=/) ||
            codeLower.match(/\blet\s+\w+\s*=/) ||
            codeLower.match(/\bvar\s+\w+\s*=/)) {
            return 'javascript';
        }

        return null;
    };

    // Validate language matches code
    const validateLanguageMatch = () => {
        if (!selectedLanguage || !currentCode) return true;

        // SQL isn't covered by the keyword heuristic below; skip the check so a
        // query is never wrongly flagged as another language.
        if (selectedLanguage.name?.toLowerCase().includes("sql")) return true;

        const detectedLang = detectLanguageFromCode(currentCode);
        if (!detectedLang) return true; // Can't detect, allow it
        
        const selectedLangName = selectedLanguage.name?.toLowerCase() || '';
        
        // Map detected language to expected language name patterns
        const langMap = {
            'python': ['python'],
            'cpp': ['c++', 'cpp'],
            'java': ['java'],
            'javascript': ['javascript', 'js']
        };
        
        const expectedPatterns = langMap[detectedLang] || [];
        const isMatch = expectedPatterns.some(pattern => selectedLangName.includes(pattern));
        
        if (!isMatch) {
            const langDisplayNames = {
                'python': 'Python',
                'cpp': 'C++',
                'java': 'Java',
                'javascript': 'JavaScript'
            };
            
            toast.error(
                `Language Mismatch Detected`,
                {
                    description: `Your code appears to be ${langDisplayNames[detectedLang]}, but you have ${selectedLanguage.name} selected. Please select the correct language from the dropdown.`,
                    duration: 5000,
                }
            );
            return false;
        }
        
        return true;
    };

    const handleRun = async () => {
        if (!problem?.id || !selectedLanguage?.id) return;
        if (!validateLanguageMatch()) return;
        setConsoleTab("result");
        setResultCaseIdx(0);
        runReset();
        reset();
        await run({ problemId: problem.id, languageId: selectedLanguage.id, sourceCode: currentCode });
    };

    const handleSubmit = async () => {
        if (!isLoggedIn) {
            toast.error("Login required", {
                description: "You need to be logged in to submit. Your code is safe.",
                action: { label: "Login", onClick: () => router.push(`/auth/login`) },
                duration: 5000,
            });
            return;
        }
        if (!problem?.id || !selectedLanguage?.id) return;
        if (!validateLanguageMatch()) return;
        setConsoleTab("result");
        runReset();
        reset();
        await execute({ problemId: problem.id, languageId: selectedLanguage.id, sourceCode: currentCode });
    };

    const handleResetCode = () => {
        if (!selectedLanguage) return;
        setCode(selectedLanguage.id, starterCode(selectedLanguage));
        useEditorStore.setState((st) => ({ submissionVersion: st.submissionVersion + 1 }));
    };

    const cases = sampleTestCases || [];
    const activeCase = cases[Math.min(caseIdx, Math.max(cases.length - 1, 0))];
    const runCases = runResult?.testResults || [];
    const activeRunCase = runCases[Math.min(resultCaseIdx, Math.max(runCases.length - 1, 0))];
    const busy = isRunning || isRunCodeRunning;

    const showOutput = (text, tone, fallbackCls = "text-zinc-300") =>
        isSql ? <SqlResultTable text={text} columns={sqlColumns} tone={tone} /> : <CodeBox className={fallbackCls}>{text}</CodeBox>;

    return (
        <section className="flex flex-col h-full bg-[#1e1e1e]">
            {/* Editor Top Bar */}
            <div className="h-10 flex items-center justify-between px-3 border-b border-zinc-800 bg-[#18181b] shrink-0">
                <div className="flex items-center gap-2">
                    <LanguageSelector sqlOnly={sqlProblem} />
                    <div className="w-px h-4 bg-zinc-700" />
                    <span className="text-xs text-zinc-500 px-2">Auto-saved</span>
                </div>
                <div className="flex items-center gap-3 text-zinc-400">
                    <button onClick={handleResetCode} className="hover:text-white transition-colors flex items-center" title="Reset to starter code">
                        <span className="material-symbols-outlined text-[18px]">restart_alt</span>
                    </button>
                    <button
                        onClick={() => useEditorStore.getState().setTheme(theme === "vs-dark" ? "light" : "vs-dark")}
                        className="hover:text-white transition-colors flex items-center"
                        title="Toggle theme"
                    >
                        <span className="material-symbols-outlined text-[18px]">
                            {theme === "vs-dark" ? "light_mode" : "dark_mode"}
                        </span>
                    </button>
                </div>
            </div>

            <Group orientation="vertical" className="flex-1 min-h-0">
                {/* Code Editor */}
                <Panel id="code" defaultSize="64%" minSize="20%" className="relative overflow-hidden">
                    <Editor
                        key={`${submissionVersion}-${selectedLanguage?.id}`}
                        height="100%"
                        language={monacoLanguage(selectedLanguage)}
                        theme={theme}
                        value={currentCode}
                        onChange={handleCodeChange}
                        options={{
                            minimap: { enabled: false },
                            fontSize: 14,
                            fontFamily: "'JetBrains Mono', Menlo, Monaco, 'Courier New', monospace",
                            fontLigatures: false,
                            padding: { top: 16 },
                            scrollBeyondLastLine: false,
                            tabSize: 4,
                            wordWrap: "on",
                            smoothScrolling: true,
                            cursorSmoothCaretAnimation: "on",
                        }}
                    />
                </Panel>

                <Separator className="relative h-1.5 shrink-0 cursor-row-resize bg-zinc-800 transition-colors hover:bg-emerald-500/60 focus-visible:bg-emerald-500 focus-visible:outline-none data-[resize-handle-state=drag]:bg-emerald-500" />

                {/* Bottom Console */}
                <Panel id="console" defaultSize="36%" minSize="12%" className="flex flex-col bg-[#18181b]">
                    {/* Console Header */}
                    <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800 shrink-0">
                        <div className="flex items-center gap-4">
                            <ConsoleTab active={consoleTab === "testcase"} onClick={() => setConsoleTab("testcase")} icon="check_box">
                                Testcase
                            </ConsoleTab>
                            <ConsoleTab active={consoleTab === "result"} onClick={() => setConsoleTab("result")} icon="terminal">
                                Test Result
                                {(result || runResult) && !busy && (
                                    <span className={`ml-1 ${STATUS_STYLES[(runResult || result)?.status] || "text-zinc-400"}`}>•</span>
                                )}
                            </ConsoleTab>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleRun}
                                disabled={busy || !selectedLanguage}
                                className="bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white px-4 py-1.5 rounded-lg text-xs font-semibold transition-all border border-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                            >
                                {isRunCodeRunning ? (
                                    <><div className="w-3 h-3 border border-zinc-400 border-t-transparent rounded-full animate-spin" /> Running...</>
                                ) : (
                                    <><span className="material-symbols-outlined text-[14px]">play_arrow</span> Run</>
                                )}
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={busy || !selectedLanguage}
                                className="bg-emerald-500 hover:bg-emerald-600 text-[#09090b] px-4 py-1.5 rounded-lg text-xs font-bold transition-all shadow-[0_0_15px_rgba(16,183,127,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                            >
                                {isRunning ? (
                                    <><div className="w-3 h-3 border border-black/60 border-t-transparent rounded-full animate-spin" /> Submitting...</>
                                ) : (
                                    <><span className="material-symbols-outlined text-[14px]">cloud_upload</span> Submit</>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Console Content */}
                    <div className="flex-1 overflow-auto p-4 text-xs">
                        {consoleTab === "testcase" && (
                            <div className="space-y-3">
                                {testCasesLoading && <p className="text-zinc-500">Loading test cases...</p>}
                                {!testCasesLoading && cases.length === 0 && (
                                    <p className="text-zinc-500">No sample test cases available.</p>
                                )}
                                {cases.length > 0 && (
                                    <>
                                        <CaseChips count={cases.length} active={caseIdx} onSelect={setCaseIdx} />
                                        {activeCase && (
                                            <div className="space-y-3">
                                                <Field label="Input">
                                                    {isSql ? <SqlSetupTables script={activeCase.input} /> : <CodeBox>{activeCase.input}</CodeBox>}
                                                </Field>
                                                <Field label="Expected Output">{showOutput(activeCase.expectedOutput)}</Field>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        )}

                        {consoleTab === "result" && (
                            <div className="space-y-3">
                                {busy && (
                                    <div className="flex items-center gap-2 text-blue-400">
                                        <div className="w-3 h-3 border border-blue-400 border-t-transparent rounded-full animate-spin" />
                                        <span>{isRunning ? "Judging your submission against all test cases..." : "Running sample cases..."}</span>
                                    </div>
                                )}

                                {(error || runError) && !busy && (
                                    <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-red-300">
                                        <p className="font-semibold mb-1">Error</p>
                                        <p className="text-red-300/80">{error || runError}</p>
                                    </div>
                                )}

                                {/* Run result — sample cases only */}
                                {runResult && !busy && (
                                    <div className="space-y-3">
                                        <div className="flex items-baseline gap-3">
                                            <p className={`font-bold text-lg ${STATUS_STYLES[runResult.status] || "text-zinc-300"}`}>
                                                {STATUS_TITLES[runResult.status] || runResult.status}
                                            </p>
                                            {runResult.totalTests != null && (
                                                <span className="text-zinc-500">
                                                    {runResult.testsPassed}/{runResult.totalTests} sample cases passed
                                                </span>
                                            )}
                                        </div>
                                        {(runResult.status === "COMPILATION_ERROR" || runResult.status === "RUNTIME_ERROR") && (
                                            <ErrorDisplay stderr={runResult.stderr} type={runResult.status} />
                                        )}
                                        {runCases.length > 0 && (
                                            <>
                                                <CaseChips
                                                    count={runCases.length}
                                                    active={resultCaseIdx}
                                                    onSelect={setResultCaseIdx}
                                                    passed={runCases.map((c) => c.passed)}
                                                />
                                                {activeRunCase && (
                                                    <div className="space-y-3">
                                                        <Field label="Input">
                                                            {isSql ? <SqlSetupTables script={activeRunCase.input} /> : <CodeBox>{activeRunCase.input}</CodeBox>}
                                                        </Field>
                                                        <Field label="Output">
                                                            {showOutput(activeRunCase.actualOutput, activeRunCase.passed ? "text-zinc-300" : "text-red-300", activeRunCase.passed ? "text-zinc-300" : "text-red-300")}
                                                        </Field>
                                                        <Field label="Expected">{showOutput(activeRunCase.expectedOutput, "text-emerald-300/90", "text-emerald-300/90")}</Field>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                )}

                                {/* Submit result */}
                                {result && !busy && !runResult && (
                                    <div className="space-y-3">
                                        <div className="flex items-baseline gap-3">
                                            <p className={`font-bold text-lg ${STATUS_STYLES[result.status] || "text-zinc-300"}`}>
                                                {STATUS_TITLES[result.status] || result.status}
                                            </p>
                                            {result.testsPassed != null && result.totalTests != null && (
                                                <span className="text-zinc-500">
                                                    {result.testsPassed}/{result.totalTests} test cases passed
                                                </span>
                                            )}
                                        </div>
                                        {result.status === "ACCEPTED" && result.executionTimeMs != null && (
                                            <div className="inline-flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2">
                                                <span className="material-symbols-outlined text-[16px] text-emerald-400">timer</span>
                                                <span className="text-zinc-400">Runtime</span>
                                                <span className="font-mono text-emerald-300">{result.executionTimeMs} ms</span>
                                            </div>
                                        )}
                                        {result.status === "COMPILATION_ERROR" && <ErrorDisplay stderr={result.stderr} type="COMPILATION_ERROR" />}
                                        {result.status === "RUNTIME_ERROR" && <ErrorDisplay stderr={result.stderr} type="RUNTIME_ERROR" />}
                                        {result.output && !["ACCEPTED", "COMPILATION_ERROR", "RUNTIME_ERROR"].includes(result.status) && (
                                            <Field label="Your output (first failing case)">{showOutput(result.output)}</Field>
                                        )}
                                    </div>
                                )}

                                {!result && !runResult && !busy && !error && !runError && (
                                    <p className="text-zinc-600">Run your code against the sample cases, or submit to judge it on every test case.</p>
                                )}
                            </div>
                        )}
                    </div>
                </Panel>
            </Group>
        </section>
    );
}

const STATUS_TITLES = {
    ACCEPTED: "Accepted",
    WRONG_ANSWER: "Wrong Answer",
    TIME_LIMIT_EXCEEDED: "Time Limit Exceeded",
    MEMORY_LIMIT_EXCEEDED: "Memory Limit Exceeded",
    RUNTIME_ERROR: "Runtime Error",
    COMPILATION_ERROR: "Compilation Error",
    PENDING: "Pending…",
    QUEUED: "Queued…",
    RUNNING: "Running…",
};

function ConsoleTab({ active, onClick, icon, children }) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-1 text-xs font-medium pb-0.5 border-b transition-colors ${active ? "text-white border-emerald-500" : "text-zinc-500 border-transparent hover:text-zinc-300"}`}
        >
            <span className={`material-symbols-outlined text-[14px] ${active ? "text-emerald-500" : ""}`}>{icon}</span>
            {children}
        </button>
    );
}

/** "Case 1 · Case 2 …" pills, tinted green/red when pass results are known. */
function CaseChips({ count, active, onSelect, passed }) {
    return (
        <div className="flex flex-wrap gap-2">
            {Array.from({ length: count }, (_, i) => {
                const state = passed?.[i];
                const isActive = i === active;
                return (
                    <button
                        key={i}
                        onClick={() => onSelect(i)}
                        className={`flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-medium transition-colors ${
                            isActive ? "bg-zinc-700 text-white" : "bg-zinc-800/60 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                        }`}
                    >
                        {state !== undefined && (
                            <span className={`h-1.5 w-1.5 rounded-full ${state ? "bg-emerald-400" : "bg-red-400"}`} />
                        )}
                        Case {i + 1}
                    </button>
                );
            })}
        </div>
    );
}

function Field({ label, children }) {
    return (
        <div>
            <p className="mb-1.5 text-[11px] font-medium text-zinc-500">{label}</p>
            {children}
        </div>
    );
}

function CodeBox({ children, className = "text-zinc-300" }) {
    const text = children == null || children === "" ? "" : String(children);
    return (
        <pre className={`rounded-lg bg-[#27272a]/60 px-3 py-2 font-mono text-[13px] leading-relaxed whitespace-pre-wrap break-words overflow-auto max-h-48 ${className}`}>
            {text === "" ? <span className="italic text-zinc-600">(empty)</span> : text}
        </pre>
    );
}
