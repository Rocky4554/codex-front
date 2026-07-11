"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const DIFF_STYLES = {
    EASY: "text-emerald-700 bg-emerald-100 border-emerald-300",
    MEDIUM: "text-amber-700 bg-amber-100 border-amber-300",
    HARD: "text-rose-700 bg-rose-100 border-rose-300",
};

/**
 * HTML5 drag-and-drop reorder list for playlist problems.
 * Calls onReorder(newOrderedProblems) after a successful drop.
 */
export function SortableProblemList({ problems, playlistId, onReorder, onRemove, saving }) {
    const [items, setItems] = useState(problems || []);
    const [dragIndex, setDragIndex] = useState(null);
    const [overIndex, setOverIndex] = useState(null);

    useEffect(() => {
        setItems(problems || []);
    }, [problems]);

    const handleDragStart = (index) => (e) => {
        setDragIndex(index);
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", String(index));
        // Helps some browsers show a proper drag ghost
        if (e.currentTarget instanceof HTMLElement) {
            e.currentTarget.style.opacity = "0.5";
        }
    };

    const handleDragEnd = (e) => {
        if (e.currentTarget instanceof HTMLElement) {
            e.currentTarget.style.opacity = "1";
        }
        setDragIndex(null);
        setOverIndex(null);
    };

    const handleDragOver = (index) => (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        if (overIndex !== index) setOverIndex(index);
    };

    const handleDrop = (index) => async (e) => {
        e.preventDefault();
        const from = dragIndex ?? Number(e.dataTransfer.getData("text/plain"));
        const to = index;
        setDragIndex(null);
        setOverIndex(null);
        if (Number.isNaN(from) || from === to || from < 0 || to < 0) return;

        const next = [...items];
        const [moved] = next.splice(from, 1);
        next.splice(to, 0, moved);
        setItems(next);

        try {
            await onReorder(next);
        } catch {
            // Revert on failure — parent will also refetch
            setItems(problems || []);
        }
    };

    if (!items.length) {
        return (
            <p className="rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 px-4 py-8 text-center text-sm text-zinc-500">
                Empty — add problems from the catalog, AI, or manually.
            </p>
        );
    }

    return (
        <ul className="divide-y divide-zinc-200 dark:divide-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-[#121214]">
            {items.map((p, i) => (
                <li
                    key={p.id}
                    draggable={!saving}
                    onDragStart={handleDragStart(i)}
                    onDragEnd={handleDragEnd}
                    onDragOver={handleDragOver(i)}
                    onDrop={handleDrop(i)}
                    className={`flex items-center gap-2 px-3 py-3 transition-colors ${
                        overIndex === i && dragIndex !== i ? "bg-emerald-500/10" : ""
                    } ${dragIndex === i ? "opacity-50" : ""} ${saving ? "pointer-events-none opacity-70" : ""}`}
                >
                    <button
                        type="button"
                        className="cursor-grab active:cursor-grabbing touch-none rounded p-1 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
                        title="Drag to reorder"
                        aria-label="Drag to reorder"
                        tabIndex={-1}
                    >
                        <span className="material-symbols-outlined text-[18px]">drag_indicator</span>
                    </button>
                    <span className="w-6 shrink-0 text-xs text-zinc-400">{i + 1}</span>
                    <Link
                        href={`/problems/${p.id}?playlist=${playlistId}`}
                        className="min-w-0 flex-1 truncate font-medium text-slate-800 dark:text-slate-100 hover:text-emerald-500"
                        onClick={(e) => {
                            // Don't navigate if user was dragging
                            if (dragIndex !== null) e.preventDefault();
                        }}
                    >
                        {p.title}
                    </Link>
                    <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${DIFF_STYLES[p.difficulty] || DIFF_STYLES.MEDIUM}`}>
                        {p.difficulty}
                    </span>
                    {p.userCreated && (
                        <span className="shrink-0 text-[10px] text-indigo-400">yours</span>
                    )}
                    <button
                        type="button"
                        onClick={() => onRemove(p.id, p.title)}
                        className="shrink-0 text-xs text-zinc-400 hover:text-rose-400"
                    >
                        Remove
                    </button>
                </li>
            ))}
        </ul>
    );
}
