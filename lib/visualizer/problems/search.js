import { array } from "../structures.js";
import { int, lines, nums, requireLength } from "../parse.js";

const arrAndTarget = (input) => {
    const [a, b] = lines(input);
    return { arr: requireLength(nums(a)), target: int(b) };
};

const dimOutside = (n, lo, hi) => {
    const tones = {};
    for (let k = 0; k < n; k++) if (k < lo || k > hi) tones[k] = "dim";
    return tones;
};

export const binarySearch = {
    id: "binary-search",
    titles: ["Binary Search"],
    sample: "-1 0 3 5 9 12\n9",
    parse: arrAndTarget,
    approaches: [
        {
            key: "iterative",
            label: "Iterative binary search",
            complexity: { time: "O(log n)", space: "O(1)" },
            code: [
                "lo, hi = 0, n - 1",
                "while lo <= hi:",
                "    mid = (lo + hi) // 2",
                "    if arr[mid] == target: return mid",
                "    elif arr[mid] < target: lo = mid + 1",
                "    else: hi = mid - 1",
                "return -1",
            ],
            run({ arr, target }, t) {
                const n = arr.length;
                let lo = 0, hi = n - 1;
                const draw = (mid, tones = {}) => [array("arr", arr, { pointers: { lo, mid, hi }, tones: { ...dimOutside(n, lo, hi), ...tones } })];
                t.step(1, `Search for ${target} in the sorted array. The answer, if it exists, is always inside [lo, hi].`, draw(null), { lo, hi, target });
                while (lo <= hi) {
                    const mid = (lo + hi) >> 1;
                    t.step(3, `mid = (${lo} + ${hi}) // 2 = ${mid}, arr[mid] = ${arr[mid]}.`, draw(mid, { [mid]: "active" }), { lo, hi, mid, target });
                    if (arr[mid] === target) {
                        t.step(4, `${arr[mid]} == ${target}. Found at index ${mid}.`, draw(mid, { [mid]: "found" }), { lo, hi, mid, target });
                        t.result(String(mid));
                        return;
                    }
                    if (arr[mid] < target) {
                        lo = mid + 1;
                        t.step(5, `${arr[mid]} < ${target}, so the left half can't contain it. lo = ${lo}.`, draw(mid), { lo, hi, mid, target });
                    } else {
                        hi = mid - 1;
                        t.step(6, `${arr[mid]} > ${target}, so the right half can't contain it. hi = ${hi}.`, draw(mid), { lo, hi, mid, target });
                    }
                }
                t.step(7, `lo passed hi — ${target} is not in the array.`, draw(null), { lo, hi, target });
                t.result("-1");
            },
        },
    ],
};

