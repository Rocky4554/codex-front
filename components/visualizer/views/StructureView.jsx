"use client";
import { motion } from "motion/react";
import { ArrayTrack } from "./ArrayTrack";
import { CallsView, MapView, QueueView, StackView, ValueView } from "./Collections";
import { LinkedListView } from "./LinkedListView";
import { TreeView } from "./TreeView";
import { SMOOTH, TONE_CELL, TONE_DEFAULT } from "./tones";

function GridView({ s, width }) {
    const cols = s.cells[0]?.length || 0;
    const cell = Math.max(22, Math.min(40, Math.floor((width - 4 * cols) / Math.max(cols, 1))));
    return (
        <div className="relative mx-auto inline-grid gap-1" style={{ gridTemplateColumns: `repeat(${cols}, ${cell}px)` }}>
            {s.cells.flatMap((row, r) =>
                row.map((v, c) => (
                    <div
                        key={`${r},${c}`}
                        className={`flex items-center justify-center rounded-md border font-mono text-xs transition-colors duration-300 ${
                            TONE_CELL[s.tones[`${r},${c}`]] || TONE_DEFAULT
                        }`}
                        style={{ width: cell, height: cell }}
                    >
                        {String(v)}
                    </div>
                )),
            )}
            {s.pointer && (
                <motion.div
                    className="pointer-events-none absolute left-0 top-0 rounded-md border-2 border-emerald-300"
                    initial={false}
                    animate={{ x: s.pointer[1] * (cell + 4) - 2, y: s.pointer[0] * (cell + 4) - 2 }}
                    transition={SMOOTH}
                    style={{ width: cell + 4, height: cell + 4 }}
                />
            )}
        </div>
    );
}

const VIEWS = {
    array: ArrayTrack,
    map: MapView,
    stack: StackView,
    queue: QueueView,
    list: LinkedListView,
    tree: TreeView,
    grid: GridView,
    calls: CallsView,
    value: ValueView,
};

export function StructureView({ s, width }) {
    const View = VIEWS[s.type];
    if (!View) return null;
    const centered = s.type === "array" || s.type === "list" || s.type === "tree" || s.type === "grid";
    return (
        <div className="space-y-2">
            {s.label && <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">{s.label}</p>}
            <div className={centered ? "flex justify-center" : ""}>
                <View s={s} width={width} />
            </div>
        </div>
    );
}
