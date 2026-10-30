// Question banks: Backend & APIs, Spring Boot & Java, AI Systems & RAG.
export const backendQuestions = [
    // ── Backend & APIs ───────────────────────────────────────────────────
    {
        id: "be-1", track: "backend", difficulty: "easy",
        q: "Design a clean REST API: resources, status codes, and the mistakes reviewers look for.",
        a: "- Nouns + hierarchy: `GET /users/42/orders`, filters in query params; verbs only for true actions (`POST /orders/42/cancel`).\n- Codes: 200/201 (+Location), 204 no body, 400 validation, 401 unauthenticated vs **403 unauthorized**, 404, 409 conflict, 422 semantic, 429 rate limit.\n- Mistakes: 200-with-error-in-body, unbounded list endpoints (always paginate), breaking changes without versioning, PUT vs PATCH confusion (replace vs partial).\n- Pagination: cursor/keyset for anything that grows — offset breaks under concurrent inserts and gets slow deep in.",
    },
    {
        id: "be-2", track: "backend", difficulty: "medium",
        q: "JWT vs server sessions — trade-offs, storage, and refresh flow.",
        a: "- **Sessions:** state in a store, cookie holds the id — instant revocation, tiny cookie; needs a shared store (Redis) across nodes.\n- **JWT:** self-contained, verified by signature — no lookup, great for service-to-service; **cannot be revoked** before expiry (mitigate: short TTL ~15m + refresh-token rotation + denylist for logout).\n- Browser storage: httpOnly+Secure+SameSite cookie beats localStorage (XSS can't read it); then handle CSRF (SameSite or tokens).\n- Refresh flow: access token short-lived; refresh token rotated on use, reuse-detection kills the family.",
    },
    {
        id: "be-3", track: "backend", difficulty: "medium",
        q: "Idempotency: why POST retries are dangerous and how to make them safe.",
        a: "- Network timeout ≠ failure — the server may have processed it; a blind retry double-charges.\n- Client sends an **Idempotency-Key**; server stores key → response atomically with the side effect (same transaction / unique constraint), replays the stored response on retry.\n- GET/PUT/DELETE are idempotent by contract; POST needs the key; consumers of at-least-once queues need the same discipline (dedupe table or upsert).\n- The unique constraint is the real guarantee — check-then-insert races; **insert-and-catch-conflict** doesn't.",
    },
    {
        id: "be-4", track: "backend", difficulty: "medium",
        q: "Node.js concurrency: how does one thread serve thousands of connections, and what kills it?",
        a: "- Event loop + non-blocking I/O: requests park while awaiting I/O (kernel/libuv), callbacks resume — concurrency without threads.\n- Killers: **CPU-bound work** (JSON.parse on 50MB, bcrypt, image resize) blocks every request → offload to worker_threads or a queue; sync APIs (`fs.readFileSync`) in handlers.\n- libuv threadpool (default 4) quietly serializes fs/dns/crypto — raise `UV_THREADPOOL_SIZE` when those saturate.\n- Scale-out: one process per core (cluster/PM2) behind the LB; keep processes stateless.",
    },
    {
        id: "be-5", track: "backend", difficulty: "hard",
        q: "Distributed transactions: why 2PC is avoided, and what the saga pattern does instead.",
        a: "- 2PC blocks: a crashed coordinator leaves participants holding locks; availability dies with it.\n- **Saga:** sequence of local transactions, each publishing an event; failures trigger **compensating actions** (refund, release inventory) instead of rollback.\n- Orchestration (central saga service — easier to reason/debug) vs choreography (services react to events — looser, harder to trace).\n- You accept intermediate states being visible → design them explicitly (order = PENDING_PAYMENT).\n- **Outbox pattern** makes 'write DB + publish event' atomic: write the event to an outbox table in the same transaction; a relay/CDC publishes it.",
    },
    {
        id: "be-6", track: "backend", difficulty: "medium",
        q: "Observability: logs vs metrics vs traces — and what you add to debug a slow endpoint in prod.",
        a: "- **Logs:** discrete events, high cardinality, expensive to query. **Metrics:** cheap aggregates (p50/p95/p99, RPS, errors) — alerting lives here. **Traces:** one request's journey across services with per-span timing.\n- Slow endpoint: check p95/p99 (not avg), pull traces of slow requests → which span dominates (DB? downstream? serialization?), correlate via **request-id propagated everywhere**.\n- Structured (JSON) logs with the trace id; RED method per service: Rate, Errors, Duration.\n- Say 'p99' not 'average' — tail latency is what users feel and what interviewers listen for.",
    },

    // ── Spring Boot & Java ───────────────────────────────────────────────
    {
        id: "sp-1", track: "spring", difficulty: "easy",
        q: "Dependency injection in Spring: bean lifecycle, scopes, and constructor vs field injection.",
        a: "- Container scans (`@Component`, `@Service`, `@Repository`, `@Configuration`+`@Bean`), builds the graph, injects.\n- Scopes: **singleton** (default, one per container), prototype, request/session (web).\n- **Constructor injection wins:** final fields, impossible to construct half-wired, trivially testable with plain `new`. Field `@Autowired` hides dependencies and needs reflection in tests.\n- Circular dependency = design smell; the constructor-injection failure is a feature telling you to extract a third bean.",
    },
    {
        id: "sp-2", track: "spring", difficulty: "medium",
        q: "@Transactional: how it works, and the self-invocation + rollback gotchas.",
        a: "- Works via **proxy**: calls enter a wrapper that begins/commits the transaction.\n- **Gotcha 1 — self-invocation:** `this.otherMethod()` bypasses the proxy → no transaction. Fix: move to another bean (or inject self).\n- **Gotcha 2 — rollback rules:** rolls back on unchecked exceptions only; checked exceptions commit unless `rollbackFor = Exception.class`.\n- Only `public` methods (CGLIB proxying); propagation matters: `REQUIRED` joins, `REQUIRES_NEW` suspends (audit logs that must survive rollback).\n- Keep transactions short — no HTTP calls inside.",
    },
    {
        id: "sp-3", track: "spring", difficulty: "medium",
        q: "JPA/Hibernate: the N+1 problem — detect and fix.",
        a: "- Lazy `@OneToMany`: load 100 orders, touch `order.getItems()` in a loop → 1 + 100 queries.\n- Detect: enable SQL logging in dev / p6spy; tests asserting query counts.\n- Fixes:\n  - `JOIN FETCH` in JPQL (or `@EntityGraph`) for that use case.\n  - `@BatchSize(size=50)` → turns N queries into N/50 `IN` queries.\n  - Projections/DTO queries for read paths that don't need entities.\n- Keep associations **lazy by default**; fetch eagerly per-query, not per-mapping. Mention `open-in-view: false` to surface these in dev.",
    },
    {
        id: "sp-4", track: "spring", difficulty: "easy",
        q: "How does Spring Boot auto-configuration work, and how do you override it?",
        a: "- `@SpringBootApplication` = `@Configuration` + `@ComponentScan` + `@EnableAutoConfiguration`.\n- Auto-config classes (listed in `AutoConfiguration.imports`) apply under `@Conditional` rules: `@ConditionalOnClass` (jar present), `@ConditionalOnMissingBean` (you haven't defined one), `@ConditionalOnProperty`.\n- Override: define your own bean (yours wins via OnMissingBean), set properties (`application.yml`), or exclude the auto-config.\n- Starters are curated dependency sets that bring the classes that trigger the conditions — that's the whole magic.",
    },
    {
        id: "sp-5", track: "spring", difficulty: "medium",
        q: "Java concurrency essentials: volatile vs synchronized vs AtomicInteger, and where virtual threads fit.",
        a: "- **volatile:** visibility only (no atomicity) — flags, publish-once references.\n- **synchronized/locks:** mutual exclusion + visibility — compound actions (check-then-act).\n- **Atomic*:** lock-free CAS — counters, accumulators; `ConcurrentHashMap.compute` for per-key atomicity.\n- `count++` on volatile is still a race (read-modify-write).\n- **Virtual threads (Java 21):** cheap threads parked on blocking I/O → thread-per-request scales again without reactive code; they don't help CPU-bound work, and `synchronized` blocks that pin carriers are the current caveat.",
    },
    {
        id: "sp-6", track: "spring", difficulty: "medium",
        q: "Spring REST exception handling and validation — the clean setup.",
        a: "- `@RestControllerAdvice` + `@ExceptionHandler` = one place mapping exceptions → consistent error JSON (code, message, traceId); never leak stack traces.\n- Validation: `@Valid @RequestBody` + Jakarta annotations (`@NotBlank`, `@Email`, custom validators) → handle `MethodArgumentNotValidException` into field-error lists (400).\n- Domain exceptions (`OrderNotFound`) map to 404/409 — keep HTTP mapping in the advice, not in services.\n- Use **ProblemDetail** (RFC 7807, built in since Spring 6) instead of inventing an error shape.",
    },

    // ── AI Systems & RAG ─────────────────────────────────────────────────
    {
        id: "ai-1", track: "ai", difficulty: "easy",
        q: "Sketch a production RAG pipeline end to end.",
        a: "**Ingest:** load → clean → **chunk** (~300-800 tokens, overlap, respect structure: headings/code blocks) → embed → vector store with **metadata** (source, date, ACL).\n**Query:** embed query → top-k similarity (+ metadata filters) → **rerank** (cross-encoder) → stuff top 3-5 into the prompt with instructions to cite and to say 'not found' when absent → generate.\n**Hard-won details:** hybrid search (BM25 + vectors) beats either alone; chunking quality moves the needle more than model choice; store chunk→source mapping for citations; evaluate retrieval separately from generation.",
    },
    {
        id: "ai-2", track: "ai", difficulty: "medium",
        q: "Embeddings & vector search: cosine similarity, ANN indexes, and when vector search fails.",
        a: "- Embeddings map text to vectors where semantic similarity ≈ cosine similarity (normalize → dot product).\n- Exact k-NN is O(n) per query → **ANN indexes**: HNSW (graph, fast, memory-hungry, the default), IVF (cluster + probe, cheaper); recall vs latency is tunable.\n- Fails on: exact identifiers (error codes, SKUs, names — BM25 wins), negation ('not X' embeds near 'X'), out-of-domain jargon, cross-lingual unless trained for it.\n- Hence **hybrid retrieval + reranker** as the default answer; mention pgvector for 'just use Postgres' scale.",
    },
    {
        id: "ai-3", track: "ai", difficulty: "medium",
        q: "RAG vs fine-tuning vs long context — how do you choose?",
        a: "- **RAG:** knowledge that changes, needs citations/ACLs, must not be memorized. Updates = re-index, not re-train.\n- **Fine-tuning:** *behavior* — format, tone, domain style, tool-use patterns; NOT a reliable way to add facts (hallucinates confidently).\n- **Long context:** small, stable corpus that fits — simplest; but cost/latency per call scales with tokens and recall degrades in the middle ('lost in the middle').\n- Real systems stack: RAG for facts + small fine-tune (or good prompting) for behavior + context caching for the static preamble.",
    },
    {
        id: "ai-4", track: "ai", difficulty: "hard",
        q: "How do you evaluate an LLM system before and after shipping?",
        a: "- **Offline:** golden dataset of real queries → score. Retrieval: recall@k, MRR. Generation: faithfulness (claims supported by context?), relevance, format compliance. **LLM-as-judge** scales it — calibrate the judge against ~50 human-labeled examples first.\n- **Regression gate in CI:** prompts/models change → eval suite runs → block on score drops.\n- **Online:** thumbs up/down, 'did they rephrase?', task completion, escalation rate; canary new prompts to 5%.\n- Log every (query, retrieved chunks, answer) — that corpus becomes tomorrow's eval set. Evals are the moat, say that.",
    },
    {
        id: "ai-5", track: "ai", difficulty: "medium",
        q: "Agents and tool use: when do you give the model tools, and what guardrails are non-negotiable?",
        a: "- Tools when the model must **act or fetch live truth**: search, DB queries, calculators, code execution, ticket creation. Agent = loop: model picks tool → result fed back → repeat until done.\n- Guardrails:\n  - Typed schemas + validation on every tool call (treat args as untrusted input).\n  - **Least privilege:** read-only tools by default; destructive actions behind human confirmation.\n  - Step/cost budgets to stop loops; timeouts.\n  - Log every call for audit/replay.\n- Prompt injection: retrieved/web content can hijack instructions → separate it from the system prompt, never let fetched text authorize actions.",
    },
    {
        id: "ai-6", track: "ai", difficulty: "medium",
        q: "LLM cost & latency engineering: the levers that actually matter.",
        a: "- **Model routing:** cheap/fast model for easy intents, big model for hard ones (classifier or heuristic in front).\n- **Prompt caching:** stable system prompt + docs prefix → cached tokens cost a fraction; order prompt so the static part comes first.\n- **Streaming:** time-to-first-token is UX latency; stream everything user-facing.\n- Cap output tokens (output costs more than input); batch offline jobs; semantic cache for repeated questions.\n- Measure per-feature: tokens × price per request, p95 TTFT — put it on a dashboard before optimizing.",
    },
    {
        id: "ai-7", track: "ai", difficulty: "easy",
        q: "Why do LLMs hallucinate, and what reduces it in practice?",
        a: "- They sample the most plausible next token — plausibility ≠ truth; gaps get filled fluently, and RLHF rewards confident answers.\n- Mitigations that work:\n  1. **Ground with RAG** + instruct 'answer only from context; say I don't know otherwise'.\n  2. Require **citations** → verifiable claims, and checkable automatically.\n  3. Structured outputs + validators for anything machine-consumed.\n  4. Lower temperature for factual tasks.\n  5. Eval faithfulness continuously (judge: 'is every claim supported?').\n- Be honest: reduced, never eliminated — design the product so wrong answers are cheap to catch.",
    },
];
