import { array, tracked } from "../structures.js";
import { lines, nums, requireLength } from "../parse.js";

const parseArr = (input) => ({ arr: requireLength(nums(lines(input)[0]), { max: 12 }) });
const out = (items) => items.map((x) => x.v).join(" ");

export const selectionSort = {
    id: "selection-sort",
    titles: ["Selection Sort"],
    sample: "64 25 12 22 11",
    parse: parseArr,
    approaches: [
        {
            key: "selection",
            label: "Selection sort",
            complexity: { time: "O(n²)", space: "O(1)" },
            code: [
                "for i in range(n - 1):",
                "    m = i",
                "    for j in range(i + 1, n):",
                "        if arr[j] < arr[m]: m = j",
                "    arr[i], arr[m] = arr[m], arr[i]",
                "print(*arr)",
            ],
            run({ arr }, t) {
                const items = tracked(arr);
                const n = items.length;
                const done = {};
                const draw = (p, tones = {}) => [array("arr", items, { bars: true, pointers: p, tones: { ...done, ...tones } })];
                t.step(1, "Each pass finds the smallest value in the unsorted part and swaps it to the front of that part.", draw({}));
                for (let i = 0; i < n - 1; i++) {
                    let m = i;
                    t.step(2, `Pass ${i + 1}: assume arr[${i}] = ${items[i].v} is the smallest so far.`, draw({ i, min: m }, { [m]: "found" }), { i, min: items[m].v });
                    for (let j = i + 1; j < n; j++) {
                        if (items[j].v < items[m].v) {
                            const old = items[m].v;
                            m = j;
                            t.step(4, `${items[j].v} < ${old} — new minimum at index ${j}.`, draw({ i, j, min: m }, { [m]: "found" }), { i, j, min: items[m].v });
                        } else {
                            t.step(4, `${items[j].v} ≥ ${items[m].v} — minimum unchanged.`, draw({ i, j, min: m }, { [j]: "compare", [m]: "found" }), { i, j, min: items[m].v });
                        }
                    }
                    if (m !== i) {
                        t.step(5, `Swap the minimum ${items[m].v} into position ${i}.`, draw({ i, min: m }, { [i]: "swap", [m]: "swap" }), { i, min: items[m].v });
                        [items[i], items[m]] = [items[m], items[i]];
                    }
                    done[i] = "done";
                    t.step(5, `${items[i].v} is in its final place.`, draw({ i }), { i });
                }
                done[n - 1] = "done";
                t.step(6, "The last element is automatically in place. Sorted.", draw({}));
                t.result(out(items));
            },
        },
    ],
};

export const mergeSort = {
    id: "merge-sort",
    titles: ["Merge Sort"],
    sample: "38 27 43 3 9 82 10",
    parse: parseArr,
    approaches: [
        {
            key: "merge",
            label: "Top-down merge sort",
            complexity: { time: "O(n log n)", space: "O(n)" },
            code: [
                "def sort(lo, hi):",
                "    if hi - lo <= 1: return",
                "    mid = (lo + hi) // 2",
                "    sort(lo, mid); sort(mid, hi)",
                "    merged = merge(arr[lo:mid], arr[mid:hi])",
                "    arr[lo:hi] = merged",
            ],
            run({ arr }, t) {
                const items = tracked(arr);
                const n = items.length;
                let merged = [];
                const draw = (lo, hi, tones = {}, p = {}) => [
                    array("arr", items, { bars: true, window: lo == null ? null : [lo, hi - 1], tones, pointers: p }),
                    merged.length ? array("merged", merged, { label: "merged run", hideIndex: true }) : null,
                ];
                t.step(1, "Split the array in half until pieces have one element, then merge sorted halves back together.", draw(null));
                const sort = (lo, hi) => {
                    if (hi - lo <= 1) return;
                    const mid = (lo + hi) >> 1;
                    t.step(3, `Split [${lo}…${hi - 1}] into [${lo}…${mid - 1}] and [${mid}…${hi - 1}].`, draw(lo, hi), { lo, mid, hi });
                    sort(lo, mid);
                    sort(mid, hi);
                    let i = lo, j = mid;
                    merged = [];
                    const left = {};
                    for (let k = lo; k < mid; k++) left[k] = "active";
                    for (let k = mid; k < hi; k++) left[k] = "compare";
                    t.step(5, `Merge sorted halves [${items.slice(lo, mid).map((x) => x.v).join(", ")}] and [${items.slice(mid, hi).map((x) => x.v).join(", ")}].`, draw(lo, hi, left), { lo, mid, hi });
                    while (i < mid || j < hi) {
                        const takeLeft = j >= hi || (i < mid && items[i].v <= items[j].v);
                        const pick = takeLeft ? i : j;
                        const why = i >= mid ? "left half is used up" : j >= hi ? "right half is used up" : `${items[i].v} ${takeLeft ? "≤" : ">"} ${items[j].v}`;
                        merged.push({ id: `m-${items[pick].id}`, v: items[pick].v });
                        const picking = { ...left };
                        for (let k = lo; k < i; k++) picking[k] = "dim";
                        for (let k = mid; k < j; k++) picking[k] = "dim";
                        picking[pick] = "found";
                        t.step(5, `Take ${items[pick].v} from the ${takeLeft ? "left" : "right"} half (${why}).`, draw(lo, hi, picking, { i: i < mid ? i : null, j: j < hi ? j : null }), { lo, mid, hi });
                        if (takeLeft) i++;
                        else j++;
                    }
                    merged.forEach((m, k) => { merged[k] = items.find((x) => `m-${x.id}` === m.id); });
                    for (let k = 0; k < merged.length; k++) items[lo + k] = merged[k];
                    merged = [];
                    const tones = {};
                    for (let k = lo; k < hi; k++) tones[k] = "done";
                    t.step(6, `Write the merged run back: ${items.slice(lo, hi).map((x) => x.v).join(", ")}.`, draw(lo, hi, tones), { lo, mid, hi });
                };
                sort(0, n);
                const tones = {};
                for (let k = 0; k < n; k++) tones[k] = "done";
                t.step(6, "All runs merged. Sorted.", draw(null, null, tones));
                t.result(out(items));
            },
        },
    ],
};

