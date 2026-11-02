import { array, map, tracked, value } from "../structures.js";
import { int, lines, nums, requireLength } from "../parse.js";

const numsInput = (input) => requireLength(nums(lines(input)[0]));

export const reverseArray = {
    id: "reverse-array",
    titles: ["Reverse an Array"],
    sample: "1 2 3 4 5",
    parse: (input) => ({ arr: numsInput(input) }),
    approaches: [
        {
            key: "two-pointers",
            label: "Two pointers",
            complexity: { time: "O(n)", space: "O(1)" },
            code: [
                "l, r = 0, len(arr) - 1",
                "while l < r:",
                "    arr[l], arr[r] = arr[r], arr[l]",
                "    l += 1; r -= 1",
                "print(*arr)",
            ],
            run({ arr }, t) {
                const items = tracked(arr);
                const done = {};
                const show = (l, r, tones = {}) => [array("arr", items, { pointers: { l, r }, tones: { ...done, ...tones } })];
                let l = 0, r = items.length - 1;
                t.step(1, "Put one pointer at each end. They walk toward each other, swapping as they go.", show(l, r), { l, r });
                while (l < r) {
                    t.step(2, `l = ${l} < r = ${r}, so swap arr[${l}] = ${items[l].v} and arr[${r}] = ${items[r].v}.`, show(l, r, { [l]: "compare", [r]: "compare" }), { l, r });
                    [items[l], items[r]] = [items[r], items[l]];
                    t.step(3, `Swapped — ${items[l].v} is now at the front side, ${items[r].v} at the back.`, show(l, r, { [l]: "swap", [r]: "swap" }), { l, r });
                    done[l] = "done";
                    done[r] = "done";
                    l += 1;
                    r -= 1;
                    t.step(4, "Both ends are final. Move the pointers inward.", show(l, r), { l, r });
                }
                if (l === r) done[l] = "done";
                t.step(5, l === r ? `The pointers met at the middle element ${items[l].v}, which stays put. Done.` : "The pointers crossed — every pair is swapped. Done.", show(null, null), { l, r });
                t.result(items.map((x) => x.v).join(" "));
            },
        },
    ],
};

export const twoSum = {
    id: "two-sum",
    titles: ["Two Sum"],
    sample: "2 7 11 15\n9",
    parse(input) {
        const [a, b] = lines(input);
        return { arr: requireLength(nums(a), { min: 2 }), target: int(b) };
    },
    approaches: [
        {
            key: "hash-map",
            label: "Hash map",
            complexity: { time: "O(n)", space: "O(n)" },
            code: [
                "seen = {}            # value -> index",
                "for i, x in enumerate(nums):",
                "    need = target - x",
                "    if need in seen:",
                "        return seen[need], i",
                "    seen[x] = i",
            ],
            run({ arr, target }, t) {
                const seen = new Map();
                const draw = (i, tones = {}, hot) => [
                    array("nums", arr, { label: "nums", pointers: { i }, tones }),
                    map("seen", seen, { label: "seen (value → index)", hot }),
                ];
                t.step(1, `Walk the array once. For each number, ask: have I already seen the number that completes ${target}?`, draw(null), { target });
                for (let i = 0; i < arr.length; i++) {
                    const x = arr[i];
                    const need = target - x;
                    t.step(3, `i = ${i}, x = ${x}. To reach ${target} we need ${target} − ${x} = ${need}.`, draw(i, { [i]: "active" }), { target, i, x, need });
                    if (seen.has(need)) {
                        const j = seen.get(need);
                        t.step(5, `${need} is in the map at index ${j}. nums[${j}] + nums[${i}] = ${need} + ${x} = ${target}.`, draw(i, { [j]: "found", [i]: "found" }, need), { target, i, x, need });
                        t.result(`${j} ${i}`);
                        return;
                    }
                    t.step(4, `${need} isn't in the map yet.`, draw(i, { [i]: "active" }), { target, i, x, need });
                    seen.set(x, i);
                    t.step(6, `Remember ${x} → ${i} so a later number can pair with it.`, draw(i, { [i]: "done" }, x), { target, i, x, need });
                }
                t.step(6, "No pair adds up to the target.", draw(null));
                t.result("");
            },
        },
        {
            key: "brute",
            label: "Brute force",
            complexity: { time: "O(n²)", space: "O(1)" },
            code: [
                "for i in range(n):",
                "    for j in range(i + 1, n):",
                "        if nums[i] + nums[j] == target:",
                "            return i, j",
            ],
            run({ arr, target }, t) {
                const draw = (i, j, tones) => [array("nums", arr, { label: "nums", pointers: { i, j }, tones })];
                t.step(1, "Try every pair (i, j) with i < j and check its sum.", draw(null, null, {}), { target });
                for (let i = 0; i < arr.length; i++) {
                    for (let j = i + 1; j < arr.length; j++) {
                        const sum = arr[i] + arr[j];
                        if (sum === target) {
                            t.step(4, `${arr[i]} + ${arr[j]} = ${target}. Found it.`, draw(i, j, { [i]: "found", [j]: "found" }), { target, i, j, sum });
                            t.result(`${i} ${j}`);
                            return;
                        }
                        t.step(3, `${arr[i]} + ${arr[j]} = ${sum} ≠ ${target}.`, draw(i, j, { [i]: "active", [j]: "compare" }), { target, i, j, sum });
                    }
                }
                t.result("");
            },
        },
    ],
};

