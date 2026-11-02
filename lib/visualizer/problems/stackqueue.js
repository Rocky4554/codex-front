import { chars, stack, tracked } from "../structures.js";
import { lines, str } from "../parse.js";

export const validParentheses = {
    id: "valid-parentheses",
    titles: ["Valid Parentheses"],
    sample: "()[]{}",
    parse(input) {
        const s = str(lines(input)[0] ?? "");
        if (s.length > 16) throw new Error("Use at most 16 characters so the animation stays readable.");
        return { s };
    },
    approaches: [
        {
            key: "stack",
            label: "Stack",
            complexity: { time: "O(n)", space: "O(n)" },
            code: [
                "pairs = {')': '(', ']': '[', '}': '{'}",
                "st = []",
                "for ch in s:",
                "    if ch in '([{': st.append(ch)",
                "    elif not st or st.pop() != pairs[ch]:",
                "        return False",
                "return not st",
            ],
            run({ s }, t) {
                const pairs = { ")": "(", "]": "[", "}": "{" };
                const st = [];
                const tones = {};
                const draw = (i, stTones = {}) => [
                    chars("s", s, { label: "s", pointers: { i }, tones }),
                    stack("st", st, { label: "Stack of open brackets", tones: stTones }),
                ];
                t.step(2, "Every closing bracket must match the most recent unmatched opening one — a stack gives us exactly that.", draw(null));
                for (let i = 0; i < s.length; i++) {
                    const ch = s[i];
                    if ("([{".includes(ch)) {
                        st.push({ ...tracked([ch], "p")[0], at: i });
                        tones[i] = "active";
                        t.step(4, `'${ch}' opens — push it.`, draw(i));
                        continue;
                    }
                    const top = st[st.length - 1];
                    if (!top || top.v !== pairs[ch]) {
                        tones[i] = "bad";
                        t.step(6, top ? `'${ch}' needs '${pairs[ch]}' but the top is '${top.v}'. Invalid.` : `'${ch}' has nothing to close. Invalid.`, draw(i, top ? { [st.length - 1]: "bad" } : {}));
                        t.result("false");
                        return;
                    }
                    tones[i] = "found";
                    tones[top.at] = "found";
                    t.step(5, `'${ch}' matches the top '${top.v}' — pop it.`, draw(i, { [st.length - 1]: "found" }));
                    st.pop();
                    tones[top.at] = "done";
                    tones[i] = "done";
                    t.step(3, "Matched pair removed.", draw(i));
                }
                const ok = st.length === 0;
                t.step(7, ok ? "Stack is empty — every bracket was matched. Valid." : `${st.length} bracket(s) never closed. Invalid.`, draw(null, ok ? {} : Object.fromEntries(st.map((_, k) => [k, "bad"]))));
                t.result(String(ok));
            },
        },
    ],
};
