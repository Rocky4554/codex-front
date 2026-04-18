import { useState, useCallback } from "react";
import api from "@/lib/axios";

export function useRunExecution() {
    const [isRunning, setIsRunning] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const run = useCallback(async ({ problemId, languageId, sourceCode }) => {
        setIsRunning(true);
        setResult(null);
        setError(null);

        try {
            const { data } = await api.post("/run", { problemId, languageId, sourceCode });
            setResult({
                status: data.status,
                output: data.stdout,
                stderr: data.stderr,
                testsPassed: data.testsPassed,
                totalTests: data.totalTests,
                testResults: data.testResults || [],
            });
        } catch (err) {
            setError(err.response?.data?.message || "Run failed. Please try again.");
        } finally {
            setIsRunning(false);
        }
    }, []);

    const reset = useCallback(() => {
        setResult(null);
        setError(null);
    }, []);

    return { run, isRunning, result, error, reset };
}
