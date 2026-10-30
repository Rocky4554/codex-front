"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { ArrayView } from "./ArrayView";
import { ClassDiagramView } from "./ClassDiagramView";
import { SequenceView } from "./SequenceView";

const SPEEDS = [0.5, 1, 1.5, 2];

// All approaches are flattened into ONE timeline, with a divider frame
// between approaches, so a single slider scrubs the whole lesson.
function buildTimeline(viz) {
    const frames = [];
    viz.approaches.forEach((approach, a) => {
        if (a > 0) frames.push({ kind: "divider", approachIdx: a, title: approach.label });
        approach.steps.forEach((_, s) => frames.push({ kind: "step", approachIdx: a, stepIdx: s }));
    });
    return frames;
}

// Reading time per frame: base + per-word, clamped, then scaled by speed.
function frameDuration(frame, viz, speed) {
    if (frame.kind === "divider") return 2600 / speed;
    const step = viz.approaches[frame.approachIdx].steps[frame.stepIdx];
    const words = step.narration.trim().split(/\s+/).length;
    return Math.min(4000, Math.max(1500, 900 + 100 * words)) / speed;
}

function ControlButton({ title, onClick, disabled, icon }) {
    return (
        <button
            type="button"
            title={title}
            onClick={onClick}
            disabled={disabled}
            className="w-8 h-8 rounded-full border border-zinc-700 flex items-center justify-center text-zinc-300 hover:bg-zinc-800 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
        >
            <span className="material-symbols-outlined text-[18px]">{icon}</span>
        </button>
    );
}

