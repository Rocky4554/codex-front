// Builders for the things a step can draw. Tracers call these with their
// live state; the tracer deep-copies the result, so mutating state after a
// step is safe.
//
// Tones (cell/node colors): "active" | "compare" | "swap" | "done" | "found" | "bad" | "dim"

let seq = 0;

/**
 * Give values stable identities so the view can animate them moving
 * (swaps, sorting, reversal). Keep the returned objects and move them around;
 * read `.v` for the value.
 */
export function tracked(values, prefix = "t") {
    seq += 1;
    return values.map((v, i) => ({ id: `${prefix}${seq}-${i}`, v }));
}

const asItems = (id, items) =>
    items.map((it, i) =>
        it && typeof it === "object" && "id" in it && "v" in it ? it : { id: `${id}-${i}`, v: it },
    );

const asPointers = (pointers) =>
    Array.isArray(pointers)
        ? pointers
        : Object.entries(pointers || {})
            .filter(([, index]) => index != null)
            .map(([name, index]) => ({ name, index }));

/**
 * A row of cells. opts:
 *   label, pointers ({ name: index } or [{ name, index, tone }]),
 *   tones ({ index: tone }), window ([lo, hi] shaded range),
 *   bars (draw as bar chart), water ([amount per index], bars only),
 *   indexLabels (custom labels under cells, e.g. "dp[0]"), hideIndex
 */
export function array(id, items, opts = {}) {
    return {
        type: "array",
        id,
        label: opts.label,
        items: asItems(id, items),
        pointers: asPointers(opts.pointers),
        tones: opts.tones || {},
        window: opts.window || null,
        bars: !!opts.bars,
        water: opts.water || null,
        indexLabels: opts.indexLabels || null,
        hideIndex: !!opts.hideIndex,
    };
}

/** A string drawn as character cells (same options as array). */
export function chars(id, str, opts = {}) {
    return array(id, [...String(str)], opts);
}

/** Key → value table (hash map / set / counts). opts: label, hot (key), tones ({ key: tone }), set (hide values) */
export function map(id, entries, opts = {}) {
    const list = entries instanceof Map ? [...entries.entries()] : Array.isArray(entries) ? entries : Object.entries(entries);
    return {
        type: "map",
        id,
        label: opts.label,
        entries: list.map(([k, v]) => [String(k), v]),
        hot: opts.hot != null ? String(opts.hot) : null,
        tones: Object.fromEntries(Object.entries(opts.tones || {}).map(([k, v]) => [String(k), v])),
        set: !!opts.set,
    };
}

/** Vertical stack, last item on top. opts: label, tones ({ index: tone }) */
export function stack(id, items, opts = {}) {
    return { type: "stack", id, label: opts.label, items: asItems(id, items), tones: opts.tones || {} };
}

/** Horizontal queue, front on the left. opts: label, tones */
export function queue(id, items, opts = {}) {
    return { type: "queue", id, label: opts.label, items: asItems(id, items), tones: opts.tones || {} };
}

/**
 * Linked list. nodes: [{ id, v }] in display order; next: { nodeId: nodeId | null }.
 * opts: label, pointers ({ name: nodeId } or [{ name, node }]), tones ({ nodeId: tone })
 */
export function list(id, nodes, next, opts = {}) {
    const pointers = Array.isArray(opts.pointers)
        ? opts.pointers
        : Object.entries(opts.pointers || {}).map(([name, node]) => ({ name, node }));
    return {
        type: "list",
        id,
        label: opts.label,
        nodes: nodes.map((n) => ({ id: n.id, v: n.v })),
        next: { ...next },
        pointers: pointers.filter((p) => p.node != null),
        nullPointers: pointers.filter((p) => p.node == null).map((p) => p.name),
        tones: opts.tones || {},
    };
}

/**
 * Binary tree. nodes: { nodeId: { v, left, right } }, root: nodeId.
 * opts: label, pointers ({ name: nodeId }), tones ({ nodeId: tone }), badges ({ nodeId: text })
 */
export function tree(id, nodes, root, opts = {}) {
    return {
        type: "tree",
        id,
        label: opts.label,
        nodes,
        root,
        pointers: Object.entries(opts.pointers || {})
            .filter(([, node]) => node != null)
            .map(([name, node]) => ({ name, node })),
        tones: opts.tones || {},
        badges: opts.badges || {},
    };
}

/** 2-D grid. opts: label, tones ({ "r,c": tone }), pointer ([r, c]) */
export function grid(id, cells, opts = {}) {
    return { type: "grid", id, label: opts.label, cells, tones: opts.tones || {}, pointer: opts.pointer || null };
}

/** Recursion call stack, outermost first. frames: [{ label, value?, tone? }] */
export function calls(id, frames, opts = {}) {
    return { type: "calls", id, label: opts.label || "Call stack", frames: frames.map((f) => ({ ...f })) };
}

/** A labelled value (result so far, output string…). opts: tone */
export function value(id, label, v, opts = {}) {
    return { type: "value", id, label, v: v == null ? "—" : String(v), tone: opts.tone || null };
}
