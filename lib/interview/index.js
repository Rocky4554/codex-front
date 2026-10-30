import { coreQuestions } from "./questions-core";
import { frontendQuestions } from "./questions-frontend";
import { backendQuestions } from "./questions-backend";

export { tracks, trackById, trackColors } from "./tracks";

export const allQuestions = [...coreQuestions, ...frontendQuestions, ...backendQuestions];

export const questionsByTrack = (trackId) => allQuestions.filter((q) => q.track === trackId);

// ── Progress, persisted per-browser in localStorage ─────────────────────
// { [questionId]: "done" | "again" } — exposed as an external store so
// components read it with useSyncExternalStore (SSR-safe, no effects).
const KEY = "interview.progress";
const EMPTY = {};
let cache = null;
const listeners = new Set();

export function getProgressSnapshot() {
    if (cache === null) {
        try {
            cache = JSON.parse(localStorage.getItem(KEY) || "{}");
        } catch {
            cache = {};
        }
    }
    return cache;
}

export function getServerProgressSnapshot() {
    return EMPTY;
}

export function subscribeProgress(cb) {
    listeners.add(cb);
    return () => listeners.delete(cb);
}

export function setQuestionProgress(questionId, status) {
    cache = { ...getProgressSnapshot(), [questionId]: status };
    try {
        localStorage.setItem(KEY, JSON.stringify(cache));
    } catch {
        /* private mode — progress just won't persist */
    }
    listeners.forEach((l) => l());
}
