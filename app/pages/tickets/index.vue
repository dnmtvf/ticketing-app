<template>
  <TicketsView 
    :bookings="bookings" 
    :settings="settings" 
    :pending="pending" 
    :error="errorMessage"
    @refresh="refreshData" 
  />
</template>

<script setup lang="ts">
import { z } from 'zod'
import { SettingsSchema, BookingSchema, EnrichedBookingSchema, MovieSchema, CinemaSchema, SessionDetailSchema, type Booking, type EnrichedBooking, type Settings } from '~/schemas'
import TicketsView from '~/components/tickets/TicketsView.vue'

definePageMeta({ middleware: 'auth' })

const { $api } = useNuxtApp()
const parsingError = ref<string | null>(null)

const { data: ticketsData, pending, error, refresh: refreshData } = await useAsyncData<{
  settings: Settings | null
  bookings: Booking[] | undefined
}>('tickets', async () => {
  const [settingsRes, bookingsRes, moviesRes, cinemasRes] = await Promise.all([
    $api('/api/proxy/settings'),
    $api('/api/proxy/me/bookings'),
    $api('/api/proxy/movies'),
    $api('/api/proxy/cinemas')
  ])

  const settingsParsed = SettingsSchema.safeParse(settingsRes)
  const bookingsParsed = z.array(BookingSchema).safeParse(bookingsRes)
  const moviesParsed = z.array(MovieSchema).safeParse(moviesRes)
  const cinemasParsed = z.array(CinemaSchema).safeParse(cinemasRes)

  if (!settingsParsed.success) {
    parsingError.value = 'Не удалось загрузить настройки'
  }
  if (!bookingsParsed.success) {
    parsingError.value = 'Не удалось загрузить билеты'
  }
  if (!moviesParsed.success) {
    parsingError.value = 'Не удалось загрузить фильмы'
  }
  if (!cinemasParsed.success) {
    parsingError.value = 'Не удалось загрузить кинотеатры'
  }

  const movies = moviesParsed.success ? moviesParsed.data : []
  const cinemas = cinemasParsed.success ? cinemasParsed.data : []

  let sessionsData: unknown[] = []
  try {
    if (bookingsParsed.success) {
      sessionsData = await Promise.all(
        bookingsParsed.data.map(booking => 
          $api(`/api/proxy/movieSessions/${booking.movieSessionId}`)
        )
      )
    }
  } catch {
    parsingError.value = 'Не удалось загрузить данные сеансов'
  }

  const sessionsParsed = sessionsData.map(data => SessionDetailSchema.safeParse(data))
  
  const movieMap = new Map(movies.map(m => [m.id, m]))
  const cinemaMap = new Map(cinemas.map(c => [c.id, c]))
  const sessionsMap = new Map(sessionsParsed
    .filter(s => s.success)
    .map(session => [session.data.id, session]))
  
  let enrichedBookings: EnrichedBooking[] = []
  
  if (bookingsParsed.success && sessionsData.length === bookingsParsed.data.length) {
    enrichedBookings = bookingsParsed.data.map(booking => {
      const session = sessionsMap.get(booking.movieSessionId)
      
      if (!session) {
        parsingError.value = 'Не удалось загрузить данные сеанса'
        return null
      }
      
      const movie = movieMap.get(booking.movieSessionId)
      const cinema = cinemaMap.get(session.data.cinemaId)
      
      return {
        ...booking,
        movieName: movie?.title || '',
        moviePoster: movie?.posterImage || '',
        lengthMinutes: movie?.lengthMinutes || 0,
        cinemaName: cinema?.name || '',
        sessionTime: session.data.startTime || ''
      }
    }).filter(Boolean)
  }

  return {
    settings: settingsParsed.success ? settingsParsed.data : null,
    bookings: enrichedBookings
  }
})

const settings = computed<Settings | null>(() => ticketsData.value?.settings ?? null)
const bookings = computed<Booking[]>(() => ticketsData.value?.bookings ?? [])
const errorMessage = computed<string | null>(() => {
  if (error.value?.message) return error.value.message
  if (parsingError.value) return parsingError.value
  return null
})
</script>

