// Registry of problem visualizers, matched by problem title.
// Each problem file exports visualizer definitions (see ./engine.js for the shape).
import * as arrays from "./problems/arrays.js";
import * as arrays2 from "./problems/arrays2.js";
import * as dp from "./problems/dp.js";
import * as graphs from "./problems/graphs.js";
import * as hashing from "./problems/hashing.js";
import * as linkedlist from "./problems/linkedlist.js";
import * as linkedlist2 from "./problems/linkedlist2.js";
import * as recursion from "./problems/recursion.js";
import * as recursion2 from "./problems/recursion2.js";
import * as search from "./problems/search.js";
import * as slidingwindow from "./problems/slidingwindow.js";
import * as slidingwindow2 from "./problems/slidingwindow2.js";
import * as sorting from "./problems/sorting.js";
import * as sorting2 from "./problems/sorting2.js";
import * as stackqueue from "./problems/stackqueue.js";
import * as stackqueue2 from "./problems/stackqueue2.js";
import * as strings from "./problems/strings.js";
import * as trees from "./problems/trees.js";
import * as trees2 from "./problems/trees2.js";

const isDef = (x) => x && typeof x === "object" && Array.isArray(x.approaches) && Array.isArray(x.titles);

export const visualizers = [
    arrays, arrays2, dp, graphs, hashing, linkedlist, linkedlist2, recursion, recursion2, search, slidingwindow, slidingwindow2, sorting, sorting2, stackqueue, stackqueue2, strings, trees, trees2,
]
    .flatMap((mod) => Object.values(mod))
    .filter(isDef);

export const normalizeTitle = (s) =>
    String(s || "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, " ")
        .trim();

const byTitle = new Map();
for (const def of visualizers) {
    for (const title of def.titles) byTitle.set(normalizeTitle(title), def);
}

/** The visualizer for a problem, or null. */
export function getVisualizer(problem) {
    if (!problem?.title) return null;
    return byTitle.get(normalizeTitle(problem.title)) || null;
}
