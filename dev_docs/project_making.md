# CodeArena — Full Implementation Plan (JavaScript)

> **LeetCode-Style Coding Platform — Next.js Frontend**
> Language: **JavaScript** (not TypeScript)

---

## 0. Tech Stack & Versions

| Tool | Purpose |
|------|---------|
| Next.js 14+ (App Router) | Framework |
| JavaScript (JSX) | Language |
| Tailwind CSS + shadcn/ui | Styling |
| Zustand | Global client state |
| TanStack Query v5 | Server state & caching |
| Monaco Editor (`@monaco-editor/react`) | Code editor |
| Axios | HTTP client with interceptors |
| JWT (httpOnly cookies) | Auth — set server-side |
| `react-resizable-panels` | Draggable split panels |
| `sonner` | Toast notifications |
| lucide-react | Icons |
| clsx + tailwind-merge | Utility classnames |

### Why Zustand over Redux Toolkit?

- **Bundle**: ~1 KB vs ~11 KB
- **No Provider needed** — works outside React (e.g., Axios interceptors)
- **No overlap** — TanStack Query handles server state; Zustand only handles client state (auth, editor)
- **Granular selectors** prevent Monaco re-renders
- **Built-in `persist` middleware** — no extra deps

---

## 1. Project Initialization

```bash
npx create-next-app@latest ./ \
  --js \
  --tailwind \
  --app \
  --src-dir \
  --import-alias "@/*"

# Core deps
npm install zustand @tanstack/react-query @tanstack/react-query-devtools \
  axios @monaco-editor/react monaco-editor lucide-react clsx tailwind-merge

# UI & UX
npm install react-resizable-panels sonner use-debounce

# Init shadcn/ui
npx shadcn-ui@latest init
```

---

## 2. Project Folder Structure

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.jsx
│   │   └── register/page.jsx
│   ├── (main)/
│   │   ├── layout.jsx            # Navbar layout
│   │   ├── problems/
│   │   │   ├── page.jsx          # Problems list
│   │   │   └── [slug]/
│   │   │       └── page.jsx      # Problem solve page
│   │   └── dashboard/
│   │       └── page.jsx
│   ├── api/
│   │   └── auth/
│   │       ├── login/route.js    # Server-side cookie setter
│   │       ├── register/route.js
│   │       └── logout/route.js
│   ├── layout.jsx                # Root layout (providers)
│   ├── providers.jsx
│   ├── loading.jsx
│   └── not-found.jsx
│
├── components/
│   ├── ui/                       # shadcn/ui base
│   ├── auth/
│   │   ├── LoginForm.jsx
│   │   └── RegisterForm.jsx
│   ├── problems/
│   │   ├── ProblemsTable.jsx
│   │   ├── ProblemFilters.jsx
│   │   ├── DifficultyBadge.jsx
│   │   └── ProblemRow.jsx
│   ├── editor/
│   │   ├── CodeEditor.jsx        # Monaco (lazy loaded)
│   │   ├── LanguageSelector.jsx
│   │   └── OutputPanel.jsx
│   ├── problem-solve/
│   │   ├── ProblemSolvePage.jsx
│   │   ├── ProblemPanel.jsx
│   │   └── SolvePanel.jsx
│   └── shared/
│       ├── Navbar.jsx
│       ├── LoadingSpinner.jsx
│       └── ErrorBoundary.jsx
│
├── hooks/
│   ├── useAuth.js
│   ├── useProblems.js
│   ├── useProblem.js
│   └── useCodeExecution.js
│
├── lib/
│   ├── axios.js                  # Axios instance + interceptors
│   ├── queryClient.js
│   └── utils.js                  # cn() helper
│
├── store/
│   ├── authStore.js
│   └── editorStore.js
│
└── middleware.js                  # Route protection
```

---

## 3. Utilities

### `src/lib/utils.js`

```javascript
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
```

---

## 4. Axios Instance with Auth Interceptors

### `src/lib/axios.js`

```javascript
import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL, // e.g. http://localhost:8000/api
  timeout: 30000, // 30s for code execution
  headers: { "Content-Type": "application/json" },
  withCredentials: true, // IMPORTANT: sends httpOnly cookies automatically
});

