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
  <article aria-labelledby="cinema-title">
    <h1 id="cinema-title" class="text-2xl font-semibold mb-4">Кинотеатр</h1>
    <div v-if="pending">Загрузка…</div>
    <div v-else-if="error">{{ error }}</div>
    <div v-else>
      <section v-if="cinema" class="mb-4">
        <h2 class="text-xl font-medium">{{ cinema.name }}</h2>
        <div class="text-zinc-300">{{ cinema.address }}</div>
      </section>

      <section v-for="(list, date) in groupByDate(sessions)" :key="date" class="border-t border-zinc-700 pt-3 mt-3">
        <h3 class="font-semibold mb-2">{{ date }}</h3>
        <div class="flex flex-wrap gap-2">
          <button v-for="s in list" :key="s.id" @click="goToSession(s.id)" class="px-3 py-1 rounded border border-zinc-600 hover:bg-zinc-800">
            {{ (s.startAt || s.start_time || '').slice(11,16) }} — {{ s.movieName || s.movie?.title }}
          </button>
        </div>
      </section>
    </div>
  </article>
</template>

<style scoped></style>
