// Interview-prep tracks. Each track has a question bank in questions-*.js.
// icon = Material Symbols name (already loaded app-wide).
export const tracks = [
    { id: "dsa", label: "DSA Patterns", icon: "timeline", color: "emerald", blurb: "Pattern recognition, complexity, classic traps" },
    { id: "sql", label: "SQL & Databases", icon: "database", color: "sky", blurb: "Joins, indexes, transactions, query tuning" },
    { id: "lld", label: "Low-Level Design", icon: "schema", color: "amber", blurb: "OOP, SOLID, design patterns, class modelling" },
    { id: "hld", label: "System Design (HLD)", icon: "hub", color: "violet", blurb: "Scale, caching, queues, consistency, estimation" },
    { id: "javascript", label: "JavaScript", icon: "javascript", color: "yellow", blurb: "Closures, event loop, prototypes, async" },
    { id: "typescript", label: "TypeScript", icon: "code_blocks", color: "blue", blurb: "Types, generics, narrowing, utility types" },
    { id: "react", label: "React", icon: "deployed_code", color: "cyan", blurb: "Hooks, rendering, state, performance" },
    { id: "backend", label: "Backend & APIs", icon: "dns", color: "orange", blurb: "REST, auth, caching, idempotency, Node" },
    { id: "spring", label: "Spring Boot & Java", icon: "coffee", color: "lime", blurb: "Beans, JPA, transactions, annotations" },
    { id: "ai", label: "AI Systems & RAG", icon: "smart_toy", color: "rose", blurb: "RAG pipelines, embeddings, evals, agents" },
];

export const trackById = Object.fromEntries(tracks.map((t) => [t.id, t]));

// Tailwind needs literal class names — map track colors here.
export const trackColors = {
    emerald: { text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30", bar: "bg-emerald-500" },
    sky: { text: "text-sky-400", bg: "bg-sky-500/10", border: "border-sky-500/30", bar: "bg-sky-500" },
    amber: { text: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/30", bar: "bg-amber-500" },
    violet: { text: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/30", bar: "bg-violet-500" },
    yellow: { text: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/30", bar: "bg-yellow-500" },
    blue: { text: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/30", bar: "bg-blue-500" },
    cyan: { text: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/30", bar: "bg-cyan-500" },
    orange: { text: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/30", bar: "bg-orange-500" },
    lime: { text: "text-lime-400", bg: "bg-lime-500/10", border: "border-lime-500/30", bar: "bg-lime-500" },
    rose: { text: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/30", bar: "bg-rose-500" },
};
