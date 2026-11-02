import { array, chars, map, value } from "../structures.js";
import { int, lines, nums, requireLength, str } from "../parse.js";

const maxLen = (s) => {
    if (s.length > 16) throw new Error("Use at most 16 characters so the animation stays readable.");
    return s;
};

export const fruitIntoBaskets = {
    id: "fruit-into-baskets",
    titles: ["Fruit into Baskets", "Fruit Into Baskets"],
    sample: "fruits = [1,2,3,2,2]",
    parse: (input) => ({ fruits: requireLength(nums(lines(input)[0])) }),
    approaches: [
        {
            key: "window",
            label: "Sliding window (≤ 2 types)",
            complexity: { time: "O(n)", space: "O(1)" },
            code: [
                "count = {}; l = best = 0",
                "for r, f in enumerate(fruits):",
                "    count[f] = count.get(f, 0) + 1",
                "    while len(count) > 2:",
                "        count[fruits[l]] -= 1",
                "        if count[fruits[l]] == 0: del count[fruits[l]]",
                "        l += 1",
                "    best = max(best, r - l + 1)",
                "print(best)",
            ],
            run({ fruits }, t) {
                const count = new Map();
                let l = 0, best = 0;
                const draw = (r, tones = {}, hot) => [
                    array("fruits", fruits, { label: "fruits", pointers: { l, r }, window: r == null ? null : [l, r], tones }),
                    map("count", count, { label: "baskets (type → count)", hot }),
                    value("best", "most fruit so far", best, { tone: best ? "found" : null }),
                ];
                t.step(1, "Find the longest window containing at most 2 fruit types — that's how much two baskets can collect.", draw(null), { l, best });
                for (let r = 0; r < fruits.length; r++) {
                    const f = fruits[r];
                    count.set(f, (count.get(f) || 0) + 1);
                    t.step(3, `Pick fruit ${f} at index ${r}. Baskets now hold ${count.size} type(s).`, draw(r, { [r]: "active" }, f), { l, r, best });
                    while (count.size > 2) {
                        const g = fruits[l];
                        count.set(g, count.get(g) - 1);
                        if (count.get(g) === 0) {
                            count.delete(g);
                            t.step(6, `Too many types — drop fruit ${g} at index ${l}; type ${g} leaves the baskets.`, draw(r, { [l]: "bad" }), { l, r, best });
                        } else {
                            t.step(5, `Too many types — drop fruit ${g} at index ${l}.`, draw(r, { [l]: "bad" }, g), { l, r, best });
                        }
                        l++;
                    }
                    const len = r - l + 1;
                    if (len > best) {
                        best = len;
                        t.step(8, `Window [${l}…${r}] holds ${len} fruits — new best.`, draw(r, { [r]: "found" }), { l, r, best });
                    } else {
                        t.step(8, `Window [${l}…${r}] holds ${len}; best stays ${best}.`, draw(r), { l, r, best });
                    }
                }
                t.step(9, `You can collect at most ${best} fruits.`, draw(null), { best });
                t.result(String(best));
            },
        },
    ],
};

export const longestKDistinct = {
    id: "longest-k-distinct",
    titles: ["Longest Substring with At Most K Distinct Characters"],
    sample: "eceba\n2",
    parse(input) {
        const ls = lines(input);
        const parts = ls.length >= 2 ? ls : ls[0].split(/,\s*/);
        const s = maxLen(str(parts[0] ?? ""));
        const k = int(parts[1]);
        if (k < 0) throw new Error("k must be ≥ 0.");
        return { s, k };
    },
    approaches: [
        {
            key: "window",
            label: "Sliding window",
            complexity: { time: "O(n)", space: "O(k)" },
            code: [
                "count = {}; l = best = 0",
                "for r, ch in enumerate(s):",
                "    count[ch] = count.get(ch, 0) + 1",
                "    while len(count) > k:",
                "        count[s[l]] -= 1",
                "        if count[s[l]] == 0: del count[s[l]]",
                "        l += 1",
                "    best = max(best, r - l + 1)",
                "print(best)",
            ],
            run({ s, k }, t) {
                const count = new Map();
                let l = 0, best = 0;
                const draw = (r, tones = {}, hot) => [
                    chars("s", s, { label: "s", pointers: { l, r }, window: r == null ? null : [l, r], tones }),
                    map("count", count, { label: "char counts in window", hot }),
                    value("best", "longest so far", best, { tone: best ? "found" : null }),
                ];
                t.step(1, `Grow the window to the right; shrink from the left whenever it holds more than ${k} distinct characters.`, draw(null), { k, l, best });
                for (let r = 0; r < s.length; r++) {
                    const ch = s[r];
                    count.set(ch, (count.get(ch) || 0) + 1);
                    t.step(3, `Add '${ch}'. Window has ${count.size} distinct character(s).`, draw(r, { [r]: "active" }, ch), { k, l, r, best });
                    while (count.size > k) {
                        const c = s[l];
                        count.set(c, count.get(c) - 1);
                        if (count.get(c) === 0) {
                            count.delete(c);
                            t.step(6, `More than ${k} distinct — remove '${c}' at index ${l}; it's gone from the window.`, draw(r, { [l]: "bad" }), { k, l, r, best });
                        } else {
                            t.step(5, `More than ${k} distinct — remove '${c}' at index ${l}.`, draw(r, { [l]: "bad" }, c), { k, l, r, best });
                        }
                        l++;
                    }
                    const len = r - l + 1;
                    if (len > best) {
                        best = len;
                        t.step(8, `"${s.slice(l, r + 1)}" has length ${len} — new best.`, draw(r, { [r]: "found" }), { k, l, r, best });
                    } else {
                        t.step(8, `"${s.slice(l, r + 1)}" has length ${len}; best stays ${best}.`, draw(r), { k, l, r, best });
                    }
                }
                t.step(9, `The longest valid substring has length ${best}.`, draw(null), { k, best });
                t.result(String(best));
            },
        },
    ],
};

