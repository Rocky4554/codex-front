"use client";
import { useEffect } from "react";

export function ErrorReporter() {
    useEffect(() => {
        const sendLog = (level, message, stack, url) => {
            fetch("/api/log", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    level,
                    message,
                    stack,
                    url: url || window.location.href,
                    userAgent: navigator.userAgent,
                }),
            }).catch(() => {}); // silently ignore if logging fails
        };

        // Catch unhandled JS errors
        const onError = (event) => {
            sendLog("error", event.message, event.error?.stack, window.location.href);
        };

        // Catch unhandled promise rejections
        const onUnhandledRejection = (event) => {
            const message = event.reason?.message || String(event.reason);
            const stack = event.reason?.stack;
            sendLog("error", message, stack, window.location.href);
        };

        window.addEventListener("error", onError);
        window.addEventListener("unhandledrejection", onUnhandledRejection);

        return () => {
            window.removeEventListener("error", onError);
            window.removeEventListener("unhandledrejection", onUnhandledRejection);
        };
    }, []);

    return null;
}
