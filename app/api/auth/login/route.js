import { NextResponse } from "next/server";

export async function POST(request) {
    const body = await request.json();

    // Forward to real backend
    const backendRes = await fetch(`${process.env.BACKEND_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });

    const data = await backendRes.json();

    if (!backendRes.ok) {
        return NextResponse.json(data, { status: backendRes.status });
    }

    const user = data.user ?? { id: data.userId, username: data.username, email: data.email };
    const token = data.token;

    // Only return user info — token lives in httpOnly cookie only
    const response = NextResponse.json({ user });
    response.cookies.set("auth_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/",
    });

    return response;
}
