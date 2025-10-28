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
          :sessions="sessions"
          @go-to-session="goToSession"
        />
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { z } from 'zod'
import { MovieSchema, SessionSchema, type Movie, type Session } from '~/schemas'
import MovieDetails from '~/components/movies/MovieDetails.vue'
import SessionGroup from '~/components/movies/SessionGroup.vue'
import { groupSessionsByDate } from '~/utils/transformers'

const { $api } = useNuxtApp()
const route = useRoute()
const id = String(route.params.id)

const movie = ref<Movie | null>(null)
const sessions = ref<Session[]>([])
const pending = ref(true)
const error = ref<string | null>(null)

try {
  // Get movie details from movies list (since /movies/{id} doesn't exist)
  const movies = await $api('/movies')
  const moviesArray = z.array(MovieSchema).safeParse(movies)
  
  if (moviesArray.success) {
    // Find the movie in the list
    movie.value = moviesArray.data.find(m => String(m.id) === id) || null
  }
  
  // Get sessions and cinemas data
  const [sess, cinemas] = await Promise.all([
    $api(`/movies/${id}/sessions`),
    $api('/cinemas')
  ])
  
  const ps = z.array(SessionSchema).safeParse(sess)
  const cs = z.array(CinemaSchema).safeParse(cinemas)
  
  if (ps.success && cs.success) {
    // Join sessions with cinema data to get cinema names
    sessions.value = ps.data.map(session => {
      const cinema = cs.data.find(c => String(c.id) === String(session.cinemaId))
      return {
        ...session,
        cinemaName: cinema?.name || `Кинотеатр ${session.cinemaId}`,
        cinema: cinema
      }
    })
  } else {
    error.value = 'Ошибка загрузки сеансов'
  }
} catch {
  error.value = 'Ошибка загрузки'
} finally {
  pending.value = false
}

// Extract dates for rendering
const dates = computed(() => {
  const grouped = groupSessionsByDate(sessions.value)
  return Object.keys(grouped).sort()
})

const goToSession = (sessionId: string | number) => navigateTo(`/sessions/${sessionId}`)
</script>
