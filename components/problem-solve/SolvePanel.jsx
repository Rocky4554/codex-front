"use client";
import Editor from "@monaco-editor/react";
import { useState, useEffect } from "react";
import { useEditorStore } from "@/store/editorStore";
import { useCodeExecution } from "@/hooks/useCodeExecution";
import { useRunExecution } from "@/hooks/useRunExecution";
import { LanguageSelector } from "@/components/editor/LanguageSelector";
import { ErrorDisplay } from "@/components/ErrorDisplay";
import { useSampleTestCases } from "@/hooks/useSampleTestCases";
import { toast } from "sonner";

const STATUS_STYLES = {
    ACCEPTED: "text-emerald-400",
    WRONG_ANSWER: "text-red-400",
    TIME_LIMIT_EXCEEDED: "text-amber-400",
    MEMORY_LIMIT_EXCEEDED: "text-amber-400",
    RUNTIME_ERROR: "text-red-400",
    COMPILATION_ERROR: "text-red-400",
    PENDING: "text-zinc-400",
    RUNNING: "text-blue-400",
};

const STATUS_LABELS = {
    ACCEPTED: "✓ Accepted",
    WRONG_ANSWER: "✗ Wrong Answer",
    TIME_LIMIT_EXCEEDED: "⏱ Time Limit Exceeded",
    MEMORY_LIMIT_EXCEEDED: "Memory Limit Exceeded",
    RUNTIME_ERROR: "Runtime Error",
    COMPILATION_ERROR: "Compilation Error",
    PENDING: "Pending...",
    RUNNING: "Running...",
};

