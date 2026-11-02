import { array, chars, map, tracked, value } from "../structures.js";
import { int, lines, str } from "../parse.js";

/** First line as a string, length-capped. */
function oneString(input, max = 16) {
    const s = str(lines(input)[0] ?? "");
    if (s.length > max) throw new Error(`Use at most ${max} characters so the animation stays readable.`);
    return s;
}

export const reverseString = {
    id: "reverse-string",
    titles: ["Reverse String"],
    sample: "hello",
    parse: (input) => ({ s: oneString(input) }),
    approaches: [
        {
            key: "two-pointers",
            label: "Two pointers",
            complexity: { time: "O(n)", space: "O(n)" },
            code: [
                "chars = list(s)",
                "l, r = 0, len(chars) - 1",
                "while l < r:",
                "    chars[l], chars[r] = chars[r], chars[l]",
                "    l += 1; r -= 1",
                "print(''.join(chars))",
            ],
            run({ s }, t) {
                const items = tracked([...s]);
                const done = {};
                const draw = (l, r, tones = {}) => [array("s", items, { label: "chars", pointers: { l, r }, tones: { ...done, ...tones } })];
                let l = 0, r = items.length - 1;
                t.step(2, "Turn the string into a list of characters and put a pointer at each end.", draw(l, r), { l, r });
                while (l < r) {
                    t.step(3, `l = ${l} < r = ${r}: swap '${items[l].v}' and '${items[r].v}'.`, draw(l, r, { [l]: "compare", [r]: "compare" }), { l, r });
                    [items[l], items[r]] = [items[r], items[l]];
                    t.step(4, `Swapped — '${items[l].v}' is now at ${l}, '${items[r].v}' at ${r}.`, draw(l, r, { [l]: "swap", [r]: "swap" }), { l, r });
                    done[l] = "done";
                    done[r] = "done";
                    l += 1;
                    r -= 1;
                    t.step(5, "Move both pointers inward.", draw(l, r), { l, r });
                }
                if (l === r) done[l] = "done";
                const out = items.map((x) => x.v).join("");
                t.step(6, `The pointers ${l === r ? "met" : "crossed"} — the string is reversed: "${out}".`, draw(null, null), { l, r });
                t.result(out);
            },
        },
    ],
};

export const checkPalindrome = {
    id: "check-palindrome",
    titles: ["Check Palindrome"],
    sample: "madam",
    parse: (input) => ({ s: oneString(input) }),
    approaches: [
        {
            key: "two-pointers",
            label: "Two pointers",
            complexity: { time: "O(n)", space: "O(1)" },
            code: [
                "l, r = 0, len(s) - 1",
                "while l < r:",
                "    if s[l] != s[r]:",
                "        return False",
                "    l += 1; r -= 1",
                "return True",
            ],
            run({ s }, t) {
                const tones = {};
                const draw = (l, r, extra = {}) => [chars("s", s, { label: "s", pointers: { l, r }, tones: { ...tones, ...extra } })];
                let l = 0, r = s.length - 1;
                t.step(1, "A palindrome reads the same both ways, so compare characters from the outside in.", draw(l, r), { l, r });
                while (l < r) {
                    if (s[l] !== s[r]) {
                        t.step(3, `s[${l}] = '${s[l]}' but s[${r}] = '${s[r]}' — they differ.`, draw(l, r, { [l]: "bad", [r]: "bad" }), { l, r });
                        t.step(4, "One mismatch is enough: not a palindrome.", draw(l, r, { [l]: "bad", [r]: "bad" }), { l, r });
                        t.result("false");
                        return;
                    }
                    t.step(3, `s[${l}] = s[${r}] = '${s[l]}' — they match.`, draw(l, r, { [l]: "found", [r]: "found" }), { l, r });
                    tones[l] = "done";
                    tones[r] = "done";
                    l += 1;
                    r -= 1;
                    t.step(5, "Move both pointers inward.", draw(l, r), { l, r });
                }
                if (l === r) tones[l] = "done";
                t.step(6, "Every pair matched — it's a palindrome.", draw(null, null), { l, r });
                t.result("true");
            },
        },
    ],
};

