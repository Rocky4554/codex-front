import { array, tracked } from "../structures.js";
import { lines, nums, requireLength } from "../parse.js";

const parseArr = (input) => ({ arr: requireLength(nums(lines(input)[0]), { max: 12 }) });
const out = (items) => items.map((x) => x.v).join(" ");

export const bubbleSort = {
    id: "bubble-sort",
    titles: ["Bubble Sort"],
    sample: "5 1 4 2 8",
    parse: parseArr,
    approaches: [
        {
            key: "bubble",
            label: "Bubble sort",
            complexity: { time: "O(n²)", space: "O(1)" },
            code: [
                "for i in range(n - 1):",
                "    swapped = False",
                "    for j in range(n - 1 - i):",
                "        if arr[j] > arr[j + 1]:",
                "            arr[j], arr[j + 1] = arr[j + 1], arr[j]",
                "            swapped = True",
                "    if not swapped: break",
            ],
            run({ arr }, t) {
                const items = tracked(arr);
                const n = items.length;
                const done = {};
                const draw = (j, tones = {}) => [array("arr", items, { bars: true, pointers: { j, "j+1": j == null ? null : j + 1 }, tones: { ...done, ...tones } })];
                t.step(1, "Each pass bubbles the largest remaining value to the end by swapping neighbours that are out of order.", draw(null));
                for (let i = 0; i < n - 1; i++) {
                    let swapped = false;
                    t.step(2, `Pass ${i + 1}: scan positions 0…${n - 1 - i}.`, draw(null), { pass: i + 1 });
                    for (let j = 0; j < n - 1 - i; j++) {
                        const a = items[j].v, b = items[j + 1].v;
                        if (a > b) {
                            t.step(4, `${a} > ${b} — out of order.`, draw(j, { [j]: "compare", [j + 1]: "compare" }), { pass: i + 1, j });
                            [items[j], items[j + 1]] = [items[j + 1], items[j]];
                            swapped = true;
                            t.step(5, `Swap them.`, draw(j, { [j]: "swap", [j + 1]: "swap" }), { pass: i + 1, j, swapped });
                        } else {
                            t.step(4, `${a} ≤ ${b} — already in order.`, draw(j, { [j]: "compare", [j + 1]: "compare" }), { pass: i + 1, j });
                        }
                    }
                    done[n - 1 - i] = "done";
                    if (!swapped) {
                        for (let k = 0; k < n; k++) done[k] = "done";
                        t.step(7, "No swaps this pass, so the array is already sorted. Stop early.", draw(null), { pass: i + 1, swapped });
                        t.result(out(items));
                        return;
                    }
                    t.step(3, `${items[n - 1 - i].v} has bubbled into its final place.`, draw(null), { pass: i + 1 });
                }
                done[0] = "done";
                t.step(7, "Sorted.", draw(null));
                t.result(out(items));
            },
        },
    ],
};
