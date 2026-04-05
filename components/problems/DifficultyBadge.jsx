import { cn } from "@/lib/utils";

const COLORS = {
    easy: "text-green-400",
    medium: "text-yellow-400",
    hard: "text-red-400",
};

export function DifficultyBadge({ difficulty, className }) {
    return (
        <span className={cn("text-sm font-medium capitalize", COLORS[difficulty], className)}>
            {difficulty}
        </span>
    );
}
