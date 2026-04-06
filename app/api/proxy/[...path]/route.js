import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL;

async function proxyRequest(request, { params }) {
    const { path } = await params;
    const pathStr = path.join("/");
    const { search } = new URL(request.url);
    const backendUrl = `${BACKEND_URL}/${pathStr}${search}`;

    const forwardHeaders = new Headers();
    const auth = request.headers.get("authorization");
    if (auth) forwardHeaders.set("authorization", auth);
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
    // Let Next.js handle transfer encoding
    responseHeaders.delete("transfer-encoding");

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
