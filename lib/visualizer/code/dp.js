// JavaScript / Java / C++ versions of the approaches in ../problems/dp.js.
// Format: see ./README.md.

const translations = {
    "climbing-stairs": {
        "dp": {
            javascript: [
                [1, "const dp = new Array(n + 1).fill(0);"],
                [2, "dp[0] = dp[1] = 1;"],
                [3, "for (let i = 2; i <= n; i++) {"],
                [4, "    dp[i] = dp[i - 1] + dp[i - 2];   // last step was 1 or 2"],
                "}",
                [5, "console.log(dp[n]);"],
            ],
            java: [
                [1, "int[] dp = new int[n + 1];"],
                [2, "dp[0] = dp[1] = 1;"],
                [3, "for (int i = 2; i <= n; i++) {"],
                [4, "    dp[i] = dp[i - 1] + dp[i - 2];   // last step was 1 or 2"],
                "}",
                [5, "System.out.println(dp[n]);"],
            ],
            cpp: [
                [1, "vector<long long> dp(n + 1, 0);"],
                [2, "dp[0] = dp[1] = 1;"],
                [3, "for (int i = 2; i <= n; i++) {"],
                [4, "    dp[i] = dp[i - 1] + dp[i - 2];   // last step was 1 or 2"],
                "}",
                [5, "cout << dp[n] << endl;"],
            ],
        },
    },
    "house-robber": {
        "dp": {
            javascript: [
                [1, "const dp = new Array(n).fill(0);"],
                [2, "dp[0] = nums[0];"],
                [3, "dp[1] = Math.max(nums[0], nums[1]);"],
                [4, "for (let i = 2; i < n; i++) {"],
                [5, "    dp[i] = Math.max(dp[i - 1], dp[i - 2] + nums[i]);"],
                "}",
                [6, "console.log(dp[n - 1]);"],
            ],
            java: [
                [1, "int[] dp = new int[n];"],
                [2, "dp[0] = nums[0];"],
                [3, "dp[1] = Math.max(nums[0], nums[1]);"],
                [4, "for (int i = 2; i < n; i++) {"],
                [5, "    dp[i] = Math.max(dp[i - 1], dp[i - 2] + nums[i]);"],
                "}",
                [6, "System.out.println(dp[n - 1]);"],
            ],
            cpp: [
                [1, "vector<int> dp(n, 0);"],
                [2, "dp[0] = nums[0];"],
                [3, "dp[1] = max(nums[0], nums[1]);"],
                [4, "for (int i = 2; i < n; i++) {"],
                [5, "    dp[i] = max(dp[i - 1], dp[i - 2] + nums[i]);"],
                "}",
                [6, "cout << dp[n - 1] << endl;"],
            ],
        },
    },
    "coin-change": {
        "dp": {
            javascript: [
                [1, "const dp = new Array(amount + 1).fill(Infinity); dp[0] = 0;"],
                [2, "for (let a = 1; a <= amount; a++) {"],
                [3, "    for (const c of coins) {"],
                [4, "        if (c <= a) dp[a] = Math.min(dp[a], dp[a - c] + 1);"],
                "    }",
                "}",
                [5, "console.log(dp[amount] < Infinity ? dp[amount] : -1);"],
            ],
            java: [
                [1, "int INF = Integer.MAX_VALUE / 2;"],
                [1, "int[] dp = new int[amount + 1]; Arrays.fill(dp, INF); dp[0] = 0;"],
                [2, "for (int a = 1; a <= amount; a++) {"],
                [3, "    for (int c : coins) {"],
                [4, "        if (c <= a) dp[a] = Math.min(dp[a], dp[a - c] + 1);"],
                "    }",
                "}",
                [5, "System.out.println(dp[amount] < INF ? dp[amount] : -1);"],
            ],
            cpp: [
                [1, "const int INF = INT_MAX / 2;"],
                [1, "vector<int> dp(amount + 1, INF); dp[0] = 0;"],
                [2, "for (int a = 1; a <= amount; a++) {"],
                [3, "    for (int c : coins) {"],
                [4, "        if (c <= a) dp[a] = min(dp[a], dp[a - c] + 1);"],
                "    }",
                "}",
                [5, "cout << (dp[amount] < INF ? dp[amount] : -1) << endl;"],
            ],
        },
    },
    "lis": {
        "dp": {
            javascript: [
                [1, "const dp = new Array(n).fill(1);   // LIS ending at i"],
                [2, "for (let i = 0; i < n; i++) {"],
                [3, "    for (let j = 0; j < i; j++) {"],
                [4, "        if (nums[j] < nums[i]) dp[i] = Math.max(dp[i], dp[j] + 1);"],
                "    }",
                "}",
                [5, "console.log(Math.max(...dp));"],
            ],
            java: [
                [1, "int[] dp = new int[n]; Arrays.fill(dp, 1);   // LIS ending at i"],
                [2, "for (int i = 0; i < n; i++) {"],
                [3, "    for (int j = 0; j < i; j++) {"],
                [4, "        if (nums[j] < nums[i]) dp[i] = Math.max(dp[i], dp[j] + 1);"],
                "    }",
                "}",
                [5, "System.out.println(Arrays.stream(dp).max().getAsInt());"],
            ],
            cpp: [
                [1, "vector<int> dp(n, 1);   // LIS ending at i"],
                [2, "for (int i = 0; i < n; i++) {"],
                [3, "    for (int j = 0; j < i; j++) {"],
                [4, "        if (nums[j] < nums[i]) dp[i] = max(dp[i], dp[j] + 1);"],
                "    }",
                "}",
                [5, "cout << *max_element(dp.begin(), dp.end()) << endl;"],
            ],
        },
    },
};

export default translations;
