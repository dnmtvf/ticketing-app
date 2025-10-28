import { test as base, expect } from '@playwright/test'

// You can extend fixtures here if needed (e.g., storageState, test users)
// For now, we just re-export Playwright's defaults to keep things simple.
export const test = base
export { expect }

