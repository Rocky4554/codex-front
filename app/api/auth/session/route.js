import { NextResponse } from "next/server";

/**
 * Validates the httpOnly auth cookie against the backend.
 * Used to keep Zustand localStorage in sync with the real session.
 */
export async function GET(request) {
    const token = request.cookies.get("auth_token")?.value;
    if (!token) {
        return NextResponse.json({ authenticated: false });
    }

    try {
        const backendRes = await fetch(`${process.env.BACKEND_URL}/user/profile`, {
            headers: { Authorization: `Bearer ${token}` },
            cache: "no-store",
        });

        if (!backendRes.ok) {
            const response = NextResponse.json({ authenticated: false });
            // Drop invalid/expired cookie so middleware stops treating us as logged in
            response.cookies.set("auth_token", "", {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                maxAge: 0,
                path: "/",
            });
            return response;
        }

        const profile = await backendRes.json();
        return NextResponse.json({
            authenticated: true,
            user: {
                id: profile.id,
                username: profile.username,
                email: profile.email,
                role: profile.role,
            },
        });
    } catch {
        return NextResponse.json({ authenticated: false });
    }
}