export function StepPlayer({ viz, initialStep = 0 }) {
    const timeline = useMemo(() => buildTimeline(viz), [viz]);
    // First frame of each approach, for the approach chips.
    const approachStarts = useMemo(
        () => viz.approaches.map((_, a) => timeline.findIndex((f) => f.kind === "step" && f.approachIdx === a)),
        [timeline, viz],
    );

    const clamp = (i) => Math.max(0, Math.min(i, timeline.length - 1));
    const [idx, setIdx] = useState(() => clamp(initialStep));
    const [playing, setPlaying] = useState(false);
    const [speed, setSpeed] = useState(1);

    // Reset when switching to a different visualization (state adjusted during
    // render, per React docs), but not on mount — mount respects initialStep.
    const [prevVizId, setPrevVizId] = useState(viz.id);
    if (prevVizId !== viz.id) {
        setPrevVizId(viz.id);
        setIdx(0);
        setPlaying(false);
    }

    const atEnd = idx >= timeline.length - 1;
    const next = useCallback(() => setIdx((i) => Math.min(i + 1, timeline.length - 1)), [timeline.length]);
    const prev = useCallback(() => setIdx((i) => Math.max(i - 1, 0)), []);
    const restart = useCallback(() => {
        setIdx(0);
        setPlaying(false);
    }, []);

    // Autoplay: hold each frame long enough to read its narration, then
    // advance; pause automatically after revealing the final frame.
    useEffect(() => {
        if (!playing || atEnd) return;
        const t = setTimeout(() => {
            if (idx + 1 >= timeline.length - 1) setPlaying(false);
            next();
        }, frameDuration(timeline[idx], viz, speed));
        return () => clearTimeout(t);
    }, [playing, idx, speed, atEnd, timeline, viz, next]);

    // Keyboard: ← → step, Space play/pause, Home restart. Ignored while typing.
    useEffect(() => {
        const onKey = (e) => {
            const t = e.target;
            if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable)) return;
            if (e.key === "ArrowRight") { setPlaying(false); next(); }
            else if (e.key === "ArrowLeft") { setPlaying(false); prev(); }
            else if (e.key === " ") { e.preventDefault(); setPlaying((p) => !p); }
            else if (e.key === "Home") restart();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [next, prev, restart]);

    const frame = timeline[idx];
    const approach = viz.approaches[frame.approachIdx];
    // On a divider, keep the previous approach's final state on screen.
    const step =
        frame.kind === "divider"
            ? viz.approaches[frame.approachIdx - 1].steps.at(-1)
            : approach.steps[frame.stepIdx];
    const stepNumber = frame.kind === "step" ? frame.stepIdx + 1 : approach.steps.length;
    const shownApproachIdx = frame.kind === "divider" ? frame.approachIdx - 1 : frame.approachIdx;
    const shownApproach = viz.approaches[shownApproachIdx];

    return (
        <MotionConfig reducedMotion="user">
            <div className="p-4 space-y-4 text-sm">
                {/* Approach chips + complexity */}
                <div className="flex items-center gap-2 flex-wrap">
                    {viz.approaches.map((a, i) => (
                        <button
                            key={a.label}
                            type="button"
                            onClick={() => { setPlaying(false); setIdx(approachStarts[i]); }}
                            className={`px-2.5 py-1 rounded-full border text-xs font-medium transition-colors ${
                                i === shownApproachIdx
                                    ? "border-emerald-500/60 bg-emerald-500/10 text-emerald-300"
                                    : "border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800"
                            }`}
                        >
                            {a.label}
                        </button>
                    ))}
                    {shownApproach.complexity && (
                        <span className="ml-auto font-mono text-[11px] text-zinc-500">
                            time <span className="text-zinc-300">{shownApproach.complexity.time}</span>
                            <span className="mx-1.5">·</span>
                            space <span className="text-zinc-300">{shownApproach.complexity.space}</span>
                        </span>
                    )}
                </div>

                {/* Canvas — each step picks its view: class/sequence diagram (LLD) or array (DSA) */}
                <div className="relative rounded-xl border border-zinc-800 bg-[#09090b] px-3 py-4 overflow-x-auto">
                    {step.classDiagram ? (
                        <ClassDiagramView view={step.classDiagram} />
                    ) : step.sequence ? (
                        <SequenceView view={step.sequence} />
                    ) : viz.input ? (
                        <ArrayView
                            values={viz.input}
                            pointers={step.pointers}
                            highlights={step.highlights}
                            best={step.best}
                        />
                    ) : null}
                    <AnimatePresence>
                        {frame.kind === "divider" && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 rounded-xl bg-[#09090b]/85 backdrop-blur-[2px] flex flex-col items-center justify-center gap-1"
                            >
                                <span className="text-[10px] uppercase tracking-widest text-zinc-500">next approach</span>
                                <span className="text-lg font-semibold text-white">{frame.title}</span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Narration */}
                <div className="rounded-lg border border-zinc-800 bg-[#18181b] px-4 py-3 min-h-[64px]">
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] uppercase tracking-widest text-zinc-500">
                            {frame.kind === "divider" ? "switching" : shownApproach.label}
                        </span>
                        <span className="font-mono text-[11px] text-zinc-500 tabular-nums">
                            step {stepNumber}/{shownApproach.steps.length}
                        </span>
                    </div>
                    <p className="text-zinc-300 leading-relaxed">
                        {frame.kind === "divider" ? `Next up: ${frame.title}.` : step.narration}
                    </p>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-2">
                    <ControlButton title="Restart (Home)" onClick={restart} disabled={idx === 0} icon="replay" />
                    <ControlButton title="Previous step (←)" onClick={() => { setPlaying(false); prev(); }} disabled={idx === 0} icon="chevron_left" />
                    <button
                        type="button"
                        title={playing ? "Pause (Space)" : "Play (Space)"}
                        onClick={() => {
                            if (atEnd && !playing) setIdx(0);
                            setPlaying((p) => !p);
                        }}
                        className="w-10 h-10 rounded-full bg-emerald-500 text-black flex items-center justify-center hover:bg-emerald-400 transition-colors"
                    >
                        <span className="material-symbols-outlined text-[22px]">{playing ? "pause" : "play_arrow"}</span>
                    </button>
                    <ControlButton title="Next step (→)" onClick={() => { setPlaying(false); next(); }} disabled={atEnd} icon="chevron_right" />
                    <input
                        type="range"
                        min={0}
                        max={timeline.length - 1}
                        value={idx}
                        onChange={(e) => { setPlaying(false); setIdx(Number(e.target.value)); }}
                        aria-label="Scrub through steps"
                        className="flex-1 accent-emerald-500 cursor-pointer"
                    />
                    <button
                        type="button"
                        title="Playback speed"
                        onClick={() => setSpeed((s) => SPEEDS[(SPEEDS.indexOf(s) + 1) % SPEEDS.length])}
                        className="px-2 py-1 rounded border border-zinc-700 font-mono text-[11px] text-zinc-300 hover:bg-zinc-800 w-12 text-center transition-colors"
                    >
                        {speed}×
                    </button>
                </div>

                {/* Pseudocode */}
                <div className="rounded-lg border border-zinc-800 bg-[#09090b] py-2 overflow-x-auto">
                    {shownApproach.pseudocode.map((line, i) => {
                        const active = frame.kind === "step" && step.codeLine === i + 1;
                        return (
                            <div
                                key={i}
                                className={`px-4 py-0.5 font-mono text-xs whitespace-pre flex gap-3 ${
                                    active ? "bg-emerald-500/10 text-emerald-300" : "text-zinc-400"
                                }`}
                            >
                                <span className={`w-4 text-right shrink-0 select-none ${active ? "text-emerald-500" : "text-zinc-700"}`}>
                                    {i + 1}
                                </span>
                                {line}
                            </div>
                        );
                    })}
                </div>

                {/* State table */}
                {step.vars?.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {step.vars.map(([k, v]) => (
                            <span key={k} className="font-mono text-[11px] px-2 py-1 rounded bg-zinc-800/80 text-zinc-300">
                                <span className="text-zinc-500">{k} = </span>
                                {String(v)}
                            </span>
                        ))}
                    </div>
                )}

                <p className="text-[10px] text-zinc-600 font-mono">← → step · space play · home restart</p>
            </div>
        </MotionConfig>
    );
}
