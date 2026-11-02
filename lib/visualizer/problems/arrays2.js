import { array, map, tracked, value } from "../structures.js";
import { int, lines, nums, requireLength } from "../parse.js";

const firstLine = (input, opts) => requireLength(nums(lines(input)[0]), opts);
const join = (items) => items.map((x) => (x && typeof x === "object" ? x.v : x)).join(" ");

export const findLargestSmallest = {
    id: "find-largest-smallest",
    titles: ["Find Largest / Smallest Element"],
    sample: "4 7 1 9 3",
    parse: (input) => ({ arr: firstLine(input) }),
    approaches: [
        {
            key: "scan",
            label: "Single scan",
            complexity: { time: "O(n)", space: "O(1)" },
            code: [
                "mx = mn = arr[0]",
                "for x in arr[1:]:",
                "    if x > mx: mx = x",
                "    if x < mn: mn = x",
                "print(mx, mn)",
            ],
            run({ arr }, t) {
                let mx = 0, mn = 0; // indices
                const draw = (i, tones = {}) => [
                    array("arr", arr, { pointers: { i }, tones: { [mx]: "found", [mn]: "compare", ...tones } }),
                    value("mx", "largest", arr[mx], { tone: "found" }),
                    value("mn", "smallest", arr[mn], { tone: "compare" }),
                ];
                t.step(1, `Start with the first element as both the largest and the smallest: ${arr[0]}.`, draw(0), { max: arr[mx], min: arr[mn] });
                for (let i = 1; i < arr.length; i++) {
                    const x = arr[i];
                    if (x > arr[mx]) {
                        const old = arr[mx];
                        mx = i;
                        t.step(3, `arr[${i}] = ${x} beats the max ${old}. New max.`, draw(i, { [i]: "found" }), { i, x, max: arr[mx], min: arr[mn] });
                    } else if (x < arr[mn]) {
                        const old = arr[mn];
                        mn = i;
                        t.step(4, `arr[${i}] = ${x} is below the min ${old}. New min.`, draw(i, { [i]: "compare" }), { i, x, max: arr[mx], min: arr[mn] });
                    } else {
                        t.step(3, `arr[${i}] = ${x} is between min ${arr[mn]} and max ${arr[mx]} — nothing changes.`, draw(i, { [i]: "active" }), { i, x, max: arr[mx], min: arr[mn] });
                    }
                }
                t.step(5, `Largest is ${arr[mx]}, smallest is ${arr[mn]}.`, draw(null), { max: arr[mx], min: arr[mn] });
                t.result(`${arr[mx]} ${arr[mn]}`);
            },
        },
    ],
};

export const secondLargest = {
    id: "second-largest",
    titles: ["Find Second Largest Number"],
    sample: "10 5 8 20 15",
    parse: (input) => ({ arr: firstLine(input) }),
    approaches: [
        {
            key: "one-pass",
            label: "One pass, two trackers",
            complexity: { time: "O(n)", space: "O(1)" },
            code: [
                "first = second = None",
                "for x in arr:",
                "    if first is None or x > first:",
                "        second, first = first, x",
                "    elif x != first and (second is None or x > second):",
                "        second = x",
                "print(second if second is not None else -1)",
            ],
            run({ arr }, t) {
                let first = null, second = null;
                const draw = (i, tones = {}) => {
                    const base = {};
                    arr.forEach((v, k) => {
                        if (k <= (i ?? arr.length - 1)) {
                            if (v === first) base[k] = "found";
                            else if (v === second) base[k] = "compare";
                        }
                    });
                    return [
                        array("arr", arr, { pointers: { i }, tones: { ...base, ...tones } }),
                        value("first", "largest", first, { tone: first == null ? null : "found" }),
                        value("second", "second largest", second, { tone: second == null ? null : "compare" }),
                    ];
                };
                t.step(1, "Track the largest and the second largest distinct values seen so far.", draw(null), { first: "None", second: "None" });
                for (let i = 0; i < arr.length; i++) {
                    const x = arr[i];
                    if (first == null || x > first) {
                        const old = first;
                        t.step(3, old == null ? `${x} is the first value — it becomes the largest.` : `${x} > largest ${old}.`, draw(i, { [i]: "active" }), { x, first: first ?? "None", second: second ?? "None" });
                        second = first;
                        first = x;
                        t.step(4, old == null ? `largest = ${first}.` : `The old largest ${old} drops to second; largest = ${first}.`, draw(i), { x, first, second: second ?? "None" });
                    } else if (x !== first && (second == null || x > second)) {
                        t.step(5, `${x} isn't above ${first}, but it beats second (${second ?? "None"}).`, draw(i, { [i]: "active" }), { x, first, second: second ?? "None" });
                        second = x;
                        t.step(6, `second = ${second}.`, draw(i), { x, first, second });
                    } else {
                        t.step(5, x === first ? `${x} equals the largest — duplicates don't count.` : `${x} doesn't beat second (${second}). Skip.`, draw(i, { [i]: "dim" }), { x, first, second: second ?? "None" });
                    }
                }
                const ans = second == null ? -1 : second;
                t.step(7, second == null ? "There's no second distinct value, so the answer is -1." : `The second largest distinct value is ${second}.`, draw(null), { first, second: second ?? "None" });
                t.result(String(ans));
            },
        },
    ],
};