export const countVowels = {
    id: "count-vowels",
    titles: ["Count Vowels"],
    sample: "programming",
    parse: (input) => ({ s: oneString(input) }),
    approaches: [
        {
            key: "scan",
            label: "Single scan",
            complexity: { time: "O(n)", space: "O(1)" },
            code: [
                "count = 0",
                "for ch in s:",
                "    if ch.lower() in 'aeiou':",
                "        count += 1",
                "print(count)",
            ],
            run({ s }, t) {
                const tones = {};
                let count = 0;
                const draw = (i) => [
                    chars("s", s, { label: "s", pointers: { i }, tones }),
                    value("count", "vowels so far", count, { tone: count ? "found" : null }),
                ];
                t.step(1, "Look at each character once and count the ones that are vowels (a, e, i, o, u).", draw(null), { count });
                for (let i = 0; i < s.length; i++) {
                    const ch = s[i];
                    if ("aeiou".includes(ch.toLowerCase())) {
                        count += 1;
                        tones[i] = "found";
                        t.step(4, `'${ch}' is a vowel — count becomes ${count}.`, draw(i), { i, ch, count });
                    } else {
                        tones[i] = "dim";
                        t.step(3, `'${ch}' is not a vowel.`, draw(i), { i, ch, count });
                    }
                }
                t.step(5, `${count} vowel${count === 1 ? "" : "s"} in "${s}".`, draw(null), { count });
                t.result(String(count));
            },
        },
    ],
};

export const firstNonRepeating = {
    id: "first-non-repeating",
    titles: ["First Non-Repeating Character"],
    sample: "swiss",
    parse: (input) => ({ s: oneString(input) }),
    approaches: [
        {
            key: "two-pass",
            label: "Count, then scan",
            complexity: { time: "O(n)", space: "O(k)" },
            code: [
                "count = {}",
                "for ch in s:",
                "    count[ch] = count.get(ch, 0) + 1",
                "for ch in s:",
                "    if count[ch] == 1:",
                "        return ch",
                "return -1",
            ],
            run({ s }, t) {
                const count = new Map();
                const draw = (i, tones = {}, hot) => [
                    chars("s", s, { label: "s", pointers: { i }, tones }),
                    map("count", count, { label: "count", hot }),
                ];
                t.step(1, "First pass: count how often each character appears.", draw(null), {});
                for (let i = 0; i < s.length; i++) {
                    count.set(s[i], (count.get(s[i]) || 0) + 1);
                    t.step(3, `'${s[i]}' → count ${count.get(s[i])}.`, draw(i, { [i]: "active" }, s[i]), { i });
                }
                const tones = {};
                t.step(4, "Second pass: walk the string in order and stop at the first character with count 1.", draw(null), {});
                for (let i = 0; i < s.length; i++) {
                    const c = count.get(s[i]);
                    if (c === 1) {
                        tones[i] = "found";
                        t.step(6, `'${s[i]}' appears exactly once — it's the answer.`, draw(i, tones, s[i]), { i });
                        t.result(s[i]);
                        return;
                    }
                    tones[i] = "dim";
                    t.step(5, `'${s[i]}' appears ${c} times — skip.`, draw(i, tones, s[i]), { i });
                }
                t.step(7, "Every character repeats, so the answer is -1.", draw(null, tones), {});
                t.result("-1");
            },
        },
    ],
};

