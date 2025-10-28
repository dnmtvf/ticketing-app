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
Playwright Agents automate planning and generation of E2E tests:

1) Install browsers: `pnpm e2e:install`

2) Initialize agent definitions (choose your loop):
```
pnpm agents:init:vscode
# or
pnpm agents:init:claude
pnpm agents:init:opencode
```
This generates definitions under `.github/` and can be regenerated when upgrading Playwright.

3) Use your AI tool to run the agents:
- Planner: produce a plan from `tests/seed.spec.ts` into `specs/`
- Generator: turn Markdown plan (e.g., `specs/ticketing-basic.md`) into Playwright tests in `tests/`
- Healer: run failing tests and apply suggested fixes

4) Run tests locally:
```
pnpm e2e
pnpm e2e:ui
```

See `specs/ticketing-basic.md` for a starter plan aligned with PRD.
