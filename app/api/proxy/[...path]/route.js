import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL;

async function proxyRequest(request, { params }) {
    const { path } = await params;
    const pathStr = path.join("/");
    const { search } = new URL(request.url);
    const backendUrl = `${BACKEND_URL}/${pathStr}${search}`;

    const forwardHeaders = new Headers();

    // Read JWT from httpOnly cookie and forward as Authorization header
    const authCookie = request.cookies.get("auth_token")?.value;
    if (authCookie) {
        forwardHeaders.set("authorization", `Bearer ${authCookie}`);
    }

    const contentType = request.headers.get("content-type");
    if (contentType) forwardHeaders.set("content-type", contentType);
    const accept = request.headers.get("accept");
    if (accept) forwardHeaders.set("accept", accept);

    const init = { method: request.method, headers: forwardHeaders };

    if (request.method !== "GET" && request.method !== "HEAD") {
        init.body = request.body;
        init.duplex = "half";
    }

    const backendRes = await fetch(backendUrl, init);

    const responseHeaders = new Headers(backendRes.headers);
    // fetch() auto-decompresses gzipped responses, so strip the hop-by-hop
    // headers that would otherwise tell the browser to decompress again.
    responseHeaders.delete("transfer-encoding");
    responseHeaders.delete("content-encoding");
    responseHeaders.delete("content-length");

    // SSE requires specific headers for streaming to work through the proxy
    const isSSE = backendRes.headers.get("content-type")?.includes("text/event-stream");
    if (isSSE) {
        responseHeaders.set("content-type", "text/event-stream");
        responseHeaders.set("cache-control", "no-cache, no-transform");
        responseHeaders.set("x-accel-buffering", "no");
        responseHeaders.set("connection", "keep-alive");
    }

    return new NextResponse(backendRes.body, {
        status: backendRes.status,
        headers: responseHeaders,
    });
}

export const GET = proxyRequest;
export const POST = proxyRequest;
export const PUT = proxyRequest;
export const DELETE = proxyRequest;
export const PATCH = proxyRequest;
