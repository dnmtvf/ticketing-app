import { test, expect } from './fixtures'

function uniqueUser() {
  const ts = Date.now()
  const rnd = Math.floor(Math.random() * 10_000)
  return `e2e-${ts}-${rnd}`
}

test('registration → booking → payment', async ({ page, baseURL, request, context }) => {
  const username = uniqueUser()
  const password = 'Abcdefg1'

  // Register via API (stabilize against flaky UI/back-end 409)
  let token: string | undefined
  for (let attempt = 0; attempt < 3 && !token; attempt++) {
    const uname = attempt === 0 ? username : uniqueUser()
    const apiRes = await request.post(`${baseURL}/api/auth/register`, {
      data: { username: uname, password, passwordConfirmation: password }
    })
    if (!apiRes.ok()) continue
    const setCookie = apiRes.headers()['set-cookie'] || apiRes.headers()['Set-Cookie']
    const tokenMatch = String(setCookie).match(/auth_token=([^;]+)/)
    if (tokenMatch) token = tokenMatch[1]
  }
  expect(token).toBeTruthy()
  await context.addCookies([{ name: 'auth_token', value: token, domain: 'localhost', path: '/', sameSite: 'Lax', httpOnly: true }])
  await page.goto(`${baseURL}/tickets`)
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
