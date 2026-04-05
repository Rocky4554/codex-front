import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950">
      <div className="w-full max-w-md p-8 bg-zinc-900 rounded-xl border border-zinc-800">
        <h1 className="text-2xl font-bold text-white mb-2">Sign In</h1>
        <p className="text-zinc-500 text-sm mb-6">Welcome back to CodeArena</p>
        <LoginForm />
      </div>
    </div>
  );
}