export const removeDuplicatesSorted = {
    id: "remove-duplicates-sorted",
    titles: ["Remove Duplicates from Sorted Array"],
    sample: "1 1 2 2 3 4 4",
    parse: (input) => ({ arr: firstLine(input) }),
    approaches: [
        {
            key: "two-pointers",
            label: "Two pointers",
            complexity: { time: "O(n)", space: "O(1)" },
            code: [
                "write = 1",
                "for read in range(1, len(arr)):",
                "    if arr[read] != arr[write - 1]:",
                "        arr[write] = arr[read]",
                "        write += 1",
                "print(*arr[:write])",
            ],
            run({ arr }, t) {
                const a = [...arr];
                let write = 1;
                const draw = (read, tones = {}) => {
                    const base = {};
                    for (let k = 0; k < write; k++) base[k] = "done";
                    return [array("arr", a, { pointers: { write, read }, tones: { ...base, ...tones }, window: [0, write - 1] })];
                };
                t.step(1, `The first element ${a[0]} is always kept. 'write' is where the next new value goes.`, draw(null), { write });
                for (let read = 1; read < a.length; read++) {
                    if (a[read] !== a[write - 1]) {
                        t.step(3, `arr[${read}] = ${a[read]} differs from the last kept value ${a[write - 1]} — it's new.`, draw(read, { [read]: "active" }), { read, write });
                        a[write] = a[read];
                        t.step(4, `Copy ${a[read]} to position ${write}.`, draw(read, { [write]: "swap" }), { read, write });
                        write += 1;
                        t.step(5, `write = ${write}.`, draw(read), { read, write });
                    } else {
                        t.step(3, `arr[${read}] = ${a[read]} repeats ${a[write - 1]}. Skip it.`, draw(read, { [read]: "dim" }), { read, write });
                    }
                }
                t.step(6, `The first ${write} slots hold the unique values: ${a.slice(0, write).join(" ")}.`, draw(null), { write });
                t.result(a.slice(0, write).join(" "));
            },
        },
    ],
};

export const rotateArray = {
    id: "rotate-array",
    titles: ["Rotate Array by K Positions", "Rotate Array"],
    sample: "1 2 3 4 5\n2",
    parse(input) {
        const [a, b] = lines(input);
        return { arr: requireLength(nums(a)), k: b == null ? 0 : int(b) };
    },
    approaches: [
        {
            key: "reverse",
            label: "Three reversals",
            complexity: { time: "O(n)", space: "O(1)" },
            code: [
                "k %= n",
                "reverse(arr, 0, n - 1)     # whole array",
                "reverse(arr, 0, k - 1)     # first k",
                "reverse(arr, k, n - 1)     # the rest",
                "print(*arr)",
            ],
            run({ arr, k }, t) {
                const items = tracked(arr);
                const n = items.length;
                const kk = ((k % n) + n) % n;
                const draw = (win, pointers = {}, tones = {}) => [array("arr", items, { window: win, pointers, tones })];
                t.step(1, `Rotating right by ${k} is the same as by k % n = ${kk}. The last ${kk} values must end up in front.`, draw(null), { n, k: kk });
                const reverse = (lo, hi, line, what) => {
                    if (lo >= hi) {
                        t.step(line, `Reverse ${what}: nothing to swap.`, draw(lo <= hi ? [lo, hi] : null), { k: kk });
                        return;
                    }
                    t.step(line, `Reverse ${what} (indices ${lo}…${hi}).`, draw([lo, hi], { l: lo, r: hi }), { k: kk });
                    let l = lo, r = hi;
                    while (l < r) {
                        [items[l], items[r]] = [items[r], items[l]];
                        t.step(line, `Swap positions ${l} and ${r}.`, draw([lo, hi], { l, r }, { [l]: "swap", [r]: "swap" }), { k: kk, l, r });
                        l++;
                        r--;
                    }
                };
                if (kk === 0) {
                    t.step(5, "k % n is 0 — the array is unchanged.", draw(null), { k: kk });
                    t.result(join(items));
                    return;
                }
                reverse(0, n - 1, 2, "the whole array");
                reverse(0, kk - 1, 3, `the first ${kk}`);
                reverse(kk, n - 1, 4, "the rest");
                const tones = Object.fromEntries(items.map((_, i) => [i, "done"]));
                t.step(5, `Rotated: ${join(items)}.`, draw(null, {}, tones), { k: kk });
                t.result(join(items));
            },
        },
    ],
};

