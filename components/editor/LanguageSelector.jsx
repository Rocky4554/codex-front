"use client";
import { useEffect, useMemo } from "react";
import { useEditorStore } from "@/store/editorStore";
import { useLanguages } from "@/hooks/useLanguages";

const isSqlLanguage = (lang) => String(lang?.name || "").toLowerCase().includes("sql");

/**
 * Language picker. SQL problems only offer SQL; other problems hide it.
 * Pass `sqlOnly` = undefined to show every language.
 */
export function LanguageSelector({ sqlOnly }) {
    const { selectedLanguage, setLanguage } = useEditorStore();
    const { data: languages, isLoading } = useLanguages();

    const options = useMemo(() => {
        if (!languages) return [];
        if (sqlOnly === undefined) return languages;
        const filtered = languages.filter((l) => isSqlLanguage(l) === sqlOnly);
        return filtered.length ? filtered : languages;
    }, [languages, sqlOnly]);

    // Keep the selection valid for this problem (e.g. switch to SQL on a SQL problem).
    useEffect(() => {
        if (!options.length) return;
        if (!selectedLanguage || !options.some((l) => l.id === selectedLanguage.id)) {
            setLanguage(options[0]);
        }
    }, [options, selectedLanguage, setLanguage]);

    const handleChange = (e) => {
        const lang = options.find((l) => l.id === e.target.value);
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
            {options.map((lang) => (
                <option key={lang.id} value={lang.id}>
                    {lang.name}
                    {lang.version ? ` (${lang.version})` : ""}
                </option>
            ))}
        </select>
    );
}
