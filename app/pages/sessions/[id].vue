<script setup lang="ts">
const { $api } = useNuxtApp()
const auth = useAuth()
const route = useRoute()
const id = route.params.id as string

const detail = ref<any>(null)
const pending = ref(true)
const error = ref<string | null>(null)
const selected = ref<string[]>([])

const normalizeBooked = (booked: any): Set<string> => {
  const set = new Set<string>()
  if (Array.isArray(booked)) {
    for (const b of booked) {
      if (typeof b === 'string') set.add(b)
      else if (b && typeof b === 'object' && 'row' in b && 'col' in b) set.add(`r${b.row}c${b.col}`)
    }
  }
  return set
}

try {
  const d = await $api(`/movieSessions/${id}`)
  detail.value = d
} catch (e) {
  error.value = 'Ошибка загрузки сеанса'
} finally {
  pending.value = false
}

const rows = computed(() => {
  const s = detail.value?.seats
  if (!s) return 0
  if (typeof s.rows === 'number') return s.rows
  if (Array.isArray(s)) return s.length
  return 0
})

const cols = computed(() => {
  const s = detail.value?.seats
  if (!s) return 0
  if (typeof s.cols === 'number') return s.cols
  if (Array.isArray(s)) return Array.isArray(s[0]) ? s[0].length : 0
  return 0
})

const bookedSet = computed(() => normalizeBooked(detail.value?.bookedSeats))

const seatId = (r: number, c: number) => `r${r}c${c}`
const isBooked = (r: number, c: number) => bookedSet.value.has(seatId(r, c))
const isSelected = (r: number, c: number) => selected.value.includes(seatId(r, c))

const toggle = (r: number, c: number) => {
  if (isBooked(r, c)) return
  const id = seatId(r, c)
  const idx = selected.value.indexOf(id)
  if (idx >= 0) selected.value.splice(idx, 1)
  else selected.value.push(id)
}

const book = async () => {
  if (!auth.loggedIn.value) return navigateTo({ path: '/login', query: { redirect: route.fullPath } })
  if (!selected.value.length) return
  try {
    await $api(`/movieSessions/${id}`, { method: 'POST', body: { seats: selected.value } })
    await navigateTo('/tickets')
  } catch (e: any) {
    // Conflict or validation error: refresh seat map
    try { detail.value = await $api(`/movieSessions/${id}`) } catch {}
    alert('Не удалось забронировать выбранные места. Попробуйте еще раз.')
  }
}
</script>

<template>
  <div>
    <h1>Сеанс</h1>
    <div v-if="pending">Загрузка…</div>
    <div v-else-if="error">{{ error }}</div>
    <div v-else class="hall">
      <div class="meta">
        <div>Фильм: {{ detail?.movieName || detail?.movie?.title }}</div>
        <div>Кинотеатр: {{ detail?.cinemaName || detail?.cinema?.name }}</div>
        <div>Время: {{ (detail?.startAt || '').replace('T', ' ').slice(0,16) }}</div>
      </div>

      <div class="grid">
        <div class="row" v-for="r in rows" :key="r" :style="{ gridTemplateColumns: `80px repeat(${cols}, 28px)` }">
          <div class="label">ряд {{ r }}</div>
          <button
            v-for="c in cols"
            :key="c"
            class="seat"
            :data-booked="isBooked(r,c)"
            :data-selected="isSelected(r,c)"
            @click="toggle(r,c)"
            :disabled="isBooked(r,c)"
          />
        </div>
      </div>

      <div class="actions">
        <button @click="book">Забронировать</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.hall { display: grid; gap: 16px; }
.meta { display: grid; gap: 4px; }
.grid { display: grid; gap: 8px; }
.row { display: grid; align-items: center; gap: 8px; }
.seat { width: 24px; height: 24px; border: 2px solid #aaa; background: transparent; }
.seat[data-booked="true"] { opacity: .4; border-color: #f66; }
.seat[data-selected="true"] { background: #356; border-color: #6cf; }
.label { color: #bbb; }
</style>