export const missingNumber = {
    id: "missing-number",
    titles: ["Find Missing Number in Array", "Missing Number"],
    sample: "3 0 1",
    parse: (input) => ({ arr: firstLine(input) }),
    approaches: [
        {
            key: "sum",
            label: "Expected sum",
            complexity: { time: "O(n)", space: "O(1)" },
            code: [
                "n = len(nums)",
                "expected = n * (n + 1) // 2",
                "actual = 0",
                "for x in nums: actual += x",
                "print(expected - actual)",
            ],
            run({ arr }, t) {
                const n = arr.length;
                const expected = (n * (n + 1)) / 2;
                let actual = 0;
                const tones = {};
                const draw = (i) => [
                    array("nums", arr, { pointers: { i }, tones }),
                    value("expected", "0 + 1 + … + n", expected),
                    value("actual", "sum so far", actual, { tone: "compare" }),
                ];
                t.step(1, `The array should hold every number 0…${n} except one.`, draw(null), { n });
                t.step(2, `If nothing were missing the total would be ${n}·${n + 1}/2 = ${expected}.`, draw(null), { n, expected });
                t.step(3, "Add up what's actually there.", draw(null), { n, expected, actual });
                for (let i = 0; i < n; i++) {
                    actual += arr[i];
                    tones[i] = "done";
                    t.step(4, `Add ${arr[i]}: actual = ${actual}.`, draw(i), { expected, actual });
                }
                const ans = expected - actual;
                t.step(5, `The gap is ${expected} − ${actual} = ${ans} — that's the missing number.`, [...draw(null), value("ans", "missing", ans, { tone: "found" })], { expected, actual });
                t.result(String(ans));
            },
        },
    ],
};

export const findDuplicates = {
    id: "find-duplicates",
    titles: ["Find Duplicates in Array"],
    sample: "4 3 2 7 8 2 3 1",
    parse: (input) => ({ arr: firstLine(input) }),
    approaches: [
        {
            key: "set",
            label: "Seen set",
            complexity: { time: "O(n log n)", space: "O(n)" },
            code: [
                "seen, dups = set(), set()",
                "for x in arr:",
                "    if x in seen: dups.add(x)",
                "    else: seen.add(x)",
                "print(*sorted(dups) or ['NONE'])",
            ],
            run({ arr }, t) {
                const seen = new Set();
                const dups = new Set();
                const tones = {};
                const draw = (i, hot, extra = {}) => [
                    array("arr", arr, { pointers: { i }, tones: { ...tones, ...extra } }),
                    map("seen", [...seen].map((v) => [v, ""]), { label: "seen", set: true, hot }),
                    map("dups", [...dups].map((v) => [v, ""]), { label: "duplicates", set: true, tones: Object.fromEntries([...dups].map((d) => [d, "found"])) }),
                ];
                t.step(1, "Remember every value we've seen; a value that shows up again is a duplicate.", draw(null), {});
                for (let i = 0; i < arr.length; i++) {
                    const x = arr[i];
                    if (seen.has(x)) {
                        dups.add(x);
                        tones[i] = "found";
                        t.step(3, `${x} is already in seen — it's a duplicate.`, draw(i, x), { i, x });
                    } else {
                        seen.add(x);
                        tones[i] = "done";
                        t.step(4, `${x} is new. Add it to seen.`, draw(i, x), { i, x });
                    }
                }
                const out = [...dups].sort((a, b) => a - b);
                t.step(5, out.length ? `Duplicates in ascending order: ${out.join(" ")}.` : "No value repeats — print NONE.", draw(null), {});
                t.result(out.length ? out.join(" ") : "NONE");
            },
        },
    ],
};

