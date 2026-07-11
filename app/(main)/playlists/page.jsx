"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { usePlaylists, useCreatePlaylist } from "@/hooks/usePlaylists";
import { PlaylistCard } from "@/components/playlists/PlaylistCard";
import { AppHeader } from "@/components/shared/AppHeader";

export default function PlaylistsPage() {
    const router = useRouter();
    const { isLoggedIn } = useAuthStore();
    const { data: playlists, isLoading, error } = usePlaylists();
    const createPlaylist = useCreatePlaylist();

    const [hydrated, setHydrated] = useState(false);
    const [showCreate, setShowCreate] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [formError, setFormError] = useState("");

    useEffect(() => setHydrated(true), []);

    useEffect(() => {
        if (hydrated && !isLoggedIn) {
            router.replace("/auth/login");
        }
    }, [hydrated, isLoggedIn, router]);

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!title.trim()) {
            setFormError("Title is required");
            return;
        }
        setFormError("");
        try {
            const created = await createPlaylist.mutateAsync({
                title: title.trim(),
                description: description.trim() || null,
            });
            setShowCreate(false);
            setTitle("");
            setDescription("");
            router.push(`/playlists/${created.id}`);
        } catch (err) {
            setFormError(err?.response?.data?.message || err?.message || "Could not create playlist");
        }
    };

    if (!hydrated || !isLoggedIn) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#09090b]">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f4f4f5] dark:bg-[#09090b] text-slate-900 dark:text-slate-100 font-sans antialiased">
            <AppHeader active="playlists" />

            <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
                <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Your Playlists</h1>
                        <p className="mt-1 text-sm text-slate-500">
                            Curate problem sets — pick from the catalog or create new ones with AI.
                        </p>
                    </div>
                    <button
                        onClick={() => setShowCreate(true)}
                        className="inline-flex items-center gap-2 border-2 border-black bg-emerald-400 px-4 py-2.5 text-sm font-black uppercase tracking-wide text-black shadow-[4px_4px_0_0_#000] transition hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0_0_#000]"
                    >
                        <span className="material-symbols-outlined text-[18px]">add</span>
                        Create playlist
                    </button>
                </div>

                {isLoading && (
                    <div className="flex justify-center py-20">
                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
                    </div>
                )}

                {error && (
                    <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-400">
                        {error?.response?.data?.message || "Failed to load playlists"}
                    </p>
                )}

                {!isLoading && !error && (playlists || []).length === 0 && (
                    <div className="rounded-2xl border-2 border-dashed border-zinc-300 dark:border-zinc-700 px-6 py-16 text-center">
                        <p className="text-lg font-semibold text-slate-700 dark:text-slate-200">No playlists yet</p>
                        <p className="mt-1 text-sm text-slate-500">Create one to start collecting problems.</p>
                        <button
                            onClick={() => setShowCreate(true)}
                            className="mt-6 inline-flex items-center gap-2 border-2 border-black bg-white px-4 py-2 text-sm font-bold uppercase text-black"
                        >
                            Create playlist
                        </button>
                    </div>
                )}

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {(playlists || []).map((p) => (
                        <PlaylistCard
                            key={p.id}
                            playlist={p}
                            onClick={() => router.push(`/playlists/${p.id}`)}
                        />
                    ))}
                </div>
            </main>

            {showCreate && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                    <form
                        onSubmit={handleCreate}
                        className="w-full max-w-md border-2 border-black bg-white p-6 shadow-[8px_8px_0_0_#000] dark:bg-[#18181b]"
                    >
                        <h2 className="text-xl font-black uppercase text-black dark:text-white">New playlist</h2>
                        <p className="mt-1 text-xs text-zinc-500">Title is required. Description is optional.</p>

                        <label className="mt-5 block text-xs font-semibold uppercase text-zinc-500">Title *</label>
                        <input
                            autoFocus
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="mt-1 w-full border-2 border-black bg-transparent px-3 py-2 text-sm text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            placeholder="e.g. Dynamic Programming"
                            maxLength={120}
                        />

                        <label className="mt-4 block text-xs font-semibold uppercase text-zinc-500">Description (optional)</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            className="mt-1 w-full resize-y border-2 border-black bg-transparent px-3 py-2 text-sm text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            placeholder="What is this playlist about?"
                            maxLength={2000}
                        />

                        {formError && <p className="mt-3 text-xs text-rose-500">{formError}</p>}

                        <div className="mt-6 flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => { setShowCreate(false); setFormError(""); }}
                                className="px-4 py-2 text-sm font-medium text-zinc-500 hover:text-black dark:hover:text-white"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={createPlaylist.isPending}
                                className="border-2 border-black bg-emerald-400 px-4 py-2 text-sm font-black uppercase text-black disabled:opacity-50"
                            >
                                {createPlaylist.isPending ? "Creating…" : "Create"}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