export const checkAnagram = {
    id: "check-anagram",
    titles: ["Check Anagram", "Valid Anagram"],
    sample: "listen\nsilent",
    parse(input) {
        const [a = "", b = ""] = lines(input).map(str);
        if (a.length > 14 || b.length > 14) throw new Error("Use at most 14 characters per word.");
        return { a, b };
    },
    approaches: [
        {
            key: "counts",
            label: "Character counts",
            complexity: { time: "O(n)", space: "O(k)" },
            code: [
                "if len(a) != len(b): return False",
                "count = {}",
                "for ch in a: count[ch] = count.get(ch, 0) + 1",
                "for ch in b: count[ch] = count.get(ch, 0) - 1",
                "return all(v == 0 for v in count.values())",
            ],
            run({ a, b }, t) {
                const count = new Map();
                const draw = (i, j, ta = {}, tb = {}, hot, tones) => [
                    chars("a", a, { label: "a", pointers: { i }, tones: ta }),
                    chars("b", b, { label: "b", pointers: { j }, tones: tb }),
                    map("count", count, { label: "count (a adds, b subtracts)", hot, tones }),
                ];
                if (a.length !== b.length) {
                    t.step(1, `Lengths differ (${a.length} vs ${b.length}) — they can't be anagrams.`, draw(null, null), {});
                    t.result("false");
                    return;
                }
                t.step(1, `Both have ${a.length} characters. Anagrams use exactly the same letters, so compare letter counts.`, draw(null, null), {});
                const ta = {}, tb = {};
                for (let i = 0; i < a.length; i++) {
                    count.set(a[i], (count.get(a[i]) || 0) + 1);
                    ta[i] = "done";
                    t.step(3, `'${a[i]}' from a: +1 → ${count.get(a[i])}.`, draw(i, null, { ...ta, [i]: "active" }, tb, a[i]), {});
                }
                for (let j = 0; j < b.length; j++) {
                    count.set(b[j], (count.get(b[j]) || 0) - 1);
                    tb[j] = "done";
                    const v = count.get(b[j]);
                    t.step(4, `'${b[j]}' from b: −1 → ${v}.`, draw(null, j, ta, { ...tb, [j]: v < 0 ? "bad" : "active" }, b[j], v < 0 ? { [b[j]]: "bad" } : undefined), {});
                }
                const bad = [...count.entries()].filter(([, v]) => v !== 0);
                const tones = Object.fromEntries([...count.keys()].map((k) => [k, count.get(k) === 0 ? "found" : "bad"]));
                t.step(
                    5,
                    bad.length ? `'${bad[0][0]}' is off by ${bad[0][1]} — not an anagram.` : "Every count is back to 0 — same letters, so it's an anagram.",
                    draw(null, null, ta, tb, null, tones),
                    {},
                );
                t.result(String(bad.length === 0));
            },
        },
    ],
};

export const longestCommonPrefix = {
    id: "longest-common-prefix",
    titles: ["Longest Common Prefix"],
    sample: "3\nflower\nflow\nflight",
    parse(input) {
        const ls = lines(input);
        let words = ls;
        if (ls.length && /^\d+$/.test(ls[0])) words = ls.slice(1, 1 + Number(ls[0]));
        words = words.map(str);
        if (!words.length) throw new Error("Give n, then n strings.");
        if (words.length > 6 || words.some((w) => w.length > 14)) throw new Error("Use at most 6 strings of at most 14 characters.");
        return { words };
    },
    approaches: [
        {
            key: "vertical",
            label: "Vertical scan",
            complexity: { time: "O(n·m)", space: "O(1)" },
            code: [
                "for i, ch in enumerate(words[0]):",
                "    for w in words[1:]:",
                "        if i == len(w) or w[i] != ch:",
                "            return words[0][:i]",
                "return words[0]",
            ],
            run({ words }, t) {
                const draw = (i, tones = []) => [
                    ...words.map((w, k) => chars(`w${k}`, w, { label: `words[${k}]`, pointers: i == null ? {} : { i }, tones: tones[k] || {} })),
                    value("prefix", "common prefix", `"${words[0].slice(0, i ?? 0)}"`, { tone: "found" }),
                ];
                const settled = (i) => words.map(() => Object.fromEntries(Array.from({ length: i }, (_, k) => [k, "done"])));
                t.step(1, "Compare column by column: character i of the first word against character i of every other word.", draw(0), {});
                const first = words[0];
                for (let i = 0; i < first.length; i++) {
                    const ch = first[i];
                    t.step(1, `Column ${i}: the first word has '${ch}'.`, draw(i, settled(i).map((x, k) => (k === 0 ? { ...x, [i]: "active" } : x))), { i, ch });
                    for (let k = 1; k < words.length; k++) {
                        const w = words[k];
                        const tones = settled(i);
                        tones[0][i] = "active";
                        if (i === w.length || w[i] !== ch) {
                            tones[k][i] = "bad";
                            t.step(3, i === w.length ? `"${w}" has no character at ${i}.` : `"${w}" has '${w[i]}' at ${i}, not '${ch}'.`, draw(i, tones), { i, ch });
                            const ans = first.slice(0, i);
                            t.step(4, ans ? `Stop — the common prefix is "${ans}".` : "Stop — there is no common prefix.", draw(i, settled(i)), { i });
                            t.result(ans);
                            return;
                        }
                        tones[k][i] = "found";
                        t.step(2, `"${w}" also has '${ch}' at ${i}.`, draw(i, tones), { i, ch });
                    }
                }
                t.step(5, `The whole first word "${first}" is a prefix of every word.`, draw(first.length, settled(first.length)), {});
                t.result(first);
            },
        },
    ],
};

