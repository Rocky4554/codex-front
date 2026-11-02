import { array, queue, stack, tracked } from "../structures.js";
import { lines, nums, requireLength } from "../parse.js";

/** "6\npush 1\npush 2\ntop" → [{ op: "push", arg: 1 }, { op: "top" }] (leading count line optional). */
function parseOps(input, allowed) {
    let ls = lines(input);
    if (ls.length && /^\d+$/.test(ls[0])) ls = ls.slice(1, 1 + Number(ls[0]));
    const ops = ls.map((l) => {
        const [op, arg] = l.split(/\s+/);
        if (!allowed.includes(op)) throw new Error(`Unknown operation "${op}". Use: ${allowed.join(", ")}.`);
        return arg === undefined ? { op } : { op, arg: Number(arg) };
    });
    if (!ops.length) throw new Error("Give at least one operation.");
    if (ops.length > 16) throw new Error("Use at most 16 operations so the animation stays readable.");
    return { ops };
}

const opsList = (ops, i) =>
    array("ops", ops.map((o) => (o.arg === undefined ? o.op : `${o.op} ${o.arg}`)), {
        label: "Operations",
        pointers: { op: i },
        tones: Object.fromEntries(ops.map((_, k) => [k, k < i ? "done" : k === i ? "active" : undefined]).filter(([, v]) => v)),
        hideIndex: true,
    });

export const implementStack = {
    id: "implement-stack",
    titles: ["Implement Stack Using Array"],
    sample: "6\npush 1\npush 2\ntop\npop\nempty\npop",
    parse: (input) => parseOps(input, ["push", "pop", "top", "empty"]),
    approaches: [
        {
            key: "array",
            label: "Array (append / pop at the end)",
            complexity: { time: "O(1) per op", space: "O(n)" },
            code: [
                "arr = []",
                "push x : arr.append(x)",
                "pop    : print(arr.pop())     # -1 if empty",
                "top    : print(arr[-1])       # -1 if empty",
                "empty  : print(len(arr) == 0)",
            ],
            run({ ops }, t) {
                const st = [];
                const out = [];
                const draw = (i, tones = {}) => [
                    opsList(ops, i),
                    stack("st", st, { label: "Stack (top = end of array)", tones }),
                    array("out", out, { label: "Printed", hideIndex: true }),
                ];
                t.step(1, "The end of the array is the top of the stack, so push and pop are both O(1).", draw(null));
                ops.forEach(({ op, arg }, i) => {
                    if (op === "push") {
                        st.push(tracked([arg], "s")[0]);
                        t.step(2, `push ${arg}: append it — ${arg} is the new top.`, draw(i, { [st.length - 1]: "active" }));
                    } else if (op === "pop") {
                        if (!st.length) {
                            out.push(-1);
                            t.step(3, "pop on an empty stack prints -1.", draw(i));
                            return;
                        }
                        t.step(3, `pop: remove the top, ${st[st.length - 1].v}.`, draw(i, { [st.length - 1]: "bad" }));
                        out.push(st.pop().v);
                        t.step(3, `Printed ${out[out.length - 1]}.`, draw(i));
                    } else if (op === "top") {
                        const v = st.length ? st[st.length - 1].v : -1;
                        out.push(v);
                        t.step(4, st.length ? `top: peek at ${v} without removing it.` : "top on an empty stack prints -1.", draw(i, st.length ? { [st.length - 1]: "found" } : {}));
                    } else {
                        out.push(String(st.length === 0));
                        t.step(5, `empty: the stack has ${st.length} item(s), so print ${st.length === 0}.`, draw(i));
                    }
                });
                t.step(1, "All operations done.", draw(null));
                t.result(out.join("\n"));
            },
        },
    ],
};

export const implementQueue = {
    id: "implement-queue",
    titles: ["Implement Queue Using Array"],
    sample: "6\nenqueue 1\nenqueue 2\nfront\ndequeue\nempty\ndequeue",
    parse: (input) => parseOps(input, ["enqueue", "dequeue", "front", "empty"]),
    approaches: [
        {
            key: "array",
            label: "Array with a front index",
            complexity: { time: "O(1) per op", space: "O(n)" },
            code: [
                "arr, head = [], 0",
                "enqueue x : arr.append(x)",
                "dequeue   : print(arr[head]); head += 1   # -1 if empty",
                "front     : print(arr[head])              # -1 if empty",
                "empty     : print(head == len(arr))",
            ],
            run({ ops }, t) {
                const q = [];
                const out = [];
                const draw = (i, tones = {}) => [
                    opsList(ops, i),
                    queue("q", q, { label: "Queue", tones }),
                    array("out", out, { label: "Printed", hideIndex: true }),
                ];
                t.step(1, "New items join at the back; items leave from the front — first in, first out.", draw(null));
                ops.forEach(({ op, arg }, i) => {
                    if (op === "enqueue") {
                        q.push(tracked([arg], "q")[0]);
                        t.step(2, `enqueue ${arg}: it joins at the back.`, draw(i, { [q.length - 1]: "active" }));
                    } else if (op === "dequeue") {
                        if (!q.length) {
                            out.push(-1);
                            t.step(3, "dequeue on an empty queue prints -1.", draw(i));
                            return;
                        }
                        t.step(3, `dequeue: ${q[0].v} has waited longest — it leaves from the front.`, draw(i, { 0: "bad" }));
                        out.push(q.shift().v);
                        t.step(3, `Printed ${out[out.length - 1]}.`, draw(i));
                    } else if (op === "front") {
                        const v = q.length ? q[0].v : -1;
                        out.push(v);
                        t.step(4, q.length ? `front: peek at ${v}.` : "front on an empty queue prints -1.", draw(i, q.length ? { 0: "found" } : {}));
                    } else {
                        out.push(String(q.length === 0));
                        t.step(5, `empty: the queue has ${q.length} item(s), so print ${q.length === 0}.`, draw(i));
                    }
                });
                t.step(1, "All operations done.", draw(null));
                t.result(out.join("\n"));
            },
        },
    ],
};

