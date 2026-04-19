import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useEditorStore = create(
    persist(
        (set, get) => ({
            selectedLanguage: null,
            // Structure: { [problemId]: { [langId]: code } }
            code: {},
            currentProblemId: null,
            theme: "vs-dark",
            submissionVersion: 0,

            setLanguage: (languageObj) => set({ selectedLanguage: languageObj }),

            setProblemId: (problemId) => set({ currentProblemId: problemId }),

            setCode: (langId, value) =>
                set((state) => {
                    const pid = state.currentProblemId;
                    if (!pid) return state;
                    return {
                        code: {
                            ...state.code,
                            [pid]: {
                                ...(state.code[pid] || {}),
                                [langId]: value,
                            },
                        },
                    };
                }),

            // Load a past submission into the editor — forces Monaco remount via submissionVersion
            loadSubmission: (langObj, sourceCode) =>
                set((state) => {
                    const pid = state.currentProblemId;
                    if (!pid || !langObj) return state;
                    return {
                        selectedLanguage: langObj,
                        submissionVersion: state.submissionVersion + 1,
                        code: {
                            ...state.code,
                            [pid]: {
                                ...(state.code[pid] || {}),
                                [langObj.id]: sourceCode,
                            },
                        },
                    };
                }),

            getCode: () => {
                const { code, currentProblemId, selectedLanguage } = get();
                if (!currentProblemId || !selectedLanguage) return "";
                return code[currentProblemId]?.[selectedLanguage.id] || "";
            },

            setTheme: (theme) => set({ theme }),

            resetCode: (starterCode) => set({ code: starterCode || {} }),
        }),
        {
            name: "codex-code-v1",
            partialize: (state) => ({ code: state.code, theme: state.theme }),
        }
    )
);