export const removeDuplicateCharacters = {
    id: "remove-duplicate-characters",
    titles: ["Remove Duplicate Characters"],
    sample: "programming",
    parse: (input) => ({ s: oneString(input) }),
    approaches: [
        {
            key: "seen-set",
            label: "Seen set",
            complexity: { time: "O(n)", space: "O(k)" },
            code: [
                "seen, out = set(), []",
                "for ch in s:",
                "    if ch not in seen:",
                "        seen.add(ch)",
                "        out.append(ch)",
                "print(''.join(out))",
            ],
            run({ s }, t) {
                const seen = new Set();
                const out = [];
                const tones = {};
                const draw = (i, hot) => [
                    chars("s", s, { label: "s", pointers: { i }, tones }),
                    map("seen", [...seen].map((c) => [c, true]), { label: "seen", set: true, hot }),
                    chars("out", out.join(""), { label: "out", hideIndex: true }),
                ];
                t.step(1, "Keep the first appearance of every character; skip any character we've already seen.", draw(null), {});
                for (let i = 0; i < s.length; i++) {
                    const ch = s[i];
                    if (seen.has(ch)) {
                        tones[i] = "dim";
                        t.step(3, `'${ch}' is already in seen — drop it.`, draw(i, ch), { i, ch });
                        continue;
                    }
                    seen.add(ch);
                    out.push(ch);
                    tones[i] = "found";
                    t.step(5, `'${ch}' is new — add it to seen and to the output.`, draw(i, ch), { i, ch });
                }
                t.step(6, `Result: "${out.join("")}".`, draw(null), {});
                t.result(out.join(""));
            },
        },
    ],
};

export const stringCompression = {
    id: "string-compression",
    titles: ["String Compression"],
    sample: "aabcccccaaa",
    parse: (input) => ({ s: oneString(input) }),
    approaches: [
        {
            key: "groups",
            label: "Count runs",
            complexity: { time: "O(n)", space: "O(n)" },
            code: [
                "out, i = [], 0",
                "while i < len(s):",
                "    j = i",
                "    while j < len(s) and s[j] == s[i]: j += 1",
                "    out.append(s[i] + str(j - i))",
                "    i = j",
                "print(''.join(out))",
            ],
            run({ s }, t) {
                let out = "";
                const tones = {};
                const draw = (i, j, extra = {}) => [
                    chars("s", s, { label: "s", pointers: { i, j }, window: i == null ? null : [i, Math.max(i, (j ?? i) - 1)], tones: { ...tones, ...extra } }),
                    value("out", "compressed", out ? `"${out}"` : '""', { tone: out ? "found" : null }),
                ];
                t.step(1, "Walk the string run by run: each run of the same character becomes that character plus its length.", draw(null, null), {});
                let i = 0;
                while (i < s.length) {
                    let j = i;
                    t.step(3, `A new run starts at ${i} with '${s[i]}'.`, draw(i, j), { i, j });
                    while (j < s.length && s[j] === s[i]) j += 1;
                    t.step(4, `It continues while the character is '${s[i]}': the run is ${i}…${j - 1}, length ${j - i}.`, draw(i, j, Object.fromEntries(Array.from({ length: j - i }, (_, k) => [i + k, "active"]))), { i, j });
                    out += s[i] + (j - i);
                    for (let k = i; k < j; k++) tones[k] = "done";
                    t.step(5, `Append "${s[i]}${j - i}".`, draw(i, j), { i, j });
                    i = j;
                }
                t.step(7, `Compressed: "${out}".`, draw(null, null), {});
                t.result(out);
            },
        },
    ],
};

