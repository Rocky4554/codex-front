import { Suspense } from "react";
import { ProblemSolvePage } from "@/components/problem-solve/ProblemSolvePage";

function SolveFallback() {
    return (
        <div className="flex h-screen items-center justify-center bg-[#09090b]">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
        </div>
    );
}

export default async function Page({ params }) {
    const { slug } = await params;
    return (
        <Suspense fallback={<SolveFallback />}>
            <ProblemSolvePage slug={slug} />
        </Suspense>
    );
}
