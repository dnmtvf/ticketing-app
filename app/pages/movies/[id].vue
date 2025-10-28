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
  <article aria-labelledby="movie-title">
    <h1 id="movie-title" class="text-2xl font-semibold mb-4">Фильм</h1>
    <div v-if="pending">Загрузка…</div>
    <div v-else-if="error">{{ error }}</div>
    <div v-else>
      <section v-if="movie" class="flex gap-4 mb-6">
        <img :src="movie.posterUrl" alt="" class="w-[140px] h-[200px] object-cover bg-zinc-800" />
        <div class="grid gap-1">
          <h2 class="text-xl font-medium">{{ movie.title || movie.name }}</h2>
          <p class="text-zinc-300">{{ movie.description }}</p>
          <div>Год: {{ movie.year }}</div>
          <div>Продолжительность: {{ movie.duration }}</div>
          <div>Рейтинг: {{ movie.rating }}</div>
        </div>
      </section>

      <section v-for="(list, date) in groupByDate(sessions)" :key="date" class="border-t border-zinc-700 pt-3 mt-3">
        <h3 class="font-semibold mb-2">{{ date }}</h3>
        <div v-for="cinema in [...new Set(list.map(s=>s.cinemaName||s.cinema?.name))]" :key="cinema" class="flex items-center gap-3 py-2">
          <div class="min-w-48">{{ cinema }}</div>
          <div class="flex flex-wrap gap-2">
            <button v-for="s in list.filter(x => (x.cinemaName||x.cinema?.name)===cinema)" :key="s.id" @click="goToSession(s.id)" class="px-3 py-1 rounded border border-zinc-600 hover:bg-zinc-800">
              {{ (s.startAt || s.start_time || '').slice(11,16) }}
            </button>
          </div>
        </div>
      </section>
    </div>
  </article>
</template>

<style scoped></style>
