"use client";

/**
 * Renders SQLite CLI output (one row per line, columns joined by "|", no header)
 * as a table. Falls back to a plain <pre> when the text is not tabular.
 */
export function SqlResultTable({ text, tone = "text-zinc-300" }) {
    const value = String(text ?? "");
    const rows = value.split("\n").filter((line, i, all) => line !== "" || i < all.length - 1).map((line) => line.split("|"));
    if (value.trim() === "") {
        return <p className="text-zinc-500 italic">(no rows)</p>;
    }
    return (
        <div className="overflow-auto max-h-48 rounded border border-zinc-800">
            <table className="w-full border-collapse text-left text-xs">
                <tbody>
                    {rows.map((cells, r) => (
                        <tr key={r} className="border-b border-zinc-800/60 last:border-0">
                            {cells.map((cell, c) => (
                                <td key={c} className={`px-3 py-1.5 font-mono ${tone}`}>
                                    {cell === "" ? <span className="text-zinc-600">NULL</span> : cell}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
