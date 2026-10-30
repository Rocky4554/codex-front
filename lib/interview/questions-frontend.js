// Question banks: JavaScript, TypeScript, React.
export const frontendQuestions = [
    // ── JavaScript ───────────────────────────────────────────────────────
    {
        id: "js-1", track: "javascript", difficulty: "easy",
        q: "Explain the event loop: microtasks vs macrotasks, with the classic output question.",
        a: "- Call stack empties → **all microtasks** run (promises, queueMicrotask, MutationObserver) → one **macrotask** (setTimeout, I/O) → repeat; rendering happens between macrotasks.\n```js\nconsole.log(1);\nsetTimeout(() => console.log(2));\nPromise.resolve().then(() => console.log(3));\nconsole.log(4);\n// 1 4 3 2  ← promise beats timeout\n```\n- `await x` parks the rest of the function as a microtask.\n- A microtask that queues microtasks can starve rendering — that's why long chains jank.",
    },
    {
        id: "js-2", track: "javascript", difficulty: "easy",
        q: "Closures: what are they, and the loop-variable trap?",
        a: "- A closure is a function + its captured **lexical scope** — the variables themselves, not copies.\n```js\nfor (var i = 0; i < 3; i++)\n  setTimeout(() => console.log(i)); // 3 3 3 — one shared i\nfor (let i = 0; i < 3; i++)\n  setTimeout(() => console.log(i)); // 0 1 2 — let = new binding per iteration\n```\n- Practical uses: module privacy, memoization, debounce/throttle (timer lives in the closure).\n- Leak angle: a closure keeps its whole captured scope alive — detach listeners you no longer need.",
    },
    {
        id: "js-3", track: "javascript", difficulty: "medium",
        q: "`this` binding rules — and what arrow functions change.",
        a: "Priority order when a function runs:\n1. `new` → fresh object.\n2. `call/apply/bind` → explicit.\n3. `obj.fn()` → the object before the dot.\n4. bare `fn()` → `undefined` in strict mode (globalThis otherwise).\n\n- **Arrow functions have no `this`** — they capture it lexically at definition, and `call/bind` can't change it. Perfect for callbacks, wrong for object methods and anything needing dynamic `this`.\n- Classic bug: passing `obj.method` as a callback loses the receiver → `obj.method.bind(obj)` or wrap in an arrow.",
    },
    {
        id: "js-4", track: "javascript", difficulty: "medium",
        q: "Prototypal inheritance: what happens on property lookup, and what does `class` desugar to?",
        a: "- Lookup walks the object, then `__proto__` chain, until `null`. Writes go on the object itself (shadowing).\n- `new F()`: creates obj with `__proto__ = F.prototype`, runs F with `this` = obj.\n- `class` is sugar: methods land on `C.prototype`, `extends` chains the prototypes, `super` walks up. Still prototypes underneath — `typeof C === 'function'`.\n- `Object.create(proto)` = inheritance without constructors; `hasOwnProperty` / `Object.keys` see own properties only, `in` and `for…in` see the chain.",
    },
    {
        id: "js-5", track: "javascript", difficulty: "medium",
        q: "Debounce vs throttle — definitions, use cases, and sketch a debounce.",
        a: "- **Debounce:** run only after N ms of silence (search-as-you-type, resize end, autosave).\n- **Throttle:** run at most once per N ms while events keep firing (scroll position, drag, mousemove).\n```js\nfunction debounce(fn, ms) {\n  let t;\n  return function (...args) {\n    clearTimeout(t);\n    t = setTimeout(() => fn.apply(this, args), ms);\n  };\n}\n```\n- Follow-ups: leading-edge option (fire immediately, then quiet period), and cancel() for unmount cleanup.",
    },
    {
        id: "js-6", track: "javascript", difficulty: "medium",
        q: "Promise combinators: all / allSettled / race / any — differences and a concurrency-limit question.",
        a: "- **all:** resolves with array; **rejects fast** on first failure.\n- **allSettled:** never rejects — array of {status, value|reason}; use for independent tasks.\n- **race:** first settle wins (timeouts: race(fetch, delay(5s).then(reject))).\n- **any:** first **fulfillment**; rejects only if all reject (AggregateError).\n- Concurrency limit (common follow-up): a worker-pool — start K workers, each pulls the next task from a shared index until exhausted; `await Promise.all(workers)`.",
    },
    {
        id: "js-7", track: "javascript", difficulty: "easy",
        q: "== vs ===, and the handful of coercion facts worth knowing.",
        a: "- `===` no coercion; `==` coerces (null == undefined is the one useful case).\n- Facts interviewers probe: `NaN !== NaN` (use `Number.isNaN`), `typeof null === 'object'`, `[] + [] === ''`, `'5' - 1 === 4` but `'5' + 1 === '51'` (+ prefers strings).\n- Falsy list is closed: `false, 0, -0, 0n, '', null, undefined, NaN` — everything else is truthy (including `[]` and `{}`).\n- `??` only treats null/undefined as missing — use it over `||` when 0 or '' are valid values.",
    },

    // ── TypeScript ───────────────────────────────────────────────────────
    {
        id: "ts-1", track: "typescript", difficulty: "easy",
        q: "interface vs type — real differences, and which do you default to?",
        a: "- Both type object shapes. **interface:** declaration-merging (augmenting libs), `extends` with better error messages. **type:** unions, intersections, mapped/conditional types, primitives, tuples.\n- Performance/ergonomics are near-identical today.\n- Common convention: `interface` for public object contracts (extendable), `type` for unions and compositions. Consistency beats the choice itself.",
    },
    {
        id: "ts-2", track: "typescript", difficulty: "medium",
        q: "unknown vs any vs never — and where each legitimately appears.",
        a: "- **any:** opts out of checking both ways — contagious; a cast from any can poison a codebase.\n- **unknown:** safe top type — you can assign anything **to** it, but must **narrow** before use. Right type for `catch (e)`, JSON.parse results, network payloads.\n- **never:** no value exists — unreachable code, exhaustive switch default:\n```ts\ndefault: const _x: never = shape; // compile error when a variant is missed\n```\n- Line that lands: 'unknown is any with a seatbelt; never is the compiler proving exhaustiveness.'",
    },
    {
        id: "ts-3", track: "typescript", difficulty: "medium",
        q: "Narrowing: how does TS narrow types, and what's a discriminated union?",
        a: "- Narrowing via `typeof`, `instanceof`, `in`, truthiness, equality, and **type predicates** (`function isFish(p): p is Fish`).\n- Discriminated union = variants sharing a literal tag:\n```ts\ntype Shape =\n  | { kind: 'circle'; r: number }\n  | { kind: 'rect'; w: number; h: number };\n// switch (s.kind) narrows each branch fully\n```\n- The pattern for API responses, reducer actions, result types (`{ok: true, data} | {ok: false, error}`) — the compiler forces handling every case (pair with the `never` default).",
    },
    {
        id: "ts-4", track: "typescript", difficulty: "medium",
        q: "Generics with constraints: write a typed `pluck`, and explain keyof.",
        a: "```ts\nfunction pluck<T, K extends keyof T>(objs: T[], key: K): T[K][] {\n  return objs.map(o => o[key]);\n}\npluck(users, 'id')   // number[]\npluck(users, 'nope') // compile error\n```\n- `keyof T` = union of T's keys; `T[K]` = indexed access (the value type).\n- `extends` constrains what callers may pass while keeping inference.\n- Mention default type params (`<T = string>`) and that generics are erased at runtime — no `instanceof T`.",
    },
    {
        id: "ts-5", track: "typescript", difficulty: "medium",
        q: "Utility types you must know cold — and what Partial looks like implemented.",
        a: "- `Partial<T>` / `Required<T>` / `Readonly<T>`, `Pick<T, K>` / `Omit<T, K>`, `Record<K, V>`, `ReturnType<F>` / `Parameters<F>`, `Awaited<T>`, `NonNullable<T>`.\n```ts\ntype Partial<T> = { [P in keyof T]?: T[P] };   // mapped type\ntype ReturnType<F> = F extends (...a: any) => infer R ? R : never; // conditional + infer\n```\n- Knowing the *implementations* is the differentiator — it shows you can write mapped/conditional types, not just use them.",
    },
    {
        id: "ts-6", track: "typescript", difficulty: "hard",
        q: "How do you type a safe API boundary — compile-time types vs runtime validation?",
        a: "- Types are **erased**: `as ApiResponse` on fetch JSON is a promise, not a check.\n- Validate at the boundary with a schema (zod et al.): parse → typed value or error, and **infer the static type from the schema** (`z.infer<typeof schema>`) so runtime and compile-time can't drift.\n- Same idea at every trust boundary: env vars, localStorage, message queues, webhooks.\n- Inside the boundary, trust types; `satisfies` checks a value against a type **without widening** it.",
    },

    // ── React ────────────────────────────────────────────────────────────
    {
        id: "react-1", track: "react", difficulty: "easy",
        q: "What triggers a re-render, and what does React actually re-run?",
        a: "- Triggers: `setState` with a **new value** (Object.is check), parent re-render, context value change, store subscription.\n- Re-render = re-running the component function and diffing the new element tree (reconciliation) — **not** repainting the DOM; only real diffs touch the DOM.\n- Children re-render with parents by default (new element identity), regardless of props being 'the same' — that's what `React.memo` short-circuits.\n- Keys: identity across renders; index-as-key breaks state when the list reorders.",
    },
    {
        id: "react-2", track: "react", difficulty: "medium",
        q: "useEffect: dependency rules, cleanup, and the two classic bugs.",
        a: "- Runs **after paint**; cleanup runs before the next effect and on unmount.\n- Deps = every reactive value used inside — the lint rule is right; 'fixing' it by omitting deps creates **stale closures** (bug #1: interval reading old state → use functional updates or a ref).\n- Bug #2: fetch race — slow response A overwrites fresh B. Fix: cleanup sets a `cancelled` flag or aborts (`AbortController`).\n- Effects are for **synchronizing with external systems** — deriving state or responding to a click doesn't belong there.",
    },
    {
        id: "react-3", track: "react", difficulty: "medium",
        q: "useMemo / useCallback / React.memo — when do they help, and when are they noise?",
        a: "- `useMemo` caches a **value**, `useCallback` caches a **function**, `React.memo` skips a component when props are shallow-equal.\n- They only pay off together: a memoized child + stable callback props. A `useCallback` whose consumer re-renders anyway is pure noise.\n- Legit uses: expensive computation, stable deps for other hooks, context values (`useMemo` the object!), referential-equality-sensitive children (lists, charts).\n- Measure first (Profiler); and mention the React Compiler is making manual memoization increasingly obsolete.",
    },
    {
        id: "react-4", track: "react", difficulty: "medium",
        q: "Controlled vs uncontrolled components, and lifting state vs colocating.",
        a: "- **Controlled:** value lives in React state (`value` + `onChange`) — validation on each keystroke, single source of truth. **Uncontrolled:** DOM owns it, read via ref / FormData on submit — less re-rendering, simpler forms.\n- Lift state to the **lowest common parent** of components that need it — and no higher; over-lifting causes app-wide re-renders on keystrokes.\n- Derived state is computed during render, never mirrored into `useState` (the 'props in state' bug: stale copies).\n- Form libraries exist because controlled-everything at scale re-renders too much — they isolate per-field subscriptions.",
    },
    {
        id: "react-5", track: "react", difficulty: "hard",
        q: "Server vs client components in Next.js App Router — what runs where, and the serialization boundary.",
        a: "- Server components: run only on the server, can read DBs/secrets, ship **zero JS**; cannot use state/effects/handlers.\n- `\"use client\"` marks the boundary — that component **and everything it imports** ships to the browser.\n- Props crossing the boundary must be serializable (no functions/Dates-as-is/class instances).\n- Pattern: server components fetch + render data skeleton, pass data down into small client leaves (buttons, inputs). Push client boundaries as deep as possible.\n- Server components can be `children` **inside** client components — composition crosses the line, imports don't.",
    },
    {
        id: "react-6", track: "react", difficulty: "medium",
        q: "A list page is slow. Walk me through React performance debugging.",
        a: "1. **Profiler** (DevTools): who re-renders, how often, why ('highlight updates').\n2. Fix identity churn: new objects/arrays/functions created per render and passed as props → memoize or move out.\n3. Narrow subscriptions: context splitting or selector-based stores (Zustand/Redux) so a keystroke doesn't render the world.\n4. Virtualize long lists (render only the viewport).\n5. Defer non-urgent updates: `useDeferredValue` / `startTransition` for type-ahead filtering.\n6. Code-split rarely-used trees (`lazy` + `Suspense`).",
    },
    {
        id: "react-7", track: "react", difficulty: "easy",
        q: "Why are keys needed, and why is array index a bad key?",
        a: "- Reconciliation matches children between renders **by key** — without a stable key React falls back to position.\n- Index keys break when the list reorders/inserts: component **state sticks to the position**, not the item (the classic 'text stays in the wrong row after delete' bug), and DOM updates multiply.\n- Use a stable id from the data. Index is acceptable only for static, never-reordered, stateless lists.\n- Bonus: changing a key on purpose **remounts** a component — a legitimate reset-state trick.",
    },
];
