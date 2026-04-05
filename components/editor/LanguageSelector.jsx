"use client";
import { useEffect } from "react";
import { useEditorStore } from "@/store/editorStore";
import { useLanguages } from "@/hooks/useLanguages";

export function LanguageSelector() {
    const { selectedLanguage, setLanguage } = useEditorStore();
    const { data: languages, isLoading } = useLanguages();

    // Auto-select first language once loaded
    useEffect(() => {
        if (languages?.length && !selectedLanguage) {
            setLanguage(languages[0]);
        }
    }, [languages, selectedLanguage, setLanguage]);

    const handleChange = (e) => {
        const lang = languages?.find((l) => l.id === e.target.value);
        if (lang) setLanguage(lang);
    };

    if (isLoading) {
        return (
            <div className="bg-zinc-800 text-zinc-500 text-sm rounded px-3 py-1.5 border border-zinc-700 w-32 animate-pulse">
                Loading...
            </div>
        );
    }

    return (
        <select
            value={selectedLanguage?.id || ""}
            onChange={handleChange}
            className="bg-zinc-800 text-zinc-300 text-sm rounded px-3 py-1.5 border border-zinc-700 focus:outline-none focus:border-zinc-500 cursor-pointer hover:bg-zinc-700 transition-colors"
        >
            {(languages || []).map((lang) => (
                <option key={lang.id} value={lang.id}>
                    {lang.name}
                </option>
            ))}
        </select>
    );
}
