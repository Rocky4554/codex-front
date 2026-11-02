// Helpers for turning a problem's stdin-style example input into arguments.
// Inputs come in both styles: "2 7 11 15\n9" and LeetCode-ish "nums = [1,2,1]".

export function lines(input) {
    return String(input ?? "")
        .replace(/\r/g, "")
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l !== "");
}

/** All integers on a line ("1 2 3", "[1,2,3]", "nums = [1, 2, 3]"). */
export function nums(line) {
    const found = String(line ?? "").replace(/^[A-Za-z_]\w*\s*=\s*/, "").match(/-?\d+/g);
    return found ? found.map(Number) : [];
}

export function int(line) {
    const n = nums(line);
    if (n.length === 0) throw new Error(`Expected a number, got "${line ?? ""}".`);
    return n[0];
}

/** A string, dropping `s = ` and surrounding quotes. */
export function str(line) {
    let s = String(line ?? "").trim().replace(/^[A-Za-z_]\w*\s*=\s*/, "");
    if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) s = s.slice(1, -1);
    return s;
}

/** Split "a = [..], b = 2" style single-line inputs into their parts. */
export function assignments(input) {
    const text = lines(input).join(", ");
    const parts = {};
    const re = /([A-Za-z_]\w*)\s*=\s*(\[[^\]]*\]|"[^"]*"|'[^']*'|[^,]+)/g;
    let m;
    while ((m = re.exec(text))) parts[m[1]] = m[2].trim();
    return parts;
}

export function requireLength(arr, { min = 1, max = 16, what = "values" } = {}) {
    if (arr.length < min) throw new Error(`Give at least ${min} ${what}.`);
    if (arr.length > max) throw new Error(`Use at most ${max} ${what} so the animation stays readable.`);
    return arr;
}
