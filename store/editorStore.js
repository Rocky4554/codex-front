import { create } from "zustand";

export const useEditorStore = create((set, get) => ({
    // Full language object from API: { id (UUID), name, ... }
    // Falls back to null until languages are loaded
    selectedLanguage: null,
    code: {},
    theme: "vs-dark",

    setLanguage: (languageObj) => set({ selectedLanguage: languageObj }),

    setCode: (langId, code) =>
        set((state) => ({ code: { ...state.code, [langId]: code } })),

    getCode: () => {
        const { code, selectedLanguage } = get();
        return selectedLanguage ? (code[selectedLanguage.id] || "") : "";
    },

    setTheme: (theme) => set({ theme }),

    resetCode: (starterCode) => set({ code: starterCode || {} }),
}));
