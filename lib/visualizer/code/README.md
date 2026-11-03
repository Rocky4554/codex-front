# Visualizer code in other languages

Each approach in `../problems/*.js` has its code written in Python (`approach.code`),
and every `t.step(line, …)` points at a 1-based line of that Python. This folder holds
the same code in JavaScript, Java and C++, one file per problem file:

```js
export default {
    "<def id>": {
        "<approach key>": {
            javascript: [ ...lines ],
            java: [ ...lines ],
            cpp: [ ...lines ],
        },
    },
};
```

A line is either `[pythonLine, "text"]` or a plain `"text"`:

- `[4, "lmax = Math.max(lmax, h[l]);"]` — highlighted whenever the visualizer is on Python line 4.
  Several lines may share a number (a Python one-liner that needs two lines here).
- `"}"` — never highlighted (closing braces, blank lines, declarations Python doesn't need).

Rules (checked by `node scripts/check-visualizer-code.mjs`):

- Every Python line number `1..code.length` appears at least once, in order, and no other numbers.
- Keep it the same snippet as the Python — same variable names, same structure, no I/O
  boilerplate beyond what the Python shows (`print(x)` → `console.log(x)` / `System.out.println(x)` / `cout << x << endl`).
- JavaScript must parse; braces balance in every language.