export const substringsAllThree = {
    id: "substrings-all-three",
    titles: ["Number of Substrings Containing All Three Characters"],
    sample: 's = "abcabc"',
    parse(input) {
        const s = maxLen(str(lines(input)[0] ?? ""));
        if (/[^abc]/.test(s)) throw new Error("The string may only contain a, b and c.");
        return { s };
    },
    approaches: [
        {
            key: "last-seen",
            label: "Last-seen positions",
            complexity: { time: "O(n)", space: "O(1)" },
            code: [
                "last = {'a': -1, 'b': -1, 'c': -1}; total = 0",
                "for r, ch in enumerate(s):",
                "    last[ch] = r",
                "    # substrings ending at r that start at or before min(last)",
                "    total += min(last.values()) + 1",
                "print(total)",
            ],
            run({ s }, t) {
                const last = new Map([["a", -1], ["b", -1], ["c", -1]]);
                let total = 0;
                const draw = (r, lo, tones = {}, hot) => [
                    chars("s", s, { label: "s", pointers: { r }, window: lo == null || lo < 0 ? null : [0, lo], tones }),
                    map("last", last, { label: "last seen index", hot }),
                    value("total", "valid substrings", total, { tone: total ? "found" : null }),
                ];
                t.step(1, "For each end r, a substring is valid if it starts at or before the earliest of the last-seen a, b and c.", draw(null, null), { total });
                for (let r = 0; r < s.length; r++) {
                    const ch = s[r];
                    last.set(ch, r);
                    t.step(3, `'${ch}' last seen at ${r}.`, draw(r, null, { [r]: "active" }, ch), { r, total });
                    const m = Math.min(...last.values());
                    total += m + 1;
                    t.step(5, m < 0 ? `Not all three letters seen yet — no valid substring ends at ${r}.` : `Any start 0…${m} works: +${m + 1} substrings ending at ${r}. Total ${total}.`, draw(r, m, { [r]: "active" }), { r, minLast: m, total });
                }
                t.step(6, `${total} substrings contain all three characters.`, draw(null, null), { total });
                t.result(String(total));
            },
        },
    ],
};

export const niceSubarrays = {
    id: "nice-subarrays",
    titles: ["Count Number of Nice Subarrays"],
    sample: "5 3\n1 1 2 1 1",
    parse(input) {
        const ls = lines(input);
        const [, k] = nums(ls[0]);
        if (k == null) throw new Error("First line is n and k, second line is the array.");
        return { arr: requireLength(nums(ls[1])), k };
    },
    approaches: [
        {
            key: "at-most",
            label: "atMost(k) − atMost(k−1)",
            complexity: { time: "O(n)", space: "O(1)" },
            code: [
                "def at_most(k):",
                "    l = odd = res = 0",
                "    for r, x in enumerate(nums):",
                "        odd += x % 2",
                "        while odd > k: odd -= nums[l] % 2; l += 1",
                "        res += r - l + 1",
                "    return res",
                "print(at_most(k) - at_most(k - 1))",
            ],
            run({ arr, k }, t) {
                const tonesOdd = {};
                arr.forEach((x, i) => { if (Math.abs(x) % 2 === 1) tonesOdd[i] = "compare"; });
                const res = {};
                const atMost = (kk) => {
                    if (kk < 0) return 0;
                    let l = 0, odd = 0, total = 0;
                    const draw = (r, extra = {}) => [
                        array("nums", arr, { label: `nums (odd values blue) — at_most(${kk})`, pointers: { l, r }, window: r == null ? null : [l, r], tones: { ...tonesOdd, ...extra } }),
                        value("res", `at_most(${kk})`, total),
                    ];
                    t.step(2, `Count subarrays with at most ${kk} odd numbers.`, draw(null), { k: kk, total });
                    for (let r = 0; r < arr.length; r++) {
                        odd += Math.abs(arr[r]) % 2;
                        t.step(4, `Add ${arr[r]}${Math.abs(arr[r]) % 2 ? " (odd)" : ""}: window has ${odd} odd.`, draw(r, { [r]: "active" }), { k: kk, odd, total });
                        while (odd > kk) {
                            odd -= Math.abs(arr[l]) % 2;
                            l++;
                            t.step(5, `Too many odds — shrink: l = ${l}, odd = ${odd}.`, draw(r, { [l - 1]: "bad" }), { k: kk, odd, total });
                        }
                        total += r - l + 1;
                        t.step(6, `Every start in [${l}…${r}] works: +${r - l + 1}, total ${total}.`, draw(r), { k: kk, odd, total });
                    }
                    res[kk] = total;
                    return total;
                };
                t.step(8, `"Exactly ${k} odd" = "at most ${k}" minus "at most ${k - 1}".`, [array("nums", arr, { label: "nums (odd values blue)", tones: tonesOdd })], { k });
                const a = atMost(k);
                const b = atMost(k - 1);
                const ans = a - b;
                t.step(8, `${a} − ${b} = ${ans} nice subarrays.`, [array("nums", arr, { label: "nums (odd values blue)", tones: tonesOdd }), value("ans", "nice subarrays", ans, { tone: "found" })], { k, ans });
                t.result(String(ans));
            },
        },
    ],
};