// Response interceptor — handle 401
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
```

> **Improvement over original plan:** No `js-cookie` needed. The token lives in an httpOnly cookie set by the server-side API route — the browser sends it automatically with `withCredentials: true`.

---

## 5. Server-Side Auth Routes (httpOnly Cookie — Security Fix)

> **⚠️ Critical Fix:** The original plan used `js-cookie` to store JWTs client-side. This is vulnerable to XSS. Instead, we use Next.js API routes to proxy auth and set httpOnly cookies server-side.

### `src/app/api/auth/login/route.js`

```javascript
import { NextResponse } from "next/server";

export async function POST(request) {
  const body = await request.json();

  // Forward to real backend
  const backendRes = await fetch(`${process.env.BACKEND_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await backendRes.json();

  if (!backendRes.ok) {
    return NextResponse.json(data, { status: backendRes.status });
  }

  // Set httpOnly cookie — NOT accessible via JavaScript
  const response = NextResponse.json({ user: data.user });
  response.cookies.set("auth_token", data.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });

  return response;
}
```

### `src/app/api/auth/register/route.js`

```javascript
import { NextResponse } from "next/server";

export async function POST(request) {
  const body = await request.json();

  const backendRes = await fetch(`${process.env.BACKEND_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await backendRes.json();

  if (!backendRes.ok) {
    return NextResponse.json(data, { status: backendRes.status });
  }

  const response = NextResponse.json({ user: data.user });
  response.cookies.set("auth_token", data.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  return response;
}
```

### `src/app/api/auth/logout/route.js`

```javascript
import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.set("auth_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0, // Expire immediately
    path: "/",
  });
  return response;
}
```

---

## 6. TanStack Query Client

### `src/lib/queryClient.js`

```javascript
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,    // 5 min
      gcTime: 1000 * 60 * 30,       // 30 min cache
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
```

---

## 7. Zustand Stores

### `src/store/authStore.js`

```javascript
import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      isLoggedIn: false,

      setAuth: (user) => {
        set({ user, isLoggedIn: true });
      },

      logout: async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        set({ user: null, isLoggedIn: false });
      },
    }),
    { name: "auth-storage" }
  )
);
```

> **Note:** No token stored in Zustand — only user info. The token is in the httpOnly cookie managed server-side.

### `src/store/editorStore.js`

```javascript
import { create } from "zustand";

export const useEditorStore = create((set) => ({
  language: "python",
  code: { python: "", java: "", cpp: "", javascript: "" },
  theme: "vs-dark",

  setLanguage: (language) => set({ language }),
  setCode: (lang, code) =>
    set((state) => ({ code: { ...state.code, [lang]: code } })),
  setTheme: (theme) => set({ theme }),
  resetCode: (starterCode) => set({ code: starterCode }),
}));
```

---

## 8. Custom Hooks (API Calls via TanStack Query)

### `src/hooks/useAuth.js`

```javascript
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

export const useLogin = () => {
  const { setAuth } = useAuthStore();
  const router = useRouter();

  return useMutation({
    mutationFn: async (payload) => {
      // Call our Next.js API route (which sets httpOnly cookie)
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Login failed");
      }
      return res.json();
    },
    onSuccess: ({ user }) => {
      setAuth(user);
      router.push("/problems");
    },
  });
};

export const useRegister = () => {
  const { setAuth } = useAuthStore();
  const router = useRouter();

  return useMutation({
    mutationFn: async (payload) => {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Registration failed");
      }
      return res.json();
    },
    onSuccess: ({ user }) => {
      setAuth(user);
      router.push("/problems");
    },
  });
};
```

### `src/hooks/useProblems.js`

```javascript
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";

const fetchProblems = async () => {
  const { data } = await api.get("/problems");
  return data;
};

export const useProblems = () =>
  useQuery({
    queryKey: ["problems"],
    queryFn: fetchProblems,
  });
```

### `src/hooks/useProblem.js`

```javascript
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";

const fetchProblem = async (slug) => {
  const { data } = await api.get(`/problems/${slug}`);
  return data;
};

export const useProblem = (slug) =>
  useQuery({
    queryKey: ["problem", slug],
    queryFn: () => fetchProblem(slug),
    enabled: !!slug,
    staleTime: 1000 * 60 * 10, // 10 min
  });
```

### `src/hooks/useCodeExecution.js`

```javascript
import { useMutation } from "@tanstack/react-query";
import api from "@/lib/axios";

const runCode = async (payload) => {
  const { data } = await api.post("/execute/run", payload);
  return data;
};

const submitCode = async (payload) => {
  const { data } = await api.post("/execute/submit", payload);
  return data;
};

