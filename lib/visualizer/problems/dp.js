import { array } from "../structures.js";
import { int, lines, nums, requireLength } from "../parse.js";

export const climbingStairs = {
    id: "climbing-stairs",
    titles: ["Climbing Stairs"],
    sample: "5",
    parse(input) {
        const n = int(lines(input)[0]);
        if (n < 1 || n > 15) throw new Error("Pick n between 1 and 15.");
        return { n };
    },
    approaches: [
        {
            key: "dp",
            label: "Bottom-up DP",
            complexity: { time: "O(n)", space: "O(n)" },
            code: [
                "dp = [0] * (n + 1)",
                "dp[0] = dp[1] = 1",
                "for i in range(2, n + 1):",
                "    dp[i] = dp[i - 1] + dp[i - 2]   # last step was 1 or 2",
                "print(dp[n])",
            ],
            run({ n }, t) {
                const dp = new Array(n + 1).fill("·");
                const labels = dp.map((_, i) => `dp[${i}]`);
                const draw = (tones = {}) => [array("dp", dp, { label: "ways to reach step i", indexLabels: labels, tones })];
                t.step(1, "dp[i] = number of ways to reach step i. You arrive either from i−1 (one step) or i−2 (two steps).", draw(), { n });
                dp[0] = 1;
                dp[1] = 1;
                t.step(2, "One way to stand at the bottom, one way to reach step 1.", draw({ 0: "done", 1: "done" }), { n });
                for (let i = 2; i <= n; i++) {
                    dp[i] = dp[i - 1] + dp[i - 2];
                    t.step(4, `dp[${i}] = dp[${i - 1}] + dp[${i - 2}] = ${dp[i - 1]} + ${dp[i - 2]} = ${dp[i]}.`, draw({ [i]: "active", [i - 1]: "compare", [i - 2]: "compare" }), { i, n });
                }
                t.step(5, `There are ${dp[n]} ways to climb ${n} steps.`, draw({ [n]: "found" }), { n });
                t.result(String(dp[n]));
            },
        },
    ],
};

export const houseRobber = {
    id: "house-robber",
    titles: ["House Robber"],
    sample: "2 7 9 3 1",
    parse: (input) => ({ arr: requireLength(nums(lines(input)[0])) }),
    approaches: [
        {
            key: "dp",
            label: "DP: rob or skip",
            complexity: { time: "O(n)", space: "O(n)" },
            code: [
                "dp = [0] * n",
                "dp[0] = nums[0]",
                "dp[1] = max(nums[0], nums[1])",
                "for i in range(2, n):",
                "    dp[i] = max(dp[i - 1], dp[i - 2] + nums[i])",
                "print(dp[n - 1])",
            ],
            run({ arr }, t) {
                const n = arr.length;
                const dp = new Array(n).fill("·");
                const labels = dp.map((_, i) => `dp[${i}]`);
                const draw = (houseTones = {}, dpTones = {}) => [
                    array("nums", arr, { label: "money in each house", tones: houseTones }),
                    array("dp", dp, { label: "best total using houses 0…i", indexLabels: labels, tones: dpTones }),
                ];
                t.step(1, "dp[i] is the most you can rob from houses 0…i without robbing two neighbours.", draw());
                dp[0] = arr[0];
                t.step(2, `Only house 0: take ${arr[0]}.`, draw({ 0: "active" }, { 0: "active" }));
                if (n === 1) {
                    t.step(6, `Answer: ${dp[0]}.`, draw({}, { 0: "found" }));
                    t.result(String(dp[0]));
                    return;
                }
                dp[1] = Math.max(arr[0], arr[1]);
                t.step(3, `Houses 0–1: take the richer one, ${dp[1]}.`, draw({ 1: "active" }, { 1: "active" }));
                for (let i = 2; i < n; i++) {
                    const skip = dp[i - 1], rob = dp[i - 2] + arr[i];
                    dp[i] = Math.max(skip, rob);
                    t.step(5, rob > skip
                        ? `Rob house ${i}: dp[${i - 2}] + ${arr[i]} = ${rob} beats skipping (${skip}).`
                        : `Skip house ${i}: keeping dp[${i - 1}] = ${skip} beats ${dp[i - 2]} + ${arr[i]} = ${rob}.`,
                    draw({ [i]: rob > skip ? "active" : "dim" }, { [i]: "active", [i - 1]: rob > skip ? "dim" : "compare", [i - 2]: rob > skip ? "compare" : "dim" }), { i, rob, skip });
                }
                t.step(6, `The most you can rob is ${dp[n - 1]}.`, draw({}, { [n - 1]: "found" }));
                t.result(String(dp[n - 1]));
            },
        },
    ],
};

