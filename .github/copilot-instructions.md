# WorkZen — AI coding instructions for contributors and agents

Purpose
- Short, actionable guidance to help AI coding agents (and new contributors) be productive in this repository.
- Keep answers and changes scoped: prefer small, testable edits (one feature or bug fix per PR).

Big picture (what to know first)
- This is a full-stack HRMS skeleton with two distinct apps:
  - Backend: `server/` — Express + Mongoose (CommonJS). Entry: `server/server.js`.
  - Frontend: `client/` — React (Vite) + Tailwind. Entry: `client/src/main.jsx` and `client/index.html`.
- API contract: backend endpoints are mounted under `/api` (see `server/server.js`). Example admin routes live under `server/routes/admin/*` and are protected using JWT auth middleware in `server/middlewares/authMiddleware.js`.
- Authentication flows:
  - `POST /api/auth/register` — first created user becomes `admin` (see `controllers/authController.js`).
  - `POST /api/auth/login` — returns `{ token, user }`; frontend stores token in `localStorage` under `token` and `api.js` sends it as `Authorization: Bearer <token>`.

Key files and patterns (quick map)
- Backend
  - `server/server.js` — app bootstrap, route mounting, CORS, JSON body parsing.
  - `server/config/db.js` — Mongoose connection logic.
  - `server/models/*.js` — Mongoose models (User, Employee, Department, Designation, Attendance, Leave, Payroll, Payrun).
  - `server/controllers/*` and `server/controllers/admin/*` — controller functions that implement behavior.
  - `server/routes/*` and `server/routes/admin/*` — route definitions; admin routes should `use(verifyToken, adminOnly)`.
  - `server/middlewares/authMiddleware.js` — `verifyToken` (JWT verification) and `adminOnly` (role check).
  - `server/utils/response.js` — unified JSON `success` / `error` helpers; use these for responses to stay consistent.
- Frontend
  - `client/src/api.js` — central Axios instance; uses `VITE_API_URL` and automatically attaches token from `localStorage`.
  - `client/src/App.jsx` — routes configuration and `ProtectedRoute` usage.
  - `client/src/components/layout/*` — `Sidebar.jsx`, `Navbar.jsx`, `ProtectedRoute.jsx` — layout and protection patterns.
  - `client/src/pages/*` — admin page placeholders. Add new page components here and wire routes in `App.jsx`.
  - Tailwind: `client/src/index.css` and `client/tailwind.config.js`.

Conventions & behaviors specific to this repo
- First user registration becomes `admin` (see `authController.register`) — tests or seed scripts that create an admin should use the register endpoint or create a user with role `admin` explicitly.
- API response shape: use `utils/response.js` helpers to return { success: true/false, ... } rather than ad-hoc JSON.
- Protect admin-only routes by adding `verifyToken, adminOnly` in that order on the route file (see `routes/admin/employees.js`).
- Backend current style: CommonJS modules (use `require` / `module.exports`) because `server/package.json` sets `type: "commonjs"`.
- Frontend current style: Vite + ESM (use `import` / `export`). Keep server and client module styles separate.

How to add a new admin endpoint (practical example)
1. Add controller: `server/controllers/admin/myFeatureController.js` exporting functions (`list, create, get, update, remove`).
2. Add route: `server/routes/admin/myFeature.js` — `router.use(verifyToken, adminOnly)` then bind endpoints to controller functions.
3. Mounting: admin routes under `routes/admin` are already required in `server/server.js` — if you add the file `routes/admin/myFeature.js`, follow existing naming pattern and it will be accessible at `/api/admin/myfeature` when required by `server.js` or by adding a require line.
4. Return responses with `utils/response.success(res, { ... })` or `utils/response.error(res, 'message', statusCode)`.

How to add a frontend page and wire API
1. Create page component `client/src/pages/MyFeature.jsx`.
2. Add route in `client/src/App.jsx` and wrap it in `ProtectedRoute` + `Layout` like other admin pages.
3. Use `client/src/api.js` to call backend endpoints; the base URL is controlled by `VITE_API_URL`.
4. On successful login backend returns a token — store it via `localStorage.setItem('token', token)` (already used in `Login.jsx`).

Environment, builds and run commands (developer workflow)
- Backend (PowerShell / Windows):
  - Install deps and start: 
    cd d:/Odoo-IITGN/server
    npm install
    # create .env (see .env.example)
    node server.js
  - Default listen port: `PORT` (env) or `5000`.
  - Default Mongo: `MONGO_URI` or `mongodb://127.0.0.1:27017/workzen`.
- Frontend (PowerShell / Windows):
  - Install deps and start dev: 
    cd d:/Odoo-IITGN/client
    npm install
    npm run dev
  - Vite dev server default port: 5173 (change via environment if needed).
- API testing: call `http://localhost:5000/api/...` (backend base) while frontend dev runs on Vite port.

Debugging tips specific to this repo
- If login fails: check backend logs from `server.js` and ensure `JWT_SECRET` is set and `MONGO_URI` reachable.
- If Tailwind rules appear as unknown at-rules in editor: make sure devDependencies are installed and Vite + PostCSS are configured (`tailwindcss`, `postcss`, `autoprefixer`). These will be resolved at build/runtime, editor linters may flag them before installation.
- If routes return 404: ensure route file is required in `server/server.js` or the top-level `routes/index.js` is mounted.

Examples from the codebase
- Admin protection: `server/routes/admin/employees.js` uses:
  router.use(verifyToken, adminOnly)
  router.get('/', empCtrl.list)
- Unified responses: `server/controllers/authController.js` returns `success(res, {...})` and `error(res, 'message', 400)`.
- Frontend token handling: `client/src/api.js` interceptor attaches `Authorization: Bearer <token>` from `localStorage`.

Limits and non-goals
- This file documents only discoverable patterns. It does not prescribe new architecture changes or enforce CI rules.

If something is unclear or you want additional examples (e.g., a sample CRUD frontend for `employees` wired end-to-end), tell me which area to expand and I will update this file.