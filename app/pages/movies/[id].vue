<script setup lang="ts">
const { $api } = useNuxtApp()
const route = useRoute()
const id = route.params.id as string

const movie = ref<any>(null)
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
  const [m, sess] = await Promise.all([
    $api(`/movies/${id}`).catch(() => null),
    $api(`/movies/${id}/sessions`)
  ])
  movie.value = m
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
    <h1>Фильм</h1>
    <div v-if="pending">Загрузка…</div>
    <div v-else-if="error">{{ error }}</div>
    <div v-else>
      <section v-if="movie" class="movie">
        <img :src="movie.posterUrl" alt="" class="poster" />
        <div>
          <h2>{{ movie.title || movie.name }}</h2>
          <p>{{ movie.description }}</p>
          <div>Год: {{ movie.year }}</div>
          <div>Продолжительность: {{ movie.duration }}</div>
          <div>Рейтинг: {{ movie.rating }}</div>
        </div>
      </section>

      <div v-for="(list, date) in groupByDate(sessions)" :key="date" class="day">
        <h3>{{ date }}</h3>
        <div v-for="cinema in [...new Set(list.map(s=>s.cinemaName||s.cinema?.name))]" :key="cinema" class="cinema">
          <div class="cinema-name">{{ cinema }}</div>
          <div class="times">
            <button v-for="s in list.filter(x => (x.cinemaName||x.cinema?.name)===cinema)" :key="s.id" @click="goToSession(s.id)">
              {{ (s.startAt || s.start_time || '').slice(11,16) }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.movie { display:flex; gap:16px; margin-bottom: 24px; }
.poster { width: 140px; height: 200px; object-fit: cover; background:#222; }
.cinema { display:flex; align-items:center; gap:12px; padding:8px 0; }
.times { display:flex; gap:8px; }
.day { border-top:1px solid #333; padding-top:12px; margin-top:12px; }
</style>