export const moveZeros = {
    id: "move-zeros",
    titles: ["Move All Zeros to End", "Move Zeroes"],
    sample: "0 1 0 3 12",
    parse: (input) => ({ arr: numsInput(input) }),
    approaches: [
        {
            key: "two-pointers",
            label: "Two pointers",
            complexity: { time: "O(n)", space: "O(1)" },
            code: [
                "write = 0",
                "for read in range(len(arr)):",
                "    if arr[read] != 0:",
                "        arr[write], arr[read] = arr[read], arr[write]",
                "        write += 1",
                "print(*arr)",
            ],
            run({ arr }, t) {
                const items = tracked(arr);
                const done = {};
                const draw = (read, write, tones = {}) => [array("arr", items, { pointers: { write, read }, tones: { ...done, ...tones } })];
                let write = 0;
                t.step(1, "`write` marks where the next non-zero belongs. `read` scans every element.", draw(0, 0), { write });
                for (let read = 0; read < items.length; read++) {
                    const v = items[read].v;
                    if (v !== 0) {
                        t.step(3, `arr[${read}] = ${v} is non-zero — it belongs at position ${write}.`, draw(read, write, { [read]: "active" }), { read, write });
                        [items[write], items[read]] = [items[read], items[write]];
                        done[write] = "done";
                        t.step(4, read === write ? `It's already in place.` : `Swap it into position ${write}; the zero moves back to ${read}.`, draw(read, write, { [write]: "swap", [read]: read === write ? "swap" : undefined }), { read, write });
                        write += 1;
                        t.step(5, `Advance write to ${write}.`, draw(read, write), { read, write });
                    } else {
                        t.step(3, `arr[${read}] is 0 — skip it; it will end up behind the non-zeros.`, draw(read, write, { [read]: "dim" }), { read, write });
                    }
                }
                t.step(6, "All non-zeros kept their order at the front; the zeros collected at the end.", draw(null, null), { write });
                t.result(items.map((x) => x.v).join(" "));
            },
        },
    ],
};

export const maxSubarray = {
    id: "max-subarray",
    titles: ["Maximum Subarray"],
    sample: "-2 1 -3 4 -1 2 1 -5 4",
    parse: (input) => ({ arr: numsInput(input) }),
    approaches: [
        {
            key: "kadane",
            label: "Kadane's algorithm",
            complexity: { time: "O(n)", space: "O(1)" },
            code: [
                "cur = best = nums[0]",
                "for x in nums[1:]:",
                "    cur = max(x, cur + x)   # extend or restart",
                "    best = max(best, cur)",
                "print(best)",
            ],
            run({ arr }, t) {
                let cur = arr[0], best = arr[0], start = 0, bestL = 0, bestR = 0;
                const draw = (i, extra = {}) => [
                    array("nums", arr, { label: "nums", pointers: { i }, window: [start, i ?? start], tones: { ...extra } }),
                    value("best", `best sum = ${best} (indices ${bestL}…${bestR})`, `[${arr.slice(bestL, bestR + 1).join(", ")}]`, { tone: "found" }),
                ];
                t.step(1, `Start with the first element: cur = best = ${cur}.`, draw(0, { 0: "active" }), { cur, best });
                for (let i = 1; i < arr.length; i++) {
                    const x = arr[i];
                    if (cur + x < x) {
                        t.step(3, `cur + ${x} = ${cur + x} is worse than starting fresh at ${x}. Restart the window here.`, draw(i, { [i]: "bad" }), { cur, x, best });
                        cur = x;
                        start = i;
                    } else {
                        t.step(3, `Extending helps: cur = ${cur} + ${x} = ${cur + x}.`, draw(i, { [i]: "active" }), { cur, x, best });
                        cur += x;
                    }
                    if (cur > best) {
                        best = cur;
                        bestL = start;
                        bestR = i;
                        t.step(4, `New best: ${best}.`, draw(i, { [i]: "found" }), { cur, x, best });
                    } else {
                        t.step(4, `cur = ${cur} doesn't beat best = ${best}.`, draw(i), { cur, x, best });
                    }
                }
                const tones = {};
                for (let k = bestL; k <= bestR; k++) tones[k] = "found";
                start = bestL;
                t.step(5, `The best subarray is indices ${bestL}…${bestR} with sum ${best}.`, [array("nums", arr, { label: "nums", tones, window: [bestL, bestR] })], { best });
                t.result(String(best));
            },
        },
    ],
};
