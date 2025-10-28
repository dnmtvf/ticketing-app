<template>
  <section class="border-t border-zinc-700 pt-3 mt-3">
    <h3 class="font-semibold mb-2">{{ date }}</h3>
    <div 
      v-for="cinema in cinemasForDate" 
      :key="cinema" 
      class="flex items-center gap-3 py-2"
    >
      <div class="min-w-48">{{ cinema }}</div>
      <div class="flex flex-wrap gap-2">
        <button 
          v-for="session in sessionsForCinema(date, cinema)" 
          :key="session.id" 
          @click="$emit('goToSession', session.id)" 
          class="px-3 py-1 rounded border border-zinc-600 hover:bg-zinc-800"
        >
          {{ getSessionTime(session) }}
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { Session } from '~/schemas'

interface Props {
  date: string
  sessions: Session[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  goToSession: [id: string | number]
}>()

const sessionsForDate = computed(() => {
  return props.sessions.filter(s => {
    const sessionDate = (s.startAt || s.startTime || s.start_time || '').slice(0, 10)
    return sessionDate === props.date
  })
})

const cinemasForDate = computed(() => {
  return [...new Set(sessionsForDate.value.map(s => {
    // Try multiple possible cinema name fields
    return s.cinemaName || s.cinema?.name || `Кинотеатр ${s.cinemaId || 'Неизвестный'}`
  }))]
})

const sessionsForCinema = (date: string, cinema: string) => {
  return props.sessions.filter(s => {
    const sessionDate = (s.startAt || s.startTime || s.start_time || '').slice(0, 10)
    const sessionCinemaName = s.cinemaName || s.cinema?.name || `Кинотеатр ${s.cinemaId || 'Неизвестный'}`
    return sessionDate === date && sessionCinemaName === cinema
  })
}

const getSessionTime = (session: Session) => {
  const startTime = session.startAt || session.startTime || session.start_time || ''
  return startTime.slice(11, 16)
}
</script>
