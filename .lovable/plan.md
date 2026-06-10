## Plan: Import Espace Entreprises from `JalalRABBAH/ireg-moto-bf`

The source repo is a Vite + React Router app using Tailwind v3 with a heavy custom design system (navy/terracotta/gold palette, dark-mode tokens, custom fonts: DM Sans / Inter / JetBrains Mono). This project is **TanStack Start + Tailwind v4**, so a straight copy won't work — the routes and theme need to be ported.

### What I'll do

1. **Install required dependencies**: `framer-motion`, `react-hook-form`, `zod`, `lucide-react`, `recharts`, `date-fns`, `embla-carousel-react`, `cmdk`, `input-otp`, `next-themes`, `react-day-picker`, `sonner`, `vaul`, plus any missing `@radix-ui/*` packages and `@fontsource` font packages for DM Sans / Inter / JetBrains Mono.

2. **Port the design system to `src/styles.css`** (Tailwind v4 form):
   - Add `@theme` tokens for the full palette: `navy-*`, `terracotta-*`, `gold-*`, `success/warning/danger/info-*`, `dm-bg-*`, `dm-text-*`, `dm-border`.
   - Map shadcn HSL tokens via `@theme inline` so existing `bg-primary` etc. keep working.
   - Convert the v3 `@layer components` blocks (`card-base`, `btn-primary`, `badge-*`, etc.) and `@layer utilities` (gradients, shimmer) to v4 `@utility` form.
   - Load fonts via `@fontsource` imports (filesystem-safe in Lightning CSS).

3. **Copy components** into `src/components/`:
   - `Layout.tsx` (rewritten to use TanStack `<Outlet />` instead of react-router)
   - `Sidebar.tsx`, `Topbar.tsx` (rewritten to use TanStack `<Link>` / `useLocation`)
   - `ComplianceGauge`, `StatCard`, `StatusBadge`
   - Any missing shadcn UI primitives that aren't already in `src/components/ui/`.

4. **Convert each page into a TanStack route file** under `src/routes/`:

```text
src/routes/
  __root.tsx           (existing — keep)
  index.tsx            (replace placeholder → redirect to /dashboard)
  _app.tsx             (layout route wrapping Sidebar/Topbar with <Outlet />)
  _app.dashboard.tsx
  _app.inventory.tsx
  _app.customers.tsx
  _app.commercial.tsx
  _app.reporting.tsx
  _app.audit.tsx
  _app.security.tsx
  _app.settings.tsx
  _app.help.tsx
```

Each route gets its own `head()` with title + description in French (matching the platform's tone).

5. **Migration rewrites** I'll apply to every copied file:
   - `react-router-dom` → `@tanstack/react-router` (`Link to=`, `useLocation`, `Navigate`, `Outlet`)
   - `useNavigate()` → `useNavigate()` from TanStack
   - Remove `HashRouter` wrapper (TanStack handles routing).

6. **Verify**: confirm the build compiles, the dashboard renders, the sidebar navigates between pages, and dark-mode toggle still works.

### Out of scope (for this first pass)

- No backend wiring (the original uses NestJS + Postgres; pages will render with the static mock data already baked into the source files).
- The `autorites` app, `backend/`, `compliance-engine/`, `seeds/`, `infrastructure/`, `qa/`, `documentation/`, `architecture/` folders — only the Entreprises frontend is being ported.
- No authentication wiring yet — every route is publicly viewable until you ask for auth.

### Technical notes

- The source uses Tailwind v3 `@apply border-border` style resets; in v4 these only work once `--color-border` is mapped in `@theme inline`, which I'll set up.
- The source's `index.css` references custom utility classes (`bg-navy-50`, `text-dm-text-primary`, `bg-terracotta-500`, etc.) that come from its `tailwind.config.js`. All of those colors will be re-declared as `--color-*` tokens in `@theme`.
- Animation easing/duration custom properties (`--ease-smooth`, `--duration-fast`, etc.) will be preserved on `:root`.
- The repo has ~2,000 lines of page code; I'll port them verbatim, only patching imports and router calls.

### After approval

I'll execute it in this order: deps → styles.css → layout/sidebar/topbar → small shared components → pages (route files) → verify build → screenshot the dashboard.

Estimated to be a long single turn — once you approve, I'll do the whole import in one pass.