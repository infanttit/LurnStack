# LurnStack (Frontend)

React (Create React App) + TailwindCSS single-page app with feature-based modules (auth, cart, live-classes, courses, etc.). Deployed as an SPA on Vercel (`vercel.json`).

## Quick start

1) Create `.env.local` (or copy from `.env.example`):

`REACT_APP_API_BASE_URL=https://lurnstackbackend-production.up.railway.app`

2) Run:

- `npm start`

## Architecture (high level)

- App entry: `src/index.js` → `src/App.js`
- Global providers: `src/app/providers/AppProviders.jsx` (Redux + AuthContext + CartContext)
- Routing: `src/app/router/router.jsx` + `src/app/router/paths.js`
- Shared layout shell: `src/app/AppShell.jsx` (navbar/footer + integrations + `Outlet`)

## Auth flow (Railway backend)

- API base URL comes from `REACT_APP_API_BASE_URL` (`src/shared/config/env.js`)
- Login: `POST /api/auth/login` (`src/auth/api/authApi.js`)
- Register: `POST /api/auth/register` (`src/auth/api/authApi.js`)
- Token + user persistence:
  - “Remember me” checked → `localStorage`
  - unchecked → `sessionStorage`
  (`src/auth/model/authStorage.js`)

## Notes on security

This frontend stores the auth token in Web Storage (session/local). For strongest protection against XSS token theft, prefer **httpOnly secure cookies** on the backend (requires backend changes).
