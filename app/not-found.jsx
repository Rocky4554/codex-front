import Link from "next/link";

export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 text-white">
            <h1 className="text-6xl font-bold text-green-500 mb-4">404</h1>
            <p className="text-zinc-400 mb-6">Page not found</p>
            <Link
                href="/problems"
                className="px-4 py-2 bg-green-500 text-black rounded-lg font-medium hover:bg-green-400 transition-colors"
            >
                Back to Problems
            </Link>
        </div>
    );
}
