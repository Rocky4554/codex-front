// LLD lesson: the Observer pattern, told through SprintCode's own domain —
// a ContestTimer that must tell the Leaderboard and an EmailAlert when the
// contest ends, without knowing either of them exists.
//
// LLD steps reuse the DSA step schema (codeLine, narration, vars) but render
// a diagram instead of an array:
//   classDiagram  { classes, relations, shownClassIds, shownRelIds, activeIds }
//   sequence      { actors, messages, shownCount, activeIndex }
// Diagrams are declared ONCE per approach; every step just says what is
// visible, so each step stays a full snapshot and scrubbing stays free.

const classes = [
    {
        id: "subj",
        name: "Subject",
        fields: ["- observers: List<Observer>"],
        methods: ["+ attach(o)", "+ detach(o)", "+ notify(event)"],
        x: 0,
        y: 0,
    },
    {
        id: "obs",
        name: "Observer",
        stereotype: "interface",
        methods: ["+ update(event)"],
        x: 2.1,
        y: 0.12,
    },
    {
        id: "timer",
        name: "ContestTimer",
        fields: ["- endsAt: Instant"],
        methods: ["+ tick()"],
        x: 0,
        y: 1.45,
    },
    {
        id: "board",
        name: "Leaderboard",
        methods: ["+ update(event)"],
        x: 1.35,
        y: 1.5,
    },
    {
        id: "mail",
        name: "EmailAlert",
        methods: ["+ update(event)"],
        x: 2.55,
        y: 1.5,
    },
];

const relations = [
    { id: "agg", from: "subj", to: "obs", kind: "aggregate", label: "notifies", toMult: "*" },
    { id: "inh", from: "timer", to: "subj", kind: "inherit", label: "is-a" },
    { id: "imp1", from: "board", to: "obs", kind: "implement" },
    { id: "imp2", from: "mail", to: "obs", kind: "implement" },
];

// Helper: a class-diagram snapshot showing the given ids.
const cd = (shownClassIds, shownRelIds, activeIds) => ({
    classes,
    relations,
    shownClassIds,
    shownRelIds,
    activeIds,
});

const actors = [
    { id: "clk", label: "Clock", kind: "actor" },
    { id: "timer", label: "ContestTimer" },
    { id: "board", label: "Leaderboard" },
    { id: "mail", label: "EmailAlert" },
];

const messages = [
    { id: "m1", from: "clk", to: "timer", label: "tick()", kind: "call" },
    { id: "m2", from: "timer", to: "timer", label: 'notify("ended")', kind: "self" },
    { id: "m3", from: "timer", to: "board", label: "update(event)", kind: "call" },
    { id: "m4", from: "board", to: "timer", label: "ok", kind: "return" },
    { id: "m5", from: "timer", to: "mail", label: "update(event)", kind: "call" },
    { id: "m6", from: "mail", to: "timer", label: "ok", kind: "return" },
];

// Helper: a sequence snapshot with `shownCount` revealed, `activeIndex` hot.
const seq = (shownCount, activeIndex) => ({ actors, messages, shownCount, activeIndex });

