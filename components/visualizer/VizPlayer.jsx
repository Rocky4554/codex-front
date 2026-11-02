"use client";
import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, LayoutGroup, MotionConfig, motion } from "motion/react";
import { runApproach } from "@/lib/visualizer/engine";
import { StructureView } from "./views/StructureView";
import { FADE, SMOOTH } from "./views/tones";

const SPEEDS = [0.5, 1, 1.5, 2, 3];
const BASE_MS = 1300;

function useWidth() {
    const ref = useRef(null);
    const [width, setWidth] = useState(480);
    useLayoutEffect(() => {
        const el = ref.current;
        if (!el) return;
        const ro = new ResizeObserver(([entry]) => setWidth(Math.floor(entry.contentRect.width)));
        ro.observe(el);
        return () => ro.disconnect();
    }, []);
    return [ref, width];
}

function Chip({ active, onClick, children, title }) {
    return (
        <button
            type="button"
            title={title}
            onClick={onClick}
            className={`rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${
                active
                    ? "border-emerald-500/60 bg-emerald-500/10 text-emerald-300"
                    : "border-zinc-700 text-zinc-400 hover:bg-zinc-800 hover:text-white"
            }`}
        >
            {children}
        </button>
    );
}

function IconButton({ title, onClick, disabled, icon }) {
    return (
        <button
            type="button"
            title={title}
            onClick={onClick}
            disabled={disabled}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-700 text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white disabled:pointer-events-none disabled:opacity-30"
        >
            <span className="material-symbols-outlined text-[18px]">{icon}</span>
        </button>
    );
}

