import { array, calls, queue, stack, tree } from "../structures.js";
import { treeInput } from "./trees.js";

export const preorderTraversal = {
    id: "preorder-traversal",
    titles: ["Preorder Traversal", "Binary Tree Preorder Traversal"],
    sample: "1 null 2 3",
    parse: treeInput,
    approaches: [
        {
            key: "recursive",
            label: "Recursive DFS",
            complexity: { time: "O(n)", space: "O(h)" },
            code: [
                "def preorder(node):",
                "    if not node: return",
                "    out.append(node.val)   # visit first",
                "    preorder(node.left)",
                "    preorder(node.right)",
            ],
            run({ nodes, root }, t) {
                const out = [];
                const callStack = [];
                const tones = {};
                const draw = (cur) => [
                    tree("tree", nodes, root, { pointers: { node: cur }, tones }),
                    stack("calls", callStack.map((id) => `preorder(${nodes[id].v})`), { label: "Call stack" }),
                    array("out", out, { label: "Output", hideIndex: true }),
                ];
                if (root == null) {
                    t.step(2, "The tree is empty, so there is nothing to visit.", draw(null));
                    t.result("");
                    return;
                }
                t.step(1, "Preorder visits the node first, then its left subtree, then its right subtree.", draw(root));
                const go = (id) => {
                    if (id == null) return;
                    callStack.push(id);
                    out.push(nodes[id].v);
                    tones[id] = "found";
                    t.step(3, `Visit ${nodes[id].v} right away.`, draw(id));
                    tones[id] = "active";
                    t.step(4, `Go left from ${nodes[id].v}${nodes[id].left ? "" : " (nothing there)"}.`, draw(id));
                    go(nodes[id].left);
                    t.step(5, `Now the right subtree of ${nodes[id].v}${nodes[id].right ? "" : " (empty)"}.`, draw(id));
                    go(nodes[id].right);
                    tones[id] = "done";
                    callStack.pop();
                };
                go(root);
                t.step(1, `Every node visited: ${out.join(", ")}.`, draw(null));
                t.result(out.join(" "));
            },
        },
        {
            key: "iterative",
            label: "Iterative (stack)",
            complexity: { time: "O(n)", space: "O(h)" },
            code: [
                "st = [root]",
                "while st:",
                "    node = st.pop(); out.append(node.val)",
                "    if node.right: st.append(node.right)",
                "    if node.left:  st.append(node.left)   # left on top",
            ],
            run({ nodes, root }, t) {
                const out = [];
                const st = root == null ? [] : [{ id: `s-${root}`, v: nodes[root].v, node: root }];
                const tones = {};
                const draw = (cur) => [
                    tree("tree", nodes, root, { pointers: { node: cur }, tones }),
                    stack("st", st, { label: "Stack" }),
                    array("out", out, { label: "Output", hideIndex: true }),
                ];
                t.step(1, root == null ? "The tree is empty." : `Start with the root ${nodes[root].v} on the stack.`, draw(null));
                while (st.length) {
                    const { node } = st.pop();
                    out.push(nodes[node].v);
                    tones[node] = "found";
                    t.step(3, `Pop ${nodes[node].v} and visit it.`, draw(node));
                    tones[node] = "done";
                    const { left, right } = nodes[node];
                    if (right != null) {
                        st.push({ id: `s-${right}`, v: nodes[right].v, node: right });
                        t.step(4, `Push the right child ${nodes[right].v} first so it's handled later.`, draw(node));
                    }
                    if (left != null) {
                        st.push({ id: `s-${left}`, v: nodes[left].v, node: left });
                        t.step(5, `Push the left child ${nodes[left].v} last — it's on top, so it's visited next.`, draw(node));
                    }
                }
                t.step(2, `Stack is empty. Preorder: ${out.join(", ") || "(none)"}.`, draw(null));
                t.result(out.join(" "));
            },
        },
    ],
};

export const levelOrderTraversal = {
    id: "level-order-traversal",
    titles: ["Level Order Traversal", "Binary Tree Level Order Traversal"],
    sample: "3 9 20 null null 15 7",
    parse: treeInput,
    approaches: [
        {
            key: "bfs",
            label: "BFS with a queue",
            complexity: { time: "O(n)", space: "O(w)" },
            code: [
                "q = deque([root])",
                "while q:",
                "    level = []",
                "    for _ in range(len(q)):",
                "        node = q.popleft(); level.append(node.val)",
                "        add node.left, node.right to q",
                "    levels.append(level)",
            ],
            run({ nodes, root }, t) {
                const levels = [];
                const q = root == null ? [] : [{ id: `q-${root}`, v: nodes[root].v, node: root }];
                const tones = {};
                const draw = (cur, level) => [
                    tree("tree", nodes, root, { pointers: { node: cur }, tones }),
                    queue("q", q, { label: "Queue" }),
                    array("levels", [...levels.map((l) => l.join(" ")), ...(level ? [level.join(" ") || "…"] : [])], { label: "Levels", indexLabels: [...levels, level].filter(Boolean).map((_, i) => `L${i}`) }),
                ];
                t.step(1, root == null ? "The tree is empty." : "A queue processes nodes in the order they were discovered, which is exactly level by level.", draw(null));
                while (q.length) {
                    const size = q.length;
                    const level = [];
                    t.step(3, `${size} node(s) in the queue — that's the whole of level ${levels.length}.`, draw(null, level));
                    for (let k = 0; k < size; k++) {
                        const { node } = q.shift();
                        level.push(nodes[node].v);
                        tones[node] = "found";
                        t.step(5, `Take ${nodes[node].v} from the front.`, draw(node, level));
                        tones[node] = "done";
                        const kids = [nodes[node].left, nodes[node].right].filter((c) => c != null);
                        for (const c of kids) {
                            q.push({ id: `q-${c}`, v: nodes[c].v, node: c });
                            tones[c] = "compare";
                        }
                        t.step(6, kids.length ? `Queue its children: ${kids.map((c) => nodes[c].v).join(", ")}.` : `${nodes[node].v} is a leaf — nothing to queue.`, draw(node, level));
                    }
                    levels.push(level);
                    t.step(7, `Level ${levels.length - 1} done: [${level.join(", ")}].`, draw(null));
                }
                t.result(levels.map((l) => l.join(" ")).join(" | "));
            },
        },
    ],
};

