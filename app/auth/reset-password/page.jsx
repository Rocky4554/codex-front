import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export default function ResetPasswordPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-950">
            <div className="w-full max-w-md p-8 bg-zinc-900 rounded-xl border border-zinc-800">
                <h1 className="text-2xl font-bold text-white mb-2">Set new password</h1>
                <p className="text-zinc-500 text-sm mb-6">
                    Choose a strong password. You&apos;ll be signed out on every device.
                </p>
                <ResetPasswordForm />
            </div>
        </div>
    );
}
