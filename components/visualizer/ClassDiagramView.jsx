"use client";
import { motion } from "motion/react";

// UML class diagram on a hand-placed grid: class positions are authored in
// grid units (x, y) and scaled by these factors, box sizes are estimated from
// text length, and relations are plain SVG lines clipped to the box borders.
const GRID_X = 200;
const GRID_Y = 176;

const INK = "#a1a1aa"; // zinc-400
const ACCENT = "#10b981"; // emerald-500
const PAPER = "#09090b"; // canvas background, used to "hollow" arrowheads

function boxSize(cls) {
    const members = [...(cls.fields || []), ...(cls.methods || [])];
    const longest = members.reduce((m, s) => Math.max(m, s.length), 0);
    const nameW = cls.name.length * 8.2 + 36;
    const w = Math.min(Math.max(nameW, longest * 6.9 + 26, 110), 300);
    const sections = (cls.fields?.length ? 1 : 0) + (cls.methods?.length ? 1 : 0);
    const h = 30 + (cls.stereotype ? 13 : 0) + members.length * 17 + sections * 9;
    return { w, h };
}

// Point where a ray from the box center toward (tx, ty) crosses the border.
function borderPoint(box, tx, ty) {
    const dx = tx - box.cx;
    const dy = ty - box.cy;
    if (dx === 0 && dy === 0) return { x: box.cx, y: box.cy };
    const r = Math.min(
        dx !== 0 ? box.w / 2 / Math.abs(dx) : Infinity,
        dy !== 0 ? box.h / 2 / Math.abs(dy) : Infinity,
    );
    return { x: box.cx + dx * r, y: box.cy + dy * r };
}

function Relation({ r, byId, visible, active }) {
    const a = byId.get(r.from);
    const b = byId.get(r.to);
    if (!a || !b) return null;

    const p1 = borderPoint(a, b.cx, b.cy); // at the `from` box
    const p2 = borderPoint(b, a.cx, a.cy); // at the `to` box
    const len = Math.hypot(p2.x - p1.x, p2.y - p1.y) || 1;
    const u = { x: (p2.x - p1.x) / len, y: (p2.y - p1.y) / len };
    const n = { x: -u.y, y: u.x };

    const stroke = active ? ACCENT : INK;
    const dashed = r.kind === "implement" || r.kind === "depend";

    let start = { ...p1 };
    let end = { ...p2 };
    const heads = [];

    if (r.kind === "inherit" || r.kind === "implement") {
        // Hollow triangle at the target (superclass / interface) end.
        const base = { x: p2.x - u.x * 12, y: p2.y - u.y * 12 };
        heads.push(
            <polygon
                key="tri"
                points={`${p2.x},${p2.y} ${base.x + n.x * 7},${base.y + n.y * 7} ${base.x - n.x * 7},${base.y - n.y * 7}`}
                fill={PAPER}
                stroke={stroke}
                strokeWidth="1.5"
            />,
        );
        end = base;
    } else if (r.kind === "compose" || r.kind === "aggregate") {
        // Diamond at the owner (`from`) end: filled = composition, hollow = aggregation.
        const mid = { x: p1.x + u.x * 8, y: p1.y + u.y * 8 };
        const tip = { x: p1.x + u.x * 16, y: p1.y + u.y * 16 };
        heads.push(
            <polygon
                key="dia"
                points={`${p1.x},${p1.y} ${mid.x + n.x * 5},${mid.y + n.y * 5} ${tip.x},${tip.y} ${mid.x - n.x * 5},${mid.y - n.y * 5}`}
                fill={r.kind === "compose" ? stroke : PAPER}
                stroke={stroke}
                strokeWidth="1.5"
            />,
        );
        start = tip;
    }
    if (r.kind === "depend" || r.kind === "associate") {
        // Open arrow at the target end.
        heads.push(
            <g key="open" stroke={stroke} strokeWidth="1.5">
                <line x1={p2.x} y1={p2.y} x2={p2.x - u.x * 10 + n.x * 5} y2={p2.y - u.y * 10 + n.y * 5} />
                <line x1={p2.x} y1={p2.y} x2={p2.x - u.x * 10 - n.x * 5} y2={p2.y - u.y * 10 - n.y * 5} />
            </g>,
        );
    }

    const midX = (start.x + end.x) / 2;
    const midY = (start.y + end.y) / 2;

    return (
        <motion.g initial={false} animate={{ opacity: visible ? 1 : 0 }} transition={{ duration: 0.3 }}>
            <line
                x1={start.x}
                y1={start.y}
                x2={end.x}
                y2={end.y}
                stroke={stroke}
                strokeWidth="1.5"
                strokeDasharray={dashed ? "5 4" : undefined}
            />
            {heads}
            {r.label && (
                <text
                    x={midX}
                    y={midY - 5}
                    textAnchor="middle"
                    fontSize="10"
                    fill={active ? ACCENT : "#71717a"}
                    style={{ paintOrder: "stroke", stroke: PAPER, strokeWidth: 4 }}
                >
                    {r.label}
                </text>
            )}
            {r.toMult && (
                <text
                    x={p2.x - u.x * 14 + n.x * 10}
                    y={p2.y - u.y * 14 + n.y * 10}
                    textAnchor="middle"
                    fontSize="10"
                    fill="#71717a"
                    style={{ paintOrder: "stroke", stroke: PAPER, strokeWidth: 4 }}
                >
                    {r.toMult}
                </text>
            )}
        </motion.g>
    );
}

