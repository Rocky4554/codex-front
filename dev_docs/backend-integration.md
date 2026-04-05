# Backend Integration Plan — Codex Frontend

Full integration of the Next.js frontend with the Spring Boot backend at `http://3.109.238.141:8080`.

---

## Current State (Before Integration)

| Area | Status | Issue |
|------|--------|-------|
| Auth (login/register) | Partially wired | Login route returns `data.user` which is undefined — backend returns `{ token, userId, username, email }` |
| Auth token | Broken | Token stored in httpOnly cookie but axios never sends `Authorization: Bearer` header |
| Problems list | Mock data | Page shows 4 hardcoded rows instead of API data |
| Problem solver | Mock data | ProblemSolvePage ignores slug prop, shows hardcoded "Two Sum" |
| Code execution | Wrong endpoints | Calls `/execute/run` and `/execute/submit` — these don't exist. Backend uses `POST /api/submissions` + SSE |
| Languages | Hardcoded | 4 hardcoded languages; backend has `/api/languages` with real UUIDs |
| User profile | Hardcoded | Shows "AL" / "Alex" everywhere; no real user data |
| User stats | Hardcoded | 142 solved, 12 streak, #1240 rank are fake |
| CORS | Broken | Backend allows `https://localhost:3000` but dev runs on `http://localhost:3000` |
| `.env.local` | Missing | `NEXT_PUBLIC_API_URL` and `BACKEND_URL` not set → all API calls fail |

---

## Backend API Reference

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/api/auth/register` | No | Register → `{ token, userId, username, email }` |
| POST | `/api/auth/login` | No | Login → `{ token, userId, username, email }` |
| GET | `/api/user/profile` | Yes | Get current user profile |
| GET | `/api/user/problems` | Yes | Get user's problem statuses (solved/attempted) |
| GET | `/api/user/submissions` | Yes | Get all user submissions |
| GET | `/api/problems` | No | List all problems |
| GET | `/api/problems/{id}` | No | Get single problem by id or slug |
| POST | `/api/submissions` | Yes | Submit code → `{ submissionId, status, message }` |
| GET | `/api/submissions/{id}/events` | Yes | SSE stream for submission result |
| GET | `/api/languages` | No | List available languages (with UUIDs) |

---

## Phase 1 — Environment Setup

### Files to create/modify:

**`Codex_frontend/.env.local`** (create)
```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
BACKEND_URL=http://localhost:8080/api
```
For production deployment change to `http://3.109.238.141:8080/api`.

**Backend `.env.production`** on EC2: update `APP_CORS_ALLOWED_ORIGINS` to include `http://localhost:3000` for dev.

---

## Phase 2 — Fix Auth Flow

### Problem
Login route sets httpOnly cookie `auth_token` but:
1. Returns `{ user: data.user }` → `data.user` is undefined (backend returns flat `{ token, userId, username, email }`)
2. Axios uses `withCredentials: true` to send cookies but backend expects `Authorization: Bearer <token>` header
3. The token in the httpOnly cookie is not accessible to JavaScript

### Fix

**`app/api/auth/login/route.js`** — return user object correctly:
```js
return NextResponse.json({
  user: { id: data.userId, username: data.username, email: data.email },
  token: data.token  // also return token so client can store it
});
```

**`store/authStore.js`** — store token alongside user:
```js
setAuth: (user, token) => set({ user, token, isLoggedIn: true })
```

**`hooks/useAuth.js`** — pass token to setAuth:
```js
onSuccess: ({ user, token }) => {
  setAuth(user, token);
  router.push("/problems");
}
```

