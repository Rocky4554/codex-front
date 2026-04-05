import { useState, useCallback } from "react";
import api from "@/lib/axios";
import { useAuthStore } from "@/store/authStore";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

/**
 * Submits code to the backend and streams SSE events for real-time results.
 * Both "Run" and "Submit" use POST /api/submissions.
 * Results stream back via GET /api/submissions/{id}/events (SSE).
 */
export function useCodeExecution() {
    const { token } = useAuthStore();
    const [isRunning, setIsRunning] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const execute = useCallback(async ({ problemId, languageId, sourceCode }) => {
        setIsRunning(true);
        setResult(null);
        setError(null);

        let gotResult = false;

        try {
            // Step 1: Create the submission
            const { data } = await api.post("/submissions", {
                problemId,
                languageId,
                sourceCode,
            });

            const submissionId = data.submissionId;
            if (!submissionId) throw new Error("No submission ID returned");

            // Step 2: Stream SSE events for real-time results
            const response = await fetch(
                `${API_BASE}/submissions/${submissionId}/events`,
                {
                    headers: {
                        Accept: "text/event-stream",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) throw new Error(`SSE stream failed: ${response.status}`);

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = "";
            const TERMINAL = [
                "ACCEPTED", "WRONG_ANSWER", "TIME_LIMIT_EXCEEDED",
                "RUNTIME_ERROR", "COMPILATION_ERROR", "MEMORY_LIMIT_EXCEEDED",
            ];

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split("\n");
                buffer = lines.pop() || "";

                for (const line of lines) {
                    if (!line.startsWith("data:")) continue;
                    const raw = line.slice(5).trim();
                    if (!raw || raw === "[DONE]") continue;
                    try {
                        const event = JSON.parse(raw);
                        setResult(event);
                        gotResult = true;
                        if (TERMINAL.includes(event.status)) {
                            reader.cancel();
                            return;
                        }
                    } catch {
                        // Plain-text terminal status (e.g. "ACCEPTED")
                        if (TERMINAL.includes(raw)) {
                            setResult({ status: raw, output: raw });
                            gotResult = true;
                            reader.cancel();
                            return;
                        }
                        setResult((prev) => ({ ...(prev || {}), output: raw }));
                        gotResult = true;
                    }
                }
            }
        } catch (err) {
            // Don't show a network error if we already received a valid result
            // (server closing the SSE stream abruptly after sending the result)
            if (!gotResult) {
                setError(err.message || "Execution failed");
            }
        } finally {
            setIsRunning(false);
        }
    }, [token]);

    const reset = useCallback(() => {
        setResult(null);
        setError(null);
    }, []);

    return { execute, isRunning, result, error, reset };
}