export const useRunCode = () => useMutation({ mutationFn: runCode });
export const useSubmitCode = () => useMutation({ mutationFn: submitCode });
```

---

## 9. Route Protection Middleware

### `src/middleware.js`

```javascript
import { NextResponse } from "next/server";

const PROTECTED_ROUTES = ["/problems", "/dashboard"];
const AUTH_ROUTES = ["/login", "/register"];

export function middleware(request) {
  const token = request.cookies.get("auth_token")?.value;
  const path = request.nextUrl.pathname;

  const isProtected = PROTECTED_ROUTES.some((r) => path.startsWith(r));
  const isAuthRoute = AUTH_ROUTES.some((r) => path.startsWith(r));

  if (isProtected && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL("/problems", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/problems/:path*", "/dashboard/:path*", "/login", "/register"],
};
```

---

## 10. Root Layout & Providers

### `src/app/layout.jsx`

```jsx
import { Providers } from "./providers";
import "./globals.css";

export const metadata = {
  title: "CodeArena",
  description: "Practice coding problems and ace your interviews",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

### `src/app/providers.jsx`

```jsx
"use client";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "sonner";
import { queryClient } from "@/lib/queryClient";

export function Providers({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster richColors position="bottom-right" />
      {process.env.NODE_ENV === "development" && <ReactQueryDevtools />}
    </QueryClientProvider>
  );
}
```

### `src/app/loading.jsx`

```jsx
export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950">
      <div className="animate-spin w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full" />
    </div>
  );
}
```

### `src/app/not-found.jsx`

```jsx
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 text-white">
      <h1 className="text-6xl font-bold text-green-500 mb-4">404</h1>
      <p className="text-zinc-400 mb-6">Page not found</p>
      <Link
        href="/problems"
        className="px-4 py-2 bg-green-500 text-black rounded-lg font-medium hover:bg-green-400 transition-colors"
      >
        Back to Problems
      </Link>
    </div>
  );
}
```

---

## 11. Shared Components

### `src/components/shared/Navbar.jsx`

```jsx
"use client";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export function Navbar() {
  const { user, isLoggedIn, logout } = useAuthStore();
  const router = useRouter();

  // Fix hydration mismatch with Zustand persist
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <nav className="h-12 flex items-center justify-between px-6 border-b border-zinc-800 bg-zinc-900/50 backdrop-blur sticky top-0 z-50">
      <Link href="/problems" className="text-white font-bold text-lg">
        ⚡ CodeArena
      </Link>
      <div className="flex items-center gap-4">
        {!hydrated ? null : isLoggedIn ? (
          <>
            <span className="text-zinc-400 text-sm">{user?.username}</span>
            <button
              onClick={handleLogout}
              className="text-sm text-zinc-400 hover:text-white transition-colors"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className="text-sm text-zinc-400 hover:text-white">
              Login
            </Link>
            <Link
              href="/register"
              className="text-sm bg-green-500 text-black px-3 py-1 rounded font-medium hover:bg-green-400"
            >
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
```

> **Improvement:** Added hydration guard to prevent mismatch between server-rendered HTML and client state from localStorage.

### `src/components/shared/ErrorBoundary.jsx`

```jsx
"use client";
import { Component } from "react";

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <p className="text-red-400 font-medium">Something went wrong</p>
              <button
                onClick={() => this.setState({ hasError: false })}
                className="mt-2 text-sm text-zinc-400 hover:text-white"
              >
                Try again
              </button>
            </div>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
```

### `src/components/shared/LoadingSpinner.jsx`

```jsx
export function LoadingSpinner({ size = "md" }) {
  const sizes = { sm: "w-4 h-4", md: "w-6 h-6", lg: "w-8 h-8" };

  return (
    <div
      className={`${sizes[size]} animate-spin border-2 border-green-500 border-t-transparent rounded-full`}
    />
  );
}
```

---

## 12. Auth Pages & Components

### `src/app/(auth)/login/page.jsx`

```jsx
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
```

### `src/components/auth/LoginForm.jsx`

```jsx
"use client";
import { useState } from "react";
import { useLogin } from "@/hooks/useAuth";
import Link from "next/link";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { mutate: login, isPending, error } = useLogin();

  const handleSubmit = (e) => {
    e.preventDefault();
    login({ email, password });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-green-500 transition-colors"
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-green-500 transition-colors"
        required
      />
      {error && (
        <p className="text-red-400 text-sm">{error.message || "Login failed"}</p>
      )}
      <button
        type="submit"
        disabled={isPending}
        className="w-full py-2.5 bg-green-500 hover:bg-green-400 text-black font-semibold rounded-lg disabled:opacity-50 transition-colors"
      >
        {isPending ? "Signing in..." : "Sign In"}
      </button>
      <p className="text-zinc-500 text-sm text-center">
        Don't have an account?{" "}
        <Link href="/register" className="text-green-400 hover:text-green-300">
          Register
        </Link>
      </p>
    </form>
  );
}
```

### `src/app/(auth)/register/page.jsx`

```jsx
import { RegisterForm } from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950">
      <div className="w-full max-w-md p-8 bg-zinc-900 rounded-xl border border-zinc-800">
        <h1 className="text-2xl font-bold text-white mb-2">Create Account</h1>
        <p className="text-zinc-500 text-sm mb-6">Start solving problems today</p>
        <RegisterForm />
      </div>
    </div>
  );
}
```

### `src/components/auth/RegisterForm.jsx`

```jsx
"use client";
import { useState } from "react";
import { useRegister } from "@/hooks/useAuth";
import Link from "next/link";

export function RegisterForm() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { mutate: register, isPending, error } = useRegister();

  const handleSubmit = (e) => {
    e.preventDefault();
    register({ username, email, password });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-green-500 transition-colors"
        required
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-green-500 transition-colors"
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-green-500 transition-colors"
        required
        minLength={6}
      />
      {error && (
        <p className="text-red-400 text-sm">
          {error.message || "Registration failed"}
        </p>
      )}
      <button
        type="submit"
        disabled={isPending}
        className="w-full py-2.5 bg-green-500 hover:bg-green-400 text-black font-semibold rounded-lg disabled:opacity-50 transition-colors"
      >
        {isPending ? "Creating account..." : "Create Account"}
      </button>
      <p className="text-zinc-500 text-sm text-center">
        Already have an account?{" "}
        <Link href="/login" className="text-green-400 hover:text-green-300">
          Sign In
        </Link>
      </p>
    </form>
  );
}
```

---

## 13. Main Layout with Navbar

### `src/app/(main)/layout.jsx`

```jsx
import { Navbar } from "@/components/shared/Navbar";

export default function MainLayout({ children }) {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Navbar />
      <main>{children}</main>
    </div>
  );
}
```

---

## 14. Problems List Page

### `src/app/(main)/problems/page.jsx`

```jsx
import { ProblemsTable } from "@/components/problems/ProblemsTable";
import { ProblemFilters } from "@/components/problems/ProblemFilters";
import { Suspense } from "react";

export default function ProblemsPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-white mb-6">Problems</h1>
      <Suspense
        fallback={<div className="text-zinc-400">Loading problems...</div>}
      >
        <ProblemFilters />
        <ProblemsTable />
      </Suspense>
    </div>
  );
}
```

### `src/components/problems/DifficultyBadge.jsx`

```jsx
import { cn } from "@/lib/utils";

const COLORS = {
  easy: "text-green-400",
  medium: "text-yellow-400",
  hard: "text-red-400",
};

export function DifficultyBadge({ difficulty, className }) {
  return (
    <span className={cn("text-sm font-medium capitalize", COLORS[difficulty], className)}>
      {difficulty}
    </span>
  );
}
```

### `src/components/problems/ProblemFilters.jsx` *(New — was missing)*

```jsx
"use client";
import { useState } from "react";

export function ProblemFilters({ onFilterChange }) {
  const [difficulty, setDifficulty] = useState("all");
  const [search, setSearch] = useState("");

  const handleDifficultyChange = (value) => {
    setDifficulty(value);
    onFilterChange?.({ difficulty: value, search });
  };

  const handleSearchChange = (value) => {
    setSearch(value);
    onFilterChange?.({ difficulty, search: value });
  };

  return (
    <div className="flex items-center gap-4 mb-6">
      <input
        type="text"
        placeholder="Search problems..."
        value={search}
        onChange={(e) => handleSearchChange(e.target.value)}
        className="flex-1 max-w-xs px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
      />
      <div className="flex gap-2">
        {["all", "easy", "medium", "hard"].map((level) => (
          <button
            key={level}
            onClick={() => handleDifficultyChange(level)}
            className={`px-3 py-1 text-sm rounded-md capitalize transition-colors ${
              difficulty === level
                ? "bg-zinc-700 text-white"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {level}
          </button>
        ))}
      </div>
    </div>
  );
}
```

### `src/components/problems/ProblemsTable.jsx`

```jsx
"use client";
import { useProblems } from "@/hooks/useProblems";
import { DifficultyBadge } from "./DifficultyBadge";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export function ProblemsTable() {
  const { data: problems, isLoading, error } = useProblems();

  if (isLoading) return <LoadingSkeleton />;
  if (error)
    return <div className="text-red-400">Failed to load problems</div>;

  return (
    <table className="w-full">
      <thead>
        <tr className="text-left text-zinc-500 border-b border-zinc-800">
          <th className="pb-3 font-medium w-12">Status</th>
          <th className="pb-3 font-medium">Title</th>
          <th className="pb-3 font-medium">Difficulty</th>
          <th className="pb-3 font-medium">Acceptance</th>
        </tr>
      </thead>
      <tbody>
        {problems?.map((problem, i) => (
          <tr
            key={problem.id}
            className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors"
          >
            <td className="py-3">
              {problem.isSolved && (
                <CheckCircle2 className="w-4 h-4 text-green-500" />
              )}
            </td>
            <td className="py-3">
              <Link
                href={`/problems/${problem.slug}`}
                className="text-white hover:text-green-400 transition-colors font-medium"
              >
                {i + 1}. {problem.title}
              </Link>
            </td>
            <td className="py-3">
              <DifficultyBadge difficulty={problem.difficulty} />
            </td>
            <td className="py-3 text-zinc-400 text-sm">
              {problem.acceptanceRate}%
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="h-12 bg-zinc-800/50 rounded animate-pulse" />
      ))}
    </div>
  );
}
```

---

## 15. Problem Solve Page (Core Feature)

### `src/app/(main)/problems/[slug]/page.jsx`

```jsx
import { ProblemSolvePage } from "@/components/problem-solve/ProblemSolvePage";

