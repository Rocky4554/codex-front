import { cookies } from "next/headers";
import { redirect } from "next/navigation";

function decodeJwtPayload(token) {
    try {
        const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
        const json = Buffer.from(base64, "base64").toString("utf-8");
        return JSON.parse(json);
    } catch {
        return null;
    }
}

export default async function AdminLayout({ children }) {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) redirect("/problems");

    const payload = decodeJwtPayload(token);
    if (!payload || payload.role !== "ADMIN") redirect("/problems");

    return <>{children}</>;
}
