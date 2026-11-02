import { grid, queue, value } from "../structures.js";
import { lines, nums } from "../parse.js";

export const numberOfIslands = {
    id: "number-of-islands",
    titles: ["Number of Islands"],
    sample: "4 5\n11000\n11000\n00100\n00011",
    parse(input) {
        const ls = lines(input);
        const [r, c] = nums(ls[0]);
        const rows = ls.slice(1, 1 + r).map((row) => row.replace(/\s+/g, "").split(""));
        if (!rows.length || rows.some((row) => row.length !== c)) throw new Error("First line is rows and columns, then one line of 0/1 per row.");
        if (r > 8 || c > 10) throw new Error("Use at most 8 rows and 10 columns.");
        return { cells: rows };
    },
    approaches: [
        {
            key: "bfs",
            label: "BFS flood fill",
            complexity: { time: "O(r·c)", space: "O(r·c)" },
            code: [
                "count = 0",
                "for each cell (r, c):",
                "    if grid[r][c] == '1':",
                "        count += 1",
                "        bfs from (r, c), marking land as visited",
                "print(count)",
            ],
            run({ cells }, t) {
                const R = cells.length, C = cells[0].length;
                const tones = {};
                for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) if (cells[r][c] === "0") tones[`${r},${c}`] = "dim";
                const islandTones = ["active", "compare", "swap", "found", "bad"];
                let count = 0;
                const q = [];
                const draw = (pointer) => [
                    grid("grid", cells, { tones, pointer }),
                    queue("q", q.map(([r, c]) => `${r},${c}`), { label: "BFS queue" }),
                    value("count", "islands", count, { tone: count ? "found" : null }),
                ];
                t.step(1, "Scan every cell. Each unvisited '1' starts a new island; a BFS then colors all land connected to it.", draw(null));
                for (let r = 0; r < R; r++) {
                    for (let c = 0; c < C; c++) {
                        if (cells[r][c] !== "1" || tones[`${r},${c}`]) continue;
                        count += 1;
                        const tone = islandTones[(count - 1) % islandTones.length];
                        tones[`${r},${c}`] = tone;
                        q.push([r, c]);
                        t.step(4, `(${r}, ${c}) is unvisited land — island #${count}. Flood it.`, draw([r, c]), { count });
                        while (q.length) {
                            const [cr, cc] = q.shift();
                            for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
                                const nr = cr + dr, nc = cc + dc;
                                if (nr < 0 || nc < 0 || nr >= R || nc >= C) continue;
                                if (cells[nr][nc] !== "1" || tones[`${nr},${nc}`]) continue;
                                tones[`${nr},${nc}`] = tone;
                                q.push([nr, nc]);
                            }
                            t.step(5, `Visit (${cr}, ${cc}) and queue its unvisited land neighbours.`, draw([cr, cc]), { count });
                        }
                        t.step(2, `Island #${count} is fully marked. Keep scanning.`, draw(null), { count });
                    }
                }
                t.step(6, `${count} island${count === 1 ? "" : "s"}.`, draw(null), { count });
                t.result(String(count));
            },
        },
    ],
};