export const searchRotated = {
    id: "search-rotated",
    titles: ["Search in Rotated Sorted Array"],
    sample: "4 5 6 7 0 1 2\n0",
    parse: arrAndTarget,
    approaches: [
        {
            key: "modified-binary",
            label: "Modified binary search",
            complexity: { time: "O(log n)", space: "O(1)" },
            code: [
                "lo, hi = 0, n - 1",
                "while lo <= hi:",
                "    mid = (lo + hi) // 2",
                "    if nums[mid] == target: return mid",
                "    if nums[lo] <= nums[mid]:          # left half sorted",
                "        if nums[lo] <= target < nums[mid]: hi = mid - 1",
                "        else: lo = mid + 1",
                "    else:                              # right half sorted",
                "        if nums[mid] < target <= nums[hi]: lo = mid + 1",
                "        else: hi = mid - 1",
                "return -1",
            ],
            run({ arr, target }, t) {
                const n = arr.length;
                let lo = 0, hi = n - 1;
                const draw = (mid, tones = {}) => [array("nums", arr, { pointers: { lo, mid, hi }, tones: { ...dimOutside(n, lo, hi), ...tones } })];
                t.step(1, `One half of any window in a rotated sorted array is always sorted. Use it to decide where ${target} can be.`, draw(null), { lo, hi, target });
                while (lo <= hi) {
                    const mid = (lo + hi) >> 1;
                    t.step(3, `mid = ${mid}, nums[mid] = ${arr[mid]}.`, draw(mid, { [mid]: "active" }), { lo, hi, mid, target });
                    if (arr[mid] === target) {
                        t.step(4, `Found ${target} at index ${mid}.`, draw(mid, { [mid]: "found" }), { lo, hi, mid, target });
                        t.result(String(mid));
                        return;
                    }
                    const sortedTones = {};
                    if (arr[lo] <= arr[mid]) {
                        for (let k = lo; k <= mid; k++) sortedTones[k] = "compare";
                        t.step(5, `nums[${lo}] = ${arr[lo]} ≤ ${arr[mid]}: the left half [${lo}…${mid}] is sorted.`, draw(mid, { ...sortedTones, [mid]: "active" }), { lo, hi, mid, target });
                        if (arr[lo] <= target && target < arr[mid]) {
                            hi = mid - 1;
                            t.step(6, `${target} lies in [${arr[lo]}, ${arr[mid]}) — search left. hi = ${hi}.`, draw(mid), { lo, hi, mid, target });
                        } else {
                            lo = mid + 1;
                            t.step(7, `${target} isn't in that sorted range — search right. lo = ${lo}.`, draw(mid), { lo, hi, mid, target });
                        }
                    } else {
                        for (let k = mid; k <= hi; k++) sortedTones[k] = "compare";
                        t.step(8, `The right half [${mid}…${hi}] is sorted.`, draw(mid, { ...sortedTones, [mid]: "active" }), { lo, hi, mid, target });
                        if (arr[mid] < target && target <= arr[hi]) {
                            lo = mid + 1;
                            t.step(9, `${target} lies in (${arr[mid]}, ${arr[hi]}] — search right. lo = ${lo}.`, draw(mid), { lo, hi, mid, target });
                        } else {
                            hi = mid - 1;
                            t.step(10, `${target} isn't in that sorted range — search left. hi = ${hi}.`, draw(mid), { lo, hi, mid, target });
                        }
                    }
                }
                t.step(11, `${target} is not in the array.`, draw(null), { lo, hi, target });
                t.result("-1");
            },
        },
    ],
};

export const kthLargest = {
    id: "kth-largest",
    titles: ["Kth Largest Element in an Array"],
    sample: "3 2 1 5 6 4\n2",
    parse(input) {
        const [a, b] = lines(input);
        const arr = requireLength(nums(a));
        const k = int(b);
        if (k < 1 || k > arr.length) throw new Error(`k must be between 1 and ${arr.length}.`);
        return { arr, k };
    },
    approaches: [
        {
            key: "min-heap",
            label: "Min-heap of size k",
            complexity: { time: "O(n log k)", space: "O(k)" },
            code: [
                "heap = []",
                "for x in nums:",
                "    heapq.heappush(heap, x)",
                "    if len(heap) > k: heapq.heappop(heap)  # drop smallest",
                "print(heap[0])          # kth largest",
            ],
            run({ arr, k }, t) {
                let heap = [];
                const draw = (i, tones = {}, hTones = {}) => [
                    array("nums", arr, { label: "nums", pointers: { i }, tones }),
                    array("heap", heap, { label: `min-heap (k = ${k}), smallest first`, tones: hTones, hideIndex: true }),
                ];
                t.step(1, `Keep only the ${k} largest values seen so far in a min-heap. Its smallest element is then the ${k}th largest.`, draw(null), { k });
                for (let i = 0; i < arr.length; i++) {
                    const x = arr[i];
                    heap = [...heap, x].sort((a, b) => a - b);
                    t.step(3, `Push ${x}.`, draw(i, { [i]: "active" }, { [heap.indexOf(x)]: "active" }), { k, size: heap.length });
                    if (heap.length > k) {
                        const small = heap[0];
                        t.step(4, `Heap has ${heap.length} > ${k} items — pop the smallest, ${small}.`, draw(i, { [i]: "active" }, { 0: "bad" }), { k, size: heap.length });
                        heap = heap.slice(1);
                    }
                }
                t.step(5, `The heap holds the ${k} largest values; its top, ${heap[0]}, is the ${k}th largest.`, draw(null, {}, { 0: "found" }), { k });
                t.result(String(heap[0]));
            },
        },
    ],
};

