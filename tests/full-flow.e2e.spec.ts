import { test, expect } from './fixtures'

function uniqueUser() {
  const ts = Date.now()
  const rnd = Math.floor(Math.random() * 10_000)
  return `e2e-${ts}-${rnd}`
}

test('registration → booking → payment', async ({ page, baseURL, request }) => {
  const username = uniqueUser()
  const password = 'Abcdefg1'

  // Register
  await page.goto(`${baseURL}/register`)
  await page.getByRole('textbox', { name: 'Введите логин' }).fill(username)
  await page.getByRole('textbox', { name: 'Введите пароль' }).fill(password)
  await page.getByRole('textbox', { name: 'Подтвердите пароль' }).fill(password)
  await page.getByRole('button', { name: 'Зарегистрироваться' }).click()

  // Expect redirect to tickets
  await expect(page).toHaveURL(/\/tickets$/)
  await expect(page.getByRole('heading', { name: 'Мои билеты' })).toBeVisible()

  // Use API to find an available session and go directly
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
  expect(sessionId).toBeTruthy()
  await page.goto(`${baseURL}/sessions/${sessionId}`)

  // Select first free seat and book
  const seat = page.locator('button[aria-label^="Ряд "]:not([disabled])').first()
  await seat.click()
  const bookBtn = page.getByRole('button', { name: 'Забронировать' })
  await expect(bookBtn).toBeEnabled()
  await bookBtn.click()

  // Expect toast + redirect to tickets
  await expect(page).toHaveURL(/\/tickets$/)
  await expect(page.getByRole('heading', { name: 'Мои билеты' })).toBeVisible()

  // There should be at least one unpaid booking; click first "Оплатить"
  const payButtons = page.getByRole('button', { name: 'Оплатить' })
  const payCountBefore = await payButtons.count()
  expect(payCountBefore).toBeGreaterThan(0)
  await payButtons.first().click()

  // After payment, unpaid count should decrease
  await expect(async () => {
    const c = await payButtons.count()
    expect(c).toBeLessThan(payCountBefore)
  }).toPass()
})
