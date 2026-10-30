// Question banks: DSA, SQL, LLD, HLD. Answers are markdown, written to be
// read in 30 seconds the night before an interview.
export const coreQuestions = [
    // ── DSA ──────────────────────────────────────────────────────────────
    {
        id: "dsa-1", track: "dsa", difficulty: "easy",
        q: "How do you recognize a two-pointer problem, and when does it beat a hash map?",
        a: "**Signals:** sorted input, pairs/triplets with a target, in-place partitioning, palindromes.\n\n- Sorted + target sum → pointers from both ends: O(n) time, **O(1) space** (hash map costs O(n) space and ignores the sortedness).\n- Unsorted + target → hash map is O(n); sorting first just to use pointers costs O(n log n).\n- Fast/slow variant detects cycles (Floyd) and finds middles without extra memory.",
    },
    {
        id: "dsa-2", track: "dsa", difficulty: "medium",
        q: "Sliding window: fixed vs variable — how do you decide and what's the invariant?",
        a: "- **Fixed window (size k):** 'max/avg of every k-length subarray'. Add the entering element, remove the leaving one — never recompute.\n- **Variable window:** 'longest/shortest subarray satisfying X'. Grow `right` every step; shrink `left` **only while the invariant is broken**.\n- The invariant is the answer to 'what must stay true inside the window?' (e.g. ≤ k distinct chars, sum < target).\n- Each pointer moves at most n times → O(n), even with the inner while-loop.",
    },
    {
        id: "dsa-3", track: "dsa", difficulty: "medium",
        q: "When do you use a heap vs sorting vs quickselect for 'top-K' problems?",
        a: "- **Heap of size K:** stream or huge n — O(n log K) time, O(K) space. Min-heap for top-K largest.\n- **Quickselect:** one-shot kth element in memory — O(n) average, O(n²) worst, in-place.\n- **Full sort:** when you need all elements ordered anyway, or n is small — O(n log n).\n- Interview tiebreak: say heap for streaming, quickselect for 'kth only', and mention bucket/counting sort when values are bounded (e.g. frequencies ≤ n).",
    },
    {
        id: "dsa-4", track: "dsa", difficulty: "medium",
        q: "BFS vs DFS vs Dijkstra — which shortest path when?",
        a: "- **BFS:** unweighted graph → fewest edges. O(V+E).\n- **0-1 BFS (deque):** weights only 0 or 1.\n- **Dijkstra (min-heap):** non-negative weights. O((V+E) log V). Fails on negative edges.\n- **Bellman-Ford:** negative edges, detects negative cycles. O(V·E).\n- Grid problems are graphs: cells = nodes, moves = edges. 'Minimum steps' on a grid = BFS, almost always.",
    },
    {
        id: "dsa-5", track: "dsa", difficulty: "hard",
        q: "How do you spot a DP problem, and what are the two standard formulations?",
        a: "**Signals:** 'count the ways', 'min/max cost to reach', choices at each step, overlapping subproblems after drawing the recursion tree.\n\n1. **Top-down:** recurse + memoize. Easier to derive; state = function arguments.\n2. **Bottom-up:** table filled in dependency order; enables space optimization (keep only the last row — knapsack, LCS).\n\nDefine the state in one sentence ('dp[i] = best answer using first i items') **before** writing code — most DP failures are undefined states, not code bugs.",
    },
    {
        id: "dsa-6", track: "dsa", difficulty: "medium",
        q: "Monotonic stack: what problems does it solve and why is it O(n)?",
        a: "- Solves 'next greater/smaller element', daily temperatures, largest rectangle in histogram, trapping rain water.\n- Keep the stack monotonic (e.g. decreasing). When a new element breaks it, **pop and resolve** each popped element — the new one is its answer.\n- O(n) because each index is pushed once and popped at most once, regardless of the nested while.\n- Histogram trick: a popped bar's rectangle spans from the new top (exclusive) to the current index (exclusive).",
    },
    {
        id: "dsa-7", track: "dsa", difficulty: "easy",
        q: "Binary search beyond sorted arrays: what is 'binary search on the answer'?",
        a: "- Works whenever a predicate `can(x)` is **monotonic**: false…false,true…true.\n- Search the answer space, not the array: 'min capacity to ship in D days', 'Koko's eating speed', 'min largest-sum split'.\n- Template: `lo, hi` = answer bounds; while lo < hi: `mid = (lo+hi)//2`; if `can(mid)` → `hi = mid` else `lo = mid+1`.\n- Always state the invariant: lo is the smallest value not yet ruled out; hi is a known-feasible bound.",
    },

    // ── SQL ──────────────────────────────────────────────────────────────
    {
        id: "sql-1", track: "sql", difficulty: "easy",
        q: "INNER vs LEFT vs FULL JOIN — and why do rows multiply?",
        a: "- **INNER:** only matching rows. **LEFT:** all left rows, NULLs where right misses. **FULL:** union of both.\n- Rows multiply because a join emits **one row per matching pair** — a 1-to-many join duplicates the 'one' side. Aggregate after joining (or pre-aggregate in a subquery/CTE) to avoid double counting.\n- Filter trap: a WHERE condition on the right table turns a LEFT JOIN into an INNER one — put the condition in the **ON** clause to keep unmatched rows.",
    },
    {
        id: "sql-2", track: "sql", difficulty: "medium",
        q: "How does a B-tree index work, and when does the optimizer ignore it?",
        a: "- Sorted tree of keys → O(log n) lookups, range scans, and ORDER BY for free.\n- **Composite index (a, b):** usable for `a` and `a,b` — not for `b` alone (leftmost-prefix rule).\n- Ignored when: a function wraps the column (`LOWER(email)` — use a functional index), leading wildcard `LIKE '%x'`, implicit type casts, low selectivity (optimizer prefers a scan past ~10-20% of rows), or OR across different columns.\n- **Covering index:** includes every selected column → answers from the index alone, no table lookup.",
    },
    {
        id: "sql-3", track: "sql", difficulty: "medium",
        q: "Window functions: ROW_NUMBER vs RANK vs DENSE_RANK, and the top-N-per-group pattern.",
        a: "- On ties: `ROW_NUMBER` 1,2,3 (arbitrary), `RANK` 1,1,3 (gaps), `DENSE_RANK` 1,1,2.\n- Top-N per group:\n```sql\nSELECT * FROM (\n  SELECT *, ROW_NUMBER() OVER (\n    PARTITION BY dept ORDER BY salary DESC) rn\n  FROM emp) t\nWHERE rn <= 3;\n```\n- Unlike GROUP BY, window functions **keep every row** while adding the aggregate beside it (`SUM(x) OVER (...)` for running totals, `LAG/LEAD` for prev/next row).",
    },
    {
        id: "sql-4", track: "sql", difficulty: "hard",
        q: "Explain transaction isolation levels and the anomalies each one allows.",
        a: "| Level | Dirty read | Non-repeatable | Phantom |\n|---|---|---|---|\n| READ UNCOMMITTED | ✓ | ✓ | ✓ |\n| READ COMMITTED | ✗ | ✓ | ✓ |\n| REPEATABLE READ | ✗ | ✗ | ✓* |\n| SERIALIZABLE | ✗ | ✗ | ✗ |\n\n- Postgres default = READ COMMITTED; MySQL InnoDB = REPEATABLE READ (*and its MVCC blocks most phantoms).\n- MVCC: readers see a snapshot, writers don't block readers.\n- Classic probe: two concurrent `UPDATE balance = balance - 100` — row locks serialize them; the lost-update risk is read-then-write in app code (fix: `SELECT … FOR UPDATE` or optimistic version column).",
    },
    {
        id: "sql-5", track: "sql", difficulty: "medium",
        q: "A query is slow. Walk me through debugging it.",
        a: "1. `EXPLAIN ANALYZE` — find seq scans on big tables, bad row estimates, nested loops over huge sets.\n2. Check indexes match the predicate + join keys (and the leftmost-prefix rule).\n3. `SELECT *`? Fetch only needed columns (enables covering indexes, cuts I/O).\n4. N+1 from the ORM? Batch with joins or `IN`.\n5. Pagination: replace `OFFSET 100000` with **keyset** (`WHERE id > last_seen ORDER BY id LIMIT 50`).\n6. Stale statistics → `ANALYZE`; then consider denormalization/materialized views for hot aggregates.",
    },
    {
        id: "sql-6", track: "sql", difficulty: "easy",
        q: "GROUP BY vs HAVING vs WHERE — order of execution?",
        a: "- Logical order: **FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT**.\n- WHERE filters rows **before** grouping (can use indexes); HAVING filters groups **after** aggregation.\n- So `HAVING COUNT(*) > 5` is legal, `WHERE COUNT(*) > 5` is not.\n- Column aliases from SELECT aren't visible in WHERE/HAVING (they don't exist yet) but are in ORDER BY.",
    },
    {
        id: "sql-7", track: "sql", difficulty: "medium",
        q: "Normalization vs denormalization — when do you break 3NF on purpose?",
        a: "- 1NF atomic values → 2NF no partial dependency on a composite key → 3NF no transitive dependencies.\n- Normalize for write-heavy OLTP: one fact lives in one place, updates can't disagree.\n- Denormalize deliberately for read-heavy paths: duplicated author_name on posts, counter columns (likes_count), materialized aggregates — accepting that writes must now update two places (trigger/transaction/async job).\n- Interview line: 'normalize until it hurts, denormalize until it works — but name the consistency cost.'",
    },

    // ── LLD ──────────────────────────────────────────────────────────────
    {
        id: "lld-1", track: "lld", difficulty: "easy",
        q: "SOLID in one line each — with a failure example for L and D.",
        a: "- **S**ingle responsibility: one reason to change.\n- **O**pen/closed: add classes, don't edit working ones.\n- **L**iskov: subtypes must honor the base contract. *Violation:* `Square extends Rectangle` breaks `setWidth` expectations.\n- **I**nterface segregation: many small interfaces over one fat one.\n- **D**ependency inversion: depend on abstractions. *Violation:* `OrderService` constructing `new StripeClient()` inside — inject a `PaymentGateway` interface instead, which is also what makes it testable.",
    },
    {
        id: "lld-2", track: "lld", difficulty: "medium",
        q: "Strategy vs State vs Template Method — they look identical in UML. Difference?",
        a: "- **Strategy:** *caller* picks the algorithm, interchangeable, usually stateless (pricing rules, retry policies).\n- **State:** the *object itself* transitions between behaviors; each state knows its successors (order lifecycle: Placed→Paid→Shipped).\n- **Template Method:** inheritance, not composition — base class owns the skeleton, subclasses fill marked holes.\n- Rule of thumb: 'who decides the switch?' Caller → Strategy. The object's lifecycle → State. The framework → Template Method.",
    },
    {
        id: "lld-3", track: "lld", difficulty: "medium",
        q: "Design a parking lot — what are the classes and the key decisions?",
        a: "- `ParkingLot` → `Floor[]` → `Spot[]` (spot has a `SpotType`: bike/car/large).\n- `Vehicle` hierarchy only for data; **fit logic lives in Spot** (`canFit(vehicle)`), not in if-chains.\n- `Ticket` (entry time, spot) issued by `EntryGate`; `PricingStrategy` interface (hourly, weekend, lost ticket) → Strategy pattern.\n- `SpotAllocator` interface (nearest-first, random) keeps assignment swappable.\n- Concurrency: allocating a spot must be atomic — lock per floor or an atomic claim on the spot.\n- Say the extension story: EV spots = new SpotType + ChargingDecorator, zero edits to existing classes.",
    },
    {
        id: "lld-4", track: "lld", difficulty: "medium",
        q: "Composition over inheritance — why, and when is inheritance still right?",
        a: "- Inheritance is the **strongest** coupling: subclasses inherit every future change and you get one axis of variation. Two axes (e.g. Shape × RenderStyle) explode into a class per combination.\n- Composition: inject behaviors (has-a) → mix at runtime, test in isolation, change independently.\n- Inheritance is right when there's a true is-a with a **stable contract** and the base is designed for extension (Template Method, framework hooks).\n- Decorator is the classic rescue: wrap to add behavior (BufferedReader, middleware) instead of subclassing.",
    },
    {
        id: "lld-5", track: "lld", difficulty: "hard",
        q: "Design a rate limiter class — token bucket vs sliding window, thread safety?",
        a: "- Interface: `boolean allow(clientId)` — callers don't know the algorithm (Strategy again).\n- **Token bucket:** capacity + refill rate; allows bursts up to capacity; O(1) memory per client. Lazy refill: on each call, `tokens = min(cap, tokens + elapsed × rate)`.\n- **Sliding window log:** exact, but O(requests) memory. Sliding window **counter** approximates cheaply (weighted previous + current bucket).\n- Thread safety: per-client lock or atomic CAS on (tokens, lastRefill); never a global lock.\n- Distributed version: state moves to Redis + Lua script for atomicity — the class stays the same, the store is injected.",
    },
    {
        id: "lld-6", track: "lld", difficulty: "easy",
        q: "Singleton: how to implement it safely, and why is it often a smell?",
        a: "- Safe Java: `enum Singleton` or a `static final` holder class (JVM guarantees once-only init). Lazy + threads → double-checked locking with `volatile`.\n- Smell because: hidden global state, hard to test (can't substitute), hidden dependencies, concurrency hazards.\n- Interview-grade answer: 'I'd let the **DI container** manage one instance (singleton *scope*) instead of hard-coding the pattern — same guarantee, still injectable and mockable.'",
    },
    {
        id: "lld-7", track: "lld", difficulty: "medium",
        q: "Observer vs Pub/Sub vs Event Bus — what actually differs?",
        a: "- **Observer:** subject holds direct references to observers; synchronous, in-process, strong typing.\n- **Pub/Sub:** a broker (topic) sits between — publishers and subscribers never meet; enables async, retries, fan-out across processes.\n- Trade: Observer is simple but couples lifetimes (forgetting detach = memory leak); Pub/Sub decouples but adds delivery semantics (at-least-once? ordering?).\n- An in-process 'event bus' is Pub/Sub topology with Observer mechanics — name the delivery guarantees when asked.",
    },

    // ── HLD ──────────────────────────────────────────────────────────────
    {
        id: "hld-1", track: "hld", difficulty: "easy",
        q: "Walk me through your first 5 minutes of any system design interview.",
        a: "1. **Functional scope:** 3-4 core features, explicitly park the rest.\n2. **Non-functional:** DAU, read:write ratio, latency target, consistency needs.\n3. **Envelope math:** e.g. 10M DAU × 10 reads = 100M/day ≈ **1.2K QPS** (×3 peak); storage = items/day × size × retention.\n4. **API sketch:** 3-5 endpoints with request/response shape.\n5. Only then boxes: client → LB → stateless services → cache → DB, and spend the time on the 2 hard parts the numbers exposed.",
    },
    {
        id: "hld-2", track: "hld", difficulty: "medium",
        q: "Cache strategies: cache-aside vs write-through vs write-behind, and the two classic cache problems.",
        a: "- **Cache-aside:** app reads cache → miss → DB → fill. Simple, most common; stale until TTL/invalidation.\n- **Write-through:** write cache+DB together — reads always warm, writes slower.\n- **Write-behind:** write cache, flush async — fast writes, risk of loss.\n- **Stampede:** hot key expires → thousands hit DB. Fix: per-key mutex ('single flight'), jittered TTLs, or serve-stale-while-revalidate.\n- **Invalidation:** delete-on-write beats update-on-write (avoids racing writers); event-driven invalidation via CDC for multi-service setups.",
    },
    {
        id: "hld-3", track: "hld", difficulty: "medium",
        q: "SQL vs NoSQL in an interview — what's the honest decision tree?",
        a: "- Relational by default: transactions, joins, flexible queries, mature tooling. Postgres scales further than interviewers pretend (read replicas + partitioning).\n- Key-value/wide-column (DynamoDB/Cassandra) when: access pattern is **known and key-based**, write volume is massive, and you can model around no joins.\n- Document when the entity is naturally a blob read whole (product catalog).\n- Search → Elasticsearch; analytics → columnar; cache → Redis.\n- Strong line: 'choose per access pattern, not per fashion — and polyglot is normal: OLTP in Postgres, search index fed by CDC.'",
    },
    {
        id: "hld-4", track: "hld", difficulty: "hard",
        q: "Design a URL shortener — the 4 decisions that actually matter.",
        a: "1. **Code generation:** counter + base62 (7 chars ≈ 3.5T) — but a global counter is a SPOF → range-allocated counters per node, or random + retry on collision.\n2. **Read path:** 100:1 read-heavy → Redis cache in front, 301 vs 302 (301 is cached by browsers = fewer hits but no analytics; pick 302 if clicks matter).\n3. **Storage:** key→URL is a perfect KV fit; partitioning by code is trivial.\n4. **Non-obvious:** custom aliases (uniqueness check), expiry (TTL + lazy delete), abuse (rate limit creation, blocklist), analytics via async event stream — never inline on redirect.",
    },
    {
        id: "hld-5", track: "hld", difficulty: "hard",
        q: "CAP, PACELC, and what 'eventual consistency' means you must handle in the product.",
        a: "- CAP: under a **p**artition, choose availability (serve possibly-stale) or consistency (refuse/503).\n- PACELC: even without partitions, you trade latency vs consistency (sync replication = slow writes).\n- Eventual consistency product costs: read-your-own-writes (fix: session stickiness or read-from-primary briefly), monotonic reads, stale counters (show '~1.2K likes').\n- Strong consistency where money/inventory lives; eventual where feeds/counters live — say it per-feature, not per-system.",
    },
    {
        id: "hld-6", track: "hld", difficulty: "medium",
        q: "Message queues: when do you add Kafka/SQS, and what new problems arrive?",
        a: "- Add a queue to: absorb spikes (write buffering), decouple producers from slow consumers, fan out one event to many services, retry safely.\n- New problems you now own:\n  - **At-least-once delivery** → consumers must be **idempotent** (dedupe key or upsert).\n  - **Ordering** only per partition/key — pick the partition key to match the invariant (per-user ordering → key by userId).\n  - **Backlog** monitoring (consumer lag), DLQs for poison messages.\n- Exactly-once is usually 'at-least-once + idempotent consumer' in practice.",
    },
    {
        id: "hld-7", track: "hld", difficulty: "medium",
        q: "How do you scale WebSockets / real-time to millions of connections?",
        a: "- Connections are **stateful** → LB with sticky routing (or L4) onto a fleet of gateway nodes; each node holds ~100K-1M conns (tune FDs, heartbeats).\n- Gateways stay dumb: they hold sockets; **business services publish to Redis Pub/Sub / Kafka**, gateways subscribe and push to their local sockets.\n- Presence/routing table: userId → gateway node (Redis).\n- Fallbacks: SSE or long-polling; mobile → push notifications when the socket is gone.\n- Backpressure: drop/coalesce updates per client (send latest state, not every tick).",
    },
];
