<template>
  <section aria-labelledby="session-title" class="flex flex-col items-center min-h-screen py-8">
    <h1 id="session-title" class="text-4xl font-semibold mb-8 text-center">Выбрать места</h1>
    <div v-if="pending" class="text-center">Загрузка…</div>
    <div v-else-if="error" class="text-center text-rose-400">{{ error }}</div>
    <div v-else class="flex flex-col items-center gap-8 w-full max-w-4xl">
      <div class="text-center space-y-1">
        <div class="text-lg">Фильм: {{ session.movieName }}</div>
        <div class="text-lg">Кинотеатр: {{ session.cinemaName }}</div>
        <div class="text-lg">Время: {{ formattedDateTime }}</div>
      </div>

      <div class="flex flex-col gap-3">
        <div class="grid items-center gap-3" v-for="r in rows" :key="r" :style="{ gridTemplateColumns: `80px repeat(${cols}, 40px)` }">
          <div class="text-right text-sm">ряд {{ r }}</div>
          <button
            v-for="c in cols"
            :key="c"
            class="w-10 h-10 rounded border-2 border-white cursor-pointer transition-colors"
            :class="{
              'bg-sky-700 border-sky-400': isSeatSelected(r,c) && !isSeatBooked(r,c),
              'bg-rose-400 border-rose-400 opacity-60 cursor-not-allowed': isSeatBooked(r,c),
              'bg-black hover:bg-zinc-800': !isSeatSelected(r,c) && !isSeatBooked(r,c)
            }"
            @click="toggleSeat(r,c)"
            :disabled="isSeatBooked(r,c)"
            :aria-pressed="isSeatSelected(r,c)"
            :aria-label="`Ряд ${r}, место ${c}`"
          />
        </div>
        <div class="grid items-center gap-3" :style="{ gridTemplateColumns: `80px repeat(${cols}, 40px)` }">
          <div></div>
          <div v-for="c in cols" :key="c" class="text-center text-sm text-zinc-400">{{ c }}</div>
        </div>
      </div>

      <div class="flex items-center justify-center mt-4">
        <BaseButton :disabled="!selectedSeats.length" @click="$emit('book', getSelectedSeatsForApi)">
          Забронировать
        </BaseButton>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useSeatSelection } from '~/composables/useSeatSelection'
import type { EnrichedSession } from '~/types/sessions'
import { formatSessionDateTime } from '~/utils/date'

type Props = {
  session: EnrichedSession
  pending: boolean
  error: string | null
}

type Emits = {
  'book': [seats: Array<{ rowNumber: number; seatNumber: number }>]
}

const props = defineProps<Props>()
defineEmits<Emits>()

const { setSessionDetail, getSeatDimensions, isSeatBooked, isSeatSelected, selectedSeats, toggleSeat, getSelectedSeatsForApi } = useSeatSelection()

watch(() => props.session, (detail) => {
  setSessionDetail(detail)
}, { immediate: true })

const rows = computed(() => getSeatDimensions.value.rows)
const cols = computed(() => getSeatDimensions.value.cols)
const formattedDateTime = computed(() => formatSessionDateTime(props.session.startTime))
</script>
