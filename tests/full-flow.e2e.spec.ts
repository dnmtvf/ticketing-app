import { test, expect } from './fixtures'

function uniqueUser() {
  const ts = Date.now()
  const rnd = Math.floor(Math.random() * 10_000)
  return `e2e-${ts}-${rnd}`
}

test('registration → booking → payment', async ({ page, baseURL, request, context }) => {
  const username = uniqueUser()
  const password = 'Abcdefg1'

  // Register via UI to get proper session cookie
  await page.goto(`${baseURL}/register`)
  await page.getByLabel('Логин').fill(username)
  await page.getByLabel('Пароль').fill(password)
  await page.getByLabel('Подтверждение пароля').fill(password)
  await page.getByRole('button', { name: 'Зарегистрироваться' }).click()

  // Wait for redirect after successful registration
  await page.waitForURL(/\/(movies|tickets)/, { timeout: 5000 })
  await page.goto(`${baseURL}/tickets`)
  await expect(page.getByRole('heading', { name: 'Мои билеты' })).toBeVisible()

  // Use API to find an available session and go directly
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
  expect(sessionUrl).toBeTruthy()
  await page.goto(`${baseURL}${sessionUrl}`)

  // Select first free seat and wait until pressed
  const seat = page.locator('button[aria-label^="Ряд "]:not([disabled])').first()
  await seat.scrollIntoViewIfNeeded()
  await seat.hover()
  await seat.click({ trial: true })
  await seat.click()
  await expect(seat).toHaveAttribute('aria-pressed', 'true')
  const bookBtn = page.getByRole('button', { name: 'Забронировать' })
  await expect(bookBtn).toBeEnabled()
  await bookBtn.click()

  // Expect toast + redirect to tickets
  await expect(page).toHaveURL(/\/tickets$/)
  await expect(page.getByRole('heading', { name: 'Мои билеты' })).toBeVisible()

  // There should be at least one unpaid booking; click first "Оплатить"
  const payButtons = page.getByRole('button', { name: 'Оплатить' })
  await expect(payButtons.first()).toBeVisible()
  const payCountBefore = await payButtons.count()
  await payButtons.first().click()

  // After payment, unpaid count should decrease
  await expect(async () => {
    const c = await payButtons.count()
    expect(c).toBeLessThan(payCountBefore)
  }).toPass()
})
