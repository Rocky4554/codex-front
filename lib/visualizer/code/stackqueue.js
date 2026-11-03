// JavaScript / Java / C++ versions of the approaches in ../problems/stackqueue.js.
// Format: see ./README.md.

const translations = {
    "valid-parentheses": {
        "stack": {
            javascript: [
                [1, "const pairs = { ')': '(', ']': '[', '}': '{' };"],
                [2, "const st = [];"],
                [3, "for (const ch of s) {"],
                [4, "    if ('([{'.includes(ch)) st.push(ch);"],
                [5, "    else if (st.length === 0 || st.pop() !== pairs[ch])"],
                [6, "        return false;"],
                "}",
                [7, "return st.length === 0;"],
            ],
            java: [
                [1, "Map<Character, Character> pairs = Map.of(')', '(', ']', '[', '}', '{');"],
                [2, "Deque<Character> st = new ArrayDeque<>();"],
                [3, "for (char ch : s.toCharArray()) {"],
                [4, "    if (\"([{\".indexOf(ch) >= 0) st.push(ch);"],
                [5, "    else if (st.isEmpty() || !st.pop().equals(pairs.get(ch)))"],
                [6, "        return false;"],
                "}",
                [7, "return st.isEmpty();"],
            ],
            cpp: [
                [1, "unordered_map<char, char> pairs = {{')', '('}, {']', '['}, {'}', '{'}};"],
                [2, "stack<char> st;"],
                [3, "for (char ch : s) {"],
                [4, "    if (string(\"([{\").find(ch) != string::npos) st.push(ch);"],
                [5, "    else if (st.empty() || st.top() != pairs[ch])"],
                [6, "        return false;"],
                [5, "    else st.pop();"],
                "}",
                [7, "return st.empty();"],
            ],
        },
    },
};

export default translations;