export const mergeSortedArrays = {
    id: "merge-sorted-arrays",
    titles: ["Merge Two Sorted Arrays"],
    sample: "1 2 3\n2 5 6",
    parse(input) {
        const [a, b] = lines(input);
        return { a: requireLength(nums(a), { min: 0, max: 8 }), b: requireLength(nums(b), { min: 0, max: 8 }) };
    },
    approaches: [
        {
            key: "two-pointers",
            label: "Two pointers",
            complexity: { time: "O(n + m)", space: "O(n + m)" },
            code: [
                "i = j = 0; out = []",
                "while i < len(a) and j < len(b):",
                "    if a[i] <= b[j]: out.append(a[i]); i += 1",
                "    else:            out.append(b[j]); j += 1",
                "out += a[i:] + b[j:]",
                "print(*out)",
            ],
            run({ a, b }, t) {
                const out = [];
                let i = 0, j = 0;
                const draw = (ta = {}, tb = {}) => {
                    const da = {}, db = {};
                    for (let k = 0; k < i; k++) da[k] = "done";
                    for (let k = 0; k < j; k++) db[k] = "done";
                    return [
                        array("a", a, { label: "a", pointers: { i }, tones: { ...da, ...ta } }),
                        array("b", b, { label: "b", pointers: { j }, tones: { ...db, ...tb } }),
                        array("out", out, { label: "merged", tones: out.length ? { [out.length - 1]: "active" } : {} }),
                    ];
                };
                t.step(1, "One pointer per array. Repeatedly take the smaller front value.", draw(), { i, j });
                while (i < a.length && j < b.length) {
                    if (a[i] <= b[j]) {
                        t.step(3, `a[${i}] = ${a[i]} ≤ b[${j}] = ${b[j]} — take ${a[i]} from a.`, draw({ [i]: "active" }, { [j]: "compare" }), { i, j });
                        out.push(a[i]);
                        i++;
                    } else {
                        t.step(4, `b[${j}] = ${b[j]} < a[${i}] = ${a[i]} — take ${b[j]} from b.`, draw({ [i]: "compare" }, { [j]: "active" }), { i, j });
                        out.push(b[j]);
                        j++;
                    }
                }
                const rest = i < a.length ? `a: ${a.slice(i).join(" ")}` : j < b.length ? `b: ${b.slice(j).join(" ")}` : null;
                while (i < a.length) out.push(a[i++]);
                while (j < b.length) out.push(b[j++]);
                t.step(5, rest ? `One array ran out — append what's left of ${rest}.` : "Both arrays are used up.", draw(), { i, j });
                t.step(6, `Merged: ${out.join(" ")}.`, draw(), { i, j });
                t.result(out.join(" "));
            },
        },
    ],
};

export const bestTimeStock = {
    id: "best-time-stock",
    titles: ["Best Time to Buy and Sell Stock"],
    sample: "7 1 5 3 6 4",
    parse: (input) => ({ prices: firstLine(input) }),
    approaches: [
        {
            key: "min-so-far",
            label: "Track the cheapest day",
            complexity: { time: "O(n)", space: "O(1)" },
            code: [
                "lo, best = prices[0], 0",
                "for p in prices[1:]:",
                "    best = max(best, p - lo)   # sell today?",
                "    lo = min(lo, p)            # cheaper buy day?",
                "print(best)",
            ],
            run({ prices }, t) {
                let lo = 0, best = 0, bestBuy = null, bestSell = null;
                const draw = (i, tones = {}) => [
                    array("prices", prices, {
                        bars: true,
                        pointers: { buy: lo, i },
                        tones: { [lo]: "compare", ...(bestBuy != null ? { [bestBuy]: "found", [bestSell]: "found" } : {}), ...tones },
                    }),
                    value("best", "best profit", best, { tone: best ? "found" : null }),
                ];
                t.step(1, `Buy on the cheapest day seen so far. Day 0 costs ${prices[0]}.`, draw(0), { lo: prices[0], best });
                for (let i = 1; i < prices.length; i++) {
                    const p = prices[i];
                    const profit = p - prices[lo];
                    if (profit > best) {
                        best = profit;
                        bestBuy = lo;
                        bestSell = i;
                        t.step(3, `Selling at ${p} after buying at ${prices[lo]} earns ${profit} — a new best.`, draw(i, { [i]: "found" }), { p, lo: prices[lo], best });
                    } else {
                        t.step(3, `Selling at ${p} earns ${profit}${profit < 0 ? " (a loss)" : ""} — not better than ${best}.`, draw(i, { [i]: "active" }), { p, lo: prices[lo], best });
                    }
                    if (p < prices[lo]) {
                        const old = prices[lo];
                        lo = i;
                        t.step(4, `${p} is cheaper than ${old}. Buy here from now on.`, draw(i), { p, lo: prices[lo], best });
                    }
                }
                t.step(5, best ? `Max profit is ${best}: buy at ${prices[bestBuy]}, sell at ${prices[bestSell]}.` : "Prices never rise after a buy — profit 0.", draw(null), { best });
                t.result(String(best));
            },
        },
    ],
};

export const containsDuplicate = {
    id: "contains-duplicate",
    titles: ["Contains Duplicate"],
    sample: "1 2 3 1",
    parse: (input) => ({ arr: firstLine(input) }),
    approaches: [
        {
            key: "set",
            label: "Hash set",
            complexity: { time: "O(n)", space: "O(n)" },
            code: [
                "seen = set()",
                "for x in nums:",
                "    if x in seen: return True",
                "    seen.add(x)",
                "return False",
            ],
            run({ arr }, t) {
                const seen = new Set();
                const tones = {};
                const draw = (i, hot) => [
                    array("nums", arr, { pointers: { i }, tones }),
                    map("seen", [...seen].map((v) => [v, ""]), { label: "seen", set: true, hot }),
                ];
                t.step(1, "Keep a set of values seen so far. The first repeat answers the question.", draw(null), {});
                for (let i = 0; i < arr.length; i++) {
                    const x = arr[i];
                    if (seen.has(x)) {
                        tones[i] = "found";
                        const first = arr.indexOf(x);
                        tones[first] = "found";
                        t.step(3, `${x} is already in the set (from index ${first}). Duplicate found.`, draw(i, x), { i, x });
                        t.result("true");
                        return;
                    }
                    seen.add(x);
                    tones[i] = "done";
                    t.step(4, `${x} is new — add it.`, draw(i, x), { i, x });
                }
                t.step(5, "Every value was unique.", draw(null), {});
                t.result("false");
            },
        },
    ],
};

