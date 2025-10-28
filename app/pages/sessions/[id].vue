<script setup lang="ts">
import { z } from 'zod'
import { SessionDetailSchema, type SessionDetail } from '~/schemas'
import { normalizeBooked, seatId, toggleSeat } from '~/utils/seats'
const { $api } = useNuxtApp()
const auth = useAuth()
const route = useRoute()
const id = String(route.params.id)

const detail = ref<SessionDetail | null>(null)
const pending = ref(true)
const error = ref<string | null>(null)
const selected = ref<string[]>([])


try {
  const d = await $api(`/movieSessions/${id}`)
  const parsed = SessionDetailSchema.safeParse(d)
  if (parsed.success) detail.value = parsed.data
  else throw new Error('Schema mismatch')
} catch (e) {
  error.value = 'Ошибка загрузки сеанса'
} finally {
  pending.value = false
}

type SeatGridObj = { rows: number; cols?: number; seatsPerRow?: number }
const isSeatGrid = (v: unknown): v is SeatGridObj => typeof v === 'object' && v !== null && 'rows' in v

const rows = computed(() => {
  const s = detail.value?.seats
  if (!s) return 0
  if (Array.isArray(s)) return s.length
  if (isSeatGrid(s) && typeof s.rows === 'number') return s.rows
  return 0
})

const cols = computed(() => {
  const s = detail.value?.seats
  if (!s) return 0
  if (Array.isArray(s)) return Array.isArray(s[0]) ? s[0].length : 0
  if (isSeatGrid(s)) {
    if (typeof s.cols === 'number') return s.cols
    if (typeof s.seatsPerRow === 'number') return s.seatsPerRow
  }
  return 0
})

const bookedSet = computed(() => normalizeBooked(detail.value?.bookedSeats))

const isBooked = (r: number, c: number) => bookedSet.value.has(seatId(r, c))
const isSelected = (r: number, c: number) => selected.value.includes(seatId(r, c))

const toggle = async (r: number, c: number) => {
  if (isBooked(r, c)) return
  toggleSeat(selected.value, r, c, bookedSet.value)
}

const book = async () => {
  if (!auth.loggedIn.value) return navigateTo({ path: '/login', query: { redirect: route.fullPath } })
  if (!selected.value.length) return
  const toast = useToast()
  try {
    const seats = selected.value.map((sid) => {
      const [r, c] = sid.slice(1).split('c').map(Number)
      return { rowNumber: r, seatNumber: c }
    })
    await $api(`/movieSessions/${id}/bookings`, { method: 'POST', body: { seats } })
    toast.add({ title: 'Места забронированы' })
    await navigateTo('/tickets')
  } catch (e) {
    // Conflict or validation error: refresh seat map
    try {
      const refreshed = await $api(`/movieSessions/${id}`)
      const parsed = SessionDetailSchema.safeParse(refreshed)
      if (parsed.success) detail.value = parsed.data
    } catch {}
    toast.add({ title: 'Не удалось забронировать места', color: 'rose' })
  }
}
</script>

<template>
  <section aria-labelledby="session-title">
    <h1 id="session-title" class="text-2xl font-semibold mb-4">Сеанс</h1>
    <div v-if="pending">Загрузка…</div>
    <div v-else-if="error">{{ error }}</div>
    <div v-else class="grid gap-4">
      <div class="grid gap-1 text-zinc-300">
        <div>Фильм: {{ detail?.movieName || detail?.movie?.title }}</div>
        <div>Кинотеатр: {{ detail?.cinemaName || detail?.cinema?.name }}</div>
        <div>Время: {{ String(detail?.startAt || detail?.startTime || '').replace('T', ' ').slice(0,16) }}</div>
      </div>

      <div class="grid gap-2">
        <div class="grid items-center gap-2" v-for="r in rows" :key="r" :style="{ gridTemplateColumns: `80px repeat(${cols}, 28px)` }">
          <div class="text-zinc-400">ряд {{ r }}</div>
          <button
            v-for="c in cols"
            :key="c"
            class="w-6 h-6 border-2 border-zinc-400 data-[booked=true]:opacity-40 data-[booked=true]:border-rose-400 data-[selected=true]:bg-sky-900 data-[selected=true]:border-sky-300"
            :data-booked="isBooked(r,c)"
            :data-selected="isSelected(r,c)"
            @click="toggle(r,c)"
            :disabled="isBooked(r,c)"
            :aria-pressed="isSelected(r,c)"
            :aria-label="`Ряд ${r}, место ${c}`"
          />
        </div>
      </div>

      <div class="flex items-center gap-3">
        <UButton color="primary" :disabled="!selected.length" @click="book">Забронировать</UButton>
      </div>
    </div>
  </section>
</template>

<style scoped></style>
