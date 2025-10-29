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
        <BaseButton
          v-for="session in sessionsForCinema(cinema)"
          :key="session.id"
          variant="outline"
          @click="emit('go-to-session', { sessionId: session.id, cinemaId: session.cinemaId })"
        >
          {{ getSessionTime(session) }}
        </BaseButton>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { SessionWithCinema } from '~/types/movies'

type Props = {
  date: string
  sessions: SessionWithCinema[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'go-to-session': [{ sessionId: number; cinemaId: number }]
}>()

const cinemasForDate = computed(() => {
  const names = props.sessions.map(session => session.cinema.name)
  return [...new Set(names)]
})

const sessionsForCinema = (cinema: string) => {
  return props.sessions.filter(session => session.cinema.name === cinema)
}

const getSessionTime = (session: SessionWithCinema) => {
  return session.startTime.slice(11, 16)
}
</script>