**`lib/axios.js`** — add request interceptor to attach token:
```js
api.interceptors.request.use((config) => {
  const { token } = useAuthStore.getState();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

Same fix applies to register route.

---

## Phase 3 — Problems List Page

### Problem
`app/(main)/problems/page.jsx` is entirely hardcoded HTML. The `ProblemsTable` component exists and uses the API but is never used in the page.

Also: problems table shows "AL" / "Alex" — hardcoded username.

### Fix
- Replace the hardcoded `<tbody>` with the `ProblemsTable` component
- Fetch real user data from authStore for the welcome message and avatar initials
- Fetch user's solved problems from `/api/user/problems` and merge with problem list to show correct status icons
- Replace hardcoded stats (142 solved etc.) with real data from `/api/user/problems`

---

## Phase 4 — Problem Solver Page

### Problem
`ProblemSolvePage` ignores the `slug` param and uses a hardcoded problem object.

### Fix
- Use `useProblem(slug)` hook (already exists in `hooks/useProblem.js`)
- Map the API response fields to the UI:
  - `problem.title`
  - `problem.difficulty`
  - `problem.description`
  - `problem.constraints` (array)
  - `problem.topics` / `problem.tags`
  - `problem.examples` / `problem.testCases`
  - `problem.starterCode` per language (if available)
- Show loading skeleton while fetching
- Show 404 message if problem not found

---

## Phase 5 — Code Execution (Critical)

### Problem
Frontend calls:
- `POST /api/execute/run` — **does not exist**
- `POST /api/execute/submit` — **does not exist**

Backend has:
- `POST /api/submissions` → returns `{ submissionId, status, message }`
- `GET /api/submissions/{id}/events` → SSE stream with real-time results

### Fix

**`hooks/useCodeExecution.js`** — rewrite completely:
```js
// 1. POST /api/submissions to create submission
// 2. Connect to SSE stream at /api/submissions/{id}/events
// 3. Stream results back to UI (ACCEPTED, WRONG_ANSWER, TIME_LIMIT_EXCEEDED, etc.)
```

**`components/problem-solve/SolvePanel.jsx`** — wire buttons:
- "Run Code" → calls `POST /api/submissions` with current code + selected language
- "Submit" → same but marks as official submission (if backend differentiates)
- Console panel shows SSE streaming output in real time
- Display verdict: Accepted ✓ / Wrong Answer ✗ / TLE / Runtime Error

**SSE Pattern:**
```js
const eventSource = new EventSource(
  `${API_URL}/submissions/${submissionId}/events`,
  { headers: { Authorization: `Bearer ${token}` } }
);
eventSource.onmessage = (e) => { /* update UI */ };
eventSource.onerror = () => eventSource.close();
```

---

## Phase 6 — Dynamic Languages

### Problem
Languages are hardcoded as `['python', 'javascript', 'java', 'cpp']` with string IDs. Backend needs UUID language IDs in submission requests.

### Fix
- Add `hooks/useLanguages.js` that fetches `GET /api/languages`
- Update `LanguageSelector` to display languages from API
- Store selected language's full object (including UUID) in editorStore
- When submitting, send `languageId: selectedLanguage.id` (UUID)

---

## Phase 7 — User Profile in UI

### Problem
Navbar and problems page show "AL" / "Alex" / "Welcome back, Alex" hardcoded. No logout button functionality.

### Fix
- Read username from `authStore.user.username`
- Compute initials from username (first 2 chars, uppercase)
- Welcome message: "Welcome back, {username}"
- Add dropdown with: Profile link, Logout button
- Logout calls `authStore.logout()` which POSTs to `/api/auth/logout` and clears state

---

## Pages to Keep / Add / Skip

| Page | Action | Reason |
|------|--------|--------|
| `/` (Landing) | Keep as-is | Static marketing page, no API needed |
| `/auth/login` | Fix | Auth flow bug |
| `/auth/register` | Fix | Same auth flow bug |
| `/problems` | Fix | Replace mock data with API |
| `/problems/[slug]` | Fix | Replace mock problem with API |
| `/dashboard` | Add (basic) | Middleware protects it but page missing — redirect to /problems |
| `/profile` | Skip | Nice-to-have, no backend endpoint needed yet |
| `/contests` | Skip | No backend support |
| `/discuss` | Skip | No backend support |

---

## File Change Summary

| File | Change |
|------|--------|
| `.env.local` | **Create** — add API URLs |
| `lib/axios.js` | Add Bearer token request interceptor |
| `store/authStore.js` | Store token in state |
| `hooks/useAuth.js` | Pass token to setAuth; fix user object mapping |
| `app/api/auth/login/route.js` | Fix user object + return token |
| `app/api/auth/register/route.js` | Same fix |
| `hooks/useCodeExecution.js` | Rewrite to use /submissions + SSE |
| `hooks/useLanguages.js` | **Create** — fetch /api/languages |
| `store/editorStore.js` | Store full language object (with UUID) |
| `components/editor/LanguageSelector.jsx` | Use real languages from API |
| `components/problem-solve/ProblemSolvePage.jsx` | Use useProblem(slug) not mock |
| `components/problem-solve/SolvePanel.jsx` | Wire Run/Submit buttons + show SSE results |
| `app/(main)/problems/page.jsx` | Replace mock data with API + real user data |
| `app/dashboard/page.jsx` | **Create** — simple redirect page |
| Backend `.env.production` (EC2) | Update CORS to allow frontend URL |
