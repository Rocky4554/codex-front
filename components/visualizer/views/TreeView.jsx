"use client";
import { motion } from "motion/react";
import { SMOOTH, TONE_SVG, TONE_SVG_DEFAULT, pointerStroke } from "./tones";

const R = 17;
const LEVEL = 58;

/** In-order position gives x, depth gives y — a tidy layout without overlaps. */
function layout(nodes, root) {
    const pos = {};
    let order = 0;
    let depthMax = 0;
    const walk = (id, depth) => {
        if (id == null || !nodes[id]) return;
        walk(nodes[id].left, depth + 1);
        pos[id] = { order: order++, depth };
        depthMax = Math.max(depthMax, depth);
        walk(nodes[id].right, depth + 1);
    };
    walk(root, 0);
    return { pos, count: order, depthMax };
}

/** Binary tree: node colors cross-fade, the traversal pointer glides as a ring. */
export function TreeView({ s, width }) {
    const { pos, count, depthMax } = layout(s.nodes, s.root);
    if (count === 0) return <p className="font-mono text-xs text-zinc-600 py-2">(empty tree)</p>;

    const w = Math.max(160, Math.min(width, count * 52 + 20));
    const h = (depthMax + 1) * LEVEL + 10;
    const x = (id) => ((pos[id].order + 0.5) / count) * (w - 20) + 10;
    const y = (id) => pos[id].depth * LEVEL + R + 6;
    const ids = Object.keys(pos);

    return (
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="mx-auto block overflow-visible">
            {ids.flatMap((id) =>
                ["left", "right"]
                    .map((side) => s.nodes[id][side])
                    .filter((c) => c != null && pos[c])
                    .map((c) => (
                        <line key={`${id}-${c}`} x1={x(id)} y1={y(id)} x2={x(c)} y2={y(c)} stroke="#3f3f46" strokeWidth="1.5" />
                    )),
            )}
            {ids.map((id) => {
                const t = TONE_SVG[s.tones[id]] || TONE_SVG_DEFAULT;
                return (
                    <g key={id}>
                        <motion.circle
                            cx={x(id)}
                            cy={y(id)}
                            r={R}
                            initial={false}
                            animate={{ fill: t.fill, stroke: t.stroke }}
                            transition={{ duration: 0.3 }}
                            strokeWidth="1.6"
                        />
                        <text x={x(id)} y={y(id) + 4} textAnchor="middle" fontSize="12" fontFamily="monospace" fill={t.text}>
                            {String(s.nodes[id].v)}
                        </text>
                        {s.badges[id] != null && (
                            <motion.text
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                x={x(id) + R + 3}
                                y={y(id) - R + 6}
                                fontSize="10"
                                fontFamily="monospace"
                                fill="#fcd34d"
                            >
                                {String(s.badges[id])}
                            </motion.text>
                        )}
                    </g>
                );
            })}
            {s.pointers.map((p, i) =>
                pos[p.node] ? (
                    <g key={p.name}>
                        <motion.circle
                            initial={false}
                            animate={{ cx: x(p.node), cy: y(p.node) }}
                            transition={SMOOTH}
                            r={R + 4 + i * 3}
                            fill="none"
                            stroke={pointerStroke(p.name)}
                            strokeWidth="2"
                            strokeDasharray={i ? "4 3" : undefined}
                        />
                        <motion.text
                            initial={false}
                            animate={{ x: x(p.node), y: y(p.node) - R - 8 - i * 11 }}
                            transition={SMOOTH}
                            textAnchor="middle"
                            fontSize="10"
                            fontWeight="700"
                            fontFamily="monospace"
                            fill={pointerStroke(p.name)}
                        >
                            {p.name}
                        </motion.text>
                    </g>
                ) : null,
            )}
        </svg>
    );
}
