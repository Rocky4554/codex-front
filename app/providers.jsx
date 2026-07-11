"use client";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "sonner";
import { queryClient } from "@/lib/queryClient";
import { AuthSync } from "@/components/auth/AuthSync";

export function Providers({ children }) {
    return (
        <QueryClientProvider client={queryClient}>
            <AuthSync />
            {children}
            <Toaster richColors position="bottom-right" />
            {process.env.NODE_ENV === "development" && <ReactQueryDevtools />}
        </QueryClientProvider>
    );
}
