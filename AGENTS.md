# AGENTS.md — Code Conventions for This Repo

These rules are mandatory for any code you add or modify in this repository. Follow them for all languages, with a special emphasis on TypeScript and Vue.

## Type Safety (TypeScript)
- No `any` — do not introduce `any` or `unknown`-as-`any`. Always use precise, explicit types.
- No type casting — avoid `as Type` assertions to force types. Instead, use:
  - Schema-driven parsing with Zod (preferred) and derive types via `z.infer<typeof Schema>`.
  - Narrowing via type guards and control flow (e.g., `in` operator, `typeof`, user-defined predicates).
  - `as const` is allowed for literal inference only.
- No `@ts-ignore` / `@ts-expect-error` unless there is a documented, unavoidable upstream issue. If used, include a short comment with a tracking issue.
- Prefer typed refs and state:
  - Use `ref<Foo | null>(null)`, `ref<Foo[]>([])` instead of `ref<any>(...)`.
  - Avoid storing untyped API responses; parse with Zod and store the inferred type.
- For API integration:
  - Define or reuse Zod schemas in `app/schemas` and derive `export type` with `z.infer`.
  - Normalize backend field variants (e.g., `startAt` vs `startTime`) with helpers, not with `any` or casts.
  - Prefer typed helpers instead of inline `as` casts.

## Vue/Nuxt
- Do not rely on implicit `any` in templates. Type composables, refs, and computed values.
- Avoid passing Ref objects directly to props expecting primitives without `.value` (be explicit).
- Keep components self-contained and typed; avoid runtime “shape guessing”.

## Linting & Config
- Treat `no-explicit-any` as a hard rule during review.
- Keep `strict` and `noImplicitAny` enabled in `tsconfig` (or align the code as if they were enabled).

## General Guidance
- Prefer small typed utilities (guards, normalizers) over weakening types.
- When the backend has inconsistent field names, write a converter that returns a well-typed object.
- If you must temporarily relax a type, isolate it locally and follow up with a refactor.

By contributing to this repo, you agree to follow these conventions. PRs that introduce `any` or type assertions without justification will be rejected.

