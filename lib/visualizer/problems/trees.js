import { array, stack, tree } from "../structures.js";
import { lines } from "../parse.js";

/** Level-order "3 9 20 null null 15 7" → { nodes: { id: { v, left, right } }, root }. */
export function parseTree(line) {
    const tokens = String(line ?? "").replace(/[[\],]/g, " ").trim().split(/\s+/).filter(Boolean);
    if (tokens.length === 0 || tokens[0] === "null") return { nodes: {}, root: null };
    if (tokens.filter((x) => x !== "null").length > 15) throw new Error("Use at most 15 nodes so the tree stays readable.");
    const nodes = {};
    const mk = (tok, i) => {
        if (tok == null || tok === "null") return null;
        const id = `t${i}`;
        nodes[id] = { v: Number.isNaN(Number(tok)) ? tok : Number(tok), left: null, right: null };
        return id;
    };
    const root = mk(tokens[0], 0);
    const q = [root];
    let i = 1;
    while (q.length && i < tokens.length) {
        const cur = q.shift();
        const l = mk(tokens[i], i++);
        nodes[cur].left = l;
        if (l) q.push(l);
        if (i < tokens.length) {
            const r = mk(tokens[i], i++);
            nodes[cur].right = r;
            if (r) q.push(r);
        }
    }
    return { nodes, root };
}

export const treeInput = (input) => parseTree(lines(input)[0]);

export const inorderTraversal = {
    id: "inorder-traversal",
    titles: ["Inorder Traversal", "Binary Tree Inorder Traversal"],
    sample: "1 null 2 3",
    parse: treeInput,
    approaches: [
        {
            key: "recursive",
            label: "Recursive DFS",
            complexity: { time: "O(n)", space: "O(h)" },
            code: [
                "def inorder(node):",
                "    if not node: return",
                "    inorder(node.left)",
                "    out.append(node.val)   # visit",
                "    inorder(node.right)",
            ],
            run({ nodes, root }, t) {
                const out = [];
                const callStack = [];
                const tones = {};
                const draw = (cur) => [
                    tree("tree", nodes, root, { pointers: { node: cur }, tones }),
                    stack("calls", callStack.map((id) => `inorder(${nodes[id].v})`), { label: "Call stack" }),
                    array("out", out, { label: "Output", hideIndex: true }),
                ];
                t.step(1, "Inorder visits left subtree, then the node, then the right subtree.", draw(root));
                const go = (id) => {
                    if (id == null) return;
                    callStack.push(id);
                    tones[id] = "active";
                    t.step(3, `At ${nodes[id].v}: go left first${nodes[id].left ? "" : " (nothing there)"}.`, draw(id));
                    go(nodes[id].left);
                    out.push(nodes[id].v);
                    tones[id] = "found";
                    t.step(4, `Left side done — visit ${nodes[id].v}.`, draw(id));
                    tones[id] = "done";
                    t.step(5, `Now the right subtree of ${nodes[id].v}${nodes[id].right ? "" : " (empty)"}.`, draw(id));
                    go(nodes[id].right);
                    callStack.pop();
                };
                go(root);
                t.step(1, `Every node visited: ${out.join(", ")}.`, draw(null));
                t.result(out.join(" "));
            },
        },
    ],
};
