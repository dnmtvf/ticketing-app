import { test, expect } from './fixtures'

test('login failure shows RU copy', async ({ page, baseURL }) => {
  await page.goto(`${baseURL}/login`)
  await page.getByRole('textbox', { name: 'Введите логин' }).fill('baduser')
  await page.getByRole('textbox', { name: 'Введите пароль' }).fill('wrongpw1')
  await page.getByRole('button', { name: 'Войти' }).click()
  // Either error text appears, or we remain on /login without navigation
  await expect(page).toHaveURL(/\/login/)
  await expect(page.getByText('Неверный логин', { exact: false })).toBeVisible({ timeout: 10_000 })
})