export function SolvePanel({ problem }) {
    const { selectedLanguage, code, setCode, theme, currentProblemId } = useEditorStore();
    const { execute, isRunning, result, error, reset } = useCodeExecution();
    const { run, isRunning: isRunCodeRunning, result: runResult, error: runError, reset: runReset } = useRunExecution();
    const [consoleTab, setConsoleTab] = useState("testcase");
    const { data: sampleTestCases, isLoading: testCasesLoading } = useSampleTestCases(problem?.id);

    useEffect(() => {
        if (problem?.id) {
            useEditorStore.getState().setProblemId(problem.id);
        }
    }, [problem?.id]);

    const currentCode = selectedLanguage && currentProblemId
        ? (code[currentProblemId]?.[selectedLanguage.id] || "")
        : "";

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
        runReset();
        reset();
        await run({ problemId: problem.id, languageId: selectedLanguage.id, sourceCode: currentCode });
    };

    const handleSubmit = async () => {
        if (!problem?.id || !selectedLanguage?.id) return;
        if (!validateLanguageMatch()) return;
        setConsoleTab("result");
        runReset();
        reset();
        await execute({ problemId: problem.id, languageId: selectedLanguage.id, sourceCode: currentCode });
    };

    const statusStyle = result?.status ? (STATUS_STYLES[result.status] || "text-zinc-300") : "";
    const statusLabel = result?.status ? (STATUS_LABELS[result.status] || result.status) : "";

    return (
        <section className="flex flex-col h-full bg-[#1e1e1e]">
            {/* Editor Top Bar */}
            <div className="h-10 flex items-center justify-between px-3 border-b border-zinc-800 bg-[#18181b]">
                <div className="flex items-center gap-2">
                    <LanguageSelector />
                    <div className="w-px h-4 bg-zinc-700" />
                    <span className="text-xs text-zinc-500 px-2">Auto-saved</span>
                </div>
                <div className="flex items-center gap-3 text-zinc-400">
                    <button
                        onClick={() => useEditorStore.getState().setTheme(theme === "vs-dark" ? "light" : "vs-dark")}
                        className="hover:text-white transition-colors"
                        title="Toggle theme"
                    >
                        <span className="material-symbols-outlined text-[18px]">
                            {theme === "vs-dark" ? "light_mode" : "dark_mode"}
                        </span>
                    </button>
                </div>
            </div>

            {/* Code Editor */}
            <div className="flex-1 relative overflow-hidden">
                <Editor
                    height="100%"
                    language={selectedLanguage?.name?.toLowerCase().includes("python") ? "python" :
                              selectedLanguage?.name?.toLowerCase().includes("java") && !selectedLanguage?.name?.toLowerCase().includes("script") ? "java" :
                              selectedLanguage?.name?.toLowerCase().includes("c++") || selectedLanguage?.name?.toLowerCase().includes("cpp") ? "cpp" :
                              selectedLanguage?.name?.toLowerCase().includes("javascript") ? "javascript" : "plaintext"}
                    theme={theme}
                    value={currentCode}
                    onChange={handleCodeChange}
                    options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        fontFamily: "Menlo, Monaco, 'Courier New', monospace",
                        fontLigatures: false,
                        padding: { top: 16 },
                        scrollBeyondLastLine: false,
                        tabSize: 4,
                        wordWrap: "on",
                    }}
                />
            </div>

            {/* Bottom Console */}
            <div className="bg-[#18181b] border-t border-zinc-800 flex flex-col shrink-0" style={{ maxHeight: "240px" }}>
                {/* Console Header */}
                <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setConsoleTab("testcase")}
                            className={`text-xs font-medium pb-0.5 transition-colors ${consoleTab === "testcase" ? "text-white border-b border-emerald-500" : "text-zinc-500 hover:text-zinc-300"}`}
                        >
                            Testcase
                        </button>
                        <button
                            onClick={() => setConsoleTab("result")}
                            className={`text-xs font-medium pb-0.5 transition-colors ${consoleTab === "result" ? "text-white border-b border-emerald-500" : "text-zinc-500 hover:text-zinc-300"}`}
                        >
                            Result
                            {result && <span className={`ml-1 ${statusStyle}`}>•</span>}
                        </button>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleRun}
                            disabled={isRunning || isRunCodeRunning || !selectedLanguage}
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
                            disabled={isRunning || isRunCodeRunning || !selectedLanguage}
                            className="bg-emerald-500 hover:bg-emerald-600 text-[#09090b] px-4 py-1.5 rounded-lg text-xs font-bold transition-all shadow-[0_0_15px_rgba(16,183,127,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isRunning ? "Submitting..." : "Submit"}
                        </button>
                    </div>
                </div>

                {/* Console Content */}
                <div className="flex-1 overflow-auto p-3 font-mono text-xs">
                    {consoleTab === "testcase" && (
                        <div className="space-y-3">
                            {testCasesLoading && (
                                <p className="text-zinc-500">Loading test cases...</p>
                            )}
                            {!testCasesLoading && (!sampleTestCases || sampleTestCases.length === 0) && (
                                <p className="text-zinc-500">No sample test cases available.</p>
                            )}
                            {sampleTestCases && sampleTestCases.map((tc, i) => (
                                <div key={tc.id} className="space-y-2">
                                    <p className="text-zinc-400 font-medium">Case {i + 1}</p>
                                    <div>
                                        <p className="text-zinc-500 text-xs mb-1">Input</p>
                                        <pre className="bg-[#09090b] border border-zinc-800 rounded p-2 text-zinc-300 whitespace-pre-wrap overflow-auto max-h-24">
                                            {tc.input}
                                        </pre>
                                    </div>
                                    <div>
                                        <p className="text-zinc-500 text-xs mb-1">Expected Output</p>
                                        <pre className="bg-[#09090b] border border-zinc-800 rounded p-2 text-zinc-300 whitespace-pre-wrap overflow-auto max-h-24">
                                            {tc.expectedOutput}
                                        </pre>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {consoleTab === "result" && (
                        <div className="space-y-3">
                            {(isRunning || isRunCodeRunning) && (
                                <div className="flex items-center gap-2 text-blue-400">
                                    <div className="w-3 h-3 border border-blue-400 border-t-transparent rounded-full animate-spin" />
                                    <span>{isRunning ? "Submitting..." : "Running sample cases..."}</span>
                                </div>
                            )}

                            {(error || runError) && !isRunning && !isRunCodeRunning && (
                                <div className="text-red-400 space-y-1">
                                    <p className="font-semibold">Error</p>
                                    <p className="text-red-300/80">{error || runError}</p>
                                </div>
                            )}

                            {/* Run result — ephemeral, sample cases only */}
                            {runResult && !isRunCodeRunning && (
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <p className={`font-bold text-sm ${STATUS_STYLES[runResult.status] || "text-zinc-300"}`}>
                                            {STATUS_LABELS[runResult.status] || runResult.status}
                                        </p>
                                        <span className="text-zinc-600 text-xs">sample cases only</span>
                                    </div>
                                    {runResult.testResults && runResult.testResults.length > 0 && (
                                        <div className="space-y-2">
                                            {runResult.testResults.map((tr, i) => (
                                                <div key={i} className={`p-2 rounded border ${tr.passed ? "border-emerald-800 bg-emerald-900/20" : "border-red-800 bg-red-900/20"}`}>
                                                    <p className={`text-xs font-semibold mb-1 ${tr.passed ? "text-emerald-400" : "text-red-400"}`}>
                                                        Case {i + 1}: {tr.passed ? "Passed" : "Failed"}
                                                    </p>
                                                    <p className="text-zinc-500 text-xs">Input: <span className="text-zinc-300 font-mono">{tr.input}</span></p>
                                                    <p className="text-zinc-500 text-xs">Expected: <span className="text-zinc-300 font-mono">{tr.expectedOutput}</span></p>
                                                    {!tr.passed && <p className="text-zinc-500 text-xs">Got: <span className="text-red-300 font-mono">{tr.actualOutput}</span></p>}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {(runResult.status === "COMPILATION_ERROR" || runResult.status === "RUNTIME_ERROR") && (
                                        <ErrorDisplay stderr={runResult.stderr} type={runResult.status} />
                                    )}
                                    <p className="text-zinc-500 text-xs">
                                        Tests: <span className="text-white">{runResult.testsPassed}/{runResult.totalTests}</span>
                                    </p>
                                </div>
                            )}

                            {/* Submit result */}
                            {result && !isRunning && !runResult && (
                                <div className="space-y-3">
                                    <p className={`font-bold text-sm ${statusStyle}`}>{statusLabel}</p>

                                    {result.output && (
                                        <div>
                                            <p className="text-zinc-500 mb-1">Output</p>
                                            <pre className="bg-[#09090b] border border-zinc-800 p-2 rounded text-zinc-300 whitespace-pre-wrap overflow-auto max-h-24">
                                                {result.output}
                                            </pre>
                                        </div>
                                    )}

                                    {result.expectedOutput && result.status === "WRONG_ANSWER" && (
                                        <div>
                                            <p className="text-zinc-500 mb-1">Expected</p>
                                            <pre className="bg-[#09090b] border border-zinc-800 p-2 rounded text-emerald-300/70 whitespace-pre-wrap overflow-auto max-h-24">
                                                {result.expectedOutput}
                                            </pre>
                                        </div>
                                    )}

                                    {result.status === "COMPILATION_ERROR" && <ErrorDisplay stderr={result.stderr} type="COMPILATION_ERROR" />}
                                    {result.status === "RUNTIME_ERROR" && <ErrorDisplay stderr={result.stderr} type="RUNTIME_ERROR" />}

                                    {result.message && !["COMPILATION_ERROR", "RUNTIME_ERROR"].includes(result.status) && (
                                        <div>
                                            <p className="text-zinc-500 mb-1">Details</p>
                                            <p className="text-zinc-400">{result.message}</p>
                                        </div>
                                    )}

                                    {result.testsPassed != null && result.totalTests != null && (
                                        <p className="text-zinc-400">
                                            Tests passed: <span className="text-white">{result.testsPassed}/{result.totalTests}</span>
                                        </p>
                                    )}
                                </div>
                            )}

                            {!result && !runResult && !isRunning && !isRunCodeRunning && !error && !runError && (
                                <p className="text-zinc-600">Run or submit your code to see results.</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
