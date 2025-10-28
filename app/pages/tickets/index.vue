<script setup lang="ts">
import { remainingSeconds } from '~/utils/time'
import type { Booking, Settings } from '~/schemas'
definePageMeta({ middleware: 'auth' })

import { z } from 'zod'
import { SettingsSchema, BookingSchema } from '~/schemas'
const { $api } = useNuxtApp()

type SettingsLike = Settings
type BookingLike = Booking

const settings = ref<SettingsLike | null>(null)
const bookings = ref<BookingLike[]>([])
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
  } catch (e) {
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

const remainingSec = (b: BookingLike) => {
  const timeout = (settings.value && 'paymentTimeoutSeconds' in settings.value && typeof settings.value.paymentTimeoutSeconds === 'number')
    ? settings.value.paymentTimeoutSeconds
    : ((settings.value && 'bookingPaymentTimeSeconds' in settings.value && typeof settings.value.bookingPaymentTimeSeconds === 'number')
      ? settings.value.bookingPaymentTimeSeconds
      : 0)
  return remainingSeconds(b.bookedAt || b.createdAt || Date.now(), timeout, now.value)
}

watchEffect(() => {
  // auto-remove expired unpaid bookings (UI) and refetch
  const timeout = (settings.value && 'paymentTimeoutSeconds' in settings.value)
    ? settings.value.paymentTimeoutSeconds
    : ((settings.value && 'bookingPaymentTimeSeconds' in settings.value)
      ? settings.value.bookingPaymentTimeSeconds
      : undefined)
  if (!timeout) return
  const before = bookings.value.length
  bookings.value = bookings.value.filter(b => !(b.status === 'unpaid' && remainingSec(b) <= 0))
  if (bookings.value.length !== before) { load() }
})

const pay = async (b: BookingLike) => {
  const toast = useToast()
  try {
    await $api(`/bookings/${b.id}/payments`, { method: 'POST' })
    toast.add({ title: 'Билет оплачен' })
    await load()
  } catch (e) {
    toast.add({ title: 'Не удалось оплатить билет', color: 'rose' })
  }
}

const isUnpaid = (b: BookingLike) => (b.status ? b.status === 'unpaid' : b.isPaid === false)
const isPaid = (b: BookingLike) => (b.status ? (b.status === 'paid' || b.status === 'upcoming') : b.isPaid === true)
const isPast = (b: BookingLike) => (b.status ? (b.status === 'past' || b.status === 'expired') : false)

const unpaid = computed(() => bookings.value.filter(isUnpaid))
const upcoming = computed(() => bookings.value.filter(isPaid))
const past = computed(() => bookings.value.filter(isPast))
</script>

<template>
  <section aria-labelledby="tickets-title">
    <h1 id="tickets-title" class="text-2xl font-semibold mb-4">Мои билеты</h1>
    <div v-if="pending">Загрузка…</div>
    <div v-else-if="error">{{ error }}</div>
    <div v-else class="grid gap-6">
      <section>
        <h2 class="text-xl font-medium mb-2">Неоплаченные</h2>
        <div v-if="!unpaid.length" class="text-zinc-300">Нет неоплаченных билетов</div>
        <div v-for="b in unpaid" :key="b.id" class="flex items-center gap-3 py-3 border-b border-zinc-800">
          <div class="grid">
            <div>{{ b.movieName || b.movie?.title }}</div>
            <div>{{ b.cinemaName || b.cinema?.name }}</div>
            <div>{{ new Date(b.startAt || b.time || '').toLocaleString('ru-RU', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' }) }}</div>
            <div>Ряд {{ b.seats?.[0]?.row || b.seats?.[0]?.rowNumber || '' }}, место {{ b.seats?.[0]?.col || b.seats?.[0]?.seatNumber || '' }}</div>
          </div>
          <div class="grow" />
          <UButton variant="outline" @click="pay(b)">Оплатить</UButton>
          <div>Осталось {{ Math.floor(remainingSec(b)/60) }}:{{ (remainingSec(b)%60).toString().padStart(2,'0') }}</div>
        </div>
      </section>

      <section>
        <h2 class="text-xl font-medium mb-2">Будущие</h2>
        <div v-if="!upcoming.length" class="text-zinc-300">Нет будущих билетов</div>
        <div v-for="b in upcoming" :key="b.id" class="py-3 border-b border-zinc-800">
          <div class="grid">
            <div>{{ b.movieName || b.movie?.title }}</div>
            <div>{{ b.cinemaName || b.cinema?.name }}</div>
            <div>{{ new Date(b.startAt || b.time || '').toLocaleString('ru-RU', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' }) }}</div>
            <div>Ряд {{ b.seats?.[0]?.row || b.seats?.[0]?.rowNumber || '' }}, место {{ b.seats?.[0]?.col || b.seats?.[0]?.seatNumber || '' }}</div>
          </div>
        </div>
      </section>

      <section>
        <h2 class="text-xl font-medium mb-2">Прошедшие</h2>
        <div v-if="!past.length" class="text-zinc-300">Нет прошедших билетов</div>
        <div v-for="b in past" :key="b.id" class="py-3 border-b border-zinc-800">
          <div class="grid">
            <div>{{ b.movieName || b.movie?.title }}</div>
            <div>{{ b.cinemaName || b.cinema?.name }}</div>
            <div>{{ new Date(b.startAt || b.time || '').toLocaleString('ru-RU', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' }) }}</div>
            <div>Ряд {{ b.seats?.[0]?.row || b.seats?.[0]?.rowNumber || '' }}, место {{ b.seats?.[0]?.col || b.seats?.[0]?.seatNumber || '' }}</div>
          </div>
        </div>
      </section>
    </div>
  </section>
</template>

<style scoped></style>
