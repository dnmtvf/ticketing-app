 # Cinema Ticket Booking Web App — Product Requirements Document (EN)

 ## 1. Overview
 Desktop‑first web app for browsing movies/cinemas, viewing sessions, selecting seats, booking tickets, and managing unpaid/upcoming/past bookings. Backend API is running and documented in Swagger.

 ## 2. Objectives & Non‑Goals
 - Objectives: complete guest→auth→booking→payment flow; robust form validation; payment countdown; clean architecture; several unit/component tests.
 - Non‑Goals: real payment provider, admin tools, pixel‑perfect mobile; multi‑language (UI is Russian only).

 ## 3. Final Decisions (confirmed)
 - RESTful API; Swagger is the source of truth for all endpoints and payloads.
 - Auth: cookie‑based session; client sends requests with `credentials: 'include'`.
 - API base URL: `http://localhost:8282`.
 - Seat IDs/payload: follow Swagger; UI labels seats as “Ряд N, место M”.
 - Currency: Russian ruble (₽); display as API provides.
 - Language: Russian‑only UI (this PRD is English).
 - Listing scope: show everything the API exposes (no local date limits).
 - Polling: no periodic polling; refetch on focus and after actions; client timer covers interim.
 - Orthography: use «Неоплаченные».
 - Seat locking: if API supports temporary locks with timeout — implement; otherwise optimistic booking with conflict handling.

 ## 4. Personas
 - Guest: browses; booking triggers redirect to auth.
 - Authenticated user: selects seats, books, pays, views history.

 ## 5. Information Architecture & Routes (file‑based)
 - Sidebar (always): «Фильмы», «Кинотеатры», «Мои билеты», «Вход/Выход».
 - `/movies`: movies table (Poster | Название | Продолжительность | Рейтинг | «Посмотреть сеансы»).
 - `/movies/:id`: movie details (poster, description, year, duration, rating) + sessions grouped by date; per‑cinema time buttons.
 - `/cinemas`: cinemas list (Кинотеатр | Адрес | «Посмотреть сеансы»).
 - `/cinemas/:id`: cinema details with upcoming sessions (per Swagger).
 - `/sessions/:id`: seat map; info (movie, cinema, date/time); «Забронировать».
 - `/tickets`: «Мои билеты» — «Неоплаченные», «Будущие», «Прошедшие»; unpaid: «Оплатить» + countdown «Осталось mm:ss».
 - `/login` and `/register`.

 ## 6. Functional Requirements
 ### A) Authentication
 - Register (`POST /register`): username, password, passwordConfirmation; validations: username ≥ 8; password ≥ 8 with ≥ 1 uppercase and ≥ 1 digit; confirmation matches; success → `/tickets`.
 - Login (`POST /login`): on failure show exact text: «Неверный логин или пароль. Проверьте введенные данные и попробуйте снова»; success → `/tickets`.
 - Logout: clear session cookie/app state; redirect to `/movies`; menu changes to «Выход» after login.

 ### B) Catalog
 - Movies: `GET /movies`; «Посмотреть сеансы» → `/movies/:id`.
 - Movie sessions: `GET /movies/{movieId}/sessions`; group by date; render times per cinema.
 - Cinemas: `GET /cinemas`; «Посмотреть сеансы» → `/cinemas/:id`.
 - Cinema sessions: endpoint per Swagger (expected `/cinemas/{cinemaId}/sessions`).

 ### C) Session & Seat Selection
 - Session detail: `GET /movieSessions/{movieSessionId}`; layout from `seats`; occupied from `bookedSeats`.
 - Guest: read‑only; «Забронировать» → `/login`.
 - Authenticated: select only free seats; submit booking.
 - Booking: `POST` per Swagger (brief uses `POST /movieSessions/{movieSessionId}`); payload seats per Swagger; success → `/tickets`.
 - Conflict: on 409/422 show error and refresh seat map.
 - Seat lock (if available): lock on selection with visible TTL; auto‑release on timeout/navigation.

 ### D) My Tickets
 - Guarded route; unauthenticated → `/login`.
 - `GET /me/bookings`; 3 groups: «Неоплаченные», «Будущие», «Прошедшие».
 - Payment timeout: `GET /settings` → seconds; countdown = `bookedAt + timeout − now`; when expired, remove locally and refetch list.
 - Payment: `POST /bookings/{bookingId}/payments`; success → move to «Будущие», refresh list.

 ## 7. Data Model (indicative; align with Swagger)
 - Movie { id, title, posterUrl, description, genres, duration, rating }
 - Cinema { id, name, address }
 - Session { id, movieId, cinemaId, startAt, hallName }
 - SessionDetail { id, seats, bookedSeats }
 - Booking { id, sessionId, seats, status: unpaid|paid|expired, bookedAt, price }
 - Settings { paymentTimeoutSeconds }

 ## 8. State, Timing, Access
 - Auth state derived from cookie; send `credentials: 'include'`.
 - Guard `/tickets`.
 - 1s client countdown; revalidate on window focus and after actions (pay/expire/book).

 ## 9. UX Copy (RU)
 - Buttons: «Посмотреть сеансы», «Забронировать», «Оплатить».
 - Sections: «Неоплаченные», «Будущие», «Прошедшие».
 - Login error: «Неверный логин или пароль. Проверьте введенные данные и попробуйте снова».
 - Registration mismatch: «Пароль не совпадает».
 - Date/time: RU formats; currency ₽.

 ## 10. Non‑Functional
 - Tech: TypeScript, Nuxt 3/4 (Vue 3). Validation. Tests: Vitest + Vue Test Utils.
 - Performance: route code‑splitting; minimal deps.
 - Security: HttpOnly cookie; SameSite=Lax (prod: Secure); CORS with credentials; no sensitive logs.
 - Accessibility: keyboard focus/roles for seat selection where feasible.

 ## 11. Errors & Empty States
 - Informative empty states; seat‑map/booking/payment errors with retry.
 - On countdown expiry, remove and refetch.

 ## 12. Acceptance Criteria
 - Validations and redirects; exact RU texts.
 - Movies/cinemas/details render all API data.
 - Guests cannot book; auth users can only pick free seats; booking redirects to `/tickets`.
 - Tickets grouped correctly; countdown uses `settings + bookedAt`; pay moves to «Будущие».
 - ≥3 tests: auth validation, seat selection rules, countdown.
 - README includes install/run.

 ## 13. Milestones (Phases)
 - M1: Auth + navigation + guards.
 - M2: Movies & Cinemas lists + details + sessions.
 - M3: Session seat map + booking flow (+ seat lock if API supports).
 - M4: My Tickets + countdown + payment.
 - M5: Tests + error/empty states + polish.

 ## 14. Delivery & Git Workflow
 - PRD file path: `PRD.md` at repo root. Updated at the end of each milestone.
 - Commit policy: commit after each phase (M1–M5) and after PRD creation/updates.
 - Conventional Commits style:
   - `docs(prd): add initial PRD`
   - `feat(auth): implement login/registration with cookie session (M1)`
   - `feat(catalog): movies/cinemas lists and details (M2)`
   - `feat(booking): seat map and booking flow (M3)`
   - `feat(tickets): my tickets, countdown, payment (M4)`
   - `test(core): add unit tests` and `chore: error states & polish (M5)`
 - Before each commit: run typecheck/tests/lint; review git status/diff; ensure no secrets.
