import { array, map, value } from "../structures.js";
import { int, lines, nums, requireLength, str } from "../parse.js";

const numsLine = (line) => requireLength(nums(line));

export const frequencyOfElements = {
    id: "frequency-of-elements",
    titles: ["Frequency of Elements"],
    sample: "1 2 2 3 3 3",
    parse: (input) => ({ arr: numsLine(lines(input)[0]) }),
    approaches: [
        {
            key: "hash-map",
            label: "Hash map counts",
            complexity: { time: "O(n log n)", space: "O(k)" },
            code: [
                "freq = {}",
                "for x in nums:",
                "    freq[x] = freq.get(x, 0) + 1",
                "for k in sorted(freq):",
                "    print(f'{k}:{freq[k]}', end=' ')",
            ],
            run({ arr }, t) {
                const freq = new Map();
                const draw = (i, hot, tones) => [
                    array("nums", arr, { label: "nums", pointers: { i }, tones: i == null ? {} : { [i]: "active" } }),
                    map("freq", freq, { label: "freq (value → count)", hot, tones }),
                ];
                t.step(1, "Count each value with a hash map: one pass, constant time per update.", draw(null), {});
                for (let i = 0; i < arr.length; i++) {
                    const x = arr[i];
                    freq.set(x, (freq.get(x) || 0) + 1);
                    t.step(3, freq.get(x) === 1 ? `${x} is new — freq[${x}] = 1.` : `${x} again — freq[${x}] = ${freq.get(x)}.`, draw(i, x), { i, x });
                }
                const keys = [...freq.keys()].sort((a, b) => a - b);
                const sorted = new Map(keys.map((k) => [k, freq.get(k)]));
                freq.clear();
                for (const [k, v] of sorted) freq.set(k, v);
                const out = keys.map((k) => `${k}:${freq.get(k)}`).join(" ");
                t.step(4, `Print the keys in ascending order: ${out}.`, draw(null, null, Object.fromEntries(keys.map((k) => [k, "found"]))), {});
                t.result(out);
            },
        },
    ],
};

export const findFirstDuplicate = {
    id: "find-first-duplicate",
    titles: ["Find First Duplicate"],
    sample: "2 1 3 5 3 2",
    parse: (input) => ({ arr: numsLine(lines(input)[0]) }),
    approaches: [
        {
            key: "seen-set",
            label: "Seen set",
            complexity: { time: "O(n)", space: "O(n)" },
            code: [
                "seen = set()",
                "for x in nums:",
                "    if x in seen:",
                "        return x",
                "    seen.add(x)",
                "return -1",
            ],
            run({ arr }, t) {
                const seen = new Set();
                const tones = {};
                const draw = (i, hot, extra = {}) => [
                    array("nums", arr, { label: "nums", pointers: { i }, tones: { ...tones, ...extra } }),
                    map("seen", [...seen].map((x) => [x, true]), { label: "seen", set: true, hot }),
                ];
                t.step(1, "Scan left to right. The first value we meet a second time is the one whose repeat comes earliest.", draw(null), {});
                for (let i = 0; i < arr.length; i++) {
                    const x = arr[i];
                    if (seen.has(x)) {
                        const first = arr.indexOf(x);
                        t.step(4, `${x} is already in seen (first at index ${first}) — it's the first duplicate.`, draw(i, x, { [i]: "found", [first]: "found" }), { i, x });
                        t.result(String(x));
                        return;
                    }
                    seen.add(x);
                    tones[i] = "done";
                    t.step(5, `${x} is new — add it to seen.`, draw(i, x, { [i]: "active" }), { i, x });
                }
                t.step(6, "No value repeats, so the answer is -1.", draw(null), {});
                t.result("-1");
            },
        },
    ],
};

export const groupAnagrams = {
    id: "group-anagrams",
    titles: ["Group Anagrams"],
    sample: "6\neat\ntea\ntan\nate\nnat\nbat",
    parse(input) {
        const ls = lines(input);
        let words = ls;
        if (ls.length && /^\d+$/.test(ls[0])) words = ls.slice(1, 1 + Number(ls[0]));
        else if (ls.length === 1) words = ls[0].replace(/[[\]",']/g, " ").replace(/^\s*\w+\s*=\s*/, "").trim().split(/\s+/);
        words = words.map(str).filter(Boolean);
        if (!words.length) throw new Error("Give n, then n words.");
        if (words.length > 10 || words.some((w) => w.length > 10)) throw new Error("Use at most 10 words of at most 10 letters.");
        return { words };
    },
    approaches: [
        {
            key: "sorted-key",
            label: "Sorted-letters key",
            complexity: { time: "O(n·k log k)", space: "O(n·k)" },
            code: [
                "groups = {}",
                "for w in words:",
                "    key = ''.join(sorted(w))",
                "    groups.setdefault(key, []).append(w)",
                "out = sorted(sorted(g) for g in groups.values())",
                "print(' | '.join(' '.join(g) for g in out))",
            ],
            run({ words }, t) {
                const groups = new Map();
                const draw = (i, hot, tones) => [
                    array("words", words, { label: "words", pointers: { i }, tones: i == null ? {} : { [i]: "active" } }),
                    map("groups", groups, { label: "groups (sorted letters → words)", hot, tones }),
                ];
                t.step(1, "Anagrams have the same letters, so sorting a word's letters gives the same key for every anagram.", draw(null), {});
                for (let i = 0; i < words.length; i++) {
                    const w = words[i];
                    const key = [...w].sort().join("");
                    t.step(3, `"${w}" sorted is "${key}".`, draw(i, groups.has(key) ? key : null), { w, key });
                    const isNew = !groups.has(key);
                    if (isNew) groups.set(key, []);
                    groups.get(key).push(w);
                    t.step(4, isNew ? `No group "${key}" yet — start one with "${w}".` : `Add "${w}" to group "${key}".`, draw(i, key), { w, key });
                }
                const out = [...groups.values()].map((g) => [...g].sort()).sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));
                const answer = out.map((g) => g.join(" ")).join(" | ");
                t.step(5, `Sort the words in each group, then order groups by their first word.`, draw(null, null, Object.fromEntries([...groups.keys()].map((k) => [k, "found"]))), {});
                t.step(6, `${out.length} group${out.length === 1 ? "" : "s"}: ${answer}.`, [...draw(null, null, Object.fromEntries([...groups.keys()].map((k) => [k, "found"]))), value("out", "output", answer, { tone: "found" })], {});
                t.result(answer);
            },
        },
    ],
};

