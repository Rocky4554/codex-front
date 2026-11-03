// Time / space complexity for a problem: from its visualizer's approaches when
// it has one, otherwise from the hand-written tables in this folder.
import { getVisualizer, normalizeTitle } from "@/lib/visualizer";
import part1 from "./part1.js";
import part2 from "./part2.js";
import part3 from "./part3.js";

const byTitle = new Map();
for (const table of [part1, part2, part3]) {
    for (const [title, approaches] of Object.entries(table)) byTitle.set(normalizeTitle(title), approaches);
}

/** [{ label, time, space }] — optimal approach last — or an empty array. */
export function getComplexity(problem) {
    const viz = getVisualizer(problem);
    if (viz) return viz.approaches.filter((a) => a.complexity).map((a) => ({ label: a.label, ...a.complexity }));
    return byTitle.get(normalizeTitle(problem?.title)) || [];
}
