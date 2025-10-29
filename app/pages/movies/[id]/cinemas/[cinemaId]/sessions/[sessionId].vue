<template>
  <SessionSeatSelection
    v-if="session"
    :session="session"
    :pending="pending"
    :error="errorMessage"
    @book="handleBooking"
  />
</template>

<script setup lang="ts">
import { SessionDetailSchema, MovieSchema, CinemaSchema } from '~/schemas'
import { z } from 'zod'
import { useToast } from 'vue-toastification'
import SessionSeatSelection from '~/components/sessions/SessionSeatSelection.vue'
import type { EnrichedSession } from '~/types/sessions'

const { $api } = useNuxtApp()
const auth = useAuth()
const route = useRoute()

const parsingError = ref<string | null>(null)

const { data: sessionData, pending, error } = await useAsyncData<EnrichedSession | null>(
  `session-${route.params.sessionId}`,
  async () => {
    // NOTE: Backend lacks a /movies/{id} endpoint, so we fetch the list and filter client-side.
    const [sessionData, movies, cinemas] = await Promise.all([
      $api(`/api/proxy/movieSessions/${route.params.sessionId}`),
      $api('/api/proxy/movies'),
      $api('/api/proxy/cinemas')
    ])

    const sessionParse = SessionDetailSchema.safeParse(sessionData)
    const moviesParse = z.array(MovieSchema).safeParse(movies)
    const cinemasParse = z.array(CinemaSchema).safeParse(cinemas)

    if (!sessionParse.success) {
      parsingError.value = 'Не удалось обработать данные сеанса'
      return null
    }

    if (!moviesParse.success || !cinemasParse.success) {
      parsingError.value = 'Не удалось обработать данные фильма или кинотеатра'
      return null
    }

    const movie = moviesParse.data.find(m => m.id === sessionParse.data.movieId)
    const cinema = cinemasParse.data.find(c => c.id === sessionParse.data.cinemaId)

    // If we can't find movie/cinema data, we shouldn't show the session at all
    if (!movie || !cinema) {
      parsingError.value = 'Не удалось найти данные фильма или кинотеатра'
      return null
    }

    return {
      ...sessionParse.data,
      movieName: movie.title,
      cinemaName: cinema.name
    }
  }
)

const session = computed(() => sessionData.value || undefined)
const errorMessage = computed<string | null>(() => {
  if (error.value?.message) {
    return error.value.message
  }
  if (parsingError.value) {
    return parsingError.value
  }
  return null
})

const handleBooking = async (seats: Array<{ rowNumber: number; seatNumber: number }>) => {
  if (!auth.loggedIn.value) {
    return navigateTo({ path: '/login', query: { redirect: route.fullPath } })
  }
  
  if (!seats.length) return
  
  const toast = useToast()
  try {
    await $api(`/api/proxy/movieSessions/${route.params.sessionId}/bookings`, { 
      method: 'POST', 
      body: { seats } 
    })
    
    toast.success('Места забронированы')
    await navigateTo('/tickets')
  } catch {
    await $api(`/api/proxy/movieSessions/${route.params.sessionId}`)
    toast.error('Не удалось забронировать места')
  }
}
</script>

