// Runs every visualizer approach on its problem's examples and checks the
// final answer against the expected output. Usage: node scripts/check-visualizers.mjs
import fs from "node:fs";
import { visualizers, getVisualizer } from "../lib/visualizer/index.js";
import { runApproach, MAX_STEPS } from "../lib/visualizer/engine.js";

const problems = JSON.parse(fs.readFileSync(new URL("./visualizer-examples.json", import.meta.url), "utf8"));
const norm = (s) => String(s ?? "").trim().split("\n").map((l) => l.trim().replace(/\s+/g, " ")).join("\n");

let failures = 0, checks = 0;
const covered = new Set();
for (const p of problems) {
    const def = getVisualizer(p);
    if (!def) continue;
    covered.add(def.id);
    const inputs = p.examples.length ? p.examples : [{ input: def.sample, output: null }];
    for (const approach of def.approaches) {
        for (const [i, ex] of inputs.entries()) {
            checks++;
            const label = `${p.title} / ${approach.label} / example ${i + 1}`;
            let res;
            try {
                res = runApproach(approach, def.parse(ex.input));
            } catch (e) {
                res = { error: `parse: ${e.message}` };
            }
            const bad = (msg) => { failures++; console.log(`FAIL ${label}: ${msg}`); };
            if (res.error) { bad(res.error); continue; }
            if (res.steps.length > MAX_STEPS * 0.8) console.log(`WARN ${label}: ${res.steps.length} steps`);
            for (const [k, s] of res.steps.entries()) {
                if (!s.note || typeof s.line !== "number" || s.line < 1 || s.line > approach.code.length) { bad(`step ${k} has bad note/line (${s.line})`); break; }
            }
            if (ex.output != null && norm(res.answer) !== norm(ex.output)) bad(`answer ${JSON.stringify(res.answer)} != expected ${JSON.stringify(ex.output)}`);
        }
    }
}
const uncovered = problems.filter((p) => !getVisualizer(p)).map((p) => p.title);
const unused = visualizers.filter((d) => !covered.has(d.id)).map((d) => d.id);
console.log(`\n${checks} checks, ${failures} failures. ${covered.size}/${problems.length} problems have a visualizer.`);
if (unused.length) console.log("Visualizers matching no problem:", unused.join(", "));
if (uncovered.length) console.log("No visualizer yet:", uncovered.join(" · "));
process.exit(failures ? 1 : 0);
