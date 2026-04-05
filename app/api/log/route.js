import { NextResponse } from "next/server";

const LOKI_URL = process.env.LOKI_URL;         // https://logs-prod-028.grafana.net/loki/api/v1/push
const LOKI_USERNAME = process.env.LOKI_USERNAME; // 1540790
const LOKI_PASSWORD = process.env.LOKI_PASSWORD; // your grafana API key

async function pushToLoki(level, logLine) {
    if (!LOKI_URL || !LOKI_USERNAME || !LOKI_PASSWORD) return;

    const payload = {
        streams: [
            {
                stream: {
                    service: "codex-frontend",
                    level,
                    env: process.env.NODE_ENV || "production",
                },
                values: [
                    [String(Date.now() * 1_000_000), logLine],
                ],
            },
        ],
    };

    await fetch(LOKI_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: "Basic " + Buffer.from(`${LOKI_USERNAME}:${LOKI_PASSWORD}`).toString("base64"),
        },
        body: JSON.stringify(payload),
    });
}

export async function POST(request) {
    const body = await request.json();
    const { level = "error", message, stack, url, userAgent } = body;

    const logLine = JSON.stringify({
        timestamp: new Date().toISOString(),
        message,
        stack,
        url,
        userAgent,
    });

    // Push directly to Loki (works from Vercel serverless)
    await pushToLoki(level, logLine).catch(() => {});

    // Also log to stdout for Vercel dashboard
    console.log(logLine);

    return NextResponse.json({ ok: true });
}
