"use client";
import { parseErrorMessage } from "@/lib/errorParser";
import { AlertCircle } from "lucide-react";

export function ErrorDisplay({ error, stderr, type = "COMPILATION_ERROR" }) {
    const isCompilationError = type === "COMPILATION_ERROR";
    const title = isCompilationError ? "Compilation Error" : "Runtime Error";

    const errorText = stderr || error;
    if (!errorText) return null;

    const errors = parseErrorMessage(errorText);

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400" />
                <p className="text-red-400 font-semibold">{title}</p>
            </div>

            <div className="bg-red-950/30 border border-red-500/30 p-3 rounded overflow-auto max-h-48">
                <div className="font-mono text-xs space-y-3 text-red-200">
                    {errors && errors.length > 0 ? (
                        errors.slice(0, 5).map((err, idx) => (
                            <div key={idx} className="border-b border-red-500/20 pb-2 last:border-b-0 last:pb-0">
                                {err.line && (
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-red-400 font-bold min-w-fit">
                                            Line {err.line}
                                            {err.column > 0 && `${err.column ? `:${err.column}` : ""}`}
                                        </span>
                                        <span className="text-red-300/70 text-xs">
                                            [{err.type}]
                                        </span>
                                    </div>
                                )}
                                <div className="text-red-300 mt-1 whitespace-pre-wrap break-words">
                                    {err.message}
                                </div>
                            </div>
                        ))
                    ) : (
                        <pre className="whitespace-pre-wrap text-red-300">
                            {errorText}
                        </pre>
                    )}
                </div>
                {errors && errors.length > 5 && (
                    <div className="text-zinc-500 text-xs mt-2 pt-2 border-t border-red-500/20">
                        ... and {errors.length - 5} more error(s)
                    </div>
                )}
            </div>
        </div>
    );
}