export const singleNumber = {
    id: "single-number",
    titles: ["Single Number"],
    sample: "4 1 2 1 2",
    parse: (input) => ({ arr: firstLine(input) }),
    approaches: [
        {
            key: "xor",
            label: "XOR everything",
            complexity: { time: "O(n)", space: "O(1)" },
            code: [
                "acc = 0",
                "for x in nums:",
                "    acc ^= x      # pairs cancel: a ^ a = 0",
                "print(acc)",
            ],
            run({ arr }, t) {
                let acc = 0;
                const tones = {};
                const bin = (v) => (v < 0 ? String(v) : v.toString(2).padStart(4, "0"));
                const draw = (i) => [
                    array("nums", arr, { pointers: { i }, tones }),
                    value("acc", "acc (binary)", `${acc}  =  ${bin(acc)}`, { tone: "compare" }),
                ];
                t.step(1, "x ^ x = 0 and x ^ 0 = x, so XOR-ing everything cancels every pair and leaves the single number.", draw(null), { acc });
                for (let i = 0; i < arr.length; i++) {
                    const before = acc;
                    acc ^= arr[i];
                    tones[i] = "done";
                    t.step(3, `${before} ^ ${arr[i]} = ${acc}.`, draw(i), { x: arr[i], acc });
                }
                t.step(4, `All pairs cancelled. The number without a partner is ${acc}.`, [...draw(null), value("ans", "single", acc, { tone: "found" })], { acc });
                t.result(String(acc));
            },
        },
        {
            key: "count",
            label: "Count with a map",
            complexity: { time: "O(n)", space: "O(n)" },
            code: [
                "count = {}",
                "for x in nums: count[x] = count.get(x, 0) + 1",
                "for x, c in count.items():",
                "    if c == 1: print(x)",
            ],
            run({ arr }, t) {
                const count = new Map();
                const draw = (i, hot, tones = {}) => [
                    array("nums", arr, { pointers: { i }, tones: {} }),
                    map("count", count, { label: "count", hot, tones }),
                ];
                t.step(1, "Count how many times each value appears.", draw(null));
                for (let i = 0; i < arr.length; i++) {
                    count.set(arr[i], (count.get(arr[i]) || 0) + 1);
                    t.step(2, `count[${arr[i]}] = ${count.get(arr[i])}.`, draw(i, arr[i]));
                }
                for (const [x, c] of count) {
                    if (c === 1) {
                        t.step(4, `${x} appears once — that's the answer.`, draw(null, x, { [x]: "found" }));
                        t.result(String(x));
                        return;
                    }
                    t.step(3, `${x} appears ${c} times. Skip.`, draw(null, x, { [x]: "dim" }));
                }
                t.result("");
            },
        },
    ],
};

export const majorityElement = {
    id: "majority-element",
    titles: ["Majority Element"],
    sample: "2 2 1 1 1 2 2",
    parse: (input) => ({ arr: firstLine(input) }),
    approaches: [
        {
            key: "boyer-moore",
            label: "Boyer–Moore voting",
            complexity: { time: "O(n)", space: "O(1)" },
            code: [
                "cand, votes = None, 0",
                "for x in nums:",
                "    if votes == 0: cand = x",
                "    votes += 1 if x == cand else -1",
                "print(cand)",
            ],
            run({ arr }, t) {
                let cand = null, votes = 0;
                const tones = {};
                const draw = (i) => [
                    array("nums", arr, { pointers: { i }, tones }),
                    value("cand", "candidate", cand, { tone: "compare" }),
                    value("votes", "votes", votes),
                ];
                t.step(1, "The majority value appears more than n/2 times, so it survives if every other value cancels one of its votes.", draw(null), { cand: "None", votes });
                for (let i = 0; i < arr.length; i++) {
                    const x = arr[i];
                    if (votes === 0) {
                        cand = x;
                        t.step(3, `No votes left — ${x} becomes the candidate.`, draw(i), { x, cand, votes });
                    }
                    if (x === cand) {
                        votes++;
                        tones[i] = "active";
                        t.step(4, `${x} matches the candidate: votes = ${votes}.`, draw(i), { x, cand, votes });
                    } else {
                        votes--;
                        tones[i] = "bad";
                        t.step(4, `${x} differs from ${cand}: it cancels a vote, votes = ${votes}.`, draw(i), { x, cand, votes });
                    }
                }
                arr.forEach((v, k) => { tones[k] = v === cand ? "found" : "dim"; });
                t.step(5, `The surviving candidate is ${cand}.`, draw(null), { cand, votes });
                t.result(String(cand));
            },
        },
    ],
};