export const coinChange = {
    id: "coin-change",
    titles: ["Coin Change"],
    sample: "1 2 5\n11",
    parse(input) {
        const [a, b] = lines(input);
        const coins = requireLength(nums(a), { max: 6, what: "coins" });
        const amount = int(b);
        if (amount < 0 || amount > 15) throw new Error("Pick an amount between 0 and 15 so the table fits.");
        return { coins, amount };
    },
    approaches: [
        {
            key: "dp",
            label: "Bottom-up DP",
            complexity: { time: "O(amount · coins)", space: "O(amount)" },
            code: [
                "dp = [inf] * (amount + 1); dp[0] = 0",
                "for a in range(1, amount + 1):",
                "    for c in coins:",
                "        if c <= a: dp[a] = min(dp[a], dp[a - c] + 1)",
                "print(dp[amount] if dp[amount] < inf else -1)",
            ],
            run({ coins, amount }, t) {
                const dp = new Array(amount + 1).fill("∞");
                dp[0] = 0;
                const labels = dp.map((_, i) => `${i}`);
                const draw = (tones = {}, coinTones = {}) => [
                    array("coins", coins, { label: "coins", tones: coinTones, hideIndex: true }),
                    array("dp", dp, { label: "fewest coins to make amount a", indexLabels: labels, tones }),
                ];
                t.step(1, `dp[a] = fewest coins that sum to a. dp[0] = 0; everything else starts unreachable (∞).`, draw({ 0: "done" }), { amount });
                for (let a = 1; a <= amount; a++) {
                    for (let ci = 0; ci < coins.length; ci++) {
                        const c = coins[ci];
                        if (c > a || dp[a - c] === "∞") continue;
                        const cand = dp[a - c] + 1;
                        if (dp[a] === "∞" || cand < dp[a]) {
                            dp[a] = cand;
                            t.step(4, `Amount ${a}: use coin ${c} after dp[${a - c}] = ${dp[a - c]} → ${cand} coin(s). New best.`, draw({ [a]: "active", [a - c]: "compare" }, { [ci]: "active" }), { a, c, "dp[a]": dp[a] });
                        } else {
                            t.step(4, `Amount ${a}: coin ${c} gives ${cand}, not better than ${dp[a]}.`, draw({ [a]: "active", [a - c]: "dim" }, { [ci]: "compare" }), { a, c, "dp[a]": dp[a] });
                        }
                    }
                    if (dp[a] === "∞") t.step(3, `Amount ${a} can't be made with these coins.`, draw({ [a]: "bad" }), { a });
                }
                const ans = dp[amount] === "∞" ? -1 : dp[amount];
                t.step(5, ans === -1 ? `Amount ${amount} is unreachable: -1.` : `Fewest coins for ${amount}: ${ans}.`, draw({ [amount]: ans === -1 ? "bad" : "found" }), { amount });
                t.result(String(ans));
            },
        },
    ],
};

export const lis = {
    id: "lis",
    titles: ["Longest Increasing Subsequence"],
    sample: "10 9 2 5 3 7 101 18",
    parse: (input) => ({ arr: requireLength(nums(lines(input)[0]), { max: 12 }) }),
    approaches: [
        {
            key: "dp",
            label: "O(n²) DP",
            complexity: { time: "O(n²)", space: "O(n)" },
            code: [
                "dp = [1] * n          # LIS ending at i",
                "for i in range(n):",
                "    for j in range(i):",
                "        if nums[j] < nums[i]: dp[i] = max(dp[i], dp[j] + 1)",
                "print(max(dp))",
            ],
            run({ arr }, t) {
                const n = arr.length;
                const dp = new Array(n).fill(1);
                const labels = dp.map((_, i) => `dp[${i}]`);
                const draw = (i, j, numTones = {}, dpTones = {}) => [
                    array("nums", arr, { label: "nums", pointers: { j, i }, tones: numTones }),
                    array("dp", dp, { label: "longest increasing subsequence ending at i", indexLabels: labels, tones: dpTones }),
                ];
                t.step(1, "dp[i] = length of the longest increasing subsequence that ends at nums[i]. Every element alone has length 1.", draw(null, null));
                for (let i = 0; i < n; i++) {
                    for (let j = 0; j < i; j++) {
                        if (arr[j] < arr[i] && dp[j] + 1 > dp[i]) {
                            dp[i] = dp[j] + 1;
                            t.step(4, `${arr[j]} < ${arr[i]}: extend the run ending at ${j} → dp[${i}] = ${dp[i]}.`, draw(i, j, { [i]: "active", [j]: "compare" }, { [i]: "active", [j]: "compare" }), { i, j, "dp[i]": dp[i] });
                        } else if (arr[j] < arr[i]) {
                            t.step(4, `${arr[j]} < ${arr[i]}, but dp[${j}] + 1 = ${dp[j] + 1} doesn't beat dp[${i}] = ${dp[i]}.`, draw(i, j, { [i]: "active", [j]: "compare" }, { [i]: "active", [j]: "dim" }), { i, j, "dp[i]": dp[i] });
                        }
                    }
                    t.step(2, `dp[${i}] = ${dp[i]} is final.`, draw(i, null, { [i]: "done" }, { [i]: "done" }), { i, "dp[i]": dp[i] });
                }
                const best = Math.max(...dp);
                const at = dp.indexOf(best);
                t.step(5, `The longest increasing subsequence has length ${best} (one ends at ${arr[at]}).`, draw(null, null, {}, { [at]: "found" }), { best });
                t.result(String(best));
            },
        },
    ],
};

