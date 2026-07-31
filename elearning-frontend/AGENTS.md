# AGENTS.md

Guidance for AI coding agents working in this repository.

## Project overview

E-Learning ("EduSpace") is a single-page web app for an online learning platform
with three user roles: **student**, **teacher**, and **superAdmin**. It is a
frontend-only React app that talks to a separate backend API over HTTP. UI copy
and code comments are primarily in **Indonesian** — match that language when
adding user-facing strings and inline comments.

## Tech stack

- **React 19** with function components and hooks (no class components)
- **Vite 7** as the build tool and dev server
- **React Router 7** (`react-router-dom`) for client-side routing
- **Tailwind CSS 3** for styling (utility-first, configured via `tailwind.config.js` + PostCSS)
- **Axios** for HTTP (a shared instance in `src/axios.js`), plus native `fetch` in some places
- **FullCalendar** (`@fullcalendar/*`) for calendar views
- **ESLint 9** (flat config) for linting
- Plain JavaScript/JSX — **no TypeScript**

## Commands

```bash
npm run dev       # start Vite dev server (with /api proxy, see below)
npm run build     # production build to dist/
npm run preview   # preview the production build locally
npm run lint      # run ESLint over the project
```

There is **no test framework** configured. If you add tests, set up the standard
choice for a Vite + React project (Vitest + React Testing Library) and wire up an
`npm test` script.

Always run `npm run lint` and `npm run build` after making changes, since there
are no tests to catch regressions.

## Project structure

```
src/
  main.jsx              # entry point; mounts <App/> inside <BrowserRouter>
  App.jsx               # all routes, auth state, and role-based route guards
  axios.js              # shared axios instance + request/response interceptors
  input.css             # Tailwind entrypoint (imported in main.jsx)
  Pages/
    Auth/               # login, register, forgot/reset password, verify, ProtectedRoute
    Student/            # student-facing pages
    Teacher/            # teacher-facing pages
    Admin/              # superadmin-facing pages
  components/
    Student/            # Student MainLayout, Sidebar, Topbar
    Teacher/            # Teacher MainLayout, Sidebar, Topbar
    Admin/              # Admin MainLayout, Sidebar, Topbar
  hooks/
    useLogout.js        # logout hook wrapping authService
  services/
    authService.js      # logout, isAuthenticated, getCurrentUser, getUserRole
  utils/
    logoutDebug.js      # logout debugging helpers
  assets/               # images (PNG/JPEG) imported directly into components
```

Each role has its own `MainLayout` (Sidebar + Topbar + `<main>` content area).
Page components are wrapped by the matching layout.

## Routing & authorization

- All routes live in `src/App.jsx`.
- On load, `App` calls `GET /api/auth/check-me` (with `credentials: "include"`) to
  hydrate `authState.user`. Until that resolves, a loading spinner is shown.
- The `<Guard allowedRoles=... user=...>` component protects routes. Unauthenticated
  users are redirected to `/login`; authenticated users hitting a route outside
  their role are redirected to their role's dashboard (`ROLE_DEST`).
- **Role normalization matters**: backend may send `admin`, `superadmin`, or
  `super_admin`; these are all normalized to `superAdmin` via `normalizeRole()`.
  Reuse this helper rather than comparing role strings directly.
- Route destinations by role: student → `/student/home`, teacher →
  `/teacher/dashboard`, superAdmin → `/admin/super-dashboard`.
- When adding a page, register it in `App.jsx` with the appropriate `<Guard>` and
  wrap the component body in its role's `MainLayout`.

## API communication — read this before touching network code

There are currently **two different patterns** in the codebase; be deliberate
about which you use and prefer consolidating rather than adding a third.

1. **Shared axios instance** (`src/axios.js`): `baseURL: 'http://localhost:5000'`.
   - Request interceptor attaches `Authorization: Bearer <token>` from
     `localStorage.getItem('token')`.
   - Response interceptor: on `401`, clears storage + cookies, dispatches a
     `user-logout` event, and redirects to `/login`.
2. **Native `fetch`** with relative `/api/...` URLs and `credentials: "include"`
   (e.g. `check-me`, logout). These rely on the **Vite dev proxy** in
   `vite.config.js` that forwards `/api` to a Cloudflare tunnel target.

Note the inconsistency: axios points at `localhost:5000` while fetch uses the
`/api` proxy. Auth is handled two ways (Bearer token in localStorage **and**
cookie-based sessions via `credentials: "include"`). If you extend networking,
prefer the shared axios instance and centralize the base URL in an env var
(`VITE_API_URL` already exists in `.env`) instead of hardcoding hosts.

## Auth & session model

- `authService.logout()` clears `localStorage`/`sessionStorage`, manually expires
  a known set of cookies, dispatches a `user-logout` window event, then fires a
  best-effort `DELETE /api/auth/logout` in the background (does not await it).
- `App.jsx` listens for the `user-logout` event to reset auth state and redirect.
- User object is cached in `localStorage` under `user`; token under `token`.
- Use the `useLogout()` hook for logout UI rather than calling `authService` directly.

## Environment

- `.env` holds `VITE_API_URL` and is **git-ignored** — never commit it.
- Vite exposes env vars prefixed with `VITE_` via `import.meta.env`.
- `vite.config.js` proxies `/api` to a Cloudflare tunnel; this target changes and
  may need updating for local development against a live backend.

## Conventions

- **Components**: function components, default export, PascalCase filenames matching
  the component name.
- **Styling**: Tailwind utility classes inline. One-off keyframe animations are
  defined in an inline `<style>` block at the bottom of the component (see
  `Login.jsx`). Keep to this pattern rather than adding global CSS.
- **Assets**: import images from `src/assets/` directly into components.
- **ESLint rule**: `no-unused-vars` is an error, but identifiers matching
  `^[A-Z_]` (constants / components) are ignored. Remove genuinely unused vars.
- **Comments/strings**: Indonesian is the norm. Follow the surrounding style.
- **State**: local `useState`/`useEffect`; there is no global state library.
  Auth state lives in `App.jsx` and is passed down as the `user` prop.

## Safety notes for agents

- Do not commit `.env` or any secrets.
- Do not create commits unless explicitly asked.
- The app ships **no backend** — do not assume server code is present in this repo.
- When adding a network-exposed feature, confirm whether it needs auth; both
  token- and cookie-based auth already exist, so match the surrounding page.
- Prefer non-destructive changes; ask before large refactors that touch routing
  or the auth flow, since those affect every role.
