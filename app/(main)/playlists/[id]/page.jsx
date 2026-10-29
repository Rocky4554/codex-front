"use client";

import { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useProblems } from "@/hooks/useProblems";
import { useEditProblemAI } from "@/hooks/useAdmin";
import {
    usePlaylist,
    useAddProblemToPlaylist,
    useCreateProblemInPlaylist,
    useRemoveProblemFromPlaylist,
    useDeletePlaylist,
    useUpdatePlaylist,
    useReorderPlaylistProblems,
} from "@/hooks/usePlaylists";
import { ProblemForm, AiProblemGenerator } from "@/components/problems/ProblemAuthoring";
import { SortableProblemList } from "@/components/playlists/SortableProblemList";
import { AppHeader } from "@/components/shared/AppHeader";

export default function PlaylistDetailPage({ params }) {
    const { id } = use(params);
    const router = useRouter();
    const { isLoggedIn } = useAuthStore();
    const [hydrated, setHydrated] = useState(false);

    const { data: playlist, isLoading, error } = usePlaylist(id);
    const { data: catalogProblems } = useProblems();
    const addProblem = useAddProblemToPlaylist();
    const createInPlaylist = useCreateProblemInPlaylist();
    const removeProblem = useRemoveProblemFromPlaylist();
    const deletePlaylist = useDeletePlaylist();
    const updatePlaylist = useUpdatePlaylist();
    const reorderProblems = useReorderPlaylistProblems();
    const editAI = useEditProblemAI();

    const [tab, setTab] = useState("select"); // select | ai | manual
    const [search, setSearch] = useState("");
    const [aiDraft, setAiDraft] = useState(null);
    const [showManual, setShowManual] = useState(false);
    const [busyMsg, setBusyMsg] = useState("");
    const [editingMeta, setEditingMeta] = useState(false);
    const [metaTitle, setMetaTitle] = useState("");
    const [metaDesc, setMetaDesc] = useState("");

    useEffect(() => setHydrated(true), []);
    useEffect(() => {
        if (hydrated && !isLoggedIn) router.replace("/auth/login");
    }, [hydrated, isLoggedIn, router]);

    useEffect(() => {
        if (playlist) {
            setMetaTitle(playlist.title || "");
            setMetaDesc(playlist.description || "");
        }
    }, [playlist]);

    const inPlaylistIds = useMemo(
        () => new Set((playlist?.problems || []).map((p) => p.id)),
        [playlist],
    );

    const filteredCatalog = useMemo(() => {
        const q = search.trim().toLowerCase();
        return (catalogProblems || []).filter((p) => {
            if (inPlaylistIds.has(p.id)) return false;
            if (!q) return true;
            return p.title?.toLowerCase().includes(q);
        });
    }, [catalogProblems, search, inPlaylistIds]);

    const handleAddExisting = async (problemId) => {
        setBusyMsg("Adding…");
        try {
            await addProblem.mutateAsync({ playlistId: id, problemId });
        } catch (err) {
            window.alert(err?.response?.data?.message || "Failed to add problem");
        } finally {
            setBusyMsg("");
        }
    };

    const handleSaveNew = async (body) => {
        setBusyMsg("Saving problem…");
        try {
            await createInPlaylist.mutateAsync({ playlistId: id, body });
            setAiDraft(null);
            setShowManual(false);
            setTab("select");
        } catch (err) {
            window.alert(err?.response?.data?.message || "Failed to save problem");
        } finally {
            setBusyMsg("");
        }
    };

    const handleRemove = async (problemId, title) => {
        if (!confirm(`Remove "${title}" from this playlist?`)) return;
        try {
            await removeProblem.mutateAsync({ playlistId: id, problemId });
        } catch (err) {
            window.alert(err?.response?.data?.message || "Failed to remove");
        }
    };

    const handleReorder = async (orderedProblems) => {
        await reorderProblems.mutateAsync({
            playlistId: id,
            problemIds: orderedProblems.map((p) => p.id),
        });
    };

    const handleDeletePlaylist = async () => {
        if (!confirm(`Delete playlist "${playlist?.title}"? This cannot be undone.`)) return;
        await deletePlaylist.mutateAsync(id);
        router.push("/playlists");
    };

    const handleSaveMeta = async () => {
        try {
            await updatePlaylist.mutateAsync({
                id,
                title: metaTitle.trim(),
                description: metaDesc.trim(),
            });
            setEditingMeta(false);
        } catch (err) {
            window.alert(err?.response?.data?.message || "Failed to update");
        }
    };

    if (!hydrated || !isLoggedIn || isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#f4f4f5] dark:bg-[#09090b]">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
            </div>
        );
    }

    if (error || !playlist) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-[#f4f4f5] dark:bg-[#09090b]">
                <p className="text-rose-400">{error?.response?.data?.message || "Playlist not found"}</p>
                <Link href="/playlists" className="text-sm text-emerald-500 hover:underline">Back to playlists</Link>
            </div>
        );
    }

    const accent = playlist.accentColor || "#A8E6CF";
    const readOnly = Boolean(playlist.featured);

    return (
        <div className="min-h-screen bg-[#f4f4f5] dark:bg-[#09090b] text-slate-900 dark:text-slate-100">
            <AppHeader active="playlists" />
            <div className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-950/40 px-4">
                <div className="mx-auto flex h-10 max-w-6xl items-center justify-between">
                    <div className="flex items-center gap-3 text-sm">
                        <Link href="/playlists" className="text-zinc-400 hover:text-emerald-500">← Playlists</Link>
                        <span className="text-zinc-600">/</span>
                        <span className="font-medium text-zinc-200 truncate max-w-[40vw]">{playlist.title}</span>
                    </div>
                    {!readOnly && (
                        <button
                            onClick={handleDeletePlaylist}
                            className="text-xs font-medium text-rose-400 hover:text-rose-300"
                        >
                            Delete playlist
                        </button>
                    )}
                </div>
            </div>

            <main className="mx-auto max-w-6xl space-y-8 px-4 py-8">
                {/* Hero banner */}
                <section
                    className="border-2 border-black p-6 shadow-[6px_6px_0_0_#000]"
                    style={{ backgroundColor: accent }}
                >
                    {editingMeta ? (
                        <div className="space-y-3">
                            <input
                                value={metaTitle}
                                onChange={(e) => setMetaTitle(e.target.value)}
                                className="w-full border-2 border-black bg-white/80 px-3 py-2 text-lg font-black uppercase text-black"
                            />
                            <textarea
                                value={metaDesc}
                                onChange={(e) => setMetaDesc(e.target.value)}
                                rows={3}
                                className="w-full border-2 border-black bg-white/80 px-3 py-2 text-sm text-black"
                                placeholder="Optional description"
                            />
                            <div className="flex gap-2">
                                <button onClick={handleSaveMeta} className="border-2 border-black bg-black px-3 py-1.5 text-xs font-bold uppercase text-white">Save</button>
                                <button onClick={() => setEditingMeta(false)} className="px-3 py-1.5 text-xs font-medium text-black/70">Cancel</button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="flex items-start justify-between gap-4">
                                <h1 className="text-3xl font-black uppercase tracking-tight text-black">{playlist.title}</h1>
                                {readOnly
                                    ? <span className="border-2 border-black bg-white px-2 py-0.5 text-[10px] font-black uppercase text-black">Featured</span>
                                    : <button onClick={() => setEditingMeta(true)} className="text-xs font-bold uppercase text-black/70 hover:text-black">Edit</button>}
                            </div>
                            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-black/80">
                                {playlist.description || "No description yet — add problems below."}
                            </p>
                            <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-black/60">
                                {playlist.problemCount} problem{playlist.problemCount === 1 ? "" : "s"}
                            </p>
                        </>
                    )}
                </section>

                {/* Current problems */}
                <section>
                    <div className="mb-3 flex items-center justify-between gap-3">
                        <h2 className="text-sm font-bold uppercase tracking-wide text-zinc-500">Problems in this playlist</h2>
                        {!readOnly && (playlist.problems || []).length > 1 && (
                            <p className="text-[11px] text-zinc-500">Drag the handle to reorder</p>
                        )}
                    </div>
                    <SortableProblemList
                        problems={playlist.problems || []}
                        playlistId={id}
                        onReorder={handleReorder}
                        onRemove={handleRemove}
                        saving={reorderProblems.isPending || removeProblem.isPending}
                        readOnly={readOnly}
                    />
                </section>

                {/* Add problems */}
                {!readOnly && <section className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121214] p-5">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Add problems</h2>
                    <div className="mt-4 flex flex-wrap gap-2">
                        {[
                            { id: "select", label: "Select from catalog", icon: "search" },
                            { id: "ai", label: "Generate with AI", icon: "auto_awesome" },
                            { id: "manual", label: "Add manually", icon: "edit" },
                        ].map((t) => (
                            <button
                                key={t.id}
                                onClick={() => {
                                    setTab(t.id);
                                    if (t.id === "manual") {
                                        setShowManual(true);
                                        setAiDraft(null);
                                    }
                                }}
                                className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                                    tab === t.id
                                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                                        : "border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-white"
                                }`}
                            >
                                <span className="material-symbols-outlined text-[16px]">{t.icon}</span>
                                {t.label}
                            </button>
                        ))}
                    </div>

                    {busyMsg && <p className="mt-3 text-xs text-indigo-300">{busyMsg}</p>}

                    {tab === "select" && (
                        <div className="mt-5 space-y-3">
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search problems…"
                                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                            />
                            <div className="max-h-80 overflow-y-auto rounded-lg border border-zinc-800">
                                {filteredCatalog.length === 0 ? (
                                    <p className="p-4 text-center text-xs text-zinc-500">No matching problems to add.</p>
                                ) : (
                                    filteredCatalog.map((p) => (
                                        <div
                                            key={p.id}
                                            className="flex items-center gap-3 border-b border-zinc-800/80 px-3 py-2.5 last:border-0"
                                        >
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium text-zinc-100">{p.title}</p>
                                                <p className="text-[11px] text-zinc-500">{p.difficulty}</p>
                                            </div>
                                            <button
                                                onClick={() => handleAddExisting(p.id)}
                                                disabled={addProblem.isPending}
                                                className="shrink-0 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
                                            >
                                                Add
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {tab === "ai" && (
                        <div className="mt-5 space-y-4">
                            <AiProblemGenerator
                                onGenerated={(draft) => {
                                    setAiDraft(draft);
                                    setShowManual(true);
                                }}
                                busy={createInPlaylist.isPending}
                            />
                            {showManual && aiDraft && (
                                <div className="rounded-xl border border-zinc-700 bg-zinc-900/60 p-4">
                                    <h3 className="mb-3 text-sm font-semibold text-white">Review AI draft, then save to playlist</h3>
                                    <ProblemForm
                                        initial={aiDraft}
                                        onSave={handleSaveNew}
                                        onCancel={() => { setAiDraft(null); setShowManual(false); }}
                                        saving={createInPlaylist.isPending}
                                        onAiEdit={(payload) => editAI.mutateAsync(payload)}
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    {tab === "manual" && (
                        <div className="mt-5 rounded-xl border border-zinc-700 bg-zinc-900/60 p-4">
                            <h3 className="mb-3 text-sm font-semibold text-white">Create a problem manually</h3>
                            <ProblemForm
                                initial={null}
                                onSave={handleSaveNew}
                                onCancel={() => setTab("select")}
                                saving={createInPlaylist.isPending}
                            />
                        </div>
                    )}
                </section>}
            </main>
        </div>
    );
}
