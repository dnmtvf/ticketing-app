# Ticketing App — Basic Scenarios Test Plan

## Application Overview
Desktop‑first cinema ticket booking app. Auth with cookie session. API base defaults to http://localhost:3022 and the client proxies via /api/proxy. UI language is Russian.

Seed: `tests/seed.spec.ts`

## Scenarios

### 1. Guests see catalog and cannot book
Steps:
1. Open `/movies` and assert table visible with at least one row
2. Click "Посмотреть сеансы" on the first movie -> `/movies/:id`
3. Click a time button to open session -> `/sessions/:sessionId`
4. Click a free seat (not disabled)
5. Click "Забронировать"

Expected:
- Redirect to `/login?redirect=/sessions/:sessionId`
- Login form visible (Логин, Пароль)

### 2. Login failure shows RU copy
Steps:
1. On `/login`, fill username `baduser` and password `wrongpw1`
2. Submit

Expected:
- Show exact text: `Неверный логин или пароль. Проверьте введенные данные и попробуйте снова`

### 3. Registration success redirects to tickets
Steps:
1. Open `/register`
2. Fill username `e2e-<timestamp>`; password `Abcdefg1`; confirm same
3. Submit

Expected:
- Toast: `Регистрация выполнена`
- Redirect to `/tickets`
- Sidebar shows `Выход`

### 4. Authenticated booking redirects to tickets
Preconditions: User is logged in (from scenario 3)
Steps:
1. Go to `/movies` → first movie → open a session
2. Select a free seat (button not disabled)
3. Click "Забронировать"

Expected:
- Toast: `Места забронированы`
- Redirect to `/tickets`
- In "Неоплаченные" there is an item with seat text `Ряд N, место M`
- Countdown shows `Осталось mm:ss`

### 5. Payment moves to "Будущие"
Preconditions: An unpaid booking exists in `/tickets`
Steps:
1. Click "Оплатить" for the unpaid booking
2. Wait for list refresh

Expected:
- Item moves to "Будущие"
- No longer present in "Неоплаченные"

