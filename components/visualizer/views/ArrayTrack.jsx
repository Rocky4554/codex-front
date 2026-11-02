"use client";
import { AnimatePresence, motion } from "motion/react";
import { FADE, SMOOTH, TONE_CELL, TONE_DEFAULT, pointerChip } from "./tones";

const GAP = 6;
const BAR_AREA = 132;

/** Fit cells to the available width: 26–48px. */
export function cellSize(width, n) {
    if (!n) return 48;
    return Math.max(26, Math.min(48, Math.floor((width - GAP * (n - 1)) / n)));
}

function Value({ v, size }) {
    const text = v === null || v === undefined ? "∅" : String(v);
    const font = size < 34 || text.length > 3 ? "text-[11px]" : "text-sm";
    // whitespace-nowrap: wide values widen the cell rather than wrapping inside it
    return (
        <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
                key={text}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={FADE}
                className={`font-mono ${font} leading-none whitespace-nowrap`}
            >
                {text}
            </motion.span>
        </AnimatePresence>
    );
}

/**
 * Array / string cells. Items with stable ids slide to their new slot when
 * they move (layout animation); pointers glide along a track below; the
 * window range is a shaded band that stretches and slides.
 */
export function ArrayTrack({ s, width }) {
    const n = s.items.length;
    const cell = cellSize(width, n); // cell height (and width for short values)
    // Wide values ("-1, -1, 2", "push 1") get wider cells instead of wrapping.
    const longest = Math.max(1, ...s.items.map((it) => String(it.v ?? "∅").length));
    const fit = n ? Math.floor((width - GAP * (n - 1)) / n) : cell;
    const cellW = s.bars ? cell : Math.max(cell, Math.min(Math.ceil(longest * 7.2 + 16), 120, Math.max(fit, cell)));
    const pitch = cellW + GAP;
    const total = Math.max(0, n * pitch - GAP);
    const maxAbs = s.bars ? Math.max(1, ...s.items.map((it) => Math.abs(Number(it.v) || 0)), ...(s.water || []).map((w, i) => w + (Number(s.items[i]?.v) || 0))) : 1;

    // Pointers on the same index stack into lanes.
    const lanes = new Map();
    const placed = s.pointers.map((p) => {
        const lane = lanes.get(p.index) || 0;
        lanes.set(p.index, lane + 1);
        return { ...p, lane };
    });
    const laneCount = Math.max(1, ...[...lanes.values()]);

    if (n === 0) {
        return <p className="text-center font-mono text-xs text-zinc-600 py-3">[ ] empty</p>;
    }

    return (
        <div className="relative mx-auto" style={{ width: total }}>
            {/* sliding window band */}
            {s.window && s.window[1] >= s.window[0] && (
                <motion.div
                    className="absolute rounded-xl border border-sky-400/40 bg-sky-400/[0.07]"
                    initial={false}
                    animate={{
                        x: s.window[0] * pitch - 4,
                        width: (s.window[1] - s.window[0] + 1) * pitch - GAP + 8,
                    }}
                    transition={SMOOTH}
                    style={{ top: -4, height: (s.bars ? BAR_AREA : cell) + 8 }}
                />
            )}

            {/* cells */}
            <div className="relative flex items-end" style={{ gap: GAP, height: s.bars ? BAR_AREA : cell }}>
                {s.items.map((it, i) => {
                    const tone = s.tones[i];
                    const cls = TONE_CELL[tone] || TONE_DEFAULT;
                    if (s.bars) {
                        const v = Number(it.v) || 0;
                        const h = Math.max(4, (Math.abs(v) / maxAbs) * (BAR_AREA - 18));
                        const water = s.water?.[i] || 0;
                        const wh = (water / maxAbs) * (BAR_AREA - 18);
                        return (
                            <motion.div key={it.id} layout transition={SMOOTH} className="flex flex-col items-center justify-end" style={{ width: cell, height: BAR_AREA }}>
                                <motion.div
                                    className="w-full rounded-t-sm bg-sky-400/35 border-x border-t border-sky-300/40"
                                    initial={false}
                                    animate={{ height: wh, opacity: water > 0 ? 1 : 0 }}
                                    transition={SMOOTH}
                                />
                                <motion.div
                                    className={`w-full border transition-colors duration-300 ${water > 0 ? "" : "rounded-t-md"} ${cls}`}
                                    initial={false}
                                    animate={{ height: h }}
                                    transition={SMOOTH}
                                />
                            </motion.div>
                        );
                    }
                    return (
                        <motion.div
                            key={it.id}
                            layout
                            transition={SMOOTH}
                            className={`relative shrink-0 rounded-lg border flex items-center justify-center overflow-hidden transition-colors duration-300 ${cls}`}
                            // Highlighted (usually moving) cells pass over the others, not under.
                            style={{ width: cellW, height: cell, zIndex: tone ? 2 : 1 }}
                        >
                            <Value v={it.v} size={cell} />
                        </motion.div>
                    );
                })}
            </div>

            {/* bar values sit under the bars when the bar is too short to hold them */}
            {s.bars && (
                <div className="flex mt-1" style={{ gap: GAP }}>
                    {s.items.map((it) => (
                        <motion.span key={it.id} layout transition={SMOOTH} className="text-center font-mono text-[10px] text-zinc-400" style={{ width: cell }}>
                            {String(it.v)}
                        </motion.span>
                    ))}
                </div>
            )}

            {/* index labels (fixed slots, they don't travel with the values) */}
            {!s.hideIndex && (
                <div className="flex mt-1" style={{ gap: GAP }}>
                    {s.items.map((_, i) => (
                        <span key={i} className="text-center font-mono text-[10px] text-zinc-600 truncate" style={{ width: cellW }}>
                            {s.indexLabels?.[i] ?? i}
                        </span>
                    ))}
                </div>
            )}

            {/* pointer track */}
            {placed.length > 0 && (
                <div className="relative mt-1" style={{ height: laneCount * 24 + 4 }}>
                    {placed.map((p) => {
                        const clamped = Math.max(-1, Math.min(p.index, n));
                        return (
                            <motion.div
                                key={p.name}
                                className="absolute top-0 flex flex-col items-center"
                                initial={false}
                                animate={{ x: clamped * pitch, y: p.lane * 24, opacity: p.index < 0 || p.index >= n ? 0.45 : 1 }}
                                transition={SMOOTH}
                                style={{ width: cellW }}
                            >
                                <span className="text-[9px] leading-none text-zinc-400">▲</span>
                                <span className={`mt-0.5 rounded px-1.5 py-[1px] font-mono text-[10px] font-bold whitespace-nowrap ${pointerChip(p.name, p.tone)}`}>
                                    {p.name}
                                </span>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