export const longestPalindromicSubstring = {
    id: "longest-palindromic-substring",
    titles: ["Longest Palindromic Substring"],
    sample: "babad",
    parse: (input) => ({ s: oneString(input, 12) }),
    approaches: [
        {
            key: "expand",
            label: "Expand around center",
            complexity: { time: "O(n²)", space: "O(1)" },
            code: [
                "best = ''",
                "for c in range(len(s)):",
                "    for l, r in ((c, c), (c, c + 1)):   # odd, even",
                "        while l >= 0 and r < len(s) and s[l] == s[r]:",
                "            l -= 1; r += 1",
                "        if r - l - 1 > len(best): best = s[l+1:r]",
                "print(best)",
            ],
            run({ s }, t) {
                let best = "", bestL = 0;
                const bestTones = () => Object.fromEntries(Array.from({ length: best.length }, (_, k) => [bestL + k, "done"]));
                const draw = (l, r, extra = {}) => [
                    chars("s", s, { label: "s", pointers: { l, r }, window: l != null && r - l - 1 > 0 ? [l + 1, r - 1] : null, tones: { ...bestTones(), ...extra } }),
                    value("best", "longest palindrome so far", best ? `"${best}"` : '""', { tone: best ? "found" : null }),
                ];
                t.step(1, "Every palindrome mirrors around a center — a character (odd length) or a gap between two (even length). Grow outward from each one.", draw(null, null), {});
                for (let c = 0; c < s.length; c++) {
                    for (const [l0, r0] of [[c, c], [c, c + 1]]) {
                        if (r0 >= s.length) continue;
                        let l = l0, r = r0;
                        t.step(3, l0 === r0 ? `Odd center at ${c} ('${s[c]}').` : `Even center between ${c} and ${c + 1}.`, draw(l, r, { [l]: "compare", [r]: "compare" }), { c, l, r });
                        while (l >= 0 && r < s.length && s[l] === s[r]) {
                            const len = r - l + 1;
                            l -= 1;
                            r += 1;
                            t.step(5, `s[${l + 1}] = s[${r - 1}] = '${s[l + 1]}' — "${s.slice(l + 1, r)}" (length ${len}) is a palindrome. Expand.`, draw(l, r, Object.fromEntries(Array.from({ length: len }, (_, k) => [l + 1 + k, "active"]))), { c, l, r });
                        }
                        const len = r - l - 1;
                        if (len > best.length) {
                            best = s.slice(l + 1, r);
                            bestL = l + 1;
                            t.step(6, `Can't grow further. "${best}" (length ${len}) is the new best.`, draw(l, r, Object.fromEntries(Array.from({ length: len }, (_, k) => [l + 1 + k, "found"]))), { c, best: best.length });
                        } else {
                            t.step(6, len > 0 ? `Stopped at length ${len}, not longer than "${best}".` : `'${s[l0]}' ≠ '${s[r0]}' — no even palindrome here.`, draw(l, r), { c, best: best.length });
                        }
                    }
                }
                t.step(7, best ? `The longest palindromic substring is "${best}".` : "Empty string.", draw(null, null, Object.fromEntries(Array.from({ length: best.length }, (_, k) => [bestL + k, "found"]))), {});
                t.result(best);
            },
        },
    ],
};

