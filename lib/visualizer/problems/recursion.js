import { array, calls } from "../structures.js";
import { int, lines } from "../parse.js";

export const fibonacci = {
    id: "fibonacci",
    titles: ["Fibonacci", "Fibonacci Number"],
    sample: "6",
    parse(input) {
        const n = int(lines(input)[0]);
        if (n < 0 || n > 12) throw new Error("Pick n between 0 and 12 so the animation stays readable.");
        return { n };
    },
    approaches: [
        {
            key: "memo",
            label: "Recursion + memo",
            complexity: { time: "O(n)", space: "O(n)" },
            code: [
                "memo = {}",
                "def fib(n):",
                "    if n <= 1: return n",
                "    if n in memo: return memo[n]",
                "    memo[n] = fib(n - 1) + fib(n - 2)",
                "    return memo[n]",
            ],
            run({ n }, t) {
                const frames = [];
                const memo = new Array(n + 1).fill("·");
                const tones = {};
                const draw = () => [
                    calls("calls", frames),
                    array("memo", memo, { label: "memo", indexLabels: memo.map((_, i) => `f(${i})`), tones }),
                ];
                t.step(2, `fib(n) = fib(n−1) + fib(n−2). Without a memo the same calls repeat exponentially; caching each answer makes it linear.`, draw());
                const fib = (k) => {
                    frames.push({ label: `fib(${k})` });
                    if (k <= 1) {
                        frames[frames.length - 1].value = k;
                        memo[k] = k;
                        tones[k] = "done";
                        t.step(3, `fib(${k}) is a base case: ${k}.`, draw());
                        frames.pop();
                        return k;
                    }
                    if (typeof memo[k] === "number") {
                        frames[frames.length - 1].value = memo[k];
                        frames[frames.length - 1].tone = "found";
                        tones[k] = "found";
                        t.step(4, `fib(${k}) is already in the memo: ${memo[k]}. No recursion needed.`, draw());
                        tones[k] = "done";
                        frames.pop();
                        return memo[k];
                    }
                    t.step(5, `fib(${k}) needs fib(${k - 1}) and fib(${k - 2}).`, draw());
                    const v = fib(k - 1) + fib(k - 2);
                    memo[k] = v;
                    tones[k] = "active";
                    frames[frames.length - 1].value = v;
                    t.step(6, `fib(${k}) = fib(${k - 1}) + fib(${k - 2}) = ${v}. Store it.`, draw());
                    tones[k] = "done";
                    frames.pop();
                    return v;
                };
                const ans = fib(n);
                t.step(6, `fib(${n}) = ${ans}.`, draw());
                t.result(String(ans));
            },
        },
        {
            key: "bottom-up",
            label: "Bottom-up",
            complexity: { time: "O(n)", space: "O(1)" },
            code: [
                "a, b = 0, 1",
                "for _ in range(n):",
                "    a, b = b, a + b",
                "return a",
            ],
            run({ n }, t) {
                const seq = [0];
                let a = 0, b = 1;
                const draw = (tones = {}) => [array("seq", seq, { label: "fib(i)", indexLabels: seq.map((_, i) => `f(${i})`), tones })];
                t.step(1, "Only the last two values matter. Start with a = fib(0) = 0, b = fib(1) = 1.", draw({ 0: "active" }), { a, b });
                for (let i = 0; i < n; i++) {
                    [a, b] = [b, a + b];
                    seq.push(a);
                    t.step(3, `Slide forward: fib(${i + 1}) = ${a}.`, draw({ [i + 1]: "active", [i]: "compare" }), { a, b });
                }
                t.step(4, `fib(${n}) = ${a}.`, draw({ [n]: "found" }), { a, b });
                t.result(String(a));
            },
        },
    ],
};
