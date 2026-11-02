"use client";
import { motion } from "motion/react";
import { SMOOTH, TONE_SVG, TONE_SVG_DEFAULT, pointerChip } from "./tones";

const NODE = 40;
const GAP = 30;
const PITCH = NODE + GAP;
const TOP = 46; // room for arcs above
const ROW = TOP + NODE;

/**
 * Nodes sit in fixed slots; `next` links are drawn as arrows whose paths
 * morph when a link is rewired (reversal, merge, cycle), so you can watch
 * the pointer flip instead of the whole list re-rendering.
 */
export function LinkedListView({ s, width }) {
    const n = s.nodes.length;
    const slot = new Map(s.nodes.map((node, i) => [node.id, i]));
    const svgW = Math.max(n * PITCH - GAP + 40, 120);
    const scale = Math.min(1, width / svgW);
    const cx = (i) => 20 + i * PITCH + NODE / 2;

    const links = s.nodes.map((node) => {
        const to = s.next[node.id];
        const a = slot.get(node.id);
        if (to == null || !slot.has(to)) {
            return { id: node.id, d: `M ${cx(a) + NODE / 2} ${TOP + NODE / 2} L ${cx(a) + NODE / 2 + 14} ${TOP + NODE / 2}`, isNull: true, a };
        }
        const b = slot.get(to);
        if (b === a + 1) {
            const x1 = cx(a) + NODE / 2, x2 = cx(b) - NODE / 2 - 2, y = TOP + NODE / 2;
            return { id: node.id, d: `M ${x1} ${y} C ${x1 + 8} ${y} ${x2 - 8} ${y} ${x2} ${y}`, a };
        }
        // Backward or long links arc: backward below, forward above.
        const back = b < a;
        const x1 = cx(a), x2 = cx(b);
        const y1 = back ? TOP + NODE : TOP, y2 = y1;
        const lift = Math.min(40, 16 + Math.abs(a - b) * 8) * (back ? 1 : -1);
        return { id: node.id, d: `M ${x1} ${y1} C ${x1} ${y1 + lift} ${x2} ${y2 + lift} ${x2} ${y2 + (back ? 3 : -3)}`, a };
    });

    const byNode = new Map();
    for (const p of s.pointers) {
        if (!byNode.has(p.node)) byNode.set(p.node, []);
        byNode.get(p.node).push(p.name);
    }

    return (
        <div className="mx-auto" style={{ width: svgW * scale }}>
            <svg width={svgW * scale} height={(ROW + 48) * scale} viewBox={`0 0 ${svgW} ${ROW + 48}`} className="overflow-visible">
                <defs>
                    <marker id={`arrow-${s.id}`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                        <path d="M 0 0 L 10 5 L 0 10 z" fill="#71717a" />
                    </marker>
                </defs>
                {links.map((l) => (
                    <motion.path
                        key={l.id}
                        initial={false}
                        animate={{ d: l.d, opacity: l.isNull ? 0.35 : 1 }}
                        transition={SMOOTH}
                        fill="none"
                        stroke="#71717a"
                        strokeWidth="1.6"
                        markerEnd={l.isNull ? undefined : `url(#arrow-${s.id})`}
                    />
                ))}
                {links.filter((l) => l.isNull).map((l) => (
                    <text key={`null-${l.id}`} x={cx(l.a) + NODE / 2 + 18} y={TOP + NODE / 2 + 4} fontSize="11" fill="#52525b" fontFamily="monospace">∅</text>
                ))}
                {s.nodes.map((node, i) => {
                    const t = TONE_SVG[s.tones[node.id]] || TONE_SVG_DEFAULT;
                    return (
                        <g key={node.id}>
                            <motion.rect
                                x={cx(i) - NODE / 2}
                                y={TOP}
                                width={NODE}
                                height={NODE}
                                rx="10"
                                initial={false}
                                animate={{ fill: t.fill, stroke: t.stroke }}
                                transition={{ duration: 0.3 }}
                                strokeWidth="1.6"
                            />
                            <text x={cx(i)} y={TOP + NODE / 2 + 4} textAnchor="middle" fontSize="13" fontFamily="monospace" fill={t.text}>
                                {String(node.v)}
                            </text>
                        </g>
                    );
                })}
            </svg>
            {/* pointer chips glide between node slots */}
            <div className="relative" style={{ height: 22 * Math.max(1, ...[...byNode.values()].map((v) => v.length)) }}>
                {s.pointers.map((p) => {
                    const i = slot.get(p.node);
                    if (i == null) return null;
                    const lane = byNode.get(p.node).indexOf(p.name);
                    return (
                        <motion.span
                            key={p.name}
                            className={`absolute top-0 -translate-x-1/2 rounded px-1.5 py-[1px] font-mono text-[10px] font-bold whitespace-nowrap ${pointerChip(p.name)}`}
                            initial={false}
                            animate={{ left: cx(i) * scale, y: lane * 20 }}
                            transition={SMOOTH}
                        >
                            {p.name}
                        </motion.span>
                    );
                })}
            </div>
            {s.nullPointers.length > 0 && (
                <p className="mt-1 font-mono text-[10px] text-zinc-500">{s.nullPointers.join(", ")} = null</p>
            )}
        </div>
    );
}