export const palindromeNumber = {
    id: "palindrome-number",
    titles: ["Palindrome Number"],
    sample: "121",
    parse(input) {
        const x = int(lines(input)[0]);
        if (String(Math.abs(x)).length > 12) throw new Error("Use a number with at most 12 digits.");
        return { x };
    },
    approaches: [
        {
            key: "reverse-half",
            label: "Reverse half the digits",
            complexity: { time: "O(log x)", space: "O(1)" },
            code: [
                "if x < 0 or (x % 10 == 0 and x != 0): return False",
                "rev = 0",
                "while x > rev:",
                "    rev = rev * 10 + x % 10",
                "    x //= 10",
                "return x == rev or x == rev // 10",
            ],
            run({ x }, t) {
                const digits = String(x);
                const tones = {};
                let rev = 0;
                let n = x;
                let moved = 0;
                const draw = (extra = {}) => [
                    chars("digits", digits, { label: "digits", tones: { ...tones, ...extra } }),
                    value("x", "x (front half)", n),
                    value("rev", "rev (back half, reversed)", rev, { tone: "compare" }),
                ];
                if (x < 0 || (x % 10 === 0 && x !== 0)) {
                    t.step(1, x < 0 ? `${x} is negative — the '-' has no mirror, so it can't be a palindrome.` : `${x} ends in 0 but doesn't start with 0 — not a palindrome.`, draw({ [digits.length - 1]: "bad" }), { x });
                    t.result("false");
                    return;
                }
                t.step(2, "Peel digits off the end of x and build them into rev. Stop at the middle — then compare the two halves.", draw(), { x: n, rev });
                while (n > rev) {
                    const d = n % 10;
                    const at = digits.length - 1 - moved;
                    tones[at] = "compare";
                    rev = rev * 10 + d;
                    t.step(4, `Take the last digit ${d}: rev = ${rev}.`, draw({ [at]: "active" }), { x: n, rev, digit: d });
                    n = Math.floor(n / 10);
                    moved += 1;
                    t.step(5, `Drop it from x: x = ${n}.`, draw(), { x: n, rev });
                }
                const ok = n === rev || n === Math.floor(rev / 10);
                const msg = ok
                    ? n === rev
                        ? `x = rev = ${n} — both halves match. Palindrome.`
                        : `x = ${n} and rev // 10 = ${Math.floor(rev / 10)} (the middle digit is ignored) — palindrome.`
                    : `x = ${n} vs rev = ${rev} — the halves differ. Not a palindrome.`;
                const final = Object.fromEntries([...digits].map((_, k) => [k, ok ? "found" : "bad"]));
                t.step(6, msg, draw(final), { x: n, rev });
                t.result(String(ok));
            },
        },
    ],
};

export const fizzBuzz = {
    id: "fizzbuzz",
    titles: ["FizzBuzz", "Fizz Buzz"],
    sample: "15",
    parse(input) {
        const n = int(lines(input)[0]);
        if (n < 1 || n > 20) throw new Error("Pick n between 1 and 20.");
        return { n };
    },
    approaches: [
        {
            key: "modulo",
            label: "Modulo checks",
            complexity: { time: "O(n)", space: "O(1)" },
            code: [
                "for i in range(1, n + 1):",
                "    if i % 15 == 0: print('FizzBuzz')",
                "    elif i % 3 == 0: print('Fizz')",
                "    elif i % 5 == 0: print('Buzz')",
                "    else: print(i)",
            ],
            run({ n }, t) {
                const out = [];
                const tones = {};
                const draw = () => [array("out", out, { label: "output", indexLabels: out.map((_, k) => String(k + 1)), tones })];
                t.step(1, "For each number: divisible by 15 → FizzBuzz, by 3 → Fizz, by 5 → Buzz, otherwise the number itself. Check 15 first.", draw(), {});
                for (let i = 1; i <= n; i++) {
                    let line, word, msg;
                    if (i % 15 === 0) { line = 2; word = "FizzBuzz"; msg = `${i} is divisible by both 3 and 5 → FizzBuzz.`; }
                    else if (i % 3 === 0) { line = 3; word = "Fizz"; msg = `${i} is divisible by 3 → Fizz.`; }
                    else if (i % 5 === 0) { line = 4; word = "Buzz"; msg = `${i} is divisible by 5 → Buzz.`; }
                    else { line = 5; word = String(i); msg = `${i} isn't divisible by 3 or 5 — print it.`; }
                    out.push(word);
                    for (const k of Object.keys(tones)) if (tones[k] === "active") tones[k] = "done";
                    tones[i - 1] = word === String(i) ? "active" : "found";
                    t.step(line, msg, draw(), { i, "i % 3": i % 3, "i % 5": i % 5 });
                }
                t.step(1, `Printed ${n} lines.`, draw(), {});
                t.result(out.join("\n"));
            },
        },
    ],
};