export const heightOfTree = {
    id: "height-of-tree",
    titles: ["Height of Tree", "Maximum Depth of Binary Tree"],
    sample: "3 9 20 null null 15 7",
    parse: treeInput,
    approaches: [
        {
            key: "recursive",
            label: "Recursive DFS",
            complexity: { time: "O(n)", space: "O(h)" },
            code: [
                "def height(node):",
                "    if not node: return 0",
                "    l = height(node.left)",
                "    r = height(node.right)",
                "    return 1 + max(l, r)",
            ],
            run({ nodes, root }, t) {
                const frames = [];
                const tones = {};
                const badges = {};
                const draw = (cur) => [tree("tree", nodes, root, { pointers: { node: cur }, tones, badges }), calls("calls", frames)];
                if (root == null) {
                    t.step(2, "An empty tree has height 0.", draw(null));
                    t.result("0");
                    return;
                }
                t.step(1, "The height of a node is 1 + the taller of its two subtrees; an empty subtree has height 0.", draw(root));
                const go = (id) => {
                    frames.push({ label: `height(${nodes[id].v})` });
                    tones[id] = "active";
                    t.step(3, `At ${nodes[id].v}: first measure the left subtree${nodes[id].left ? "" : " (empty → 0)"}.`, draw(id));
                    const l = nodes[id].left != null ? go(nodes[id].left) : 0;
                    t.step(4, `Left height of ${nodes[id].v} is ${l}. Now the right${nodes[id].right ? "" : " (empty → 0)"}.`, draw(id));
                    const r = nodes[id].right != null ? go(nodes[id].right) : 0;
                    const h = 1 + Math.max(l, r);
                    badges[id] = `h=${h}`;
                    tones[id] = "done";
                    frames[frames.length - 1].value = h;
                    t.step(5, `height(${nodes[id].v}) = 1 + max(${l}, ${r}) = ${h}.`, draw(id));
                    frames.pop();
                    return h;
                };
                const h = go(root);
                tones[root] = "found";
                t.step(5, `The tree's height is ${h}.`, draw(null));
                t.result(String(h));
            },
        },
    ],
};

export const checkBalancedTree = {
    id: "check-balanced-tree",
    titles: ["Check Balanced Tree", "Balanced Binary Tree"],
    sample: "3 9 20 null null 15 7",
    parse: treeInput,
    approaches: [
        {
            key: "bottom-up",
            label: "Bottom-up heights",
            complexity: { time: "O(n)", space: "O(h)" },
            code: [
                "def check(node):            # height, or -1 if unbalanced",
                "    if not node: return 0",
                "    l, r = check(node.left), check(node.right)",
                "    if l == -1 or r == -1 or abs(l - r) > 1: return -1",
                "    return 1 + max(l, r)",
                "print(check(root) != -1)",
            ],
            run({ nodes, root }, t) {
                const tones = {};
                const badges = {};
                const draw = (cur) => [tree("tree", nodes, root, { pointers: { node: cur }, tones, badges })];
                if (root == null) {
                    t.step(2, "An empty tree is balanced.", draw(null));
                    t.result("true");
                    return;
                }
                t.step(1, "A tree is balanced when, at every node, the two subtree heights differ by at most 1. Compute heights bottom-up and stop as soon as one node fails.", draw(root));
                const go = (id) => {
                    if (id == null) return 0;
                    tones[id] = "active";
                    t.step(3, `At ${nodes[id].v}: get the heights of both subtrees.`, draw(id));
                    const l = go(nodes[id].left);
                    if (l === -1) return -1;
                    const r = go(nodes[id].right);
                    if (r === -1) return -1;
                    if (Math.abs(l - r) > 1) {
                        tones[id] = "bad";
                        badges[id] = `${l} vs ${r}`;
                        t.step(4, `At ${nodes[id].v} the left height is ${l} and the right is ${r} — they differ by ${Math.abs(l - r)} > 1. Unbalanced.`, draw(id));
                        return -1;
                    }
                    const h = 1 + Math.max(l, r);
                    tones[id] = "done";
                    badges[id] = `h=${h}`;
                    t.step(5, `${nodes[id].v}: heights ${l} and ${r} differ by ≤ 1, so it's fine. Its height is ${h}.`, draw(id));
                    return h;
                };
                const ok = go(root) !== -1;
                if (ok) tones[root] = "found";
                t.step(6, ok ? "Every node passed — the tree is balanced." : "One node failed, so the tree is not balanced.", draw(null));
                t.result(String(ok));
            },
        },
    ],
};
