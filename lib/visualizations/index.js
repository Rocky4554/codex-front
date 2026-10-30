import { twoSumII } from "./two-sum-ii";
import { observerPattern } from "./observer-pattern";

// Visualizations live in the frontend for now, keyed by problem slug/title.
// Once the backend grows a `visualization` field on problems, this registry
// becomes the fallback and the API field wins.
const registry = [twoSumII, observerPattern];

const normalize = (s) =>
    String(s || "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

const aliases = {
    "two-sum-2": "two-sum-ii",
    "two-sum-ii-input-array-is-sorted": "two-sum-ii",
    observer: "observer-pattern",
};

const bySlug = new Map(registry.map((v) => [v.id, v]));

/** Find a visualization for a problem object (matches id, slug or title). */
export function getVisualization(problem) {
    if (!problem) return null;
    for (const raw of [problem.slug, problem.id, problem.title]) {
        const key = normalize(raw);
        if (!key) continue;
        const viz = bySlug.get(aliases[key] || key);
        if (viz) return viz;
    }
    return null;
}