/** Plays one computed run (steps for a fixed input + approach). Remounted when either changes. */
function Run({ approach, run }) {
    const uid = useId();
    const [canvasRef, width] = useWidth();
    const steps = run.steps;
    const [idx, setIdx] = useState(0);
    const [playing, setPlaying] = useState(false);
    const [speed, setSpeed] = useState(1);
    const atEnd = idx >= steps.length - 1;

    const next = useCallback(() => setIdx((i) => Math.min(i + 1, steps.length - 1)), [steps.length]);
    const prev = useCallback(() => setIdx((i) => Math.max(i - 1, 0)), []);

    useEffect(() => {
        if (!playing || atEnd) return;
        const t = setTimeout(() => {
            if (idx + 1 >= steps.length - 1) setPlaying(false);
            next();
        }, BASE_MS / speed);
        return () => clearTimeout(t);
    }, [playing, idx, speed, atEnd, next, steps.length]);

    // ← → step, Space play/pause, Home restart — ignored while typing or in the editor.
    useEffect(() => {
        const onKey = (e) => {
            const t = e.target;
            if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable || t.closest?.(".monaco-editor"))) return;
            if (e.key === "ArrowRight") { setPlaying(false); next(); }
            else if (e.key === "ArrowLeft") { setPlaying(false); prev(); }
            else if (e.key === " ") { e.preventDefault(); setPlaying((p) => !p); }
            else if (e.key === "Home") { setPlaying(false); setIdx(0); }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [next, prev]);

    const step = steps[idx];
    const vars = Object.entries(step.vars || {});
    const progress = steps.length > 1 ? idx / (steps.length - 1) : 1;

    return (
        <LayoutGroup id={uid}>
            {/* Canvas */}
            <div ref={canvasRef} className="relative overflow-hidden rounded-xl border border-zinc-800 bg-[#09090b] px-4 py-5">
                <div className="space-y-5">
                    {step.structures.map((s) => (
                        <StructureView key={s.id} s={s} width={width - 32} />
                    ))}
                </div>
                {atEnd && run.answer !== undefined && (
                    <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={SMOOTH}
                        className="mt-4 inline-flex items-center gap-2 rounded-lg border border-amber-400/50 bg-amber-400/10 px-3 py-1.5 text-xs"
                    >
                        <span className="material-symbols-outlined text-[16px] text-amber-300">emoji_events</span>
                        <span className="text-zinc-400">Answer</span>
                        <span className="font-mono whitespace-pre text-amber-200">{String(run.answer)}</span>
                    </motion.div>
                )}
            </div>

            {/* Narration */}
            <div className="mt-3 min-h-[68px] rounded-lg border border-zinc-800 bg-[#18181b] px-4 py-3">
                <div className="mb-1 flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-widest text-zinc-500">{approach.label}</span>
                    <span className="font-mono text-[11px] tabular-nums text-zinc-500">
                        step {idx + 1}/{steps.length}
                    </span>
                </div>
                <AnimatePresence mode="wait" initial={false}>
                    <motion.p
                        key={idx}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.18 }}
                        className="leading-relaxed text-zinc-200"
                    >
                        {step.note}
                    </motion.p>
                </AnimatePresence>
            </div>

            {/* Controls */}
            <div className="mt-3 flex items-center gap-2">
                <IconButton title="Restart (Home)" onClick={() => { setPlaying(false); setIdx(0); }} disabled={idx === 0} icon="replay" />
                <IconButton title="Previous step (←)" onClick={() => { setPlaying(false); prev(); }} disabled={idx === 0} icon="chevron_left" />
                <button
                    type="button"
                    title={playing ? "Pause (Space)" : "Play (Space)"}
                    onClick={() => {
                        if (atEnd && !playing) setIdx(0);
                        setPlaying((p) => !p);
                    }}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-black shadow-[0_0_18px_rgba(16,185,129,0.35)] transition-colors hover:bg-emerald-400"
                >
                    <span className="material-symbols-outlined text-[22px]">{playing ? "pause" : atEnd ? "replay" : "play_arrow"}</span>
                </button>
                <IconButton title="Next step (→)" onClick={() => { setPlaying(false); next(); }} disabled={atEnd} icon="chevron_right" />
                <div className="relative mx-1 flex-1">
                    <div className="h-1.5 overflow-hidden rounded-full bg-zinc-800">
                        <motion.div
                            className="h-full rounded-full bg-emerald-500"
                            initial={false}
                            animate={{ width: `${progress * 100}%` }}
                            transition={{ duration: 0.35, ease: "easeOut" }}
                        />
                    </div>
                    <input
                        type="range"
                        min={0}
                        max={steps.length - 1}
                        value={idx}
                        onChange={(e) => { setPlaying(false); setIdx(Number(e.target.value)); }}
                        aria-label="Scrub through steps"
                        className="absolute inset-x-0 -top-2 h-5 w-full cursor-pointer opacity-0"
                    />
                </div>
                <button
                    type="button"
                    title="Playback speed"
                    onClick={() => setSpeed((s) => SPEEDS[(SPEEDS.indexOf(s) + 1) % SPEEDS.length])}
                    className="w-12 rounded border border-zinc-700 px-2 py-1 text-center font-mono text-[11px] text-zinc-300 transition-colors hover:bg-zinc-800"
                >
                    {speed}×
                </button>
            </div>

            {/* Variables */}
            {vars.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                    {vars.map(([k, v]) => (
                        <span key={k} className="flex items-center rounded bg-zinc-800/80 px-2 py-1 font-mono text-[11px] text-zinc-300">
                            <span className="text-zinc-500">{k}&nbsp;=&nbsp;</span>
                            <AnimatePresence mode="popLayout" initial={false}>
                                <motion.span key={String(v)} initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} transition={FADE}>
                                    {Array.isArray(v) ? `[${v.join(", ")}]` : String(v)}
                                </motion.span>
                            </AnimatePresence>
                        </span>
                    ))}
                </div>
            )}

            {/* Code with the executing line highlighted */}
            <div className="mt-3 overflow-x-auto rounded-lg border border-zinc-800 bg-[#09090b] py-2">
                {approach.code.map((line, i) => {
                    const active = step.line === i + 1;
                    return (
                        <div key={i} className="relative flex gap-3 px-4 py-[3px] font-mono text-xs whitespace-pre">
                            {active && (
                                <motion.div
                                    layoutId="code-line"
                                    transition={SMOOTH}
                                    className="absolute inset-0 border-l-2 border-emerald-400 bg-emerald-500/10"
                                />
                            )}
                            <span className={`relative w-4 shrink-0 select-none text-right ${active ? "text-emerald-400" : "text-zinc-700"}`}>{i + 1}</span>
                            <span className={`relative ${active ? "text-emerald-200" : "text-zinc-400"}`}>{line}</span>
                        </div>
                    );
                })}
            </div>
            <p className="mt-2 font-mono text-[10px] text-zinc-600">← → step · space play/pause · home restart</p>
        </LayoutGroup>
    );
}

