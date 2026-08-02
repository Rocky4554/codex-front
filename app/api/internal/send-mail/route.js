import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

/**
 * Internal webhook called by the Java backend to send mail via Gmail SMTP (Nodemailer).
 * Protected by X-Mail-Secret — never expose without that shared secret.
 */
export async function POST(request) {
    const expected = process.env.MAIL_WEBHOOK_SECRET || "";
    const provided = request.headers.get("X-Mail-Secret") || "";

    if (!expected || provided !== expected) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const smtpUser = process.env.SMTP_USERNAME;
    const smtpPass = process.env.SMTP_PASSWORD;
    if (!smtpUser || !smtpPass) {
        return NextResponse.json(
            { error: "SMTP is not configured on the frontend" },
            { status: 503 }
        );
    }

    let body;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const { to, subject, html, from } = body || {};
    if (!to || !subject || !html) {
        return NextResponse.json({ error: "to, subject, and html are required" }, { status: 400 });
    }

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: Number(process.env.SMTP_PORT || 587),
        secure: false,
        auth: { user: smtpUser, pass: smtpPass },
    });

    try {
        await transporter.sendMail({
            from: from || process.env.MAIL_FROM || smtpUser,
            to,
            subject,
            html,
        });
        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error("[send-mail] SMTP failure:", err?.message || err);
        return NextResponse.json({ error: "Failed to send email" }, { status: 502 });
    }
}
