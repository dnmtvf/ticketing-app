<template>
  <MovieSessionsContent
    :movie="movie"
    :dates="dates"
    :sessions-by-date="sessionsByDate"
    :pending="pending"
    :error="errorMessage"
    @go-to-session="goToSession"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { z } from 'zod'
import { MovieSchema, SessionSchema, CinemaSchema, type Movie } from '~/schemas'
import MovieSessionsContent from '~/components/movies/MovieSessionsContent.vue'
import type { SessionWithCinema } from '~/types/movies'
import { groupSessionsByDate, normalizeMovie } from '~/utils/transformers'

type MovieSessionsData = {
  movie: Movie | null
  sessions: SessionWithCinema[]
  parsingError: string | null
}

const { $api } = useNuxtApp()
const { public: { apiBase } } = useRuntimeConfig()
const route = useRoute()
const id = String(route.params.id)

const { data: movieSessionsData, pending, error } = await useAsyncData<MovieSessionsData>(
  `movie-${id}`,
  async () => {
    // NOTE: Backend lacks a /movies/{id} endpoint, so we fetch the list and filter client-side.
    const [movies, sess, cinemas] = await Promise.all([
      $api('/movies'),
      $api(`/movies/${id}/sessions`),
      $api('/cinemas')
    ])

    const movieParse = z.array(MovieSchema).safeParse(movies)
    const sessionParse = z.array(SessionSchema).safeParse(sess)
    const cinemaParse = z.array(CinemaSchema).safeParse(cinemas)

    let movie: Movie | null = null
    let sessions: SessionWithCinema[] = []
    let parsingError: string | null = null

    if (movieParse.success) {
      const rawMovie = movieParse.data.find(movieItem => String(movieItem.id) === id)
      movie = rawMovie ? normalizeMovie({ movie: rawMovie, apiBase }) : null
    } else {
      parsingError = 'Не удалось обработать данные фильма'
    }

    if (sessionParse.success && cinemaParse.success) {
      const cinemasById = Object.fromEntries(cinemaParse.data.map(c => [String(c.id), c]))

      sessions = sessionParse.data.map(session => {
        const cinema = cinemasById[String(session.cinemaId)] ?? {
          id: session.cinemaId,
          name: `Кинотеатр ${session.cinemaId}`
        }

        return {
          ...session,
          cinema
        }
      })
    } else {
      parsingError = parsingError ?? 'Ошибка загрузки сеансов'
    }

    return {
      movie,
      sessions,
      parsingError
    }
  }
)

const movie = computed<Movie | null>(() => movieSessionsData.value?.movie ?? null)
const sessions = computed<SessionWithCinema[]>(() => movieSessionsData.value?.sessions ?? [])
const errorMessage = computed<string | null>(() => {
  if (error.value?.message) {
    return error.value.message
  }
  if (movieSessionsData.value?.parsingError) {
    return movieSessionsData.value.parsingError
  }
  return null
})

const groupedSessions = computed(() => groupSessionsByDate(sessions.value))

const dates = computed(() => groupedSessions.value.dates)

const sessionsByDate = computed(() => groupedSessions.value.grouped)

const goToSession = ({ sessionId, cinemaId }: { sessionId: number; cinemaId: number }) => {
  const movieId = String(route.params.id)
  return navigateTo(`/movies/${movieId}/cinemas/${cinemaId}/sessions/${sessionId}`)
}
</script>
