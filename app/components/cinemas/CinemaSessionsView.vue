<template>
  <article aria-labelledby="cinema-title" class="max-w-6xl mx-auto">
    <h1 id="cinema-title" class="text-4xl font-semibold mb-8 text-center">{{ cinema.name }}</h1>

    <div v-if="pending" class="text-center">Загрузка…</div>
    <div v-else-if="error" class="text-center text-rose-400">{{ error }}</div>
    <div v-else>
      <div v-for="(movieGroups, date) in grouped" :key="date" class="mb-8">
        <h2 class="text-2xl font-medium mb-4 pb-2 border-b border-white">{{ formatDate(date) }}</h2>

        <div v-for="group in movieGroups" :key="group.movie.id" class="flex items-center gap-4 py-4 border-b border-zinc-700">
          <img
            :src="group.movie.posterFullUrl"
            :alt="group.movie.title"
            width="64"
            height="64"
            class="w-16 h-16 object-cover bg-zinc-800 rounded flex-shrink-0"
            loading="lazy"
            decoding="async"
          />

          <div class="min-w-48">
            <div class="text-lg">{{ group.movie.title }}</div>
          </div>

          <div class="flex flex-wrap gap-3">
            <BaseButton
              v-for="sessionId in group.sessionIds"
              :key="sessionId"
              @click="handleSessionSelect(sessionId)"
            >
              {{ formatSessionTime(sessionId) }}
            </BaseButton>
          </div>
        </div>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import type { Cinema, Movie } from '~/schemas'
import type { SessionWithMovie } from '~/types/sessions'
import { formatDateShort, formatSessionTime as formatSessionTimeUtil, getDatePart } from '~/utils/date'

type Props = {
  cinema: Cinema
  sessions: SessionWithMovie[]
  pending: boolean
  error: string | null
}

type MovieGroup = {
  movie: Movie
  sessionIds: number[]
}

type GroupedSessions = Record<string, MovieGroup[]>

const props = defineProps<Props>()

const emit = defineEmits<{
  'session-select': [SessionWithMovie]
}>()

const sessionsById = computed(() =>
  Object.fromEntries(props.sessions.map(s => [s.id, s]))
)

const groupByDateAndMovie = (list: SessionWithMovie[]): GroupedSessions => {
  const result: GroupedSessions = {}
  for (const s of list) {
    if (!s.movie) continue

    const date = getDatePart(s.startTime)
    const movieId = s.movie.id

    if (!result[date]) result[date] = []

    let movieGroup = result[date].find(g => g.movie.id === movieId)
    if (!movieGroup) {
      movieGroup = { movie: s.movie, sessionIds: [] }
      result[date].push(movieGroup)
    }
    movieGroup.sessionIds.push(s.id)
  }
  return result
}

const formatDate = formatDateShort

const formatSessionTime = (sessionId: number) => {
  const session = sessionsById.value[sessionId]
  return session ? formatSessionTimeUtil(session.startTime) : ''
}

const handleSessionSelect = (sessionId: number) => {
  const session = sessionsById.value[sessionId]
  if (session) emit('session-select', session)
}

const grouped = computed(() => groupByDateAndMovie(props.sessions))
</script>
