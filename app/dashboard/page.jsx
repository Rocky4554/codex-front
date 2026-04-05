import { redirect } from "next/navigation";

// Dashboard redirects to problems — the main interface
export default function DashboardPage() {
    redirect("/problems");
}
