import axios from "axios";

const api = axios.create({
    baseURL: "/api/proxy",
    timeout: 30000,
    headers: { "Content-Type": "application/json" },
    withCredentials: true,
});

const sendLog = (message, level, meta) => {
    fetch("/api/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, level, ...meta }),
    }).catch(() => {});
};

let handling401 = false;

async function handleUnauthorized() {
    if (handling401 || typeof window === "undefined") return;
    handling401 = true;
    try {
        // Clear stale Zustand + drop cookie so middleware/login behave correctly
        const { useAuthStore } = await import("@/store/authStore");
        useAuthStore.getState().clearAuth();
        await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    } finally {
        window.location.href = "/auth/login";
    }
}

api.interceptors.request.use((config) => {
    config._startTime = Date.now();
    return config;
});

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

        if (status === 401) {
            handleUnauthorized();
        }
        return Promise.reject(error);
    }
);

export default api;