export const nextGreaterElement = {
    id: "next-greater-element",
    titles: ["Next Greater Element"],
    sample: "2 1 2 4 3",
    parse: (input) => ({ arr: requireLength(nums(lines(input)[0])) }),
    approaches: [
        {
            key: "monotonic-stack",
            label: "Monotonic stack",
            complexity: { time: "O(n)", space: "O(n)" },
            code: [
                "ans = [-1] * n; st = []   # indices waiting for an answer",
                "for i, x in enumerate(nums):",
                "    while st and nums[st[-1]] < x:",
                "        ans[st.pop()] = x",
                "    st.append(i)",
                "print(*ans)",
            ],
            run({ arr }, t) {
                const ans = arr.map(() => -1);
                const st = [];
                const solved = {};
                const draw = (i, tones = {}, stTones = {}) => [
                    array("nums", arr, { label: "nums", pointers: { i }, tones: { ...solved, ...tones } }),
                    stack("st", st.map((it) => ({ id: it.id, v: `${arr[it.v]} (i=${it.v})` })), { label: "Stack: indices still waiting", tones: stTones }),
                    array("ans", ans, { label: "ans", tones: solved }),
                ];
                t.step(1, "Keep a stack of indices whose next greater element we haven't found yet. Their values are decreasing from bottom to top.", draw(null));
                for (let i = 0; i < arr.length; i++) {
                    const x = arr[i];
                    t.step(2, `x = ${x}. Does it beat anything waiting on the stack?`, draw(i, { [i]: "active" }));
                    while (st.length && arr[st[st.length - 1].v] < x) {
                        const j = st[st.length - 1].v;
                        t.step(3, `nums[${j}] = ${arr[j]} < ${x}, so ${x} is its next greater element.`, draw(i, { [i]: "active", [j]: "compare" }, { [st.length - 1]: "found" }));
                        st.pop();
                        ans[j] = x;
                        solved[j] = "done";
                        t.step(4, `ans[${j}] = ${x}. Pop index ${j}.`, draw(i, { [i]: "active" }));
                    }
                    st.push(tracked([i], "i")[0]);
                    t.step(5, `Push index ${i} — it waits for something bigger than ${x}.`, draw(i, { [i]: "active" }, { [st.length - 1]: "active" }));
                }
                t.step(6, st.length ? `Indices still on the stack (${st.map((s) => s.v).join(", ")}) have nothing greater to their right: -1.` : "Every element found its answer.", draw(null));
                t.result(ans.join(" "));
            },
        },
    ],
};

export const minStack = {
    id: "min-stack",
    titles: ["Min Stack"],
    sample: "8\npush -2\npush 0\npush -3\ngetMin\npop\ntop\ngetMin\npop",
    parse: (input) => parseOps(input, ["push", "pop", "top", "getMin"]),
    approaches: [
        {
            key: "two-stacks",
            label: "Stack + min stack",
            complexity: { time: "O(1) per op", space: "O(n)" },
            code: [
                "st, mins = [], []",
                "push x : st.append(x); mins.append(min(x, mins[-1] if mins else x))",
                "pop    : print(st.pop()); mins.pop()",
                "top    : print(st[-1])",
                "getMin : print(mins[-1])",
            ],
            run({ ops }, t) {
                const st = [];
                const mins = [];
                const out = [];
                const draw = (i, stTones = {}, minTones = {}) => [
                    opsList(ops, i),
                    stack("st", st, { label: "Stack", tones: stTones }),
                    stack("mins", mins, { label: "Min so far (parallel stack)", tones: minTones }),
                    array("out", out, { label: "Printed", hideIndex: true }),
                ];
                t.step(1, "Alongside the stack, keep a second stack where each entry is the minimum of everything at or below that level. The current min is always on top.", draw(null));
                ops.forEach(({ op, arg }, i) => {
                    const top = st.length - 1;
                    if (op === "push") {
                        const m = mins.length ? Math.min(arg, mins[mins.length - 1].v) : arg;
                        st.push(tracked([arg], "s")[0]);
                        mins.push(tracked([m], "m")[0]);
                        t.step(2, `push ${arg}: the min at this level is min(${arg}, previous min) = ${m}.`, draw(i, { [top + 1]: "active" }, { [top + 1]: "active" }));
                    } else if (op === "pop") {
                        if (!st.length) {
                            out.push(-1);
                            t.step(3, "pop on an empty stack prints -1.", draw(i));
                            return;
                        }
                        t.step(3, `pop: remove ${st[top].v} from both stacks and print it — the min underneath becomes current again.`, draw(i, { [top]: "bad" }, { [top]: "bad" }));
                        out.push(st.pop().v);
                        mins.pop();
                        t.step(3, st.length ? `The min is back to ${mins[mins.length - 1].v}.` : "Both stacks are empty.", draw(i));
                    } else if (op === "top") {
                        const v = st.length ? st[top].v : -1;
                        out.push(v);
                        t.step(4, `top: ${v}.`, draw(i, st.length ? { [top]: "found" } : {}));
                    } else {
                        const v = mins.length ? mins[top].v : -1;
                        out.push(v);
                        t.step(5, `getMin: read the top of the min stack — ${v}, in O(1).`, draw(i, {}, mins.length ? { [top]: "found" } : {}));
                    }
                });
                t.step(1, "All operations done.", draw(null));
                t.result(out.join("\n"));
            },
        },
    ],
};