export default async function Page({ params }) {
  const { slug } = await params;
  return <ProblemSolvePage slug={slug} />;
}
```

### `src/components/problem-solve/ProblemSolvePage.jsx`

```jsx
"use client";
import { useProblem } from "@/hooks/useProblem";
import { ProblemPanel } from "./ProblemPanel";
import { SolvePanel } from "./SolvePanel";
import { useEffect } from "react";
import { useEditorStore } from "@/store/editorStore";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import { PanelGroup, Panel, PanelResizeHandle } from "react-resizable-panels";

export function ProblemSolvePage({ slug }) {
  const { data: problem, isLoading } = useProblem(slug);
  const resetCode = useEditorStore((s) => s.resetCode);

  // Load starter code when problem loads
  useEffect(() => {
    if (problem?.starterCode) {
      resetCode(problem.starterCode);
    }
  }, [problem?.id]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-950">
        <div className="animate-spin w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!problem) return <div className="text-red-400 p-8">Problem not found</div>;

  return (
    <div className="h-[calc(100vh-48px)] bg-zinc-950">
      <PanelGroup direction="horizontal">
        {/* Left: Problem Description */}
        <Panel defaultSize={45} minSize={30}>
          <div className="h-full overflow-y-auto">
            <ProblemPanel problem={problem} />
          </div>
        </Panel>

        {/* Draggable divider */}
        <PanelResizeHandle className="w-1.5 bg-zinc-800 hover:bg-green-500/50 transition-colors cursor-col-resize" />

        {/* Right: Editor + Output */}
        <Panel defaultSize={55} minSize={30}>
          <ErrorBoundary fallback={<div className="p-8 text-red-400">Editor failed to load</div>}>
            <SolvePanel problemId={problem.id} />
          </ErrorBoundary>
        </Panel>
      </PanelGroup>
    </div>
  );
}
```

> **Improvement:** Uses `react-resizable-panels` for a draggable split view instead of hardcoded `w-[45%]`. Wraps editor in `ErrorBoundary`.

### `src/components/problem-solve/ProblemPanel.jsx`

```jsx
import { DifficultyBadge } from "../problems/DifficultyBadge";

export function ProblemPanel({ problem }) {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">{problem.title}</h1>
        <DifficultyBadge difficulty={problem.difficulty} className="mt-2" />
      </div>

      <div
        className="prose prose-invert prose-sm max-w-none text-zinc-300"
        dangerouslySetInnerHTML={{ __html: problem.description }}
      />

      <div className="space-y-4">
        <h3 className="text-white font-semibold">Examples</h3>
        {problem.examples.map((ex, i) => (
          <div key={i} className="bg-zinc-900 rounded-lg p-4 font-mono text-sm">
            <p className="text-zinc-400">
              Input: <span className="text-white">{ex.input}</span>
            </p>
            <p className="text-zinc-400">
              Output: <span className="text-white">{ex.output}</span>
            </p>
            {ex.explanation && (
              <p className="text-zinc-400 mt-1">
                Explanation: <span className="text-zinc-300">{ex.explanation}</span>
              </p>
            )}
          </div>
        ))}
      </div>

      <div>
        <h3 className="text-white font-semibold mb-2">Constraints</h3>
        <ul className="space-y-1">
          {problem.constraints.map((c, i) => (
            <li key={i} className="text-zinc-400 text-sm font-mono">{c}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
```

### `src/components/problem-solve/SolvePanel.jsx`

```jsx
"use client";
import dynamic from "next/dynamic";
import { useState, useCallback, useEffect } from "react";
import { useEditorStore } from "@/store/editorStore";
import { useRunCode, useSubmitCode } from "@/hooks/useCodeExecution";
import { OutputPanel } from "../editor/OutputPanel";
import { LanguageSelector } from "../editor/LanguageSelector";
import { toast } from "sonner";

// LAZY LOAD Monaco — it's heavy (~2MB)
const CodeEditor = dynamic(
  () => import("../editor/CodeEditor").then((m) => m.CodeEditor),
  {
    ssr: false,
    loading: () => (
      <div className="flex-1 flex items-center justify-center bg-zinc-900">
        <span className="text-zinc-500 text-sm">Loading editor...</span>
      </div>
    ),
  }
);

export function SolvePanel({ problemId }) {
  const { language, code } = useEditorStore();
  const [result, setResult] = useState(null);

  const { mutate: runCode, isPending: isRunning } = useRunCode();
  const { mutate: submitCode, isPending: isSubmitting } = useSubmitCode();

  const handleRun = useCallback(() => {
    runCode(
      { problemId, language, code: code[language] },
      {
        onSuccess: (data) => {
          setResult(data);
          toast.info("Code executed");
        },
        onError: (e) => {
          setResult({ status: "runtime_error", error: e.message });
          toast.error("Execution failed");
        },
      }
    );
  }, [problemId, language, code, runCode]);

  const handleSubmit = useCallback(() => {
    submitCode(
      { problemId, language, code: code[language] },
      {
        onSuccess: (data) => {
          setResult(data);
          if (data.status === "accepted") {
            toast.success("All test cases passed! 🎉");
          } else {
            toast.error(data.status.replace(/_/g, " "));
          }
        },
      }
    );
  }, [problemId, language, code, submitCode]);

  // Keyboard shortcuts: Ctrl+Enter = Run, Ctrl+Shift+Enter = Submit
  useEffect(() => {
    const handler = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === "Enter") {
        e.preventDefault();
        handleSubmit();
      } else if (e.ctrlKey && e.key === "Enter") {
        e.preventDefault();
        handleRun();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleRun, handleSubmit]);

  return (
    <>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-900 border-b border-zinc-800">
        <LanguageSelector />
        <div className="flex items-center gap-2">
          <span className="text-zinc-600 text-xs hidden sm:inline">
            Ctrl+Enter to Run · Ctrl+Shift+Enter to Submit
          </span>
          <button
            onClick={handleRun}
            disabled={isRunning}
            className="px-4 py-1.5 text-sm bg-zinc-700 hover:bg-zinc-600 text-white rounded-md disabled:opacity-50 transition-colors"
          >
            {isRunning ? "Running..." : "▶ Run"}
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-4 py-1.5 text-sm bg-green-600 hover:bg-green-500 text-white font-semibold rounded-md disabled:opacity-50 transition-colors"
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 min-h-0">
        <CodeEditor />
      </div>

      {/* Output */}
      {result && (
        <div className="h-48 border-t border-zinc-800">
          <OutputPanel result={result} />
        </div>
      )}
    </>
  );
}
```

> **Improvements:** Added keyboard shortcuts (`Ctrl+Enter` / `Ctrl+Shift+Enter`), toast notifications via `sonner`, and `useCallback` for memoized handlers.

---

## 16. Editor Components

### `src/components/editor/CodeEditor.jsx`

```jsx
"use client";
import Editor from "@monaco-editor/react";
import { useEditorStore } from "@/store/editorStore";

const LANGUAGE_MAP = {
  python: "python",
  java: "java",
  cpp: "cpp",
  javascript: "javascript",
};

export function CodeEditor() {
  const { language, code, theme, setCode } = useEditorStore();

  return (
    <Editor
      height="100%"
      language={LANGUAGE_MAP[language]}
      theme={theme}
      value={code[language]}
      onChange={(value) => setCode(language, value || "")}
      options={{
        fontSize: 14,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        wordWrap: "on",
        tabSize: language === "python" ? 4 : 2,
        automaticLayout: true,
        fontFamily: "JetBrains Mono, Fira Code, monospace",
        fontLigatures: true,
        lineNumbers: "on",
        renderLineHighlight: "all",
      }}
    />
  );
}
```

### `src/components/editor/LanguageSelector.jsx`

```jsx
"use client";
import { useEditorStore } from "@/store/editorStore";

const LANGUAGES = [
  { value: "python", label: "Python 3" },
  { value: "java", label: "Java" },
  { value: "cpp", label: "C++" },
  { value: "javascript", label: "JavaScript" },
];

export function LanguageSelector() {
  const { language, setLanguage } = useEditorStore();

  return (
    <select
      value={language}
      onChange={(e) => setLanguage(e.target.value)}
      className="bg-zinc-800 text-white text-sm rounded px-3 py-1 border border-zinc-700 focus:outline-none focus:border-zinc-500"
    >
      {LANGUAGES.map((l) => (
        <option key={l.value} value={l.value}>
          {l.label}
        </option>
      ))}
    </select>
  );
}
```

### `src/components/editor/OutputPanel.jsx`

```jsx
"use client";
import { cn } from "@/lib/utils";

const STATUS_CONFIG = {
  accepted: { label: "Accepted", color: "text-green-400", bg: "bg-green-400/10" },
  wrong_answer: { label: "Wrong Answer", color: "text-red-400", bg: "bg-red-400/10" },
  compile_error: { label: "Compile Error", color: "text-yellow-400", bg: "bg-yellow-400/10" },
  runtime_error: { label: "Runtime Error", color: "text-orange-400", bg: "bg-orange-400/10" },
  time_limit_exceeded: { label: "TLE", color: "text-purple-400", bg: "bg-purple-400/10" },
};

export function OutputPanel({ result }) {
  const config = STATUS_CONFIG[result.status];

  return (
    <div className="h-full overflow-y-auto bg-zinc-950 p-4 font-mono text-sm">
      <div className={cn("inline-flex items-center gap-2 px-3 py-1 rounded-full mb-4", config.bg)}>
        <span className={cn("font-semibold", config.color)}>{config.label}</span>
        {result.testCasesPassed !== undefined && (
          <span className="text-zinc-400">
            {result.testCasesPassed}/{result.totalTestCases} passed
          </span>
        )}
      </div>

      {result.error && (
        <div className="bg-red-950/30 border border-red-900/50 rounded p-3 mb-3">
          <p className="text-red-300 text-xs whitespace-pre-wrap">{result.error}</p>
        </div>
      )}

      {result.status === "wrong_answer" && (
        <div className="space-y-2">
          <div>
            <p className="text-zinc-500 text-xs mb-1">Your Output:</p>
            <div className="bg-zinc-800 rounded p-2 text-red-300">{result.output}</div>
          </div>
          <div>
            <p className="text-zinc-500 text-xs mb-1">Expected:</p>
            <div className="bg-zinc-800 rounded p-2 text-green-300">{result.expectedOutput}</div>
          </div>
        </div>
      )}

      {result.status === "accepted" && result.output && (
        <div className="bg-zinc-800 rounded p-2 text-green-300">{result.output}</div>
      )}

      {result.runtime && (
        <div className="flex gap-4 mt-3 text-zinc-500 text-xs">
          <span>Runtime: <span className="text-zinc-300">{result.runtime}</span></span>
          {result.memory && (
            <span>Memory: <span className="text-zinc-300">{result.memory}</span></span>
          )}
        </div>
      )}
    </div>
  );
}
```

---

## 17. Environment Variables

### `.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
BACKEND_URL=http://localhost:8000/api
```

- `NEXT_PUBLIC_API_URL` — used by Axios on the client
- `BACKEND_URL` — used by server-side API routes (never exposed to browser)

---

## 18. API Contract (Backend Must Implement)

| Method | Path | Returns |
|--------|------|---------|
| POST | `/auth/login` | `{ user, token }` |
| POST | `/auth/register` | `{ user, token }` |
| GET | `/problems` | `Problem[]` |
| GET | `/problems/:slug` | `ProblemDetail` |
| POST | `/execute/run` | `ExecutionResult` |
| POST | `/execute/submit` | `ExecutionResult` |

### Data Shapes

```javascript
// Problem (list item)
{ id, slug, title, difficulty, tags, acceptanceRate, isSolved }

// ProblemDetail (full)
{ ...Problem, description, examples, constraints, starterCode }

// starterCode example
{ python: "def solve():\n    pass", java: "class Solution {}", ... }

// ExecutionResult
{ status, output, expectedOutput, error, runtime, memory, testCasesPassed, totalTestCases }

// status enum: "accepted" | "wrong_answer" | "compile_error" | "runtime_error" | "time_limit_exceeded"
```

---

## 19. Optimizations Checklist

### Code Splitting & Lazy Loading
- [ ] Monaco Editor loaded with `dynamic(() => import(...), { ssr: false })`
- [ ] Route-level splitting is automatic with App Router
- [ ] Problem filters are client components, table can be lazy loaded

### Caching Strategy
- [ ] TanStack Query caches problems list for 5 minutes
- [ ] Individual problem detail cached 10 minutes
- [ ] `gcTime: 30min` keeps data in memory after unmount
- [ ] Monaco editor initializes once per session

### State Management
- [ ] Zustand for auth (persisted) and editor state (not persisted)
- [ ] TanStack Query for all server state
- [ ] No duplication between Zustand and TanStack Query

### API Best Practices
- [ ] Single Axios instance with `withCredentials: true`
- [ ] Automatic 401 redirect via interceptor
- [ ] 30s timeout for code execution
- [ ] `useMutation` for run/submit (side effects)
- [ ] `useQuery` with proper keys for GET requests

### Performance
- [ ] Suspense boundaries on ProblemsTable
- [ ] Loading skeletons instead of blank states
- [ ] `useCallback` on run/submit handlers
- [ ] Editor auto-saves code per language in Zustand
- [ ] Hydration guard on Navbar for persisted Zustand state

### Security
- [ ] JWT in httpOnly cookie (set server-side)
- [ ] Middleware protects `/problems` and `/dashboard` routes
- [ ] No token in localStorage or client-accessible cookies
- [ ] `BACKEND_URL` env var is server-only (no `NEXT_PUBLIC_` prefix)

---

## 20. Nice-to-Have Enhancements (Future)

### 20.1 Dark/Light Theme Toggle
The `editorStore` already has a `theme` field. Add a toggle button in the Navbar and extend it to control the entire app via a CSS class on `<html>`.

### 20.2 Problem Search & Filters
`ProblemFilters.jsx` is implemented above. Extend it with:
- Tag-based filtering (arrays, strings, etc.)
- Sort by acceptance rate or difficulty
- Debounced search input

### 20.3 Submission History Tab
Add a tab in the solve page left panel to show past submissions:
- Tabs: "Description" | "Submissions"
- Fetch via `GET /problems/:slug/submissions`
- Show status, language, runtime, timestamp

### 20.4 Rate Limiting on Run/Submit
Add a cooldown to prevent spam-clicking:
```javascript
const [cooldown, setCooldown] = useState(false);
const handleRun = () => {
  if (cooldown) return;
  setCooldown(true);
  setTimeout(() => setCooldown(false), 2000);
  runCode(/* ... */);
};
```

### 20.5 Debounced Editor Saves
If editor changes need to persist to backend:
```javascript
import { useDebouncedCallback } from "use-debounce";
const debouncedSave = useDebouncedCallback((code) => {
  api.post("/drafts", { problemId, language, code });
}, 1000);
```

### 20.6 Resizable Output Panel
Make the output panel height draggable using `react-resizable-panels` with a vertical `PanelGroup` in the right side.

### 20.7 User Dashboard
A `/dashboard` page showing:
- Total problems solved (easy/medium/hard)
- Recent submissions
- Streak calendar (heatmap)
- Progress chart

---

## 21. Build & Run

```bash
# Development
npm run dev

# Production
npm run build
npm run start

# Lint
npx eslint src/
```
