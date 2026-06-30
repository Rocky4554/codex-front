// Streams a CodeBot SSE response from the backend (through the Next.js proxy).
//
// The backend sends newline-delimited SSE frames, each carrying one JSON object:
//   data: {"type":"token","text":"..."}
//   data: {"type":"done","conversationId":"...","remaining":42}
//   data: {"type":"error","status":429,"message":"..."}
//
// We use fetch (not EventSource) because the request is a POST with a JSON body.
// Cookies (the auth_token) ride along automatically for same-origin requests.

const PROXY_BASE = "/api/proxy";

/**
 * @param {string} path   e.g. `/problems/{id}/assistant/chat`
 * @param {object} body   request payload
 * @param {object} handlers { onMeta, onToken, onDone, onError }
 * @returns {Promise<void>}
 */
export async function streamAssistant(path, body, { onMeta, onToken, onDone, onError } = {}) {
    let res;
    try {
        res = await fetch(`${PROXY_BASE}${path}`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Accept: "text/event-stream" },
            body: JSON.stringify(body || {}),
        });
    } catch {
        onError?.({ message: "Network error — could not reach the assistant." });
        return;
    }

    // Non-streaming error (e.g. 401/403/500 returned as JSON, or 429 before stream).
    if (!res.ok || !res.body) {
        let message = `Request failed (${res.status})`;
        try {
            const data = await res.json();
            message = data.message || message;
        } catch {
            /* keep default */
        }
        onError?.({ status: res.status, message });
        return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    const handleFrame = (raw) => {
        // A frame may contain multiple "data:" lines; concatenate their payloads.
        const dataLines = raw
            .split("\n")
            .filter((l) => l.startsWith("data:"))
            .map((l) => l.slice(5).trim());
        if (dataLines.length === 0) return;
        const payload = dataLines.join("");
        if (!payload) return;
        let evt;
        try {
            evt = JSON.parse(payload);
        } catch {
            return;
        }
        if (evt.type === "token") onToken?.(evt.text || "");
        else if (evt.type === "meta") onMeta?.(evt);
        else if (evt.type === "done") onDone?.(evt);
        else if (evt.type === "error") onError?.(evt);
    };

    try {
        for (;;) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            // SSE frames are separated by a blank line.
            let sep;
            while ((sep = buffer.indexOf("\n\n")) !== -1) {
                const frame = buffer.slice(0, sep);
                buffer = buffer.slice(sep + 2);
                handleFrame(frame);
            }
        }
        if (buffer.trim()) handleFrame(buffer);
    } catch {
        onError?.({ message: "Stream interrupted." });
    }
}
