<template>
  <section aria-labelledby="tickets-title">
    <h1 id="tickets-title" class="text-2xl font-semibold mb-4">Мои билеты</h1>
    <div v-if="pending">Загрузка…</div>
    <div v-else-if="error">{{ error }}</div>
    <div v-else class="grid gap-6">
      <section>
        <h2 class="text-xl font-medium mb-2">Неоплаченные</h2>
        <template v-if="unpaidBookings.length">
          <TicketCard
            v-for="booking in unpaidBookings"
            :key="booking.id"
            :booking="booking"
          >
            <template #actions>
              <BaseButton
                v-if="getRemainingSeconds(booking) > 0"
                @click="handlePay(booking)"
              >
                Оплатить
              </BaseButton>
              <span v-else class="text-red-500 text-sm font-medium">
                Истекло
              </span>
            </template>
            <template #countdown>
              <span class="text-sm text-zinc-400">
                Осталось: {{ formatRemainingTime(getRemainingSeconds(booking)) }}
              </span>
            </template>
          </TicketCard>
        </template>
        <div v-else class="text-zinc-300">Нет неоплаченных билетов</div>
      </section>

      <section>
        <h2 class="text-xl font-medium mb-2">Будущие</h2>
        <template v-if="upcomingBookings.length">
          <TicketCard
            v-for="booking in upcomingBookings"
            :key="booking.id"
            :booking="booking"
            :settings="settings"
          />
        </template>
        <div v-else class="text-zinc-300">Нет будущих билетов</div>
      </section>

      <section>
        <h2 class="text-xl font-medium mb-2">Прошедшие</h2>
        <template v-if="pastBookings.length">
          <TicketCard
            v-for="booking in pastBookings"
            :key="booking.id"
            :booking="booking"
            :settings="settings"
          />
        </template>
        <div v-else class="text-zinc-300">Нет прошедших билетов</div>
      </section>
    </div>
  </section>
</template>

<script setup lang="ts">
import { remainingSeconds, isTimeInFuture, isTimeInPast } from '~/utils/time'
import type { EnrichedBooking, Settings } from '~/schemas'
import TicketCard from '~/components/tickets/TicketCard.vue'
import { useToast } from 'vue-toastification'
import { useCountdownTimer } from '~/composables/useCountdownTimer'

type Props = {
  bookings: EnrichedBooking[]
  settings: Settings
  pending: boolean
  error: string | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  refresh: []
}>()

const { now } = useCountdownTimer()
const { $api } = useNuxtApp()
const toast = useToast()

const getRemainingSeconds = (booking: EnrichedBooking): number => {
  return remainingSeconds(booking.bookedAt, props.settings.bookingPaymentTimeSeconds, now.value)
}

const formatRemainingTime = (seconds: number): string => {
  if (seconds <= 0) return '0:00'
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}



const handlePay = async (booking: EnrichedBooking) => {
  if (getRemainingSeconds(booking) <= 0) {
    toast.error('Время бронирования истекло')
    return
  }

  try {
    await $api(`/api/proxy/bookings/${booking.id}/payments`, { method: 'POST' })
    toast.success('Билет оплачен')
    emit('refresh')
  } catch {
    toast.error('Не удалось оплатить билет')
  }
}



const isUnpaid = (booking: EnrichedBooking) => !booking.isPaid
const isUpcoming = (booking: EnrichedBooking) => booking.isPaid && isTimeInFuture(booking.sessionTime)
const isPast = (booking: EnrichedBooking) => booking.isPaid && isTimeInPast(booking.sessionTime)

const unpaidBookings = computed(() => props.bookings.filter(isUnpaid))
const upcomingBookings = computed(() => props.bookings.filter(isUpcoming))
const pastBookings = computed(() => props.bookings.filter(isPast))
</script>
