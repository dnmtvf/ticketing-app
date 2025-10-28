<script setup lang="ts">
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

const remainingSec = (b: any) => {
  const timeout = settings.value?.paymentTimeoutSeconds ?? 0
  const bookedAt = new Date(b.bookedAt || b.createdAt || Date.now()).getTime()
  return Math.max(0, Math.floor((bookedAt + timeout * 1000 - now.value) / 1000))
}

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
  <div>
    <h1>Мои билеты</h1>
    <div v-if="pending">Загрузка…</div>
    <div v-else-if="error">{{ error }}</div>
    <div v-else class="tickets">
      <section>
        <h2>Неоплаченные</h2>
        <div v-if="!unpaid.length">Нет неоплаченных билетов</div>
        <div v-for="b in unpaid" :key="b.id" class="item">
          <div>
            <div>{{ b.movieName || b.movie?.title }}</div>
            <div>{{ b.cinemaName || b.cinema?.name }}</div>
            <div>{{ new Date(b.startAt || b.time || '').toLocaleString('ru-RU', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' }) }}</div>
            <div>Ряд {{ b.seats?.[0]?.row || '' }}, место {{ b.seats?.[0]?.col || '' }}</div>
          </div>
          <div class="spacer" />
          <button @click="pay(b)">Оплатить</button>
          <div>Осталось {{ Math.floor(remainingSec(b)/60) }}:{{ (remainingSec(b)%60).toString().padStart(2,'0') }}</div>
        </div>
      </section>

      <section>
        <h2>Будущие</h2>
        <div v-if="!upcoming.length">Нет будущих билетов</div>
        <div v-for="b in upcoming" :key="b.id" class="item">
          <div>
            <div>{{ b.movieName || b.movie?.title }}</div>
            <div>{{ b.cinemaName || b.cinema?.name }}</div>
            <div>{{ new Date(b.startAt || b.time || '').toLocaleString('ru-RU', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' }) }}</div>
            <div>Ряд {{ b.seats?.[0]?.row || '' }}, место {{ b.seats?.[0]?.col || '' }}</div>
          </div>
        </div>
      </section>

      <section>
        <h2>Прошедшие</h2>
        <div v-if="!past.length">Нет прошедших билетов</div>
        <div v-for="b in past" :key="b.id" class="item">
          <div>
            <div>{{ b.movieName || b.movie?.title }}</div>
            <div>{{ b.cinemaName || b.cinema?.name }}</div>
            <div>{{ new Date(b.startAt || b.time || '').toLocaleString('ru-RU', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' }) }}</div>
            <div>Ряд {{ b.seats?.[0]?.row || '' }}, место {{ b.seats?.[0]?.col || '' }}</div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.tickets { display: grid; gap: 24px; }
.item { display: flex; align-items: center; gap: 12px; padding: 12px 0; border-bottom: 1px solid #333; }
.spacer { flex: 1; }
</style>
