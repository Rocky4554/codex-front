import Link from "next/link";
import { StepPlayer } from "@/components/visualizer/StepPlayer";
import { twoSumII } from "@/lib/visualizations/two-sum-ii";
import { observerPattern } from "@/lib/visualizations/observer-pattern";

export const metadata = { title: "Visualizer — SprintCode" };

const demos = [
    { key: "two-sum-ii", label: "DSA · Two Sum II", viz: twoSumII },
    { key: "observer", label: "LLD · Observer Pattern", viz: observerPattern },
];

// Standalone demo of the step player. The same player is embedded as a
// "Visualize" tab on any problem page whose slug/title has an entry in
// lib/visualizations. Supports ?demo=<key>&step=<n> deep links.
export default async function VisualizerPage({ searchParams }) {
    const { step, demo } = await searchParams;
    const initialStep = Number.parseInt(step ?? "0", 10) || 0;
    const active = demos.find((d) => d.key === demo) ?? demos[0];

    return (
        <div className="mx-auto max-w-3xl px-4 py-8">
            <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                    <p className="text-[10px] uppercase tracking-widest text-zinc-500">Visualizer</p>
                    <h1 className="text-2xl font-bold text-white">{active.viz.title}</h1>
                </div>
                <div className="flex items-center gap-2">
                    {demos.map((d) => (
                        <Link
                            key={d.key}
                            href={`/visualizer?demo=${d.key}`}
                            className={`px-2.5 py-1 rounded-full border text-xs font-medium transition-colors ${
                                d.key === active.key
                                    ? "border-emerald-500/60 bg-emerald-500/10 text-emerald-300"
                                    : "border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800"
                            }`}
                        >
                            {d.label}
                        </Link>
                    ))}
                </div>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-[#18181b] overflow-hidden">
                <StepPlayer viz={active.viz} initialStep={initialStep} />
            </div>
        </div>
    );
}
