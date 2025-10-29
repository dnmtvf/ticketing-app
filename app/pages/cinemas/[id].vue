<template>
  <CinemaSessionsView
    v-if="cinema"
    :cinema="cinema"
    :sessions="sessions"
    :pending="pending"
    :error="errorMessage"
    @session-select="goToSession"
  />
  <div v-else-if="errorMessage" class="text-center text-rose-400 mt-8">
    {{ errorMessage }}
  </div>
</template>

<script setup lang="ts">
import { z } from 'zod'
import { CinemaSchema, SessionSchema, MovieSchema, type Movie, type Session } from '~/schemas'
import CinemaSessionsView from '~/components/cinemas/CinemaSessionsView.vue'
import { normalizeMovie } from '~/utils/transformers'
import type { SessionWithMovie } from '~/types/sessions'

const { $api } = useNuxtApp()
const { public: { apiBase } } = useRuntimeConfig()
const route = useRoute()
const id = String(route.params.id)
const parsingError = ref<string | null>(null)

const { data, pending, error } = await useAsyncData(
  `cinema-${id}-sessions`,
  async () => {
    const [cinemasRes, sessionsRes, moviesRes] = await Promise.all([
      $api('/api/proxy/cinemas'),
      $api(`/api/proxy/cinemas/${id}/sessions`),
      $api('/api/proxy/movies')
    ])

    const cinemasParsed = z.array(CinemaSchema).safeParse(cinemasRes)
    const sessionsParsed = z.array(SessionSchema).safeParse(sessionsRes)
    const moviesParsed = z.array(MovieSchema).safeParse(moviesRes)

    if (!cinemasParsed.success) {
      parsingError.value = 'Не удалось загрузить данные кинотеатра'
    }

    if (!sessionsParsed.success) {
      parsingError.value = 'Ошибка загрузки сеансов'
    }

    if (!moviesParsed.success) {
      parsingError.value = 'Не удалось загрузить данные фильмов'
    }

    const cinema = cinemasParsed.success
      ? cinemasParsed.data.find(c => c.id === Number(id))
      : undefined

    const moviesById = moviesParsed.success
      ? Object.fromEntries(
          moviesParsed.data.map(m => [m.id, normalizeMovie({ movie: m, apiBase })])
        )
      : {}

    const sessions = sessionsParsed.success
      ? sessionsParsed.data
          .map(session => ({
            ...session,
            movie: moviesById[session.movieId]
          }))
          .filter((session): session is SessionWithMovie => !!session.movie)
      : []

    return {
      cinema,
      sessions
    }
  }
)

const cinema = computed(() => data.value?.cinema)
const sessions = computed(() => data.value?.sessions ?? [])
const errorMessage = computed<string | null>(() => {
  if (error.value?.message) return error.value.message
  if (parsingError.value) return parsingError.value
  return null
})

const goToSession = (session: Session) => {
  return navigateTo(`/movies/${session.movieId}/cinemas/${id}/sessions/${session.id}`)
}
</script>

