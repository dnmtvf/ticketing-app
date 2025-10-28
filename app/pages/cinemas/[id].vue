<script setup lang="ts">
const { $api } = useNuxtApp()
const route = useRoute()
const id = route.params.id as string

const cinema = ref<any>(null)
const sessions = ref<any[]>([])
const pending = ref(true)
const error = ref<string | null>(null)

const groupByDate = (list: any[]) => {
  const map: Record<string, any[]> = {}
  for (const s of list) {
    const d = (s.startAt || s.start_time || s.date || '').slice(0, 10)
    if (!map[d]) map[d] = []
    map[d].push(s)
  }
  return map
}

try {
  const [c, sess] = await Promise.all([
    $api(`/cinemas/${id}`).catch(() => null),
    $api(`/cinemas/${id}/sessions`).catch(() => $api(`/cinemas/${id}/session`))
  ])
  cinema.value = c
  sessions.value = Array.isArray(sess) ? sess : []
} catch (e) {
  error.value = 'Ошибка загрузки'
} finally {
  pending.value = false
}

const goToSession = (sessionId: string | number) => navigateTo(`/sessions/${sessionId}`)
</script>

<template>
  <div>
    <h1>Кинотеатр</h1>
    <div v-if="pending">Загрузка…</div>
    <div v-else-if="error">{{ error }}</div>
    <div v-else>
      <section v-if="cinema" class="cinema">
        <h2>{{ cinema.name }}</h2>
        <div>{{ cinema.address }}</div>
      </section>

      <div v-for="(list, date) in groupByDate(sessions)" :key="date" class="day">
        <h3>{{ date }}</h3>
        <div class="times">
          <button v-for="s in list" :key="s.id" @click="goToSession(s.id)">
            {{ (s.startAt || s.start_time || '').slice(11,16) }} — {{ s.movieName || s.movie?.title }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.times { display:flex; gap:8px; flex-wrap: wrap; }
.day { border-top:1px solid #333; padding-top:12px; margin-top:12px; }
</style>
