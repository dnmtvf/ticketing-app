<template>
  <article aria-labelledby="movie-title">
    <h1 id="movie-title" class="text-2xl font-semibold mb-4">Фильм</h1>
    <div v-if="pending">Загрузка…</div>
    <div v-else-if="error">{{ error }}</div>
    <div v-else>
      <MovieDetails :movie="movie" />

      <div v-for="date in dates" :key="date">
        <SessionGroup
          :date="date"
          :sessions="sessionsByDate[date] ?? []"
          @go-to-session="emit('go-to-session', $event)"
        />
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import MovieDetails from '~/components/movies/MovieDetails.vue'
import SessionGroup from '~/components/movies/SessionGroup.vue'
import type { Movie } from '~/schemas'
import type { SessionWithCinema } from '~/types/movies'

type Props = {
  movie: Movie | null
  dates: string[]
  sessionsByDate: Record<string, SessionWithCinema[]>
  pending: boolean
  error: string | null
}

const { movie, dates, sessionsByDate, pending, error } = defineProps<Props>()

const emit = defineEmits<{
  'go-to-session': [{ sessionId: number; cinemaId: number }]
}>()
</script>
