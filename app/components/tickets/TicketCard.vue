<template>
  <div class="flex items-center gap-3 py-3 border-b border-zinc-800">
    <div class="grid">
      <div>{{ ticketTitle }}</div>
      <div>{{ cinemaName }}</div>
      <div>{{ sessionTime }}</div>
      <div>{{ seatInfo }}</div>
    </div>
    <div class="grow" />
    <UButton 
      v-if="showPayment" 
      variant="outline" 
      @click="emitPay"
    >
      Оплатить
    </UButton>
    <div v-if="countdownText" class="text-sky-400">
      Осталось {{ countdownText }}
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Booking, Settings } from '~/schemas'
import { normalizeBooking } from '~/utils/transformers'

interface Props {
  booking: Booking
  settings: Settings | null
  showPayment?: boolean
  remainingSeconds?: number
}

const props = withDefaults(defineProps<Props>(), {
  showPayment: false,
  remainingSeconds: 0
})

const emit = defineEmits<{
  pay: [booking: Booking]
}>()

const emitPay = () => {
  if (props.showPayment) {
    emit('pay', props.booking)
  }
}

// Normalized data for consistent display
const normalizedBooking = computed(() => normalizeBooking(props.booking))

const ticketTitle = computed(() => normalizedBooking.value.movieName || normalizedBooking.value.movie?.title || '')
const cinemaName = computed(() => normalizedBooking.value.cinemaName || normalizedBooking.value.cinema?.name || '')
const sessionTime = computed(() => {
  const startAt = normalizedBooking.value.startAt || normalizedBooking.value.time || ''
  return new Date(startAt).toLocaleString('ru-RU', { 
    hour: '2-digit', 
    minute: '2-digit', 
    day: '2-digit', 
    month: '2-digit' 
  })
})

const seatInfo = computed(() => {
  const seat = normalizedBooking.value.seats?.[0]
  if (!seat) return ''
  
  if (typeof seat === 'string') {
    return seat
  }
  
  const row = 'row' in seat ? seat.row : 'rowNumber' in seat ? seat.rowNumber : ''
  const col = 'col' in seat ? seat.col : 'seatNumber' in seat ? seat.seatNumber : ''
  
  return `Ряд ${row}, место ${col}`
})

const countdownText = computed(() => {
  if (!props.remainingSeconds) return ''
  const minutes = Math.floor(props.remainingSeconds / 60)
  const seconds = props.remainingSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
})
</script>

