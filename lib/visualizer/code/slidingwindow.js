// JavaScript / Java / C++ versions of the approaches in ../problems/slidingwindow.js.
// Format: see ./README.md.

const translations = {
    "longest-substring-no-repeat": {
        "window": {
            javascript: [
                [1, "const last = new Map(); let l = 0, best = 0;"],
                [2, "for (let r = 0; r < s.length; r++) {"],
                [2, "    const ch = s[r];"],
                [3, "    if (last.has(ch) && last.get(ch) >= l) {"],
                [4, "        l = last.get(ch) + 1;      // jump past the repeat"],
                "    }",
                [5, "    last.set(ch, r);"],
                [6, "    best = Math.max(best, r - l + 1);"],
                "}",
                [7, "console.log(best);"],
            ],
            java: [
                [1, "Map<Character, Integer> last = new HashMap<>(); int l = 0, best = 0;"],
                [2, "for (int r = 0; r < s.length(); r++) {"],
                [2, "    char ch = s.charAt(r);"],
                [3, "    if (last.containsKey(ch) && last.get(ch) >= l) {"],
                [4, "        l = last.get(ch) + 1;      // jump past the repeat"],
                "    }",
                [5, "    last.put(ch, r);"],
                [6, "    best = Math.max(best, r - l + 1);"],
                "}",
                [7, "System.out.println(best);"],
            ],
            cpp: [
                [1, "unordered_map<char, int> last; int l = 0, best = 0;"],
                [2, "for (int r = 0; r < (int)s.size(); r++) {"],
                [2, "    char ch = s[r];"],
                [3, "    if (last.count(ch) && last[ch] >= l) {"],
                [4, "        l = last[ch] + 1;      // jump past the repeat"],
                "    }",
                [5, "    last[ch] = r;"],
                [6, "    best = max(best, r - l + 1);"],
                "}",
                [7, "cout << best << endl;"],
            ],
        },
    },
};

export default translations;
