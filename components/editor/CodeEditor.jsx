"use client";
import React from 'react';

const MonacoEditor = React.lazy(() => import('@monaco-editor/react'));

import { useEditorStore } from "@/store/editorStore";
import { useDebouncedCallback } from "use-debounce";
import { ErrorBoundary } from "../shared/ErrorBoundary";
import { LoadingSpinner } from "../shared/LoadingSpinner";
import { Suspense } from "react";

const STARTER_CODE = {
    javascript: "function solve(nums) {\n  // your code here\n  return nums;\n}",
    python: "def solve(nums):\n    # your code here\n    pass",
    cpp: "#include <iostream>\n#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<int> solve(vector<int>& nums) {\n        // your code here\n        return nums;\n    }\n};",
    java: "class Solution {\n    public int[] solve(int[] nums) {\n        // your code here\n        return nums;\n    }\n}",
};

export function CodeEditor() {
    const { language, code, setCode, theme } = useEditorStore();

    const handleEditorChange = useDebouncedCallback((value) => {
        setCode(language, value || "");
    }, 300);

    return (
        <div className="h-full w-full">
            <ErrorBoundary>
                <Suspense fallback={
                    <div className="h-full flex items-center justify-center bg-[#1e1e1e]">
                        <LoadingSpinner />
                    </div>
                }>
                    <MonacoEditor
                        height="100%"
                        language={language}
                        theme={theme}
                        value={code[language] || STARTER_CODE[language]}
                        onChange={handleEditorChange}
                        options={{
                            minimap: { enabled: false },
                            fontSize: 14,
                            lineHeight: 24,
                            fontFamily: "'Fira Code', 'JetBrains Mono', monospace",
                            fontLigatures: true,
                            scrollBeyondLastLine: false,
                            smoothScrolling: true,
                            cursorBlinking: "smooth",
                            cursorSmoothCaretAnimation: "on",
                            formatOnPaste: true,
                            suggestOnTriggerCharacters: true,
                        }}
                    />
                </Suspense>
            </ErrorBoundary>
        </div>
    );
}