export const observerPattern = {
    id: "observer-pattern",
    title: "Observer Pattern",
    kind: "concept",
    approaches: [
        {
            label: "Structure · class diagram",
            pseudocode: [
                "interface Observer { update(event) }",
                "",
                "class Subject {",
                "    observers: List<Observer>",
                "    attach(o) · detach(o) · notify(event)",
                "}",
                "",
                "class ContestTimer extends Subject { tick() }",
                "class Leaderboard implements Observer { update(e) }",
                "class EmailAlert  implements Observer { update(e) }",
            ],
            steps: [
                {
                    codeLine: 3,
                    narration:
                        "The problem: when a contest ends, the timer must refresh the leaderboard AND send emails — without hard-coding either. Start with Subject: it keeps a list of observers and can attach, detach and notify them.",
                    classDiagram: cd(["subj"], [], ["subj"]),
                    vars: [["goal", "decouple sender from receivers"]],
                },
                {
                    codeLine: 1,
                    narration:
                        "Observer is a one-method interface. The hollow diamond is AGGREGATION: Subject has many observers (the * multiplicity) but doesn't own their lifetime. Subject depends on nothing else.",
                    classDiagram: cd(["subj", "obs"], ["agg"], ["obs", "agg"]),
                    vars: [["◇ hollow diamond", "has-many, not owned"]],
                },
                {
                    codeLine: 8,
                    narration:
                        "ContestTimer is-a Subject — the solid line with a hollow triangle is INHERITANCE. It inherits the observer list and notify() for free; all it adds is tick().",
                    classDiagram: cd(["subj", "obs", "timer"], ["agg", "inh"], ["timer", "inh"]),
                    vars: [["△ hollow triangle", "is-a"]],
                },
                {
                    codeLine: 9,
                    narration:
                        "Leaderboard IMPLEMENTS Observer — the dashed line with a hollow triangle. When update(event) arrives it recomputes rankings, but Subject never knows that.",
                    classDiagram: cd(["subj", "obs", "timer", "board"], ["agg", "inh", "imp1"], ["board", "imp1"]),
                    vars: [["⇢△ dashed + triangle", "implements"]],
                },
                {
                    codeLine: 10,
                    narration:
                        "EmailAlert implements the same interface. Want a Slack ping next week? Add one more class — ContestTimer never changes. That's the Open/Closed principle in action.",
                    classDiagram: cd(
                        ["subj", "obs", "timer", "board", "mail"],
                        ["agg", "inh", "imp1", "imp2"],
                        ["mail", "imp2"],
                    ),
                    vars: [["open/closed", "extend, don't modify"]],
                },
                {
                    codeLine: 5,
                    narration:
                        "The finished structure. Every arrow of coupling crosses ONE tiny interface: publishers know Observer, never Leaderboard or EmailAlert. Now let's watch it run.",
                    classDiagram: cd(
                        ["subj", "obs", "timer", "board", "mail"],
                        ["agg", "inh", "imp1", "imp2"],
                        ["obs"],
                    ),
                    vars: [["coupling", "1 interface"]],
                },
            ],
        },
        {
            label: "Behaviour · sequence diagram",
            pseudocode: [
                "tick():",
                "    if now ≥ endsAt:",
                "        notify(\"ended\")",
                "",
                "notify(event):",
                "    for o in observers:",
                "        o.update(event)",
            ],
            steps: [
                {
                    codeLine: 1,
                    narration:
                        "Reading a sequence diagram: each dashed vertical line is a LIFELINE — one object existing through time, which flows downward. The stick figure is an external actor.",
                    sequence: seq(0, -1),
                    vars: [["lifeline", "one object over time"]],
                },
                {
                    codeLine: 2,
                    narration: "The clock fires tick(). A solid arrow is a synchronous CALL from one lifeline to another.",
                    sequence: seq(1, 0),
                    vars: [["→ solid", "call"]],
                },
                {
                    codeLine: 3,
                    narration:
                        "The deadline has passed, so the timer calls its own notify() — a SELF-MESSAGE, drawn as a little loop back onto the same lifeline.",
                    sequence: seq(2, 1),
                    vars: [["↩ loop", "self-call"]],
                },
                {
                    codeLine: 7,
                    narration: "notify() walks the observer list. First registered: the leaderboard gets update(event).",
                    sequence: seq(3, 2),
                    vars: [["o", "Leaderboard"]],
                },
                {
                    codeLine: 7,
                    narration:
                        "The dashed arrow is the RETURN. The timer doesn't inspect the result — it only needs to know the call finished.",
                    sequence: seq(4, 3),
                    vars: [["⇠ dashed", "return"]],
                },
                {
                    codeLine: 7,
                    narration: "Same loop, next observer: the email alert gets the identical update(event) call.",
                    sequence: seq(5, 4),
                    vars: [["o", "EmailAlert"]],
                },
                {
                    codeLine: 7,
                    narration: "…and returns. Every observer heard the event; the timer still has no idea who they were.",
                    sequence: seq(6, 5),
                    vars: [["observers notified", "2"]],
                },
                {
                    codeLine: 6,
                    narration:
                        "That one loop is the whole pattern: subscribers come and go at runtime via attach/detach, and the publisher's code never changes. O(n) calls for n observers — and zero coupling.",
                    sequence: seq(6, -1),
                    vars: [["pattern", "Observer"], ["coupling", "1 interface"]],
                },
            ],
        },
    ],
};
