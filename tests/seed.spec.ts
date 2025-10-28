import { test, expect } from './fixtures'

// Seed test: establishes baseline app context for agents (planner/generator).
// It validates that dev server is up and the Movies page renders.
test('seed', async ({ page, baseURL }) => {
  // Navigate to root which redirects to /movies
  await page.goto(baseURL ?? 'http://localhost:8282')

  // Sidebar navigation exists
  await expect(page.getByRole('navigation', { name: 'Основная навигация' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Фильмы' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Кинотеатры' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Мои билеты' })).toBeVisible()

  // Movies table loads
  await expect(page.getByRole('heading', { name: 'Фильмы / Главная' })).toBeVisible()
  await expect(page.getByRole('table')).toBeVisible()
})

