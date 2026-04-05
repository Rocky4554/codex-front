"use client";
import { useState } from "react";

export function ProblemFilters({ onFilterChange }) {
    const [difficulty, setDifficulty] = useState("all");
    const [search, setSearch] = useState("");

    const handleDifficultyChange = (value) => {
        setDifficulty(value);
        onFilterChange?.({ difficulty: value, search });
    };

    const handleSearchChange = (value) => {
        setSearch(value);
        onFilterChange?.({ difficulty, search: value });
    };

    return (
        <div className="flex items-center gap-4 mb-6">
            <input
                type="text"
                placeholder="Search problems..."
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="flex-1 max-w-xs px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
            />
            <div className="flex gap-2">
                {["all", "easy", "medium", "hard"].map((level) => (
                    <button
                        key={level}
                        onClick={() => handleDifficultyChange(level)}
                        className={`px-3 py-1 text-sm rounded-md capitalize transition-colors ${difficulty === level
                                ? "bg-zinc-700 text-white"
                                : "text-zinc-500 hover:text-zinc-300"
                            }`}
                    >
                        {level}
                    </button>
                ))}
            </div>
        </div>
    );
}
