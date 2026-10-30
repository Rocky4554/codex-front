"use client";
import { motion } from "motion/react";

// UML sequence diagram: one lifeline per participant, time flows downward,
// messages are revealed one at a time via shownCount / activeIndex.
const INK = "#a1a1aa";
const MUTE = "#71717a";
const ACCENT = "#10b981";
const PAPER = "#09090b";

const HEADER_H = 44;
const MSG_GAP = 36;
const FIRST_MSG_Y = HEADER_H + 24;

function Arrowhead({ x, y, dir, color, open }) {
    // dir: +1 pointing right, −1 pointing left
    if (open) {
        return (
            <g stroke={color} strokeWidth="1.5">
                <line x1={x} y1={y} x2={x - dir * 9} y2={y - 4.5} />
                <line x1={x} y1={y} x2={x - dir * 9} y2={y + 4.5} />
            </g>
        );
    }
    return <polygon points={`${x},${y} ${x - dir * 10},${y - 5} ${x - dir * 10},${y + 5}`} fill={color} />;
}

function Message({ msg, y, xOf, visible, active }) {
    const color = active ? ACCENT : msg.kind === "return" ? MUTE : INK;
    const fx = xOf(msg.from);
    const tx = xOf(msg.to);
    const isReturn = msg.kind === "return";

    let body;
    if (msg.kind === "self") {
        // Loop out to the right and back onto the same lifeline.
        const w = 30;
        body = (
            <>
                <path
                    d={`M ${fx} ${y} H ${fx + w} V ${y + 15} H ${fx + 7}`}
                    fill="none"
                    stroke={color}
                    strokeWidth="1.5"
                />
                <Arrowhead x={fx + 4} y={y + 15} dir={-1} color={color} />
                <text x={fx + w + 8} y={y + 10} fontSize="10.5" fontFamily="monospace" fill={color}>
                    {msg.label}
                </text>
            </>
        );
    } else {
        const dir = tx > fx ? 1 : -1;
        const endX = tx - dir * 3;
        body = (
            <>
                <line
                    x1={fx}
                    y1={y}
                    x2={endX}
                    y2={y}
                    stroke={color}
                    strokeWidth="1.5"
                    strokeDasharray={isReturn ? "5 4" : undefined}
                />
                <Arrowhead x={endX} y={y} dir={dir} color={color} open={isReturn} />
                <text
                    x={(fx + tx) / 2}
                    y={y - 6}
                    textAnchor="middle"
                    fontSize="10.5"
                    fontFamily="monospace"
                    fill={color}
                    style={{ paintOrder: "stroke", stroke: PAPER, strokeWidth: 4 }}
                >
                    {msg.label}
                </text>
            </>
        );
    }

    return (
        <motion.g initial={false} animate={{ opacity: visible ? 1 : 0 }} transition={{ duration: 0.25 }}>
            {body}
        </motion.g>
    );
}

/**
 * view = {
 *   actors:   [{ id, label, kind?: "actor" }],
 *   messages: [{ id, from, to, label, kind: "call" | "return" | "self" }],
 *   shownCount?,   // how many messages are revealed (default: all)
 *   activeIndex?,  // which revealed message is "current" (default: none)
 * }
 */
export function SequenceView({ view }) {
    const { actors, messages } = view;
    const shown = view.shownCount ?? messages.length;
    const activeIdx = view.activeIndex ?? -1;

    const colW = Math.max(120, ...actors.map((a) => a.label.length * 7.5 + 30));
    const xOf = (id) => {
        const i = actors.findIndex((a) => a.id === id);
        return 16 + i * colW + colW / 2;
    };
    const width = 32 + actors.length * colW;
    const bottom = FIRST_MSG_Y + messages.length * MSG_GAP + 4;

    return (
        <svg
            width={width}
            height={bottom + 8}
            className="mx-auto block select-none"
            role="img"
            aria-label="Sequence diagram"
        >
            {actors.map((a) => {
                const x = xOf(a.id);
                return (
                    <g key={a.id}>
                        {/* lifeline */}
                        <line x1={x} y1={HEADER_H} x2={x} y2={bottom} stroke="#3f3f46" strokeWidth="1" strokeDasharray="4 4" />
                        {/* header: stick figure for actors, a box for objects */}
                        {a.kind === "actor" ? (
                            <g stroke={INK} strokeWidth="1.5" fill="none">
                                <circle cx={x} cy={10} r={4.5} />
                                <line x1={x} y1={14.5} x2={x} y2={24} />
                                <line x1={x - 6} y1={18} x2={x + 6} y2={18} />
                                <line x1={x} y1={24} x2={x - 5} y2={31} />
                                <line x1={x} y1={24} x2={x + 5} y2={31} />
                            </g>
                        ) : (
                            <rect
                                x={x - (a.label.length * 7 + 16) / 2}
                                y={6}
                                width={a.label.length * 7 + 16}
                                height={22}
                                rx={4}
                                fill="#121214"
                                stroke="#52525b"
                                strokeWidth="1"
                            />
                        )}
                        <text
                            x={x}
                            y={a.kind === "actor" ? 42 : 21}
                            textAnchor="middle"
                            fontSize="11"
                            fontFamily="monospace"
                            fill="#d4d4d8"
                        >
                            {a.label}
                        </text>
                    </g>
                );
            })}
            {messages.map((m, i) => (
                <Message
                    key={m.id}
                    msg={m}
                    y={FIRST_MSG_Y + i * MSG_GAP}
                    xOf={xOf}
                    visible={i < shown}
                    active={i === activeIdx}
                />
            ))}
        </svg>
    );
}
