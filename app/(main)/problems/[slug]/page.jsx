import { use } from "react";
import { ProblemSolvePage } from "@/components/problem-solve/ProblemSolvePage";

export default function Page({ params }) {
    const { slug } = use(params);
    return <ProblemSolvePage slug={slug} />;
}
