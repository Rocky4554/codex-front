// JavaScript / Java / C++ versions of the approaches in ../problems/recursion.js.
// Format: see ./README.md.

const translations = {
    "fibonacci": {
        "memo": {
            javascript: [
                [1, "const memo = new Map();"],
                [2, "function fib(n) {"],
                [3, "    if (n <= 1) return n;"],
                [4, "    if (memo.has(n)) return memo.get(n);"],
                [5, "    memo.set(n, fib(n - 1) + fib(n - 2));"],
                [6, "    return memo.get(n);"],
                "}",
            ],
            java: [
                [1, "static Map<Integer, Integer> memo = new HashMap<>();"],
                [2, "static int fib(int n) {"],
                [3, "    if (n <= 1) return n;"],
                [4, "    if (memo.containsKey(n)) return memo.get(n);"],
                [5, "    memo.put(n, fib(n - 1) + fib(n - 2));"],
                [6, "    return memo.get(n);"],
                "}",
            ],
            cpp: [
                [1, "unordered_map<int, int> memo;"],
                [2, "int fib(int n) {"],
                [3, "    if (n <= 1) return n;"],
                [4, "    if (memo.count(n)) return memo[n];"],
                [5, "    memo[n] = fib(n - 1) + fib(n - 2);"],
                [6, "    return memo[n];"],
                "}",
            ],
        },
        "bottom-up": {
            javascript: [
                [1, "let a = 0, b = 1;"],
                [2, "for (let i = 0; i < n; i++) {"],
                [3, "    [a, b] = [b, a + b];"],
                "}",
                [4, "return a;"],
            ],
            java: [
                [1, "int a = 0, b = 1;"],
                [2, "for (int i = 0; i < n; i++) {"],
                [3, "    int next = a + b; a = b; b = next;"],
                "}",
                [4, "return a;"],
            ],
            cpp: [
                [1, "int a = 0, b = 1;"],
                [2, "for (int i = 0; i < n; i++) {"],
                [3, "    int next = a + b; a = b; b = next;"],
                "}",
                [4, "return a;"],
            ],
        },
    },
};

export default translations;
