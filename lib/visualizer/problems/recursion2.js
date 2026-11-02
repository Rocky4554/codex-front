import { array, calls, chars, value } from "../structures.js";
import { int, lines, str } from "../parse.js";

const smallInt = (input, { min = 0, max = 10 } = {}) => {
    const n = int(lines(input)[0]);
    if (n < min || n > max) throw new Error(`Pick n between ${min} and ${max} so the animation stays readable.`);
    return { n };
};

export const factorial = {
    id: "factorial",
    titles: ["Factorial"],
    sample: "5",
    parse: (input) => smallInt(input, { max: 12 }),
    approaches: [
        {
            key: "recursive",
            label: "Recursion",
            complexity: { time: "O(n)", space: "O(n)" },
            code: [
                "def fact(n):",
                "    if n <= 1: return 1",
                "    return n * fact(n - 1)",
            ],
            run({ n }, t) {
                const frames = [];
                const draw = () => [calls("calls", frames)];
                t.step(1, `n! = n × (n−1)!. Each call waits for the smaller one to return.`, draw());
                const fact = (k) => {
                    frames.push({ label: `fact(${k})` });
                    if (k <= 1) {
                        frames[frames.length - 1].value = 1;
                        t.step(2, `fact(${k}) is the base case: 1. Now the waiting calls can finish.`, draw());
                        frames.pop();
                        return 1;
                    }
                    t.step(3, `fact(${k}) needs fact(${k - 1}) first.`, draw());
                    const sub = fact(k - 1);
                    const v = k * sub;
                    frames[frames.length - 1].value = v;
                    t.step(3, `fact(${k}) = ${k} × ${sub} = ${v}.`, draw());
                    frames.pop();
                    return v;
                };
                const ans = fact(n);
                t.step(3, `${n}! = ${ans}.`, [calls("calls", []), value("ans", "answer", ans, { tone: "found" })]);
                t.result(String(ans));
            },
        },
    ],
};

export const print1ToN = {
    id: "print-1-to-n",
    titles: ["Print 1 to N"],
    sample: "5",
    parse: (input) => smallInt(input, { min: 1, max: 10 }),
    approaches: [
        {
            key: "recursive",
            label: "Recursion (print on the way back)",
            complexity: { time: "O(n)", space: "O(n)" },
            code: [
                "def show(n):",
                "    if n == 0: return",
                "    show(n - 1)     # print smaller numbers first",
                "    print(n)",
            ],
            run({ n }, t) {
                const frames = [];
                const out = [];
                const draw = () => [calls("calls", frames), array("out", out, { label: "Printed", hideIndex: true })];
                t.step(1, `show(${n}) first prints 1…${n - 1} by recursing, then prints ${n}. So printing happens while the calls unwind.`, draw());
                const show = (k) => {
                    frames.push({ label: `show(${k})` });
                    if (k === 0) {
                        t.step(2, "show(0) is the base case: print nothing and return.", draw());
                        frames.pop();
                        return;
                    }
                    t.step(3, `show(${k}) calls show(${k - 1}) before printing.`, draw());
                    show(k - 1);
                    out.push(k);
                    frames[frames.length - 1].value = "printed";
                    t.step(4, `Back in show(${k}): print ${k}.`, draw());
                    frames.pop();
                };
                show(n);
                t.step(4, `Printed 1 to ${n}.`, draw());
                t.result(out.join(" "));
            },
        },
    ],
};

export const sumOfDigits = {
    id: "sum-of-digits",
    titles: ["Sum of Digits"],
    sample: "12345",
    parse(input) {
        const n = Math.abs(int(lines(input)[0]));
        if (String(n).length > 10) throw new Error("Use at most 10 digits.");
        return { n };
    },
    approaches: [
        {
            key: "recursive",
            label: "Recursion",
            complexity: { time: "O(digits)", space: "O(digits)" },
            code: [
                "def digits(n):",
                "    if n < 10: return n",
                "    return n % 10 + digits(n // 10)",
            ],
            run({ n }, t) {
                const frames = [];
                const s = String(n);
                const tones = {};
                const draw = () => [chars("num", s, { label: "number", tones }), calls("calls", frames)];
                t.step(1, "Peel off the last digit (n % 10) and recurse on the rest (n // 10).", draw());
                const go = (k, depth) => {
                    frames.push({ label: `digits(${k})` });
                    const idx = s.length - 1 - depth;
                    tones[idx] = "active";
                    if (k < 10) {
                        frames[frames.length - 1].value = k;
                        t.step(2, `${k} is a single digit — return it.`, draw());
                        tones[idx] = "done";
                        frames.pop();
                        return k;
                    }
                    t.step(3, `digits(${k}) = ${k % 10} + digits(${Math.floor(k / 10)}).`, draw());
                    const rest = go(Math.floor(k / 10), depth + 1);
                    const v = (k % 10) + rest;
                    tones[idx] = "done";
                    frames[frames.length - 1].value = v;
                    t.step(3, `digits(${k}) = ${k % 10} + ${rest} = ${v}.`, draw());
                    frames.pop();
                    return v;
                };
                const ans = go(n, 0);
                t.step(3, `The digits of ${n} add up to ${ans}.`, [chars("num", s, { label: "number", tones }), value("ans", "sum", ans, { tone: "found" })]);
                t.result(String(ans));
            },
        },
    ],
};

export const reverseStringRecursion = {
    id: "reverse-string-recursion",
    titles: ["Reverse String Using Recursion"],
    sample: "codex",
    parse(input) {
        const s = str(lines(input)[0] ?? "");
        if (s.length > 10) throw new Error("Use at most 10 characters so the animation stays readable.");
        return { s };
    },
    approaches: [
        {
            key: "recursive",
            label: "Recursion",
            complexity: { time: "O(n²) with slicing", space: "O(n)" },
            code: [
                "def rev(s):",
                "    if len(s) <= 1: return s",
                "    return rev(s[1:]) + s[0]",
            ],
            run({ s }, t) {
                const frames = [];
                const tones = {};
                const draw = () => [chars("s", s, { label: "s", tones }), calls("calls", frames)];
                t.step(1, "Reverse everything after the first character, then put the first character at the end.", draw());
                const rev = (sub, start) => {
                    frames.push({ label: `rev("${sub}")` });
                    if (sub.length <= 1) {
                        if (sub.length) tones[start] = "found";
                        frames[frames.length - 1].value = `"${sub}"`;
                        t.step(2, sub.length ? `"${sub}" is one character — it's its own reverse.` : "The empty string is its own reverse.", draw());
                        frames.pop();
                        return sub;
                    }
                    tones[start] = "active";
                    t.step(3, `rev("${sub}") = rev("${sub.slice(1)}") + '${sub[0]}'.`, draw());
                    const inner = rev(sub.slice(1), start + 1);
                    const v = inner + sub[0];
                    tones[start] = "found";
                    frames[frames.length - 1].value = `"${v}"`;
                    t.step(3, `"${inner}" + '${sub[0]}' = "${v}".`, draw());
                    frames.pop();
                    return v;
                };
                const ans = rev(s, 0);
                t.step(3, `Reversed: "${ans}".`, [chars("out", ans, { label: "reversed", tones: Object.fromEntries([...ans].map((_, i) => [i, "done"])) })]);
                t.result(ans);
            },
        },
    ],
};
