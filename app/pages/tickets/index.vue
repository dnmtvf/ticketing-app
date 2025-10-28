<script setup lang="ts">
import { remainingSeconds } from '~/utils/time'
definePageMeta({ middleware: 'auth' })

const { $api } = useNuxtApp()

const settings = ref<{ paymentTimeoutSeconds: number } | null>(null)
const bookings = ref<any[]>([])
const pending = ref(true)
const error = ref<string | null>(null)

const load = async () => {
  pending.value = true
  try {
    const [s, b] = await Promise.all([
      $api('/settings'),
      $api('/me/bookings')
    ])
    settings.value = s
    bookings.value = Array.isArray(b) ? b : []
  } catch (e) {
    error.value = 'Ошибка загрузки'
  } finally {
    pending.value = false
  }
}

await load()

const now = ref(Date.now())
let timer: any
onMounted(() => { timer = setInterval(() => (now.value = Date.now()), 1000) })
onBeforeUnmount(() => clearInterval(timer))

const remainingSec = (b: any) => remainingSeconds(b.bookedAt || b.createdAt || Date.now(), settings.value?.paymentTimeoutSeconds ?? 0, now.value)

watchEffect(() => {
  // auto-remove expired unpaid bookings (UI) and refetch
  const timeout = settings.value?.paymentTimeoutSeconds
  if (!timeout) return
  const before = bookings.value.length
  bookings.value = bookings.value.filter(b => !(b.status === 'unpaid' && remainingSec(b) <= 0))
  if (bookings.value.length !== before) { load() }
})

const pay = async (b: any) => {
  try {
    await $api(`/bookings/${b.id}/payments`, { method: 'POST' })
    await load()
  } catch (e) {
    alert('Не удалось оплатить билет. Попробуйте снова.')
  }
}

const unpaid = computed(() => bookings.value.filter(b => b.status === 'unpaid'))
const upcoming = computed(() => bookings.value.filter(b => b.status === 'paid' || b.status === 'upcoming'))
const past = computed(() => bookings.value.filter(b => b.status === 'past' || b.status === 'expired'))
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
            <div>Ряд {{ b.seats?.[0]?.row || '' }}, место {{ b.seats?.[0]?.col || '' }}</div>
          </div>
          <div class="grow" />
          <button class="px-3 py-1 rounded border border-zinc-600 hover:bg-zinc-800" @click="pay(b)">Оплатить</button>
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
            <div>Ряд {{ b.seats?.[0]?.row || '' }}, место {{ b.seats?.[0]?.col || '' }}</div>
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
            <div>Ряд {{ b.seats?.[0]?.row || '' }}, место {{ b.seats?.[0]?.col || '' }}</div>
          </div>
        </div>
      </section>
    </div>
  </section>
</template>

<style scoped></style>
