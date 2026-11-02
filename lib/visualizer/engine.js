// Visualization engine: an algorithm runs on real input and records a FULL
// snapshot of the screen at every step (never a delta), so stepping back,
// scrubbing and jumping are just "render step i".
//
// Step shape:
//   line        1-based line of the approach's code to highlight
//   note        one or two sentences explaining this exact moment
//   structures  what to draw — built with the helpers in ./structures
//   vars        { name: value } shown as chips under the canvas
//
// Visualizer definition shape (see ./problems/*):
//   id, titles            titles it matches (normalized, so case/punctuation don't matter)
//   sample                fallback input when the problem has no examples
//   parse(input)          stdin-style input string → args; throw Error(msg) when invalid
//   approaches[]          { key, label, complexity: { time, space }, code: [lines], run(args, t) }
//
// `run` calls t.step(...) as it goes and t.result(answer) at the end. The
// answer is compared against the example's expected output in tests.

export const MAX_STEPS = 500;

export class StepLimitError extends Error {
    constructor() {
        super(`This input needs more than ${MAX_STEPS} steps — try a smaller one.`);
    }
}

export function createTracer() {
    const steps = [];
    let result;
    return {
        steps,
        step(line, note, structures = [], vars = {}) {
            if (steps.length >= MAX_STEPS) throw new StepLimitError();
            steps.push({
                line,
                note,
                structures: structuredClone(structures.filter(Boolean)),
                vars: structuredClone(vars),
            });
        },
        result(value) {
            result = value;
        },
        get answer() {
            return result;
        },
    };
}

/** Run one approach on parsed args. Returns { steps, answer } or { error }. */
export function runApproach(approach, args) {
    const t = createTracer();
    try {
        approach.run(structuredClone(args), t);
    } catch (e) {
        return { error: e.message || String(e), steps: t.steps };
    }
    if (t.steps.length === 0) return { error: "Nothing to show for this input.", steps: [] };
    return { steps: t.steps, answer: t.answer };
}
