"use client";

/**
 * Neo-brutalist playlist card: flat colored tile by default,
 * stacks + reveals CTA on hover (smooth CSS transition).
 */
export function PlaylistCard({ playlist, onClick }) {
    const color = playlist.accentColor || "#A8E6CF";
    const title = (playlist.title || "Untitled").toUpperCase();
    const desc =
        playlist.description?.trim() ||
        `${playlist.problemCount ?? 0} problem${(playlist.problemCount ?? 0) === 1 ? "" : "s"} in this playlist.`;

    return (
        <button
            type="button"
            onClick={onClick}
            className="group relative block w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
            style={{ perspective: "800px" }}
        >
            {/* Stack layers (visible on hover) */}
            <span
                aria-hidden
                className="pointer-events-none absolute inset-0 border-2 border-black bg-black/10 transition-all duration-300 ease-out
                           translate-x-0 translate-y-0 opacity-0
                           group-hover:translate-x-2 group-hover:translate-y-2 group-hover:opacity-100"
                style={{ backgroundColor: color, filter: "brightness(0.85)" }}
            />
            <span
                aria-hidden
                className="pointer-events-none absolute inset-0 border-2 border-black transition-all duration-300 ease-out delay-75
                           translate-x-0 translate-y-0 opacity-0
                           group-hover:translate-x-1 group-hover:translate-y-1 group-hover:opacity-100"
                style={{ backgroundColor: color, filter: "brightness(0.92)" }}
            />

            {/* Front card */}
            <div
                className="relative z-10 flex min-h-[240px] flex-col border-2 border-black p-5 transition-all duration-300 ease-out
                           group-hover:-translate-x-0.5 group-hover:-translate-y-1.5 group-hover:shadow-[8px_8px_0_0_#000]"
                style={{ backgroundColor: color }}
            >
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                        <span
                            className="material-symbols-outlined text-[18px] text-black opacity-0 -translate-x-2 transition-all duration-300
                                       group-hover:opacity-100 group-hover:translate-x-0"
                        >
                            arrow_forward
                        </span>
                        <h3 className="text-lg font-black uppercase tracking-tight text-black leading-tight truncate">
                            {title}
                        </h3>
                    </div>
                    <span
                        className="shrink-0 h-10 w-10 rounded-full border-2 border-black bg-white/40 flex items-center justify-center
                                   text-[8px] font-black uppercase leading-tight text-center text-black
                                   opacity-0 scale-50 rotate-12 transition-all duration-300 delay-100
                                   group-hover:opacity-100 group-hover:scale-100 group-hover:rotate-0"
                        title="Learn more"
                    >
                        Learn<br />more
                    </span>
                </div>

                <p className="mt-4 flex-1 text-sm leading-relaxed text-black/80 line-clamp-4">
                    {desc}
                </p>

                <div className="mt-auto pt-4">
                    <span className="mb-3 block text-xs font-semibold uppercase tracking-wide text-black/60 transition-opacity duration-200 group-hover:opacity-0 group-hover:h-0 group-hover:mb-0 overflow-hidden">
                        {playlist.problemCount ?? 0} problems
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