export const quickSort = {
    id: "quick-sort",
    titles: ["Quick Sort"],
    sample: "10 7 8 9 1 5",
    parse: parseArr,
    approaches: [
        {
            key: "lomuto",
            label: "Lomuto partition",
            complexity: { time: "O(n log n) avg", space: "O(log n)" },
            code: [
                "def qs(lo, hi):",
                "    if lo >= hi: return",
                "    pivot = arr[hi]; i = lo",
                "    for j in range(lo, hi):",
                "        if arr[j] < pivot: swap(i, j); i += 1",
                "    swap(i, hi)          # pivot to its spot",
                "    qs(lo, i - 1); qs(i + 1, hi)",
            ],
            run({ arr }, t) {
                const items = tracked(arr);
                const n = items.length;
                const done = {};
                const draw = (lo, hi, p = {}, tones = {}) => [
                    array("arr", items, { bars: true, window: lo == null ? null : [lo, hi], pointers: p, tones: { ...done, ...tones } }),
                ];
                t.step(1, "Pick a pivot, move smaller values to its left and larger to its right, then sort each side.", draw(null, null));
                const qs = (lo, hi) => {
                    if (lo > hi) return;
                    if (lo === hi) {
                        done[lo] = "done";
                        t.step(2, `Single element ${items[lo].v} is already in place.`, draw(lo, hi), { lo, hi });
                        return;
                    }
                    const pivot = items[hi].v;
                    let i = lo;
                    t.step(3, `Partition [${lo}…${hi}] around pivot ${pivot}.`, draw(lo, hi, { i }, { [hi]: "found" }), { lo, hi, pivot });
                    for (let j = lo; j < hi; j++) {
                        if (items[j].v < pivot) {
                            const same = i === j;
                            [items[i], items[j]] = [items[j], items[i]];
                            t.step(5, same ? `${items[i].v} < ${pivot} — already on the small side.` : `${items[i].v} < ${pivot} — swap it to position ${i}.`, draw(lo, hi, { i, j }, { [i]: "swap", [j]: same ? "swap" : "compare", [hi]: "found" }), { lo, hi, pivot, i, j });
                            i++;
                        } else {
                            t.step(5, `${items[j].v} ≥ ${pivot} — leave it on the large side.`, draw(lo, hi, { i, j }, { [j]: "compare", [hi]: "found" }), { lo, hi, pivot, i, j });
                        }
                    }
                    [items[i], items[hi]] = [items[hi], items[i]];
                    done[i] = "done";
                    t.step(6, `Put pivot ${pivot} at index ${i} — its final position.`, draw(lo, hi, { i }), { lo, hi, pivot, i });
                    qs(lo, i - 1);
                    qs(i + 1, hi);
                };
                qs(0, n - 1);
                for (let k = 0; k < n; k++) done[k] = "done";
                t.step(7, "Every pivot is placed. Sorted.", draw(null, null));
                t.result(out(items));
            },
        },
    ],
};