export const productExceptSelf = {
    id: "product-except-self",
    titles: ["Product of Array Except Self"],
    sample: "1 2 3 4",
    parse: (input) => ({ arr: firstLine(input, { min: 2, max: 12 }) }),
    approaches: [
        {
            key: "prefix-suffix",
            label: "Prefix × suffix",
            complexity: { time: "O(n)", space: "O(1) extra" },
            code: [
                "out = [1] * n",
                "left = 1",
                "for i in range(n): out[i] = left; left *= nums[i]",
                "right = 1",
                "for i in reversed(range(n)): out[i] *= right; right *= nums[i]",
                "print(*out)",
            ],
            run({ arr }, t) {
                const n = arr.length;
                const out = new Array(n).fill(1);
                const draw = (i, line, tones = {}) => [
                    array("nums", arr, { label: "nums", pointers: { i }, tones }),
                    array("out", out, { label: "out", tones: i == null ? {} : { [i]: "active" } }),
                ];
                t.step(1, "out[i] = (product of everything left of i) × (product of everything right of i). No division needed.", draw(null), {});
                let left = 1;
                t.step(2, "First pass, left to right: out[i] gets the product of nums[0…i−1].", draw(null), { left });
                for (let i = 0; i < n; i++) {
                    out[i] = left;
                    const lt = {};
                    for (let k = 0; k < i; k++) lt[k] = "compare";
                    t.step(3, `out[${i}] = left = ${left}${i ? ` (product of ${arr.slice(0, i).join("·")})` : " (nothing to the left)"}. Then left × ${arr[i]} = ${left * arr[i]}.`, draw(i, 3, lt), { i, left });
                    left *= arr[i];
                }
                let right = 1;
                t.step(4, "Second pass, right to left: multiply in the product of nums[i+1…].", draw(null), { right });
                for (let i = n - 1; i >= 0; i--) {
                    out[i] *= right;
                    const rt = {};
                    for (let k = i + 1; k < n; k++) rt[k] = "swap";
                    t.step(5, `out[${i}] × right ${right} = ${out[i]}. Then right × ${arr[i]} = ${right * arr[i]}.`, draw(i, 5, rt), { i, right });
                    right *= arr[i];
                }
                t.step(6, `Result: ${out.join(" ")}.`, [array("nums", arr, { label: "nums" }), array("out", out, { label: "out", tones: Object.fromEntries(out.map((_, k) => [k, "found"])) })], {});
                t.result(out.join(" "));
            },
        },
    ],
};

export const containerMostWater = {
    id: "container-most-water",
    titles: ["Container With Most Water"],
    sample: "1 8 6 2 5 4 8 3 7",
    parse: (input) => ({ h: firstLine(input, { min: 2 }) }),
    approaches: [
        {
            key: "two-pointers",
            label: "Two pointers",
            complexity: { time: "O(n)", space: "O(1)" },
            code: [
                "l, r, best = 0, len(h) - 1, 0",
                "while l < r:",
                "    best = max(best, min(h[l], h[r]) * (r - l))",
                "    if h[l] < h[r]: l += 1   # move the shorter wall",
                "    else: r -= 1",
                "print(best)",
            ],
            run({ h }, t) {
                let l = 0, r = h.length - 1, best = 0, bl = null, br = null;
                const draw = (tones = {}) => {
                    const water = h.map(() => 0);
                    const lvl = Math.min(h[l], h[r]);
                    for (let k = l + 1; k < r; k++) water[k] = Math.max(0, lvl - h[k]);
                    return [
                        array("h", h, {
                            bars: true,
                            water,
                            pointers: { l, r },
                            window: [l, r],
                            tones: { ...(bl != null ? { [bl]: "found", [br]: "found" } : {}), [l]: "active", [r]: "active", ...tones },
                        }),
                        value("best", "most water", best, { tone: best ? "found" : null }),
                    ];
                };
                t.step(1, "Start with the widest container. Width only shrinks from here, so only a taller short wall can help.", draw(), { l, r, best });
                while (l < r) {
                    const area = Math.min(h[l], h[r]) * (r - l);
                    if (area > best) {
                        best = area;
                        bl = l;
                        br = r;
                        t.step(3, `min(${h[l]}, ${h[r]}) × ${r - l} = ${area} — a new best.`, draw(), { l, r, area, best });
                    } else {
                        t.step(3, `min(${h[l]}, ${h[r]}) × ${r - l} = ${area}; best stays ${best}.`, draw(), { l, r, area, best });
                    }
                    if (h[l] < h[r]) {
                        t.step(4, `Left wall ${h[l]} is shorter — moving it is the only way to improve.`, draw({ [l]: "bad" }), { l, r, best });
                        l++;
                    } else {
                        t.step(5, `Right wall ${h[r]} is ${h[r] === h[l] ? "as short" : "shorter"} — move it inward.`, draw({ [r]: "bad" }), { l, r, best });
                        r--;
                    }
                }
                l = bl ?? 0;
                r = br ?? h.length - 1;
                t.step(6, `The best container holds ${best} (walls at ${l} and ${r}).`, draw(), { best });
                t.result(String(best));
            },
        },
    ],
};