export const countOccurrences = {
    id: "count-occurrences",
    titles: ["Count Occurrences in Array"],
    sample: "1 2 2 2 3 4\n2",
    parse(input) {
        const [a, b] = lines(input);
        return { arr: numsLine(a), target: int(b) };
    },
    approaches: [
        {
            key: "scan",
            label: "Linear scan",
            complexity: { time: "O(n)", space: "O(1)" },
            code: [
                "count = 0",
                "for x in nums:",
                "    if x == target:",
                "        count += 1",
                "print(count)",
            ],
            run({ arr, target }, t) {
                const tones = {};
                let count = 0;
                const draw = (i) => [
                    array("nums", arr, { label: "nums", pointers: { i }, tones }),
                    value("count", `occurrences of ${target}`, count, { tone: count ? "found" : null }),
                ];
                t.step(1, `Check every element and count the ones equal to ${target}.`, draw(null), { target, count });
                for (let i = 0; i < arr.length; i++) {
                    if (arr[i] === target) {
                        count += 1;
                        tones[i] = "found";
                        t.step(4, `nums[${i}] = ${target} — count becomes ${count}.`, draw(i), { target, i, count });
                    } else {
                        tones[i] = "dim";
                        t.step(3, `nums[${i}] = ${arr[i]} ≠ ${target}.`, draw(i), { target, i, count });
                    }
                }
                t.step(5, `${target} appears ${count} time${count === 1 ? "" : "s"}.`, draw(null), { target, count });
                t.result(String(count));
            },
        },
    ],
};

export const intersectionOfArrays = {
    id: "intersection-of-arrays",
    titles: ["Find Intersection of Arrays", "Intersection of Two Arrays"],
    sample: "1 2 2 3 4\n2 2 4 6",
    parse(input) {
        const [a, b] = lines(input);
        return { a: numsLine(a), b: requireLength(nums(b ?? ""), { min: 0 }) };
    },
    approaches: [
        {
            key: "set",
            label: "Hash set",
            complexity: { time: "O(n + m)", space: "O(n)" },
            code: [
                "in_a = set(a)",
                "common = set()",
                "for x in b:",
                "    if x in in_a:",
                "        common.add(x)",
                "print(*sorted(common) or ['NONE'])",
            ],
            run({ a, b }, t) {
                const inA = new Set();
                const common = new Set();
                const tb = {};
                const draw = (i, j, hotA, hotC) => [
                    array("a", a, { label: "a", pointers: { i }, tones: i == null ? {} : { [i]: "active" } }),
                    array("b", b, { label: "b", pointers: { j }, tones: tb }),
                    map("inA", [...inA].map((x) => [x, true]), { label: "set(a)", set: true, hot: hotA }),
                    map("common", [...common].map((x) => [x, true]), { label: "common", set: true, hot: hotC }),
                ];
                t.step(1, "Put every value of a into a set, then keep the values of b that are in it. Sets also remove duplicates.", draw(null, null), {});
                for (let i = 0; i < a.length; i++) {
                    const had = inA.has(a[i]);
                    inA.add(a[i]);
                    t.step(1, had ? `${a[i]} is already in the set.` : `Add ${a[i]} to set(a).`, draw(i, null, a[i]), { i });
                }
                for (let j = 0; j < b.length; j++) {
                    const x = b[j];
                    if (inA.has(x)) {
                        const dup = common.has(x);
                        common.add(x);
                        tb[j] = dup ? "done" : "found";
                        t.step(5, dup ? `${x} is in a, but it's already in common.` : `${x} is in a — add it to common.`, draw(null, j, x, x), { j, x });
                    } else {
                        tb[j] = "dim";
                        t.step(4, `${x} is not in a.`, draw(null, j, null), { j, x });
                    }
                }
                const out = [...common].sort((p, q) => p - q);
                const answer = out.length ? out.join(" ") : "NONE";
                t.step(6, out.length ? `Sorted intersection: ${answer}.` : "Nothing in common — print NONE.", [...draw(null, null), value("out", "output", answer, { tone: "found" })], {});
                t.result(answer);
            },
        },
    ],
};
