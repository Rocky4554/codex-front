// Cell / node colors per tone. Classes include transition-colors so tone
// changes cross-fade instead of snapping.
export const TONE_CELL = {
    active: "border-emerald-400 bg-emerald-500/15 text-emerald-200",
    compare: "border-sky-400 bg-sky-500/15 text-sky-200",
    swap: "border-amber-400 bg-amber-500/20 text-amber-200",
    done: "border-emerald-700/70 bg-emerald-900/25 text-emerald-300/80",
    found: "border-amber-300 bg-amber-400/25 text-amber-100 shadow-[0_0_14px_rgba(251,191,36,0.35)]",
    bad: "border-rose-400 bg-rose-500/15 text-rose-200",
    dim: "border-zinc-800 bg-zinc-900/40 text-zinc-600",
};
export const TONE_DEFAULT = "border-zinc-700 bg-zinc-900 text-zinc-200";

// SVG fills/strokes for trees and lists.
export const TONE_SVG = {
    active: { fill: "rgba(16,185,129,0.22)", stroke: "#34d399", text: "#a7f3d0" },
    compare: { fill: "rgba(14,165,233,0.22)", stroke: "#38bdf8", text: "#bae6fd" },
    swap: { fill: "rgba(245,158,11,0.25)", stroke: "#fbbf24", text: "#fde68a" },
    done: { fill: "rgba(6,78,59,0.45)", stroke: "#047857", text: "#6ee7b7" },
    found: { fill: "rgba(251,191,36,0.3)", stroke: "#fcd34d", text: "#fef3c7" },
    bad: { fill: "rgba(244,63,94,0.2)", stroke: "#fb7185", text: "#fecdd3" },
    dim: { fill: "rgba(24,24,27,0.6)", stroke: "#27272a", text: "#52525b" },
};
export const TONE_SVG_DEFAULT = { fill: "#18181b", stroke: "#3f3f46", text: "#e4e4e7" };

// Pointer chip colors, assigned by pointer name so a pointer keeps its color.
const POINTER_PALETTE = [
    "bg-emerald-400 text-black",
    "bg-sky-400 text-black",
    "bg-amber-300 text-black",
    "bg-fuchsia-400 text-black",
    "bg-rose-400 text-black",
    "bg-zinc-200 text-black",
];
const POINTER_STROKES = ["#34d399", "#38bdf8", "#fcd34d", "#e879f9", "#fb7185", "#e4e4e7"];

const hash = (s) => [...String(s)].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
const WELL_KNOWN = { i: 0, l: 0, left: 0, lo: 0, slow: 0, prev: 3, curr: 0, j: 1, r: 1, right: 1, hi: 1, fast: 1, mid: 2, k: 2, next: 4, write: 3, read: 1 };

export function pointerIndex(name, tone) {
    if (tone === "active") return 0;
    if (tone === "compare") return 1;
    if (tone === "swap") return 2;
    return WELL_KNOWN[name] ?? hash(name) % POINTER_PALETTE.length;
}
export const pointerChip = (name, tone) => POINTER_PALETTE[pointerIndex(name, tone)];
export const pointerStroke = (name, tone) => POINTER_STROKES[pointerIndex(name, tone)];

// One shared motion transition so everything moves with the same feel.
export const SMOOTH = { type: "spring", stiffness: 210, damping: 28, mass: 0.9 };
export const FADE = { duration: 0.28, ease: [0.4, 0, 0.2, 1] };