export const trappingRainWater = {
    id: "trapping-rain-water",
    titles: ["Trapping Rain Water"],
    sample: "0 1 0 2 1 0 1 3 2 1 2 1",
    parse: (input) => ({ h: firstLine(input) }),
    approaches: [
        {
            key: "two-pointers",
            label: "Two pointers",
            complexity: { time: "O(n)", space: "O(1)" },
            code: [
                "l, r = 0, n - 1; lmax = rmax = water = 0",
                "while l < r:",
                "    if h[l] < h[r]:",
                "        lmax = max(lmax, h[l]); water += lmax - h[l]; l += 1",
                "    else:",
                "        rmax = max(rmax, h[r]); water += rmax - h[r]; r -= 1",
                "print(water)",
            ],
            run({ h }, t) {
                const n = h.length;
                const water = new Array(n).fill(0);
                let l = 0, r = n - 1, lmax = 0, rmax = 0, total = 0;
                const draw = (tones = {}) => [
                    array("h", h, { bars: true, water: [...water], pointers: { l, r }, tones }),
                    value("total", "water trapped", total, { tone: total ? "found" : null }),
                ];
                t.step(1, "Water above a bar = min(tallest wall on its left, tallest on its right) − its height. Work inward from the side with the shorter wall — that side's max is the limit.", draw(), { lmax, rmax, water: total });
                while (l < r) {
                    if (h[l] < h[r]) {
                        lmax = Math.max(lmax, h[l]);
                        const add = lmax - h[l];
                        water[l] = add;
                        total += add;
                        t.step(4, add ? `h[${l}] = ${h[l]} sits below lmax ${lmax}: it holds ${add}. Total ${total}.` : `h[${l}] = ${h[l]} is the new left max — no water on top.`, draw({ [l]: add ? "compare" : "active" }), { l, r, lmax, rmax, water: total });
                        l++;
                    } else {
                        rmax = Math.max(rmax, h[r]);
                        const add = rmax - h[r];
                        water[r] = add;
                        total += add;
                        t.step(6, add ? `h[${r}] = ${h[r]} sits below rmax ${rmax}: it holds ${add}. Total ${total}.` : `h[${r}] = ${h[r]} is the new right max — no water on top.`, draw({ [r]: add ? "compare" : "active" }), { l, r, lmax, rmax, water: total });
                        r--;
                    }
                }
                t.step(7, `${total} unit${total === 1 ? "" : "s"} of water trapped.`, draw(), { water: total });
                t.result(String(total));
            },
        },
    ],
};

export const threeSum = {
    id: "three-sum",
    titles: ["3Sum"],
    sample: "-1 0 1 2 -1 -4",
    parse: (input) => ({ arr: firstLine(input, { min: 0, max: 12 }) }),
    approaches: [
        {
            key: "sort-two-pointers",
            label: "Sort + two pointers",
            complexity: { time: "O(n²)", space: "O(1) extra" },
            code: [
                "nums.sort()",
                "for i in range(n - 2):",
                "    if i > 0 and nums[i] == nums[i - 1]: continue",
                "    l, r = i + 1, n - 1",
                "    while l < r:",
                "        s = nums[i] + nums[l] + nums[r]",
                "        if s < 0: l += 1",
                "        elif s > 0: r -= 1",
                "        else: record; skip dups; l += 1; r -= 1",
            ],
            run({ arr }, t) {
                const items = tracked(arr);
                const found = [];
                const draw = (p = {}, tones = {}) => [
                    array("nums", items, { pointers: p, tones }),
                    array("found", found.map((x) => x.join(", ")), { label: "triplets", hideIndex: true }),
                ];
                t.step(1, "Sort first so equal values sit together and two pointers can steer the sum.", draw(), {});
                items.sort((a, b) => a.v - b.v);
                const a = items.map((x) => x.v);
                const n = a.length;
                t.step(1, `Sorted: ${a.join(" ")}.`, draw(), {});
                for (let i = 0; i < n - 2; i++) {
                    if (i > 0 && a[i] === a[i - 1]) {
                        t.step(3, `nums[${i}] = ${a[i]} repeats the previous anchor — skip it to avoid duplicate triplets.`, draw({ i }, { [i]: "dim" }), { i });
                        continue;
                    }
                    let l = i + 1, r = n - 1;
                    t.step(4, `Fix nums[${i}] = ${a[i]}. Look for two values after it that sum to ${-a[i]}.`, draw({ i, l, r }, { [i]: "active" }), { i, l, r });
                    while (l < r) {
                        const s = a[i] + a[l] + a[r];
                        if (s < 0) {
                            t.step(7, `${a[i]} + ${a[l]} + ${a[r]} = ${s} < 0 — need bigger, move l right.`, draw({ i, l, r }, { [i]: "active", [l]: "compare", [r]: "compare" }), { i, l, r, sum: s });
                            l++;
                        } else if (s > 0) {
                            t.step(8, `${a[i]} + ${a[l]} + ${a[r]} = ${s} > 0 — need smaller, move r left.`, draw({ i, l, r }, { [i]: "active", [l]: "compare", [r]: "compare" }), { i, l, r, sum: s });
                            r--;
                        } else {
                            found.push([a[i], a[l], a[r]]);
                            t.step(9, `${a[i]} + ${a[l]} + ${a[r]} = 0. Record it.`, draw({ i, l, r }, { [i]: "found", [l]: "found", [r]: "found" }), { i, l, r, sum: s });
                            while (l < r && a[l] === a[l + 1]) l++;
                            while (l < r && a[r] === a[r - 1]) r--;
                            l++;
                            r--;
                        }
                    }
                }
                t.step(9, found.length ? `${found.length} unique triplet${found.length === 1 ? "" : "s"}.` : "No triplet sums to 0.", draw(), {});
                t.result(found.length ? found.map((x) => x.join(" ")).join("\n") : "none");
            },
        },
    ],
};

