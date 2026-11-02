import { list, value } from "../structures.js";
import { int, lines, nums, requireLength } from "../parse.js";
import { makeList, walk } from "./linkedlist.js";

const listValues = (line, max = 10) => requireLength(nums(line), { max });
const nameOf = (byId, id) => (id == null ? "null" : String(byId[id].v));

export const detectCycle = {
    id: "detect-cycle",
    titles: ["Detect Cycle in Linked List", "Linked List Cycle"],
    sample: "3 2 0 -4\n1",
    parse(input) {
        const [a, b] = lines(input);
        const values = listValues(a);
        const pos = b == null ? -1 : int(b);
        if (pos >= values.length) throw new Error(`pos must be -1 or between 0 and ${values.length - 1}.`);
        return { values, pos };
    },
    approaches: [
        {
            key: "floyd",
            label: "Floyd's tortoise & hare",
            complexity: { time: "O(n)", space: "O(1)" },
            code: [
                "slow = fast = head",
                "while fast and fast.next:",
                "    slow = slow.next",
                "    fast = fast.next.next",
                "    if slow is fast:",
                "        return True",
                "return False",
            ],
            run({ values, pos }, t) {
                const { nodes, next, head } = makeList(values);
                const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));
                if (pos >= 0 && nodes.length) next[nodes[nodes.length - 1].id] = nodes[pos].id;
                const draw = (slow, fast, tones = {}) => [list("ll", nodes, next, { pointers: { slow, fast }, tones })];
                let slow = head, fast = head;
                t.step(
                    1,
                    pos >= 0
                        ? `The tail (${nameOf(byId, nodes[nodes.length - 1].id)}) links back to index ${pos}. Start both pointers at the head: slow moves 1 step, fast moves 2.`
                        : "Start both pointers at the head: slow moves 1 step, fast moves 2. If there's a loop, fast will lap slow.",
                    draw(slow, fast),
                );
                while (fast != null && next[fast] != null) {
                    t.step(2, `fast (${nameOf(byId, fast)}) and fast.next (${nameOf(byId, next[fast])}) exist, keep going.`, draw(slow, fast));
                    slow = next[slow];
                    t.step(3, `slow moves one step to ${nameOf(byId, slow)}.`, draw(slow, fast, { [slow]: "active" }));
                    fast = next[next[fast]];
                    t.step(4, `fast jumps two steps to ${nameOf(byId, fast)}.`, draw(slow, fast, { [slow]: "active", ...(fast ? { [fast]: "compare" } : {}) }));
                    if (slow === fast) {
                        t.step(6, `slow and fast meet at ${nameOf(byId, slow)} — only possible inside a loop. Cycle found.`, draw(slow, fast, { [slow]: "found" }));
                        t.result("true");
                        return;
                    }
                    t.step(5, "They haven't met yet.", draw(slow, fast));
                }
                t.step(7, "fast ran off the end of the list, so there is no loop.", draw(slow, fast));
                t.result("false");
            },
        },
    ],
};

export const findMiddleNode = {
    id: "find-middle-node",
    titles: ["Find Middle Node", "Middle of the Linked List"],
    sample: "1 2 3 4 5",
    parse: (input) => ({ values: listValues(lines(input)[0]) }),
    approaches: [
        {
            key: "slow-fast",
            label: "Slow & fast pointers",
            complexity: { time: "O(n)", space: "O(1)" },
            code: [
                "slow = fast = head",
                "while fast and fast.next:",
                "    slow = slow.next",
                "    fast = fast.next.next",
                "print(slow.val)",
            ],
            run({ values }, t) {
                const { nodes, next, head } = makeList(values);
                const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));
                const draw = (slow, fast, tones = {}) => [list("ll", nodes, next, { pointers: { slow, fast }, tones })];
                let slow = head, fast = head;
                t.step(1, "fast moves twice as fast as slow, so when fast reaches the end, slow is halfway.", draw(slow, fast));
                while (fast != null && next[fast] != null) {
                    t.step(2, `fast is at ${nameOf(byId, fast)} and has a next node, so take another step.`, draw(slow, fast));
                    slow = next[slow];
                    t.step(3, `slow → ${nameOf(byId, slow)}.`, draw(slow, fast, { [slow]: "active" }));
                    fast = next[next[fast]];
                    t.step(4, `fast → ${nameOf(byId, fast)}.`, draw(slow, fast, { [slow]: "active", ...(fast ? { [fast]: "compare" } : {}) }));
                }
                t.step(5, `fast can't move two more steps, so slow (${nameOf(byId, slow)}) is the middle.`, draw(slow, fast, { [slow]: "found" }));
                t.result(nameOf(byId, slow));
            },
        },
    ],
};

