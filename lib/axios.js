import axios from "axios";
import { getApiToken } from "@/lib/tokenStore";

const api = axios.create({
    baseURL: "/api/proxy",
    timeout: 30000,
    headers: { "Content-Type": "application/json" },
    withCredentials: true,
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
    const token = getApiToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

const sendLog = (message, level, meta) => {
    fetch("/api/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, level, ...meta }),
    }).catch(() => {});
};

// Track API call timing
api.interceptors.request.use((config) => {
    config._startTime = Date.now();
    return config;
});

// Handle 401 — redirect to login, log failures
api.interceptors.response.use(
    (res) => {
        const duration = Date.now() - (res.config._startTime || Date.now());
        if (duration > 3000) {
            sendLog("Slow API call", "warn", { url: res.config.url, duration_ms: duration });
        }
        return res;
    },
    (error) => {
        const status = error.response?.status;
        const url = error.config?.url;
        const duration = Date.now() - (error.config?._startTime || Date.now());

        if (status !== 401) {
            sendLog("API Error", "error", { url, status, duration_ms: duration, message: error.message });
        }

        if (status === 401 && typeof window !== "undefined") {
            window.location.href = "/auth/login";
        }
        return Promise.reject(error);
    }
);

export default api;
