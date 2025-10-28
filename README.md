# Ticketing App (Nuxt 4)

Cinema ticket booking frontend (desktop‑first) built with Nuxt 4 + TypeScript.

## Requirements
- Node 18+
- pnpm 10+

## Setup
```bash
pnpm install
pnpm run postinstall    # generates .nuxt and ESLint flat config
```

Set API base (defaults to http://localhost:8282):
```bash
export NUXT_PUBLIC_API_BASE=http://localhost:8282
```

## Scripts
- Dev server: `pnpm dev`
- Build: `pnpm build`
- Preview: `pnpm preview`
- Lint: `pnpm lint`
- Tests: `pnpm test` (Vitest)
 - E2E: `pnpm e2e`, `pnpm e2e:ui`
 - Playwright install: `pnpm e2e:install`
 - Test Agents init: `pnpm agents:init:vscode` (or `:claude`, `:opencode`)

## Tech
- Nuxt 4, TypeScript, Tailwind CSS, Nuxt UI (UForm, UButton, Toast)
- Auth via cookies (credentials: include)
- Zod schemas validate API responses
- Vitest unit tests (auth validation, seat selection, countdown)

## Playwright Test Agents

Playwright Test Agents (Planner / Generator / Healer) help you explore the app, generate tests from a plan, and automatically repair failing tests.

Prerequisites
- Node 18+, pnpm 10+
- Browsers: `pnpm e2e:install`
- VS Code Insiders 1.105+ (for the agent experience in VS Code)

Initialize Agents (one‑time)
```
pnpm agents:init:vscode
# or
pnpm agents:init:claude
pnpm agents:init:opencode
```
This generates agent definitions under `.github/chatmodes/` and a `.vscode/mcp.json`. Re‑run after Playwright upgrades.

Recommended Files (already in this repo)
- Seed test: `tests/seed.spec.ts` — boots the app and validates Movies page.
- Starter plan: `specs/ticketing-basic.md` — aligned with PRD.
- Config: `playwright.config.ts` — starts Nuxt dev server automatically.

Run Agents in VS Code (Insiders)
1) Open this project in VS Code Insiders and trust the workspace.
2) Install Playwright extension (if prompted).
3) Open the Playwright Agents panel.
4) Run 🎭 Planner with a prompt like:
   - “Generate a plan for guest→auth→booking→payment. Use seed tests/seed.spec.ts and PRD.md. Save to specs/ticketing-basic.md.”
5) Run 🎭 Generator:
   - “Generate Playwright tests from specs/ticketing-basic.md into tests/.”
6) Run 🎭 Healer on failing tests (for example):
   - `tests/guest-block.e2e.spec.ts`
   - `tests/full-flow.e2e.spec.ts`

Run the test suite locally
```
pnpm e2e           # headless
pnpm e2e:ui       # UI mode
pnpm e2e --repeat-each=3  # stability runs
```

Best Practices
- Keep tests resilient: prefer robust selectors, API‑assisted navigation, and storageState for auth.
- Do not change product implementation to satisfy E2E tests — fix tests or genuine bugs instead (see AGENTS.md policy).
- Traces are enabled on first retry; view them with Playwright trace viewer if a test fails.

Troubleshooting
- Backend base URL is set via `NUXT_PUBLIC_API_BASE` (defaults to `http://localhost:3022`). Playwright’s webServer starts Nuxt on `http://localhost:8282`.
- If registration intermittently fails with 409, re‑run Healer on the registration test or use a storageState‑based auth fixture.

See `specs/ticketing-basic.md` for a ready‑to‑use plan and adapt it as your coverage grows.
