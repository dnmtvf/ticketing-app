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

## Tech
- Nuxt 4, TypeScript, Tailwind CSS, Nuxt UI (UForm, UButton, Toast)
- Auth via cookies (credentials: include)
- Zod schemas validate API responses
- Vitest unit tests (auth validation, seat selection, countdown)
