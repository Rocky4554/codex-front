"use client";
import { motion } from "motion/react";

const POINTER_COLORS = {
    accent: { chip: "bg-emerald-500 text-black", arrow: "text-emerald-500" },
    accent2: { chip: "bg-sky-400 text-black", arrow: "text-sky-400" },
    ink: { chip: "bg-zinc-300 text-black", arrow: "text-zinc-300" },
};

const spring = { type: "spring", stiffness: 420, damping: 32 };

/**
 * Renders one array snapshot: cells, highlights, the answer ring and
 * named pointers that slide between indices (animated via layoutId,
 * so the same pointer name glides from its old cell to the new one).
 */
export function ArrayView({ values, pointers = [], highlights = [], best }) {
    const highlightSet = new Set(highlights);
    const bestSet = new Set(best?.indices || []);

    // Group pointers by index so two pointers on one cell stack vertically.
    const byIndex = new Map();
    for (const p of pointers) {
        if (!byIndex.has(p.index)) byIndex.set(p.index, []);
        byIndex.get(p.index).push(p);
    }

    return (
        <div className="flex items-start justify-center gap-1.5 py-2 select-none" role="img" aria-label="Array state">
            {values.map((v, i) => {
                const isBest = bestSet.has(i);
                const isHot = highlightSet.has(i);
                const cellPointers = byIndex.get(i) || [];
                return (
                    <div key={i} className="flex flex-col items-center gap-1 min-w-[44px]">
                        {/* value cell */}
                        <motion.div
                            animate={{
                                scale: isBest ? 1.08 : 1,
                                backgroundColor: isBest
                                    ? "rgba(245, 158, 11, 0.18)"
                                    : isHot
                                        ? "rgba(16, 185, 129, 0.14)"
                                        : "rgba(9, 9, 11, 1)",
                            }}
                            transition={spring}
                            className={`w-11 h-11 rounded-lg border flex items-center justify-center font-mono text-sm ${
                                isBest
                                    ? "border-amber-400 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.25)]"
                                    : isHot
                                        ? "border-emerald-500/70 text-emerald-300"
                                        : "border-zinc-700 text-zinc-300"
                            }`}
                        >
                            {v}
                        </motion.div>
                        {/* index label */}
                        <span className="text-[10px] font-mono text-zinc-600">{i}</span>
                        {/* pointer lane — fixed height so cells don't jump when pointers appear */}
                        <div className="h-12 flex flex-col items-center gap-0.5">
                            {cellPointers.map((p) => {
                                const c = POINTER_COLORS[p.color] || POINTER_COLORS.accent;
                                return (
                                    <motion.div
                                        key={p.name}
                                        layoutId={`ptr-${p.name}`}
                                        transition={spring}
                                        className="flex flex-col items-center"
                                    >
                                        <span className={`text-[10px] leading-none ${c.arrow}`}>▲</span>
                                        <span className={`px-1.5 py-0.5 rounded font-mono text-[10px] font-bold ${c.chip}`}>
                                            {p.name}
                                        </span>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
            {best?.label && (
                <motion.span
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="self-center ml-2 text-[10px] font-mono uppercase tracking-widest text-amber-400"
                >
                    {best.label}
                </motion.span>
            )}
        </div>
    );
}
