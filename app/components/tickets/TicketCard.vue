<template>
  <div class="flex items-center gap-3 py-3 border-b border-zinc-800">
    <div class="grid">
      <div>{{ booking.movieName }}</div>
      <div>{{ booking.cinemaName }}</div>
      <div>{{ sessionTime }}</div>
      <div>{{ seatInfo }}</div>
    </div>
    <div class="grow" />
    <slot name="actions" />
    <slot name="countdown" />
  </div>
</template>

<script setup lang="ts">
import type { Booking } from '~/schemas'

type Props = {
  booking: Booking
}

const props = defineProps<Props>()


const sessionTime = computed(() => {
  return new Date(props.booking.sessionTime).toLocaleString('ru-RU', { 
    hour: '2-digit', 
    minute: '2-digit', 
    day: '2-digit', 
    month: '2-digit' 
  })
})

const seatInfo = computed(() => {
  if (!props.booking.seats.length) return ''

  const seats = props.booking.seats
    .map(seat => `${seat.seatNumber}`)
    .join(', ')

  const rowNumber = props.booking.seats[0].rowNumber
  return `Ряд ${rowNumber}, места ${seats}`
})


</script>

