import { NextResponse } from "next/server";

const PROTECTED_ROUTES = ["/problems", "/dashboard", "/leaderboard"];
const AUTH_ROUTES = ["/auth/login", "/auth/register"];

export function middleware(request) {
    const token = request.cookies.get("auth_token")?.value;
    const path = request.nextUrl.pathname;

    const isProtected = PROTECTED_ROUTES.some((r) => path.startsWith(r));
    const isAuthRoute = AUTH_ROUTES.some((r) => path.startsWith(r));

    if (isProtected && !token) {
        return NextResponse.redirect(new URL("/auth/login", request.url));
    }

    if (isAuthRoute && token) {
        return NextResponse.redirect(new URL("/problems", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/problems/:path*", "/dashboard/:path*", "/leaderboard/:path*", "/auth/login", "/auth/register"],
};
