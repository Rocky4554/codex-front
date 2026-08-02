import { VerifyOtpForm } from "@/components/auth/VerifyOtpForm";

export default function VerifyOtpPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-950">
            <div className="w-full max-w-md p-8 bg-zinc-900 rounded-xl border border-zinc-800">
                <h1 className="text-2xl font-bold text-white mb-2">Enter reset code</h1>
                <p className="text-zinc-500 text-sm mb-6">
                    Check your inbox for the 6-digit OTP (expires in 10 minutes).
                </p>
                <VerifyOtpForm />
            </div>
        </div>
    );
}