export const removeNthFromEnd = {
    id: "remove-nth-from-end",
    titles: ["Remove Nth Node From End", "Remove Nth Node From End of List"],
    sample: "1 2 3 4 5\n2",
    parse(input) {
        const [a, b] = lines(input);
        const values = listValues(a);
        const n = int(b);
        if (n < 1 || n > values.length) throw new Error(`n must be between 1 and ${values.length}.`);
        return { values, n };
    },
    approaches: [
        {
            key: "two-pointers",
            label: "Two pointers with a gap",
            complexity: { time: "O(n)", space: "O(1)" },
            code: [
                "dummy = Node(0, head)",
                "fast = slow = dummy",
                "for _ in range(n): fast = fast.next",
                "while fast.next:",
                "    fast, slow = fast.next, slow.next",
                "slow.next = slow.next.next   # unlink",
                "print list from dummy.next",
            ],
            run({ values, n }, t) {
                const { nodes: real, next } = makeList(values);
                const dummy = { id: "dummy", v: "D" };
                const nodes = [dummy, ...real];
                next.dummy = real[0].id;
                const byId = Object.fromEntries(nodes.map((x) => [x.id, x]));
                const removed = {};
                const draw = (p, tones = {}) => [list("ll", nodes, next, { pointers: p, tones: { dummy: "dim", ...removed, ...tones } })];
                t.step(1, "A dummy node in front of the head means removing the first node needs no special case.", draw({}));
                let fast = "dummy", slow = "dummy";
                t.step(2, "Both pointers start at the dummy.", draw({ slow, fast }));
                for (let k = 1; k <= n; k++) {
                    fast = next[fast];
                    t.step(3, `Move fast ahead ${k} of ${n}: fast = ${nameOf(byId, fast)}. This opens a gap of n nodes.`, draw({ slow, fast }, { [fast]: "compare" }));
                }
                while (next[fast] != null) {
                    fast = next[fast];
                    slow = next[slow];
                    t.step(5, `Move both: slow = ${nameOf(byId, slow)}, fast = ${nameOf(byId, fast)}. The gap stays ${n}.`, draw({ slow, fast }, { [slow]: "active", [fast]: "compare" }));
                }
                const target = next[slow];
                t.step(4, `fast is the last node, so slow.next (${nameOf(byId, target)}) is the ${n}${n === 1 ? "st" : n === 2 ? "nd" : n === 3 ? "rd" : "th"} from the end.`, draw({ slow, fast }, { [slow]: "active", [target]: "bad" }));
                next[slow] = next[target];
                next[target] = null;
                removed[target] = "dim";
                t.step(6, `Unlink it: ${nameOf(byId, slow)}.next now points to ${nameOf(byId, next[slow])}.`, draw({ slow }, { [slow]: "active" }));
                const out = walk(next, next.dummy, byId);
                t.step(7, `Result: ${out.join(" → ")}.`, draw({ head: next.dummy }));
                t.result(out.join(" "));
            },
        },
    ],
};

export const mergeTwoSortedLists = {
    id: "merge-two-sorted-lists",
    titles: ["Merge Two Sorted Linked Lists", "Merge Two Sorted Lists"],
    sample: "1 2 4\n1 3 4",
    parse(input) {
        const [a, b] = lines(input);
        return { a: requireLength(nums(a ?? ""), { min: 0, max: 6 }), b: requireLength(nums(b ?? ""), { min: 0, max: 6 }) };
    },
    approaches: [
        {
            key: "dummy-tail",
            label: "Dummy head + tail",
            complexity: { time: "O(n + m)", space: "O(1)" },
            code: [
                "dummy = tail = Node(0)",
                "while l1 and l2:",
                "    if l1.val <= l2.val: tail.next, l1 = l1, l1.next",
                "    else:                tail.next, l2 = l2, l2.next",
                "    tail = tail.next",
                "tail.next = l1 or l2",
                "return dummy.next",
            ],
            run({ a, b }, t) {
                const A = makeList(a, "a");
                const B = makeList(b, "b");
                const dummy = { id: "dummy", v: "D" };
                const nodes = [dummy, ...A.nodes, ...B.nodes];
                const next = { dummy: null, ...A.next, ...B.next };
                const byId = Object.fromEntries(nodes.map((x) => [x.id, x]));
                const merged = {};
                let l1 = A.head, l2 = B.head, tail = "dummy";
                const draw = (tones = {}) => [
                    list("ll", nodes, next, { pointers: { tail, l1, l2 }, tones: { dummy: "dim", ...merged, ...tones } }),
                    value("merged", "merged so far", walk(next, next.dummy, byId).join(" → ") || "(empty)"),
                ];
                t.step(1, "Lay both lists side by side behind a dummy node. tail always points to the last merged node; we rewire links instead of copying values.", draw());
                while (l1 != null && l2 != null) {
                    t.step(2, `Compare l1 = ${nameOf(byId, l1)} and l2 = ${nameOf(byId, l2)}.`, draw({ [l1]: "compare", [l2]: "compare" }));
                    let pick;
                    if (byId[l1].v <= byId[l2].v) {
                        pick = l1;
                        next[tail] = l1;
                        l1 = next[l1];
                        t.step(3, `${byId[pick].v} ≤ ${byId[l2].v}, so link ${nameOf(byId, tail)} → ${byId[pick].v} and advance l1.`, draw({ [pick]: "active" }));
                    } else {
                        pick = l2;
                        next[tail] = l2;
                        l2 = next[l2];
                        t.step(4, `${byId[pick].v} < ${byId[l1].v}, so link ${nameOf(byId, tail)} → ${byId[pick].v} and advance l2.`, draw({ [pick]: "active" }));
                    }
                    merged[pick] = "done";
                    tail = pick;
                    t.step(5, `tail moves to ${byId[tail].v}.`, draw());
                }
                const rest = l1 ?? l2;
                next[tail] = rest;
                for (let cur = rest; cur != null; cur = next[cur]) merged[cur] = "done";
                t.step(6, rest ? `One list is empty; attach the rest (${nameOf(byId, rest)} …) in one step.` : "Both lists are used up.", draw());
                const out = walk(next, next.dummy, byId);
                t.step(7, `Merged: ${out.join(" → ") || "(empty)"}.`, draw());
                t.result(out.join(" "));
            },
        },
    ],
};
