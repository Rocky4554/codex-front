export function ProblemPanel({ problem }) {
    // Normalize difficulty to title case for display
    const difficulty = problem.difficulty
        ? problem.difficulty.charAt(0) + problem.difficulty.slice(1).toLowerCase()
        : "Medium";

    const difficultyStyle =
        difficulty === "Easy" ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" :
        difficulty === "Medium" ? "text-amber-400 bg-amber-400/10 border-amber-400/20" :
        "text-rose-500 bg-rose-500/10 border-rose-500/20";

    // Support both array and single string for constraints
    const constraints = Array.isArray(problem.constraints)
        ? problem.constraints
        : problem.constraints ? [problem.constraints] : [];

    // Support both array and single string for topics/tags
    const topics = problem.topics || problem.tags || [];

    // Support examples array or fallback
    const examples = problem.examples || problem.testCases?.slice(0, 2) || [];

    return (
        <section className="flex flex-col border-r border-zinc-800 bg-[#18181b] h-full overflow-hidden text-slate-100">
            {/* Tabs */}
            <div className="flex items-center gap-1 bg-[#18181b] border-b border-zinc-800 px-2 pt-2">
                <div className="px-4 py-2 bg-[#27272a] rounded-t-lg border-t border-x border-zinc-700 text-white text-sm font-medium flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-emerald-500">description</span>
                    Description
                </div>
                <div className="px-4 py-2 hover:bg-[#27272a]/50 rounded-t-lg text-zinc-400 hover:text-white text-sm font-medium cursor-pointer transition-colors flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px]">history</span>
                    Submissions
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-2xl font-bold text-white">{problem.title}</h1>
                    <div className="flex items-center gap-3">
                        <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${difficultyStyle}`}>
                            {difficulty}
                        </span>
                        <div className="flex gap-1">
                            <button className="text-zinc-500 hover:text-white"><span className="material-symbols-outlined text-[18px]">favorite</span></button>
                            <button className="text-zinc-500 hover:text-white"><span className="material-symbols-outlined text-[18px]">share</span></button>
                        </div>
                    </div>
                </div>

                <div className="text-zinc-300 text-sm leading-relaxed space-y-4 whitespace-pre-wrap">
                    <p>{problem.description}</p>
                </div>

                {/* Examples */}
                {examples.length > 0 && (
                    <div className="mt-8 space-y-6">
                        {examples.map((ex, i) => (
                            <div key={i}>
                                <h3 className="text-white font-semibold text-sm mb-3">Example {i + 1}:</h3>
                                <div className="bg-[#09090b] border-l-2 border-zinc-700 p-4 rounded-r-lg font-mono text-xs text-zinc-300 space-y-2">
                                    {ex.input != null && <p><span className="text-zinc-500">Input:</span> {String(ex.input)}</p>}
                                    {ex.output != null && <p><span className="text-zinc-500">Output:</span> {String(ex.output)}</p>}
                                    {ex.explanation && <p><span className="text-zinc-500">Explanation:</span> {ex.explanation}</p>}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Constraints */}
                {constraints.length > 0 && (
                    <div className="mt-8 mb-4">
                        <h3 className="text-white font-semibold text-sm mb-3">Constraints:</h3>
                        <ul className="list-disc pl-5 space-y-2 text-zinc-400 text-xs">
                            {constraints.map((c, i) => (
                                <li key={i}><code className="bg-[#09090b] px-1 rounded text-zinc-300 font-mono">{c}</code></li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            {/* Tags Footer */}
            {topics.length > 0 && (
                <div className="p-4 border-t border-zinc-800 flex gap-2 flex-wrap">
                    {topics.map((topic, i) => (
                        <span key={i} className="text-xs bg-zinc-800 text-zinc-400 px-2 py-1 rounded hover:bg-zinc-700 hover:text-white transition-colors cursor-pointer">
                            {topic}
                        </span>
                    ))}
                </div>
            )}
        </section>
    );
}
