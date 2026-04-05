import { Navbar } from "@/components/shared/Navbar";

export default function MainLayout({ children }) {
    return (
        <div className="min-h-screen bg-zinc-950 text-white">
            <Navbar />
            <main>{children}</main>
        </div>
    );
}
