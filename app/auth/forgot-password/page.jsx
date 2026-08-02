import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export default function ForgotPasswordPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-950">
            <div className="w-full max-w-md p-8 bg-zinc-900 rounded-xl border border-zinc-800">
                <h1 className="text-2xl font-bold text-white mb-2">Forgot password</h1>
                <p className="text-zinc-500 text-sm mb-6">
                    Enter your email and we&apos;ll send a one-time reset code.
                </p>
                <ForgotPasswordForm />
            </div>
        </div>
    );
}
