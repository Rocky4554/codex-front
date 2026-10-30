// Step-by-step visualization data for "Two Sum II" (sorted array, 1-indexed answer).
//
// Every step is a FULL snapshot of what should be on screen — never a delta.
// That makes scrubbing, jumping and stepping backwards trivial: render step i.
//
// Step shape:
//   codeLine    1-based line of the approach's pseudocode to highlight
//   narration   one or two sentences explaining this exact moment
//   pointers    [{ name, index, color: "accent" | "accent2" | "ink" }]
//   highlights  array indices to tint
//   best        { indices, label } — the found answer, drawn with a ring
//   vars        [[name, value], ...] shown in the state table

const arr = [1, 3, 4, 8, 13];
const target = 12;

export const twoSumII = {
    id: "two-sum-ii",
    title: "Two Sum II",
    input: arr,
    approaches: [
        {
            label: "Brute force",
            complexity: { time: "O(n²)", space: "O(1)" },
            pseudocode: [
                "given sorted arr, target",
                "for i ← 0 … n−2:",
                "    for j ← i+1 … n−1:",
                "        if arr[i] + arr[j] == target:",
                "            return (i+1, j+1)",
            ],
            steps: [
                {
                    codeLine: 1,
                    narration:
                        "Find positions i < j with arr[i] + arr[j] = 12. We work 0-based and add 1 at the end, since the answer is 1-indexed.",
                    vars: [["target", target]],
                },
                {
                    codeLine: 2,
                    narration: "Fix i = 0, so arr[i] = 1. Now try every j after it.",
                    pointers: [{ name: "i", index: 0, color: "accent" }],
                    highlights: [0],
                    vars: [["i", 0], ["arr[i]", 1], ["target", target]],
                },
                {
                    codeLine: 4,
                    narration: "j = 1: sum = 1 + 3 = 4. Not 12, keep going.",
                    pointers: [
                        { name: "i", index: 0, color: "accent" },
                        { name: "j", index: 1, color: "accent2" },
                    ],
                    highlights: [0, 1],
                    vars: [["i", 0], ["j", 1], ["sum", 4], ["target", target]],
                },
                {
                    codeLine: 4,
                    narration: "j = 2: sum = 1 + 4 = 5. Still short.",
                    pointers: [
                        { name: "i", index: 0, color: "accent" },
                        { name: "j", index: 2, color: "accent2" },
                    ],
                    highlights: [0, 2],
                    vars: [["i", 0], ["j", 2], ["sum", 5], ["target", target]],
                },
                {
                    codeLine: 4,
                    narration: "j = 3: sum = 1 + 8 = 9. Closer, but no.",
                    pointers: [
                        { name: "i", index: 0, color: "accent" },
                        { name: "j", index: 3, color: "accent2" },
                    ],
                    highlights: [0, 3],
                    vars: [["i", 0], ["j", 3], ["sum", 9], ["target", target]],
                },
                {
                    codeLine: 4,
                    narration: "j = 4: sum = 1 + 13 = 14. Overshot — no j works for i = 0.",
                    pointers: [
                        { name: "i", index: 0, color: "accent" },
                        { name: "j", index: 4, color: "accent2" },
                    ],
                    highlights: [0, 4],
                    vars: [["i", 0], ["j", 4], ["sum", 14], ["target", target]],
                },
                {
                    codeLine: 2,
                    narration: "Move on: fix i = 1, arr[i] = 3.",
                    pointers: [{ name: "i", index: 1, color: "accent" }],
                    highlights: [1],
                    vars: [["i", 1], ["arr[i]", 3], ["target", target]],
                },
                {
                    codeLine: 4,
                    narration: "j = 2: sum = 3 + 4 = 7.",
                    pointers: [
                        { name: "i", index: 1, color: "accent" },
                        { name: "j", index: 2, color: "accent2" },
                    ],
                    highlights: [1, 2],
                    vars: [["i", 1], ["j", 2], ["sum", 7], ["target", target]],
                },
                {
                    codeLine: 4,
                    narration: "j = 3: sum = 3 + 8 = 11. One short!",
                    pointers: [
                        { name: "i", index: 1, color: "accent" },
                        { name: "j", index: 3, color: "accent2" },
                    ],
                    highlights: [1, 3],
                    vars: [["i", 1], ["j", 3], ["sum", 11], ["target", target]],
                },
                {
                    codeLine: 4,
                    narration: "j = 4: sum = 3 + 13 = 16. Too big again.",
                    pointers: [
                        { name: "i", index: 1, color: "accent" },
                        { name: "j", index: 4, color: "accent2" },
                    ],
                    highlights: [1, 4],
                    vars: [["i", 1], ["j", 4], ["sum", 16], ["target", target]],
                },
                {
                    codeLine: 2,
                    narration: "Fix i = 2, arr[i] = 4.",
                    pointers: [{ name: "i", index: 2, color: "accent" }],
                    highlights: [2],
                    vars: [["i", 2], ["arr[i]", 4], ["target", target]],
                },
                {
                    codeLine: 5,
                    narration:
                        "j = 3: sum = 4 + 8 = 12 — that's the target! 0-based (2, 3) becomes the 1-indexed answer (3, 4).",
                    pointers: [
                        { name: "i", index: 2, color: "accent" },
                        { name: "j", index: 3, color: "accent2" },
                    ],
                    highlights: [2, 3],
                    best: { indices: [2, 3], label: "answer" },
                    vars: [["i", 2], ["j", 3], ["sum", 12], ["target", target]],
                },
                {
                    codeLine: 3,
                    narration:
                        "We checked up to every pair: O(n²) time, O(1) space. But we never used the fact that the array is sorted…",
                    vars: [["time", "O(n²)"], ["space", "O(1)"]],
                },
            ],
        },
        {
            label: "Optimized · two pointers",
            complexity: { time: "O(n)", space: "O(1)" },
            pseudocode: [
                "given sorted arr, target",
                "left ← 0, right ← n−1",
                "while left < right:",
                "    sum ← arr[left] + arr[right]",
                "    if sum == target → return (left+1, right+1)",
                "    if sum < target: left++  else: right−−",
            ],
            steps: [
                {
                    codeLine: 1,
                    narration:
                        "Sorted input is the key: moving left rightwards can only increase the sum, moving right leftwards can only decrease it.",
                    vars: [["target", target]],
                },
                {
                    codeLine: 2,
                    narration: "Start at both ends: left = 0, right = 4.",
                    pointers: [
                        { name: "L", index: 0, color: "accent" },
                        { name: "R", index: 4, color: "accent2" },
                    ],
                    highlights: [0, 4],
                    vars: [["left", 0], ["right", 4], ["target", target]],
                },
                {
                    codeLine: 4,
                    narration: "sum = 1 + 13 = 14 > 12. The sum is too big.",
                    pointers: [
                        { name: "L", index: 0, color: "accent" },
                        { name: "R", index: 4, color: "accent2" },
                    ],
                    highlights: [0, 4],
                    vars: [["left", 0], ["right", 4], ["sum", 14], ["target", target]],
                },
                {
                    codeLine: 6,
                    narration:
                        "Only shrinking from the right can lower the sum, so right−− . Index 4 can never be part of the answer.",
                    pointers: [
                        { name: "L", index: 0, color: "accent" },
                        { name: "R", index: 3, color: "accent2" },
                    ],
                    highlights: [0, 3],
                    vars: [["left", 0], ["right", 3], ["target", target]],
                },
                {
                    codeLine: 4,
                    narration: "sum = 1 + 8 = 9 < 12. Now we're too small.",
                    pointers: [
                        { name: "L", index: 0, color: "accent" },
                        { name: "R", index: 3, color: "accent2" },
                    ],
                    highlights: [0, 3],
                    vars: [["left", 0], ["right", 3], ["sum", 9], ["target", target]],
                },
                {
                    codeLine: 6,
                    narration: "Too small → left++. Index 0 is ruled out the same way.",
                    pointers: [
                        { name: "L", index: 1, color: "accent" },
                        { name: "R", index: 3, color: "accent2" },
                    ],
                    highlights: [1, 3],
                    vars: [["left", 1], ["right", 3], ["target", target]],
                },
                {
                    codeLine: 4,
                    narration: "sum = 3 + 8 = 11 < 12. Still one short.",
                    pointers: [
                        { name: "L", index: 1, color: "accent" },
                        { name: "R", index: 3, color: "accent2" },
                    ],
                    highlights: [1, 3],
                    vars: [["left", 1], ["right", 3], ["sum", 11], ["target", target]],
                },
                {
                    codeLine: 6,
                    narration: "left++ once more.",
                    pointers: [
                        { name: "L", index: 2, color: "accent" },
                        { name: "R", index: 3, color: "accent2" },
                    ],
                    highlights: [2, 3],
                    vars: [["left", 2], ["right", 3], ["target", target]],
                },
                {
                    codeLine: 5,
                    narration:
                        "sum = 4 + 8 = 12 — found it! Return the 1-indexed pair (3, 4).",
                    pointers: [
                        { name: "L", index: 2, color: "accent" },
                        { name: "R", index: 3, color: "accent2" },
                    ],
                    highlights: [2, 3],
                    best: { indices: [2, 3], label: "answer" },
                    vars: [["left", 2], ["right", 3], ["sum", 12], ["target", target]],
                },
                {
                    codeLine: 3,
                    narration:
                        "Every comparison permanently discards one index, so the pointers meet after at most n steps: O(n) time, O(1) space.",
                    vars: [["time", "O(n)"], ["space", "O(1)"]],
                },
            ],
        },
    ],
};
