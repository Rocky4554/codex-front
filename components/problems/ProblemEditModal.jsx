"use client";

import { useAdminProblemDetail, useEditProblemAI, useUpdateProblem } from "@/hooks/useAdmin";
import { ProblemForm } from "@/components/problems/ProblemAuthoring";

/**
 * Edit an existing problem in a modal. Loads the full detail (hidden test
 * cases included) — saving replaces all test cases, so the form must start
 * from the complete set.
 */
export function ProblemEditModal({ problemId, onClose }) {
    const { data: problem, isLoading, error } = useAdminProblemDetail(problemId);
    const updateProblem = useUpdateProblem();
    const editAI = useEditProblemAI();

    const handleSave = async (body) => {
        try {
            await updateProblem.mutateAsync({ id: problemId, ...body });
            onClose();
        } catch (err) {
            window.alert(err?.response?.data?.message || "Failed to save problem");
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm">
            <div className="my-8 w-full max-w-4xl rounded-xl border border-zinc-700 bg-zinc-900 p-5">
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-white">Edit problem</h3>
                    <button onClick={onClose} className="text-xs text-zinc-400 hover:text-white">Close</button>
                </div>
                {isLoading ? (
                    <div className="flex justify-center py-10">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
                    </div>
                ) : error ? (
                    <p className="text-sm text-rose-400">{error?.response?.data?.message || "Could not load problem"}</p>
                ) : problem && (
                    <ProblemForm
                        key={problem.id}
                        initial={problem}
                        onSave={handleSave}
                        onCancel={onClose}
                        saving={updateProblem.isPending}
                        onAiEdit={(payload) => editAI.mutateAsync(payload)}
                    />
                )}
            </div>
        </div>
    );
}
