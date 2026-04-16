import { useState, useCallback } from "react";
import api from "@/lib/axios";

/**
 * Submits code to the backend and streams SSE events for real-time results.
 * Both "Run" and "Submit" use POST /api/submissions.
 * Results stream back via GET /api/submissions/{id}/events (SSE).
 */
export function useCodeExecution() {
    const [isRunning, setIsRunning] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const execute = useCallback(async ({ problemId, languageId, sourceCode }) => {
        setIsRunning(true);
        setResult(null);
        setError(null);

        let gotResult = false;
        let timeoutId = null;
        let submissionId = null;
        const TERMINAL = [
            "ACCEPTED", "WRONG_ANSWER", "TIME_LIMIT_EXCEEDED",
            "RUNTIME_ERROR", "COMPILATION_ERROR", "MEMORY_LIMIT_EXCEEDED",
        ];

        try {
            // Step 1: Create the submission
            const { data } = await api.post("/submissions", {
                problemId,
                languageId,
                sourceCode,
            });

            submissionId = data.submissionId;
            if (!submissionId) throw new Error("No submission ID returned");

            // Step 2: Try SSE for real-time results (60s Vercel limit)
            const controller = new AbortController();
            timeoutId = setTimeout(() => controller.abort(), 60_000); // 60s Vercel max

            try {
                const response = await fetch(
                    `/api/proxy/submissions/${submissionId}/events`,
                    {
                        headers: { Accept: "text/event-stream" },
                        signal: controller.signal,
                    }
                );

                if (!response.ok) throw new Error(`SSE stream failed: ${response.status}`);

                const reader = response.body.getReader();
                const decoder = new TextDecoder();
                let buffer = "";

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    buffer += decoder.decode(value, { stream: true });
                    const lines = buffer.split("\n");
                    buffer = lines.pop() || "";

                    for (const line of lines) {
                        if (line.startsWith("event:")) continue;
                        if (!line.startsWith("data:")) continue;
                        const raw = line.slice(5).trim();
                        if (!raw || raw === "[DONE]") continue;
                        try {
                            const event = JSON.parse(raw);
                            const mapped = {
                                status: event.status,
                                output: event.stdout,
                                stderr: event.stderr,
                                testsPassed: event.testsPassed,
                                totalTests: event.totalTests,
                                executionTimeMs: event.executionTimeMs,
                            };
                            setResult(mapped);
                            gotResult = true;
                            if (TERMINAL.includes(event.status)) {
                                clearTimeout(timeoutId);
                                reader.cancel();
                                return;
                            }
                        } catch {
                            if (TERMINAL.includes(raw)) {
                                setResult({ status: raw });
                                gotResult = true;
                                clearTimeout(timeoutId);
                                reader.cancel();
                                return;
                            }
                            setResult((prev) => ({ ...(prev || {}), output: raw }));
                            gotResult = true;
                        }
                    }
                }
            } catch (sseErr) {
                clearTimeout(timeoutId);
                // If SSE timeout (AbortError) and no result yet → fall back to polling
                if (sseErr.name === "AbortError" && !gotResult) {
                    setResult({ status: "RUNNING", output: "Taking longer than expected... polling for result." });
                    await pollForResult(submissionId, TERMINAL);
                    return;
                }
                throw sseErr;
            }
        } catch (err) {
            clearTimeout(timeoutId);
            if (!gotResult) {
                const msg = err.message || "Execution failed";
                setError(msg);
            }
        } finally {
            setIsRunning(false);
        }
    }, []);

    // Poll endpoint until terminal status reached (max 5 min)
    const pollForResult = async (submissionId, TERMINAL) => {
        const startTime = Date.now();
        const MAX_POLL_TIME = 5 * 60 * 1000; // 5 min max
        const POLL_INTERVAL = 2000; // 2s between polls

        while (Date.now() - startTime < MAX_POLL_TIME) {
            try {
                const { data } = await api.get(`/submissions/${submissionId}`);
                const mapped = {
                    status: data.status,
                    output: data.stdout,
                    stderr: data.stderr,
                    testsPassed: data.passedTestCases,
                    totalTests: data.totalTestCases,
                    executionTimeMs: data.executionTimeMs,
                };
                setResult(mapped);
                if (TERMINAL.includes(data.status)) return;
            } catch (err) {
                setError(`Polling failed: ${err.message}`);
                return;
            }
            await new Promise((r) => setTimeout(r, POLL_INTERVAL));
        }
        setError("Execution took too long (>5 min)");
    };

    const reset = useCallback(() => {
        setResult(null);
        setError(null);
    }, []);

    return { execute, isRunning, result, error, reset };
}
