<template>
  <section aria-labelledby="tickets-title">
    <h1 id="tickets-title" class="text-2xl font-semibold mb-4">Мои билеты</h1>
    <div v-if="pending">Загрузка…</div>
    <div v-else-if="error">{{ error }}</div>
    <div v-else class="grid gap-6">
      <section>
        <h2 class="text-xl font-medium mb-2">Неоплаченные</h2>
        <div v-if="!unpaidBookings.length" class="text-zinc-300">Нет неоплаченных билетов</div>
        <TicketCard
          v-for="booking in unpaidBookings"
          :key="booking.id"
          :booking="booking"
          :settings="settings"
          :show-payment="true"
          :remaining-seconds="getRemainingSeconds(booking)"
          @pay="handlePay"
        />
      </section>

      <section>
        <h2 class="text-xl font-medium mb-2">Будущие</h2>
        <div v-if="!upcomingBookings.length" class="text-zinc-300">Нет будущих билетов</div>
        <TicketCard
          v-for="booking in upcomingBookings"
          :key="booking.id"
          :booking="booking"
          :settings="settings"
        />
      </section>

      <section>
        <h2 class="text-xl font-medium mb-2">Прошедшие</h2>
        <div v-if="!pastBookings.length" class="text-zinc-300">Нет прошедших билетов</div>
        <TicketCard
          v-for="booking in pastBookings"
          :key="booking.id"
          :booking="booking"
          :settings="settings"
        />
      </section>
    </div>
  </section>
</template>

<script setup lang="ts">
import { remainingSeconds } from '~/utils/time'
import type { Booking, Settings } from '~/schemas'
import TicketCard from '~/components/tickets/TicketCard.vue'

definePageMeta({ middleware: 'auth' })

import { z } from 'zod'
import { SettingsSchema, BookingSchema } from '~/schemas'

const { $api } = useNuxtApp()

const settings = ref<Settings | null>(null)
const bookings = ref<Booking[]>([])
const pending = ref(true)
const error = ref<string | null>(null)

const load = async () => {
  pending.value = true
  try {
    const [s, b] = await Promise.all([
      $api('/settings'),
      $api('/me/bookings')
    ])
    const ps = SettingsSchema.safeParse(s)
    settings.value = ps.success ? ps.data : null
    const pb = z.array(BookingSchema).safeParse(b)
    bookings.value = pb.success ? pb.data : []
  } catch {
    error.value = 'Ошибка загрузки'
  } finally {
    pending.value = false
  }
}

await load()

const now = ref(Date.now())
let timer: ReturnType<typeof setInterval> | undefined
onMounted(() => { timer = setInterval(() => (now.value = Date.now()), 1000) })
onBeforeUnmount(() => { if (timer) clearInterval(timer) })

const getRemainingSeconds = (booking: Booking): number => {
  const timeout = settings.value && 'paymentTimeoutSeconds' in settings.value
    ? settings.value.paymentTimeoutSeconds
    : settings.value && 'bookingPaymentTimeSeconds' in settings.value
      ? settings.value.bookingPaymentTimeSeconds
      : 0
      
  return remainingSeconds(booking.bookedAt || booking.createdAt || Date.now(), timeout, now.value)
}

watchEffect(() => {
  const timeout = settings.value && 'paymentTimeoutSeconds' in settings.value
    ? settings.value.paymentTimeoutSeconds
    : settings.value && 'bookingPaymentTimeSeconds' in settings.value
      ? settings.value.bookingPaymentTimeSeconds
      : undefined
      
  if (!timeout) return
  const before = bookings.value.length
  bookings.value = bookings.value.filter(b => !(b.status === 'unpaid' && getRemainingSeconds(b) <= 0))
  if (bookings.value.length !== before) { load() }
})

const handlePay = async (booking: Booking) => {
  const toast = useToast()
  try {
    await $api(`/bookings/${booking.id}/payments`, { method: 'POST' })
    toast.add({ title: 'Билет оплачен' })
    await load()
  } catch {
    toast.add({ title: 'Не удалось оплатить билет', color: 'rose' })
  }
}

const isUnpaid = (booking: Booking) => booking.status ? booking.status === 'unpaid' : booking.isPaid === false
const isUpcoming = (booking: Booking) => booking.status ? (booking.status === 'paid' || booking.status === 'upcoming') : booking.isPaid === true
const isPast = (booking: Booking) => booking.status ? (booking.status === 'past' || booking.status === 'expired') : false

const unpaidBookings = computed(() => bookings.value.filter(isUnpaid))
const upcomingBookings = computed(() => bookings.value.filter(isUpcoming))
const pastBookings = computed(() => bookings.value.filter(isPast))
</script>

