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
  <section aria-labelledby="session-title">
    <h1 id="session-title" class="text-2xl font-semibold mb-4">Сеанс</h1>
    <div v-if="pending">Загрузка…</div>
    <div v-else-if="error">{{ error }}</div>
    <div v-else class="grid gap-4">
      <div class="grid gap-1 text-zinc-300">
        <div>Фильм: {{ detail?.movieName || detail?.movie?.title }}</div>
        <div>Кинотеатр: {{ detail?.cinemaName || detail?.cinema?.name }}</div>
        <div>Время: {{ (detail?.startAt || '').replace('T', ' ').slice(0,16) }}</div>
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

      <div>
        <button @click="book" class="px-4 py-2 rounded bg-sky-600 hover:bg-sky-500">Забронировать</button>
      </div>
    </div>
  </section>
</template>

<style scoped></style>
