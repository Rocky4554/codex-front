// Checks the JavaScript / Java / C++ versions of every visualizer approach
// (lib/visualizer/code/*) against the Python they mirror. Usage: node scripts/check-visualizer-code.mjs
import { visualizers, allTranslations, CODE_LANGUAGES } from "../lib/visualizer/index.js";

const LANGS = CODE_LANGUAGES.map((l) => l.key).filter((k) => k !== "python");
const errors = [];
let missing = 0, ok = 0;

const balanced = (text) => {
    // Strip string/char literals and comments before counting brackets.
    const src = text.replace(/"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`/g, "\"\"").replace(/\/\/.*$/gm, "");
    for (const [o, c] of ["{}", "()", "[]"]) {
        let depth = 0;
        for (const ch of src) {
            if (ch === o) depth++;
            if (ch === c && --depth < 0) return `unbalanced ${o}${c}`;
        }
        if (depth !== 0) return `unbalanced ${o}${c}`;
    }
    return null;
};

const known = new Map(visualizers.map((d) => [d.id, new Map(d.approaches.map((a) => [a.key, a]))]));
for (const [id, byKey] of Object.entries(allTranslations)) {
    if (!known.has(id)) { errors.push(`unknown def id "${id}"`); continue; }
    for (const key of Object.keys(byKey)) if (!known.get(id).has(key)) errors.push(`${id}: unknown approach key "${key}"`);
}

for (const def of visualizers) {
    for (const approach of def.approaches) {
        const n = approach.code.length;
        for (const lang of LANGS) {
            const where = `${def.id} / ${approach.key} / ${lang}`;
            const lines = allTranslations[def.id]?.[approach.key]?.[lang];
            if (!lines) { missing++; continue; }
            const problems = [];
            const order = [];
            for (const l of lines) {
                if (typeof l === "string") continue;
                if (!Array.isArray(l) || l.length !== 2 || !Number.isInteger(l[0]) || typeof l[1] !== "string") {
                    problems.push(`bad line entry ${JSON.stringify(l)}`);
                    continue;
                }
                if (l[0] < 1 || l[0] > n) problems.push(`line number ${l[0]} outside 1..${n}`);
                if (!order.includes(l[0])) order.push(l[0]);
            }
            const absent = Array.from({ length: n }, (_, i) => i + 1).filter((i) => !order.includes(i));
            if (absent.length) problems.push(`Python lines never mapped: ${absent.join(", ")}`);
            if (order.some((v, i) => i > 0 && v < order[i - 1])) problems.push(`mapped lines out of order: ${order.join(",")}`);
            const text = lines.map((l) => (typeof l === "string" ? l : l[1])).join("\n");
            const bal = balanced(text);
            if (bal) problems.push(bal);
            if (lang === "javascript") {
                try { new Function(text); } catch (e) { problems.push(`does not parse: ${e.message}`); }
            }
            if (problems.length) errors.push(`${where}: ${problems.join("; ")}`);
            else ok++;
        }
    }
}

for (const e of errors) console.log("✗", e);
console.log(`\n${ok} ok, ${errors.length} with errors, ${missing} not translated yet.`);
process.exit(errors.length || missing ? 1 : 0);
