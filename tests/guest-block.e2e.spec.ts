import { test, expect } from './fixtures'

test('guest cannot book; redirect to login', async ({ page, baseURL, request }) => {
  // Navigate directly to an available session via API to reduce flakiness
  const moviesRes = await request.get(`${baseURL}/api/proxy/movies`)
  const movies: { id: number | string }[] = await moviesRes.json()
  let sessionUrl: string | undefined
  for (const m of movies) {
    const sessRes = await request.get(`${baseURL}/api/proxy/movies/${m.id}/sessions`)
    const sessions: { id: number | string; cinemaId: number | string }[] = await sessRes.json()
    if (Array.isArray(sessions) && sessions.length) {
      const session = sessions[0]
      sessionUrl = `/movies/${m.id}/cinemas/${session.cinemaId}/sessions/${session.id}`
      break
    }
  }
  expect(sessionUrl, 'expected at least one session').toBeTruthy()
  await page.goto(`${baseURL}${sessionUrl}`)

  // Wait for page to be fully hydrated - wait for seat grid to be interactive
  const seat = page.locator('button[aria-label^="Ряд "]:not([disabled])').first()
  await seat.waitFor({ state: 'visible' })

  // Ensure the component is hydrated by waiting for aria-pressed attribute to exist
  await expect(seat).toHaveAttribute('aria-pressed', /^(true|false)$/, { timeout: 5000 })

  // Click the seat to select it - retry until aria-pressed changes to "true"
  // This works around a Vue hydration timing issue where the first click doesn't register
  await expect(async () => {
    await seat.click()
    await page.waitForTimeout(100)
    await expect(seat).toHaveAttribute('aria-pressed', 'true')
  }).toPass({ timeout: 10000 })

  // Book button should now be enabled
  const bookBtn = page.getByRole('button', { name: 'Забронировать' })
  await expect(bookBtn).toBeEnabled({ timeout: 5000 })
  await bookBtn.click()

  // Expect redirect to login with redirect param
  await expect(page).toHaveURL(/\/login\?redirect=/)
  await expect(page.getByRole('heading', { name: 'Вход' })).toBeVisible()
})
