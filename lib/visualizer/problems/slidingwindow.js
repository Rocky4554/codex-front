import { chars, map, value } from "../structures.js";
import { lines, str } from "../parse.js";

export const longestSubstringNoRepeat = {
    id: "longest-substring-no-repeat",
    titles: ["Longest Substring Without Repeating Characters"],
    sample: "abcabcbb",
    parse(input) {
        const s = str(lines(input)[0] ?? "");
        if (s.length > 16) throw new Error("Use at most 16 characters so the animation stays readable.");
        return { s };
    },
    approaches: [
        {
            key: "window",
            label: "Sliding window",
            complexity: { time: "O(n)", space: "O(k)" },
            code: [
                "last = {}; l = best = 0",
                "for r, ch in enumerate(s):",
                "    if ch in last and last[ch] >= l:",
                "        l = last[ch] + 1      # jump past the repeat",
                "    last[ch] = r",
                "    best = max(best, r - l + 1)",
                "print(best)",
            ],
            run({ s }, t) {
                const last = new Map();
                let l = 0, best = 0, bestL = 0;
                const draw = (r, tones = {}, hot) => [
                    chars("s", s, { label: "s", pointers: { l, r }, window: r == null ? null : [l, r], tones }),
                    map("last", last, { label: "last seen index", hot }),
                    value("best", "longest so far", best ? `${best}  "${s.slice(bestL, bestL + best)}"` : 0, { tone: best ? "found" : null }),
                ];
                t.step(1, "Grow a window [l, r] that never contains a repeated character, remembering where each character was last seen.", draw(null), { l, best });
                for (let r = 0; r < s.length; r++) {
                    const ch = s[r];
                    if (last.has(ch) && last.get(ch) >= l) {
                        const prev = last.get(ch);
                        t.step(3, `'${ch}' is already in the window at index ${prev}.`, draw(r, { [r]: "bad", [prev]: "bad" }, ch), { l, r, best });
                        l = prev + 1;
                        t.step(4, `Shrink: move l past it to ${l}.`, draw(r, { [r]: "active" }, ch), { l, r, best });
                    }
                    last.set(ch, r);
                    const len = r - l + 1;
                    if (len > best) {
                        best = len;
                        bestL = l;
                        t.step(6, `Window "${s.slice(l, r + 1)}" has length ${len} — a new best.`, draw(r, { [r]: "found" }, ch), { l, r, best });
                    } else {
                        t.step(5, `Window "${s.slice(l, r + 1)}" (length ${len}); best stays ${best}.`, draw(r, { [r]: "active" }, ch), { l, r, best });
                    }
                }
                const tones = {};
                for (let k = bestL; k < bestL + best; k++) tones[k] = "found";
                l = bestL;
                t.step(7, best ? `The longest substring without repeats is "${s.slice(bestL, bestL + best)}" (length ${best}).` : "Empty string — length 0.", [chars("s", s, { label: "s", tones, window: best ? [bestL, bestL + best - 1] : null })], { best });
                t.result(String(best));
            },
        },
    ],
};
