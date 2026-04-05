"use client";
import { Clock, Cpu } from "lucide-react";
import { LoadingSpinner } from "../shared/LoadingSpinner";

export function OutputPanel({ output, isLoading }) {
    if (isLoading) {
        return (
            <div className="h-full bg-zinc-950 p-4 border-t border-zinc-800 flex items-center justify-center">
                <div className="flex items-center gap-3 text-zinc-400">
                    <LoadingSpinner size="sm" />
                    <span className="text-sm font-medium animate-pulse">Running code...</span>
                </div>
            </div>
        );
    }

    if (!output) {
        return (
            <div className="h-full bg-zinc-950 p-4 border-t border-zinc-800 flex items-center justify-center">
                <p className="text-zinc-600 text-sm">Run your code to see output here.</p>
            </div>
        );
    }

    const isError = output.status !== "Accepted" && output.status !== "Finished";

    return (
        <div className="h-full bg-zinc-950 border-t border-zinc-800 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800/50 bg-zinc-900/50">
                <span
                    className={`text-sm font-bold ${isError ? "text-red-400" : "text-green-400"
                        }`}
                >
                    {output.status}
                </span>
                <div className="flex items-center gap-4 text-xs text-zinc-500">
                    {output.time && (
                        <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {output.time}ms
                        </span>
                    )}
                    {output.memory && (
                        <span className="flex items-center gap-1">
                            <Cpu className="w-3 h-3" /> {output.memory}MB
                        </span>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-4 overflow-y-auto font-mono text-sm space-y-4">
                {output.compileError ? (
                    <div>
                        <p className="text-red-400/80 mb-2 font-semibold">Compile Error:</p>
                        <pre className="text-red-400 whitespace-pre-wrap bg-red-400/10 p-3 rounded border border-red-500/20">
                            {output.compileError}
                        </pre>
                    </div>
                ) : output.runtimeError ? (
                    <div>
                        <p className="text-red-400/80 mb-2 font-semibold">Runtime Error:</p>
                        <pre className="text-red-400 whitespace-pre-wrap bg-red-400/10 p-3 rounded border border-red-500/20">
                            {output.runtimeError}
                        </pre>
                    </div>
                ) : (
                    <div>
                        <p className="text-zinc-500 mb-2">Stdout:</p>
                        <pre className="text-zinc-300 whitespace-pre-wrap">
                            {output.stdout || "No output"}
                        </pre>

                        {/* If it's a submission and it failed, show test case diff */}
                        {output.expectedOutput && (
                            <div className="mt-4 space-y-2">
                                <p className="text-zinc-500">Expected Output:</p>
                                <pre className="text-green-400 px-3 py-2 bg-green-400/10 rounded">
                                    {output.expectedOutput}
                                </pre>
                                <p className="text-zinc-500">Your Output:</p>
                                <pre className="text-red-400 px-3 py-2 bg-red-400/10 rounded">
                                    {output.userOutput}
                                </pre>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
