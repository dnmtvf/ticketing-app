<template>
  <section aria-labelledby="session-title">
    <h1 id="session-title" class="text-2xl font-semibold mb-4">Сеанс</h1>
    <div v-if="pending">Загрузка…</div>
    <div v-else-if="error">{{ error }}</div>
    <div v-else class="grid gap-4">
      <div class="grid gap-1 text-zinc-300">
        <div>Фильм: {{ seatSelection.sessionDetail?.movieName || seatSelection.sessionDetail?.movie?.title }}</div>
        <div>Кинотеатр: {{ seatSelection.sessionDetail?.cinemaName || seatSelection.sessionDetail?.cinema?.name }}</div>
        <div>Время: {{ String(seatSelection.sessionDetail?.startAt || seatSelection.sessionDetail?.startTime || '').replace('T', ' ').slice(0,16) }}</div>
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
            @click="toggleSeat(r,c)"
            :disabled="isBooked(r,c)"
            :aria-pressed="isSelected(r,c)"
            :aria-label="`Ряд ${r}, место ${c}`"
          />
        </div>
      </div>

      <div class="flex items-center gap-3">
        <UButton color="primary" :disabled="!selectedSeats.length" @click="book">
          Забронировать ({{ selectedSeats.length }})
        </UButton>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { SessionDetailSchema } from '~/schemas'
import { normalizeSessionDetail } from '~/utils/transformers'
import { useSeatSelection } from '~/composables/useSeatSelection'

const { $api } = useNuxtApp()
const auth = useAuth()
const route = useRoute()
const id = String(route.params.id)

// Use the seat selection composable
const seatSelection = useSeatSelection()

const pending = ref(true)
const error = ref<string | null>(null)

// Initialize session data
try {
  const sessionData = await $api(`/movieSessions/${id}`)
  const parsed = SessionDetailSchema.safeParse(sessionData)
  
  if (parsed.success) {
    const normalizedDetail = normalizeSessionDetail(parsed.data)
    seatSelection.setSessionDetail(normalizedDetail)
  } else {
    throw new Error('Schema mismatch')
  }
} catch {
  error.value = 'Ошибка загрузки сеанса'
} finally {
  pending.value = false
}

// Computed properties from the composable
const rows = computed(() => seatSelection.getSeatDimensions.value.rows)
const cols = computed(() => seatSelection.getSeatDimensions.value.cols)
const isBooked = (r: number, c: number) => seatSelection.isSeatBooked(r, c)
const isSelected = (r: number, c: number) => seatSelection.isSeatSelected(r, c)
const selectedSeats = computed(() => seatSelection.selectedSeats)

const toggleSeat = (r: number, c: number) => {
  seatSelection.toggleSeat(r, c)
}

const book = async () => {
  if (!auth.loggedIn.value) {
    return navigateTo({ path: '/login', query: { redirect: route.fullPath } })
  }
  
  if (!selectedSeats.value.length) return
  
  const toast = useToast()
  try {
    const seats = seatSelection.getSelectedSeatsForApi.value
    await $api(`/movieSessions/${id}/bookings`, { 
      method: 'POST', 
      body: { seats } 
    })
    
    toast.add({ title: 'Места забронированы' })
    await navigateTo('/tickets')
  } catch {
    // Refresh seat map on conflict/validation errors
    try {
      const refreshed = await $api(`/movieSessions/${id}`)
      const parsed = SessionDetailSchema.safeParse(refreshed)
      if (parsed.success) {
        const normalizedDetail = normalizeSessionDetail(parsed.data)
        seatSelection.setSessionDetail(normalizedDetail)
      }
    } catch {}
    
    toast.add({ title: 'Не удалось забронировать места', color: 'rose' })
  }
}
</script>