/**
 * Visualize tab: pick an example (or type a custom input) and an approach,
 * then play the algorithm running on that exact input.
 */
export function VizPlayer({ def, examples = [] }) {
    const exampleInputs = useMemo(() => {
        const list = examples.map((e) => e?.input).filter((x) => x != null && String(x).trim() !== "");
        return list.length ? list : [def.sample];
    }, [examples, def.sample]);

    const [source, setSource] = useState(0); // example index, or "custom"
    const [custom, setCustom] = useState(exampleInputs[0]);
    const [customApplied, setCustomApplied] = useState(exampleInputs[0]);
    const [approachKey, setApproachKey] = useState(def.approaches[0].key);
    const approach = def.approaches.find((a) => a.key === approachKey) || def.approaches[0];

    const input = source === "custom" ? customApplied : exampleInputs[source] ?? exampleInputs[0];

    const run = useMemo(() => {
        let args;
        try {
            args = def.parse(input);
        } catch (e) {
            return { error: e.message };
        }
        return runApproach(approach, args);
    }, [def, approach, input]);

    return (
        <MotionConfig reducedMotion="user">
            <div className="space-y-3 p-4 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                    <span className="mr-1 text-[10px] uppercase tracking-widest text-zinc-500">Input</span>
                    {exampleInputs.map((_, i) => (
                        <Chip key={i} active={source === i} onClick={() => setSource(i)}>
                            Example {i + 1}
                        </Chip>
                    ))}
                    <Chip active={source === "custom"} onClick={() => { setCustom(input); setSource("custom"); }}>
                        <span className="inline-flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">edit</span>Custom
                        </span>
                    </Chip>
                </div>

                <AnimatePresence initial={false} mode="wait">
                    {source === "custom" ? (
                        <motion.div key="custom" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={FADE} className="space-y-2 overflow-hidden">
                            <textarea
                                value={custom}
                                onChange={(e) => setCustom(e.target.value)}
                                rows={Math.min(6, Math.max(2, String(custom).split("\n").length))}
                                spellCheck={false}
                                className="w-full resize-y rounded-lg border border-zinc-700 bg-[#09090b] p-2.5 font-mono text-xs text-zinc-200 focus:border-emerald-500/60 focus:outline-none"
                            />
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setCustomApplied(custom)}
                                    className="rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-black transition-colors hover:bg-emerald-400"
                                >
                                    Visualize this input
                                </button>
                                <span className="text-[11px] text-zinc-500">Same format as the problem&apos;s input.</span>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.pre key="example" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={FADE} className="overflow-x-auto rounded-lg border border-zinc-800 bg-[#09090b] px-3 py-2 font-mono text-xs text-zinc-300">
                            {input}
                        </motion.pre>
                    )}
                </AnimatePresence>

                {def.approaches.length > 1 && (
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="mr-1 text-[10px] uppercase tracking-widest text-zinc-500">Approach</span>
                        {def.approaches.map((a) => (
                            <Chip key={a.key} active={a.key === approach.key} onClick={() => setApproachKey(a.key)}>
                                {a.label}
                            </Chip>
                        ))}
                    </div>
                )}
                {approach.complexity && (
                    <p className="font-mono text-[11px] text-zinc-500">
                        {def.approaches.length === 1 && <span className="mr-2 text-zinc-300">{approach.label}</span>}
                        time <span className="text-zinc-300">{approach.complexity.time}</span>
                        <span className="mx-1.5">·</span>
                        space <span className="text-zinc-300">{approach.complexity.space}</span>
                    </p>
                )}

                {run.error && !run.steps?.length ? (
                    <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-300">{run.error}</div>
                ) : (
                    <>
                        {run.error && (
                            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-300">{run.error} Showing the first steps.</div>
                        )}
                        <Run key={`${approach.key}|${input}`} approach={approach} run={run} />
                    </>
                )}
            </div>
        </MotionConfig>
    );
}
