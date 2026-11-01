# SprintCode — Frontend

Next.js frontend for SprintCode, a coding-practice platform (problems, code execution, playlists, leaderboard, interview prep, DSA/LLD visualizers, AI CodeBot).

**Live:** https://sprintcode.vercel.app

## Stack

- Next.js 16 (App Router) + React 19
- TanStack React Query (server state), Zustand (client state)
- Tailwind CSS 4, Radix UI, lucide-react
- Monaco editor for code
- Nodemailer (Gmail SMTP) for password-reset emails

## Where Everything Runs

| Part | Service |
|------|---------|
| Frontend (this repo) | **Vercel** — auto-deploys on push to `main` |
| Backend API ([Codex_code](https://github.com/Rocky4554/Codex_code)) | **Render** — Spring Boot, `https://codex-code-el37.onrender.com` |
| Database | **Supabase** PostgreSQL (Mumbai, `ap-south-1`) |
| Cache / queue | **Redis Cloud** |
| Code execution | Executor agent on **AWS EC2** (Mumbai) |
| AI | Google Gemini |

Full details: `Codex_code/dev_docs/infrastructure.md`.

The browser never calls the backend directly. All API calls go to `/api/proxy/*` on Vercel, which reads the httpOnly `auth_token` cookie and forwards it to `BACKEND_URL` as a Bearer token.

## Getting Started

Create `.env.local`:

```env
BACKEND_URL=http://localhost:8080/api   # or https://codex-code-el37.onrender.com/api
# Optional — password-reset emails
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=
SMTP_PASSWORD=
MAIL_FROM=
MAIL_WEBHOOK_SECRET=
```

Then:

```bash
npm install
npm run dev     # http://localhost:3000
```

`npm run dev` compiles each route on first visit, so page changes are slow in dev. Use `npm run build && npm start` to judge real performance.

## Project Layout

```
app/            routes (App Router); app/api/* = auth, proxy, log, send-mail routes
components/     UI by feature (problem-solve, playlists, interview, visualizer, …)
hooks/          React Query hooks per resource
lib/            axios client, query client, visualizations, interview question banks
store/          Zustand stores (auth, editor, assistant)
middleware.js   redirects for protected/auth routes based on the auth cookie
```
