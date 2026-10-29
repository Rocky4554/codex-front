"use client";

import { useId } from "react";

/**
 * Neo-brutalist playlist card: flat colored tile with a permanently
 * visible stacked-deck shadow and a spinning circular "Learn more"
 * badge; hover just deepens the lift and reveals the CTA.
 */
export function PlaylistCard({ playlist, onClick }) {
    const color = playlist.accentColor || "#A8E6CF";
    const title = (playlist.title || "Untitled").toUpperCase();
    const desc =
        playlist.description?.trim() ||
        `${playlist.problemCount ?? 0} problem${(playlist.problemCount ?? 0) === 1 ? "" : "s"} in this playlist.`;
    const badgePathId = useId();

    return (
        <button
            type="button"
            onClick={onClick}
            className="group relative block w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
            style={{ perspective: "800px" }}
        >
            {/* Stack layers — always visible, deepen further on hover */}
            <span
                aria-hidden
                className="pointer-events-none absolute inset-0 border-2 border-black transition-all duration-300 ease-out
                           translate-x-2 translate-y-2 group-hover:translate-x-3 group-hover:translate-y-3"
                style={{ backgroundColor: color, filter: "brightness(0.85)" }}
            />
            <span
                aria-hidden
                className="pointer-events-none absolute inset-0 border-2 border-black transition-all duration-300 ease-out delay-75
                           translate-x-1 translate-y-1 group-hover:translate-x-2 group-hover:translate-y-2"
                style={{ backgroundColor: color, filter: "brightness(0.92)" }}
            />

            {/* Front card */}
            <div
                className="relative z-10 flex min-h-[240px] flex-col border-2 border-black p-5 transition-all duration-300 ease-out
                           group-hover:-translate-x-0.5 group-hover:-translate-y-1.5 group-hover:shadow-[8px_8px_0_0_#000]"
                style={{ backgroundColor: color }}
            >
                {/* Spinning circular "Learn more" badge — overlaps the top-right corner */}
                <div className="pointer-events-none absolute -right-3 -top-3 z-20 h-16 w-16" title="Learn more">
                    <svg viewBox="0 0 100 100" className="h-full w-full animate-[spin_9s_linear_infinite]">
                        <defs>
                            <path id={badgePathId} d="M 50,50 m -38,0 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0" fill="none" />
                        </defs>
                        <circle cx="50" cy="50" r="48" fill="white" stroke="black" strokeWidth="2" />
                        <text className="fill-black text-[10.5px] font-black uppercase" style={{ letterSpacing: "0.05em" }}>
                            <textPath href={`#${badgePathId}`}>
                                • Learn more • Learn more
                            </textPath>
                        </text>
                    </svg>
                </div>

                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0 pr-10">
                        <span className="material-symbols-outlined text-[18px] text-black">
                            arrow_forward
                        </span>
                        <h3 className="text-lg font-black uppercase tracking-tight text-black leading-tight truncate">
                            {title}
                        </h3>
                    </div>
                </div>

                <p className="mt-4 flex-1 text-sm leading-relaxed text-black/80 line-clamp-4">
                    {desc}
                </p>

                <div className="mt-auto pt-4">
                    <span className="mb-3 block text-xs font-semibold uppercase tracking-wide text-black/60 transition-opacity duration-200 group-hover:opacity-0 group-hover:h-0 group-hover:mb-0 overflow-hidden">
                        {playlist.problemCount ?? 0} problems{playlist.featured ? " · Featured" : ""}
                    </span>
                    <span
                        className="flex w-full items-center justify-center border-2 border-black bg-white px-4 py-2.5 text-xs font-black uppercase tracking-wide text-black
                                   opacity-0 translate-y-3 max-h-0 overflow-hidden transition-all duration-300 delay-75
                                   group-hover:opacity-100 group-hover:translate-y-0 group-hover:max-h-12"
                    >
                        Let&apos;s go
                    </span>
                </div>
            </div>
        </button>
    );
}
