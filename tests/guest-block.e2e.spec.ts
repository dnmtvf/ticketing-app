import { test, expect } from './fixtures'

test('guest cannot book; redirect to login', async ({ page, baseURL, request }) => {
  // Navigate directly to an available session via API to reduce flakiness
  const moviesRes = await request.get(`${baseURL}/api/proxy/movies`)
  const movies: { id: number | string }[] = await moviesRes.json()
  let sessionId: number | string | undefined
  for (const m of movies) {
    const sessRes = await request.get(`${baseURL}/api/proxy/movies/${m.id}/sessions`)
    const sessions: { id: number | string }[] = await sessRes.json()
    if (Array.isArray(sessions) && sessions.length) {
      sessionId = sessions[0].id
      break
    }
  }
  expect(sessionId, 'expected at least one session').toBeTruthy()
  await page.goto(`${baseURL}/sessions/${sessionId}`)

  // Select first free seat and wait until pressed
  // Try multiple seats until book button becomes enabled
  const bookBtn = page.getByRole('button', { name: 'Забронировать' })
  const seats = page.locator('button[aria-label^="Ряд "]:not([disabled])')
  const count = await seats.count()
  let enabled = false
  for (let i = 0; i < Math.min(count, 10); i++) {
    const s = seats.nth(i)
    await s.scrollIntoViewIfNeeded()
    await s.click()
    enabled = await bookBtn.isEnabled().catch(() => false)
    if (enabled) break
  }
  expect(enabled).toBeTruthy()

  // Try to book
  await expect(bookBtn).toBeEnabled()
  await bookBtn.click()

  // Expect redirect to login with redirect param
  await expect(page).toHaveURL(/\/login\?redirect=/)
  await expect(page.getByRole('heading', { name: 'Вход' })).toBeVisible()
})