function ClassBox({ box, visible, active }) {
    const { c } = box;
    return (
        <motion.div
            initial={false}
            animate={{ opacity: visible ? 1 : 0.08, scale: visible ? 1 : 0.97 }}
            transition={{ duration: 0.3 }}
            className={`absolute rounded-md border bg-[#121214] font-mono text-[11px] ${
                active
                    ? "border-emerald-500/80 shadow-[0_0_14px_rgba(16,185,129,0.18)]"
                    : "border-zinc-700"
            }`}
            style={{ left: box.left, top: box.top, width: box.w }}
        >
            <div className="px-2 py-1.5 text-center border-b border-zinc-800">
                {c.stereotype && (
                    <div className="text-[9px] text-zinc-500 leading-none mb-0.5">«{c.stereotype}»</div>
                )}
                <div className={`font-semibold ${active ? "text-emerald-300" : "text-zinc-200"} ${c.stereotype ? "italic" : ""}`}>
                    {c.name}
                </div>
            </div>
            {c.fields?.length > 0 && (
                <div className="px-2 py-1 border-b border-zinc-800">
                    {c.fields.map((f) => (
                        <div key={f} className="text-zinc-400 leading-[17px] whitespace-nowrap">{f}</div>
                    ))}
                </div>
            )}
            {c.methods?.length > 0 && (
                <div className="px-2 py-1">
                    {c.methods.map((m) => (
                        <div key={m} className="text-zinc-300 leading-[17px] whitespace-nowrap">{m}</div>
                    ))}
                </div>
            )}
        </motion.div>
    );
}

/**
 * view = { classes, relations, shownClassIds?, shownRelIds?, activeIds? }
 * Omitted shown* means "show everything". activeIds may contain class or
 * relation ids. Hidden classes stay as faint ghosts so the layout reads.
 */
export function ClassDiagramView({ view }) {
    const boxes = view.classes.map((c) => {
        const { w, h } = boxSize(c);
        const left = c.x * GRID_X;
        const top = c.y * GRID_Y;
        return { c, left, top, w, h, cx: left + w / 2, cy: top + h / 2 };
    });
    const byId = new Map(boxes.map((b) => [b.c.id, b]));
    const shownC = new Set(view.shownClassIds ?? view.classes.map((c) => c.id));
    const shownR = new Set(view.shownRelIds ?? view.relations.map((r) => r.id));
    const active = new Set(view.activeIds ?? []);
    const width = Math.max(...boxes.map((b) => b.left + b.w)) + 8;
    const height = Math.max(...boxes.map((b) => b.top + b.h)) + 8;

    return (
        <div className="relative mx-auto select-none" style={{ width, height }} role="img" aria-label="Class diagram">
            <svg width={width} height={height} className="absolute left-0 top-0" style={{ overflow: "visible", pointerEvents: "none" }}>
                {view.relations.map((r) => (
                    <Relation
                        key={r.id}
                        r={r}
                        byId={byId}
                        visible={shownR.has(r.id) && shownC.has(r.from) && shownC.has(r.to)}
                        active={active.has(r.id)}
                    />
                ))}
            </svg>
            {boxes.map((b) => (
                <ClassBox key={b.c.id} box={b} visible={shownC.has(b.c.id)} active={active.has(b.c.id)} />
            ))}
        </div>
    );
}
