// SQL problems ship each test case's input as a setup script
// (CREATE TABLE … ; INSERT INTO … VALUES …). These helpers turn that script
// into tables for display, and pull the expected-output column names from
// the problem description's "**Output:**" markdown table.

/** Split on `;` outside of quotes. */
function statements(script) {
    const out = [];
    let cur = "";
    let quote = null;
    for (const ch of String(script ?? "")) {
        if (quote) {
            if (ch === quote) quote = null;
        } else if (ch === "'" || ch === '"') {
            quote = ch;
        } else if (ch === ";") {
            if (cur.trim()) out.push(cur.trim());
            cur = "";
            continue;
        }
        cur += ch;
    }
    if (cur.trim()) out.push(cur.trim());
    return out;
}

/** Split on commas at paren depth 0, outside quotes. */
function topLevelSplit(text) {
    const parts = [];
    let depth = 0, cur = "", quote = null;
    for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        if (quote) {
            cur += ch;
            if (ch === quote) {
                if (text[i + 1] === quote) { cur += text[++i]; continue; } // '' escape
                quote = null;
            }
            continue;
        }
        if (ch === "'" || ch === '"') quote = ch;
        else if (ch === "(") depth++;
        else if (ch === ")") depth--;
        else if (ch === "," && depth === 0) { parts.push(cur.trim()); cur = ""; continue; }
        cur += ch;
    }
    if (cur.trim()) parts.push(cur.trim());
    return parts;
}

const unquote = (name) => name.replace(/^[`"[]|[`"\]]$/g, "");

function literal(token) {
    const t = token.trim();
    if (/^null$/i.test(t)) return null;
    if (/^'.*'$/s.test(t)) return t.slice(1, -1).replace(/''/g, "'");
    if (/^".*"$/s.test(t)) return t.slice(1, -1);
    return t;
}

/** Extract the parenthesised groups after VALUES: "(1,'a'),(2,'b')" → ["1,'a'", "2,'b'"]. */
function tuples(text) {
    const out = [];
    let depth = 0, start = -1, quote = null;
    for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        if (quote) {
            if (ch === quote) {
                if (text[i + 1] === quote) { i++; continue; }
                quote = null;
            }
            continue;
        }
        if (ch === "'" || ch === '"') quote = ch;
        else if (ch === "(") { if (depth++ === 0) start = i + 1; }
        else if (ch === ")") { if (--depth === 0) out.push(text.slice(start, i)); }
    }
    return out;
}

/**
 * Parse a setup script into [{ name, columns, rows }] in creation order.
 * Returns null when the script doesn't look like SQL setup.
 */
export function parseSqlSetup(script) {
    const tables = new Map();
    for (const stmt of statements(script)) {
        const create = stmt.match(/^CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?([`"[\]\w.]+)\s*\(([\s\S]*)\)\s*$/i);
        if (create) {
            const columns = topLevelSplit(create[2])
                .filter((def) => !/^(PRIMARY|FOREIGN|UNIQUE|CHECK|CONSTRAINT)\b/i.test(def))
                .map((def) => unquote(def.split(/\s+/)[0]));
            tables.set(unquote(create[1]).toLowerCase(), { name: unquote(create[1]), columns, rows: [] });
            continue;
        }
        const insert = stmt.match(/^INSERT\s+INTO\s+([`"[\]\w.]+)\s*(?:\(([^)]*)\))?\s*VALUES\s*([\s\S]*)$/i);
        if (insert) {
            const key = unquote(insert[1]).toLowerCase();
            if (!tables.has(key)) tables.set(key, { name: unquote(insert[1]), columns: [], rows: [] });
            const table = tables.get(key);
            const cols = insert[2] ? insert[2].split(",").map((c) => unquote(c.trim())) : null;
            for (const tuple of tuples(insert[3])) {
                const vals = topLevelSplit(tuple).map(literal);
                if (cols && table.columns.length) {
                    const row = table.columns.map(() => null);
                    cols.forEach((c, i) => {
                        const at = table.columns.findIndex((x) => x.toLowerCase() === c.toLowerCase());
                        if (at >= 0) row[at] = vals[i];
                    });
                    table.rows.push(row);
                } else {
                    if (!table.columns.length && cols) table.columns = cols;
                    table.rows.push(vals);
                }
            }
        }
    }
    return tables.size ? [...tables.values()] : null;
}

/** Column names of the first "**Output:**" table in a markdown description. */
export function outputColumns(description) {
    const text = String(description ?? "");
    const at = text.search(/\*\*Output:?\*\*/i);
    if (at < 0) return null;
    const header = text.slice(at).split("\n").find((line) => /^\s*\|.*\|\s*$/.test(line));
    if (!header) return null;
    return header.split("|").slice(1, -1).map((c) => c.trim());
}

/** Is this a SQL problem? (by topics, falling back to the description) */
export function isSqlProblem(problem) {
    const topics = (problem?.topics || problem?.tags || []).map((t) => String(t).toLowerCase());
    if (topics.includes("sql") || topics.includes("database")) return true;
    return /Dialect is \*\*SQLite\*\*/i.test(problem?.description || "");
}
