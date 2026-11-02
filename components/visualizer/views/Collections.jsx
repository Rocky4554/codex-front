"use client";
import { AnimatePresence, motion } from "motion/react";
import { FADE, SMOOTH, TONE_CELL, TONE_DEFAULT } from "./tones";

const show = (v) => (v === null || v === undefined ? "∅" : Array.isArray(v) ? `[${v.join(", ")}]` : String(v));

function Flip({ text, className = "" }) {
    return (
        <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
                key={text}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={FADE}
                className={className}
            >
                {text}
            </motion.span>
        </AnimatePresence>
    );
}

/** Hash map / set / counter: rows fade in as keys are added, values flip when they change. */
export function MapView({ s }) {
    if (s.entries.length === 0) {
        return <p className="font-mono text-xs text-zinc-600 py-2">{s.set ? "{ } empty set" : "{ } empty map"}</p>;
    }
    return (
        <motion.div layout className="flex flex-wrap gap-1.5">
            <AnimatePresence initial={false}>
                {s.entries.map(([k, v]) => {
                    const tone = s.tones[k] || (s.hot === k ? "active" : null);
                    return (
                        <motion.div
                            key={k}
                            layout
                            initial={{ opacity: 0, scale: 0.85 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.85 }}
                            transition={SMOOTH}
                            className={`flex items-center overflow-hidden rounded-md border font-mono text-xs transition-colors duration-300 ${TONE_CELL[tone] || TONE_DEFAULT}`}
                        >
                            <span className="px-2 py-1">{k}</span>
                            {!s.set && (
                                <>
                                    <span className="self-stretch w-px bg-current opacity-20" />
                                    <span className="px-2 py-1 min-w-[1.5rem] text-center">
                                        <Flip text={show(v)} />
                                    </span>
                                </>
                            )}
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </motion.div>
    );
}

/** Stack: grows upward; pushes drop in from above, pops lift out. */
export function StackView({ s }) {
    return (
        <div className="flex items-end gap-3">
            <div className="flex min-h-[52px] min-w-[72px] flex-col-reverse items-stretch gap-1 rounded-b-lg border-x-2 border-b-2 border-zinc-700 px-1.5 pb-1.5 pt-3">
                <AnimatePresence initial={false}>
                    {s.items.map((it, i) => (
                        <motion.div
                            key={it.id}
                            layout
                            initial={{ opacity: 0, y: -24 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -24 }}
                            transition={SMOOTH}
                            className={`rounded-md border px-3 py-1 text-center font-mono text-xs transition-colors duration-300 ${
                                TONE_CELL[s.tones[i]] || (i === s.items.length - 1 ? TONE_CELL.compare : TONE_DEFAULT)
                            }`}
                        >
                            {show(it.v)}
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
            <span className="pb-1 font-mono text-[10px] text-zinc-600">{s.items.length ? "← top" : "empty"}</span>
        </div>
    );
}

/** Queue: enqueue slides in from the right, dequeue leaves to the left. */
export function QueueView({ s }) {
    return (
        <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] text-zinc-600">front →</span>
            <div className="flex min-h-[40px] min-w-[80px] items-center gap-1 rounded-lg border-y-2 border-zinc-700 px-1.5 py-1">
                <AnimatePresence initial={false} mode="popLayout">
                    {s.items.map((it, i) => (
                        <motion.div
                            key={it.id}
                            layout
                            initial={{ opacity: 0, x: 24 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -24 }}
                            transition={SMOOTH}
                            className={`rounded-md border px-2.5 py-1 font-mono text-xs transition-colors duration-300 ${
                                TONE_CELL[s.tones[i]] || (i === 0 ? TONE_CELL.compare : TONE_DEFAULT)
                            }`}
                        >
                            {show(it.v)}
                        </motion.div>
                    ))}
                </AnimatePresence>
                {s.items.length === 0 && <span className="px-2 font-mono text-[11px] text-zinc-600">empty</span>}
            </div>
            <span className="font-mono text-[10px] text-zinc-600">← back</span>
        </div>
    );
}

/** Recursion: frames push on top; a returned value pops out as a badge before the frame leaves. */
export function CallsView({ s }) {
    return (
        <div className="flex flex-col-reverse items-start gap-1">
            <AnimatePresence initial={false}>
                {s.frames.map((f, i) => {
                    const top = i === s.frames.length - 1;
                    return (
                        <motion.div
                            key={`${i}-${f.label}`}
                            layout
                            initial={{ opacity: 0, x: -16 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 16 }}
                            transition={SMOOTH}
                            style={{ marginLeft: i * 14 }}
                            className={`flex items-center gap-2 rounded-md border px-2.5 py-1 font-mono text-xs transition-colors duration-300 ${
                                TONE_CELL[f.tone] || (top ? TONE_CELL.active : TONE_DEFAULT)
                            }`}
                        >
                            {f.label}
                            {f.value !== undefined && (
                                <motion.span
                                    initial={{ opacity: 0, scale: 0.6 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={SMOOTH}
                                    className="rounded bg-amber-300 px-1.5 text-[10px] font-bold text-black"
                                >
                                    → {show(f.value)}
                                </motion.span>
                            )}
                        </motion.div>
                    );
                })}
            </AnimatePresence>
            {s.frames.length === 0 && <span className="font-mono text-[11px] text-zinc-600">(empty)</span>}
        </div>
    );
}

export function ValueView({ s }) {
    return (
        <div className={`inline-flex rounded-md border px-3 py-1.5 font-mono text-sm transition-colors duration-300 ${TONE_CELL[s.tone] || TONE_DEFAULT}`}>
            <Flip text={s.v} />
        </div>
    );
}
