# End-to-end Scenarios (Playwright)

Base URL: http://localhost:8282
API base: http://localhost:3022 (override via NUXT_PUBLIC_API_BASE if different)

## 1) Authentication
- Login success (positive)
  1. Open /login
  2. Fill username, password (valid)
  3. Click "Войти"
  4. Expect toast "Успешный вход" and redirect to /tickets

- Login failure (negative)
  1. Open /login
  2. Fill bad credentials
  3. Submit → expect error text: «Неверный логин или пароль. Проверьте введенные данные и попробуйте снова»

- Registration success (positive)
  1. Open /register
  2. Fill username ≥ 8, strong password (≥8, uppercase, digit), matching confirmation
  3. Submit → toast "Регистрация выполнена" → redirect /tickets

- Registration validation (negative)
  - Too short username → error "Логин должен быть не менее 8 символов"
  - Weak password → error "Пароль: минимум 8 символов, минимум 1 заглавная буква и 1 цифра"
  - Mismatch confirmation → error "Пароль не совпадает"

- Logout (positive)
  1. Click "Выход" in sidebar → expect redirect to /movies

## 2) Movies
- Movies list loads (positive)
  1. Open /movies
  2. Expect table rows ≥ 1; columns include Название/Продолжительность/Рейтинг

- Movies list error (negative)
  - Temporarily set API base to invalid URL and ensure error message appears (manual toggle)

- Movie details and sessions (positive)
  1. From /movies click "Посмотреть сеансы" on a movie
  2. Expect movie info and buttons with times grouped by date and cinema

## 3) Cinemas
- Cinemas list loads (positive)
  1. Open /cinemas → expect rows with Кинотеатр/Адрес

- Cinema details and sessions (positive)
  1. From /cinemas click "Посмотреть сеансы"
  2. Expect time buttons with movie titles

## 4) Session & Booking
- Guest cannot book (negative)
  1. Open a session (/sessions/:id)
  2. Select any free seats
  3. Click "Забронировать" → expect redirect to /login

- Auth user booking (positive)
  1. Login
  2. Open a session with free seats
  3. Verify booked seats are disabled; select multiple free seats
  4. Click "Забронировать" → expect toast and redirect to /tickets

- Booking conflict (negative)
  - Simulate by booking same seats from another client before submit; expect toast error and seat map refresh

## 5) My Tickets
- Grouping and visibility (positive)
  1. Open /tickets when logged in
  2. Expect sections: «Неоплаченные», «Будущие», «Прошедшие»

- Unpaid timer (positive)
  1. For unpaid ticket, verify countdown "Осталось mm:ss" decreases each second
  2. After timeout expires (per /settings), item disappears; list refreshes

- Payment success (positive)
  1. Click "Оплатить" → success toast → ticket moves to «Будущие»

- Payment errors (negative)
  - 404 unknown booking id (simulate) → show error toast remains in «Неоплаченные»
  - 409 already paid (simulate) → show error toast

## 6) Navigation & Guards
- Guard /tickets (positive)
  1. As guest, navigate /tickets → expect redirect to /login

## 7) Localization & UI
- RU copy check (positive)
  - Confirm exact error strings and section headers as specified
- UI controls (positive)
  - Native HTML forms with Vuelidate validation; BaseButton components; vue-toastification notifications visible

---

## Playwright MCP Steps (example)

1. Start backend at http://localhost:3022; start frontend: `pnpm dev` (port 8282)
2. In Playwright MCP:
   - Navigate to http://localhost:8282
   - Follow flows above using role/name selectors, e.g.:
     - await page.getByRole('link', { name: 'Вход' }).click()
     - await page.getByLabel('Логин').fill('username123')
     - await page.getByLabel('Пароль').fill('Password1')
     - await page.getByRole('button', { name: 'Войти' }).click()
   - Assert redirects, texts, disabled states, and toasts

## Notes
- If your API runs on a different port/host, set NUXT_PUBLIC_API_BASE accordingly.
- Backend default is 3022; Swagger at http://localhost:3022/api-docs
