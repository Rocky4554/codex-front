"use client";
import { parseSqlSetup } from "@/lib/sqlSetup";

function Grid({ columns, rows, tone = "text-zinc-300", maxHeight = "max-h-56" }) {
    const width = Math.max(columns?.length || 0, ...rows.map((r) => r.length));
    return (
        <div className={`overflow-auto ${maxHeight} rounded-lg border border-zinc-800`}>
            <table className="w-full border-collapse text-left font-mono text-xs">
                {columns?.length > 0 && (
                    <thead className="sticky top-0 bg-zinc-900">
                        <tr>
                            {columns.map((c, i) => (
                                <th key={i} className="border-b border-zinc-800 px-3 py-1.5 font-semibold text-zinc-200 whitespace-nowrap">{c}</th>
                            ))}
                        </tr>
                    </thead>
                )}
                <tbody>
                    {rows.map((cells, r) => (
                        <tr key={r} className="border-b border-zinc-800/60 last:border-0 odd:bg-white/[0.015]">
                            {Array.from({ length: width }, (_, c) => {
                                const cell = cells[c];
                                return (
                                    <td key={c} className={`px-3 py-1.5 whitespace-nowrap ${tone}`}>
                                        {cell === null || cell === undefined || cell === "" ? <span className="italic text-zinc-600">NULL</span> : cell}
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

/**
 * Renders SQLite CLI output (one row per line, columns joined by "|", no header)
 * as a table, with column names when we know them.
 */
export function SqlResultTable({ text, columns, tone = "text-zinc-300" }) {
    const value = String(text ?? "");
    if (value.trim() === "") {
        return <p className="text-zinc-500 italic">(no rows)</p>;
    }
    const rows = value.split("\n").filter((line, i, all) => line !== "" || i < all.length - 1).map((line) => line.split("|"));
    const width = Math.max(...rows.map((r) => r.length));
    return <Grid columns={columns?.length === width ? columns : null} rows={rows} tone={tone} />;
}

/** Renders a SQL setup script (CREATE TABLE / INSERT) as the tables it creates. */
export function SqlSetupTables({ script }) {
    const tables = parseSqlSetup(script);
    if (!tables) {
        return (
            <pre className="overflow-auto whitespace-pre-wrap rounded-lg border border-zinc-800 bg-[#09090b] p-2.5 text-zinc-300">{script}</pre>
        );
    }
    return (
        <div className="space-y-3">
            {tables.map((t) => (
                <div key={t.name}>
                    <p className="mb-1 font-mono text-[11px] text-zinc-400">
                        <span className="text-emerald-400">{t.name}</span> table
                        <span className="ml-2 text-zinc-600">{t.rows.length} row{t.rows.length === 1 ? "" : "s"}</span>
                    </p>
                    {t.rows.length ? <Grid columns={t.columns} rows={t.rows} maxHeight="max-h-44" /> : (
                        <p className="font-mono text-[11px] italic text-zinc-600">(empty — columns: {t.columns.join(", ")})</p>
                    )}
                </div>
            ))}
        </div>
    );
}
