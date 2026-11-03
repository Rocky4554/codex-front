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
// Same approaches in other languages, keyed by def id → approach key (see ./code/README.md).
import arraysCode from "./code/arrays.js";
import arrays2Code from "./code/arrays2.js";
import dpCode from "./code/dp.js";
import graphsCode from "./code/graphs.js";
import hashingCode from "./code/hashing.js";
import linkedlistCode from "./code/linkedlist.js";
import linkedlist2Code from "./code/linkedlist2.js";
import recursionCode from "./code/recursion.js";
import recursion2Code from "./code/recursion2.js";
import searchCode from "./code/search.js";
import slidingwindowCode from "./code/slidingwindow.js";
import slidingwindow2Code from "./code/slidingwindow2.js";
import sortingCode from "./code/sorting.js";
import sorting2Code from "./code/sorting2.js";
import stackqueueCode from "./code/stackqueue.js";
import stackqueue2Code from "./code/stackqueue2.js";
import stringsCode from "./code/strings.js";
import treesCode from "./code/trees.js";
import trees2Code from "./code/trees2.js";

const isDef = (x) => x && typeof x === "object" && Array.isArray(x.approaches) && Array.isArray(x.titles);

export const visualizers = [
    arrays, arrays2, dp, graphs, hashing, linkedlist, linkedlist2, recursion, recursion2, search, slidingwindow, slidingwindow2, sorting, sorting2, stackqueue, stackqueue2, strings, trees, trees2,
]
    .flatMap((mod) => Object.values(mod))
    .filter(isDef);

const translations = Object.assign({}, arraysCode, arrays2Code, dpCode, graphsCode, hashingCode, linkedlistCode, linkedlist2Code, recursionCode, recursion2Code, searchCode, slidingwindowCode, slidingwindow2Code, sortingCode, sorting2Code, stackqueueCode, stackqueue2Code, stringsCode, treesCode, trees2Code);

export const CODE_LANGUAGES = [
    { key: "python", label: "Python" },
    { key: "javascript", label: "JavaScript" },
    { key: "java", label: "Java" },
    { key: "cpp", label: "C++" },
];

/**
 * An approach's code in a language as [{ text, line }], where `line` is the
 * Python line it mirrors (what t.step highlights) or null. Null if untranslated.
 */
export function codeFor(def, approach, lang) {
    if (lang === "python") return approach.code.map((text, i) => ({ text, line: i + 1 }));
    const lines = translations[def.id]?.[approach.key]?.[lang];
    if (!lines) return null;
    return lines.map((l) => (Array.isArray(l) ? { text: l[1], line: l[0] } : { text: l, line: null }));
}

/** Every translation, for the checker script. */
export const allTranslations = translations;

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