export const mergeIntervals = {
    id: "merge-intervals",
    titles: ["Merge Intervals"],
    sample: "4\n1 3\n2 6\n8 10\n15 18",
    parse(input) {
        const ls = lines(input);
        const first = nums(ls[0]);
        const rows = first.length === 1 ? ls.slice(1, 1 + first[0]) : ls;
        const intervals = rows.map((row) => {
            const [s, e] = nums(row);
            if (s == null || e == null) throw new Error("Each interval needs a start and an end.");
            return [s, e];
        });
        return { intervals: requireLength(intervals, { max: 10, what: "intervals" }) };
    },
    approaches: [
        {
            key: "sort-sweep",
            label: "Sort + sweep",
            complexity: { time: "O(n log n)", space: "O(n)" },
            code: [
                "intervals.sort()",
                "out = [intervals[0]]",
                "for s, e in intervals[1:]:",
                "    if s <= out[-1][1]:",
                "        out[-1][1] = max(out[-1][1], e)   # overlap: extend",
                "    else:",
                "        out.append([s, e])",
                "print each interval",
            ],
            run({ intervals }, t) {
                const items = tracked(intervals.map(([s, e]) => `${s}–${e}`));
                const pairs = new Map(items.map((it, k) => [it.id, intervals[k]]));
                const out = [];
                const draw = (i, tones = {}, outTone) => [
                    array("in", items, { label: "intervals", pointers: { i }, tones }),
                    array("out", out.map(([s, e]) => `${s}–${e}`), { label: "merged", tones: outTone ? { [out.length - 1]: outTone } : {} }),
                ];
                t.step(1, "Sort by start so overlapping intervals end up next to each other.", draw(null), {});
                items.sort((a, b) => pairs.get(a.id)[0] - pairs.get(b.id)[0] || pairs.get(a.id)[1] - pairs.get(b.id)[1]);
                const sorted = items.map((it) => pairs.get(it.id));
                t.step(1, "Sorted by start.", draw(null), {});
                out.push([...sorted[0]]);
                t.step(2, `Start the result with ${sorted[0][0]}–${sorted[0][1]}.`, draw(0, { 0: "done" }, "active"), {});
                const tones = { 0: "done" };
                for (let i = 1; i < sorted.length; i++) {
                    const [s, e] = sorted[i];
                    const last = out[out.length - 1];
                    if (s <= last[1]) {
                        t.step(4, `${s}–${e} starts at ${s} ≤ ${last[1]}, the end of ${last[0]}–${last[1]}. They overlap.`, draw(i, { ...tones, [i]: "compare" }, "compare"), { s, e, end: last[1] });
                        last[1] = Math.max(last[1], e);
                        tones[i] = "done";
                        t.step(5, `Extend the last interval to ${last[0]}–${last[1]}.`, draw(i, tones, "swap"), { s, e, end: last[1] });
                    } else {
                        t.step(6, `${s}–${e} starts after ${last[1]} — no overlap.`, draw(i, { ...tones, [i]: "active" }), { s, e, end: last[1] });
                        out.push([s, e]);
                        tones[i] = "done";
                        t.step(7, `Start a new interval ${s}–${e}.`, draw(i, tones, "active"), { s, e });
                    }
                }
                t.step(8, `${out.length} merged interval${out.length === 1 ? "" : "s"}.`, draw(null, tones), {});
                t.result(out.map(([s, e]) => `${s} ${e}`).join("\n"));
            },
        },
    ],
};
