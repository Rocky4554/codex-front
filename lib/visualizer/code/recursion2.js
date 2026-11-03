// JavaScript / Java / C++ versions of the approaches in ../problems/recursion2.js.
// Format: see ./README.md.

const translations = {
    "factorial": {
        "recursive": {
            javascript: [
                [1, "function fact(n) {"],
                [2, "    if (n <= 1) return 1;"],
                [3, "    return n * fact(n - 1);"],
                "}",
            ],
            java: [
                [1, "static int fact(int n) {"],
                [2, "    if (n <= 1) return 1;"],
                [3, "    return n * fact(n - 1);"],
                "}",
            ],
            cpp: [
                [1, "int fact(int n) {"],
                [2, "    if (n <= 1) return 1;"],
                [3, "    return n * fact(n - 1);"],
                "}",
            ],
        },
    },
    "print-1-to-n": {
        "recursive": {
            javascript: [
                [1, "function show(n) {"],
                [2, "    if (n === 0) return;"],
                [3, "    show(n - 1);     // print smaller numbers first"],
                [4, "    console.log(n);"],
                "}",
            ],
            java: [
                [1, "static void show(int n) {"],
                [2, "    if (n == 0) return;"],
                [3, "    show(n - 1);     // print smaller numbers first"],
                [4, "    System.out.println(n);"],
                "}",
            ],
            cpp: [
                [1, "void show(int n) {"],
                [2, "    if (n == 0) return;"],
                [3, "    show(n - 1);     // print smaller numbers first"],
                [4, "    cout << n << endl;"],
                "}",
            ],
        },
    },
    "reverse-string-recursion": {
        "recursive": {
            javascript: [
                [1, "function rev(s) {"],
                [2, "    if (s.length <= 1) return s;"],
                [3, "    return rev(s.slice(1)) + s[0];"],
                "}",
            ],
            java: [
                [1, "static String rev(String s) {"],
                [2, "    if (s.length() <= 1) return s;"],
                [3, "    return rev(s.substring(1)) + s.charAt(0);"],
                "}",
            ],
            cpp: [
                [1, "string rev(string s) {"],
                [2, "    if (s.size() <= 1) return s;"],
                [3, "    return rev(s.substr(1)) + s[0];"],
                "}",
            ],
        },
    },
    "sum-of-digits": {
        "recursive": {
            javascript: [
                [1, "function digits(n) {"],
                [2, "    if (n < 10) return n;"],
                [3, "    return (n % 10) + digits(Math.floor(n / 10));"],
                "}",
            ],
            java: [
                [1, "static int digits(int n) {"],
                [2, "    if (n < 10) return n;"],
                [3, "    return n % 10 + digits(n / 10);"],
                "}",
            ],
            cpp: [
                [1, "int digits(int n) {"],
                [2, "    if (n < 10) return n;"],
                [3, "    return n % 10 + digits(n / 10);"],
                "}",
            ],
        },
    },
};

export default translations;
