import { list } from "../structures.js";
import { lines, nums, requireLength } from "../parse.js";

/** Build list nodes with ids n0…n(k-1) and a next map. */
export function makeList(values, prefix = "n") {
    const nodes = values.map((v, i) => ({ id: `${prefix}${i}`, v }));
    const next = {};
    nodes.forEach((node, i) => { next[node.id] = nodes[i + 1]?.id ?? null; });
    return { nodes, next, head: nodes[0]?.id ?? null };
}

export function walk(next, head, byId) {
    const out = [];
    const seen = new Set();
    for (let cur = head; cur != null && !seen.has(cur); cur = next[cur]) {
        seen.add(cur);
        out.push(byId[cur].v);
    }
    return out;
}

export const reverseLinkedList = {
    id: "reverse-linked-list",
    titles: ["Reverse Linked List"],
    sample: "1 2 3 4 5",
    parse: (input) => ({ values: requireLength(nums(lines(input)[0]), { max: 10 }) }),
    approaches: [
        {
            key: "iterative",
            label: "Iterative (three pointers)",
            complexity: { time: "O(n)", space: "O(1)" },
            code: [
                "prev, curr = None, head",
                "while curr:",
                "    nxt = curr.next",
                "    curr.next = prev      # flip the link",
                "    prev = curr",
                "    curr = nxt",
                "return prev               # new head",
            ],
            run({ values }, t) {
                const { nodes, next, head } = makeList(values);
                const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));
                const done = {};
                const draw = (p, tones = {}) => [list("ll", nodes, next, { pointers: p, tones: { ...done, ...tones } })];
                let prev = null, curr = head;
                t.step(1, "prev starts as null (the end of the reversed part), curr at the head.", draw({ prev, curr }), {});
                while (curr != null) {
                    const nxt = next[curr];
                    t.step(3, `Save curr.next (${nxt ? byId[nxt].v : "null"}) before we overwrite it.`, draw({ prev, curr, nxt }, { [curr]: "active" }));
                    next[curr] = prev;
                    t.step(4, `Flip: ${byId[curr].v}.next now points to ${prev ? byId[prev].v : "null"}.`, draw({ prev, curr, nxt }, { [curr]: "swap" }));
                    done[curr] = "done";
                    prev = curr;
                    curr = nxt;
                    t.step(6, `Move both pointers one step: prev = ${byId[prev].v}, curr = ${curr ? byId[curr].v : "null"}.`, draw({ prev, curr }));
                }
                t.step(7, `curr is null, so prev (${byId[prev].v}) is the new head.`, draw({ head: prev }));
                t.result(walk(next, prev, byId).join(" "));
            },
        },
    ],
};
