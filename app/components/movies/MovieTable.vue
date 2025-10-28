<template>
  <section aria-labelledby="movies-title">
    <h1 id="movies-title" class="text-2xl font-semibold mb-4">Фильмы / Главная</h1>
    
    <div v-if="pending">Загрузка…</div>
    <div v-else-if="error">{{ error }}</div>
    
    <table v-else class="w-full border-collapse">
      <thead class="text-left text-zinc-300">
        <tr class="border-b border-zinc-700">
          <th class="w-16"></th>
          <th class="py-2">Название</th>
          <th class="py-2">Продолжительность</th>
          <th class="py-2">Рейтинг</th>
          <th class="py-2"></th>
        </tr>
      </thead>
      <tbody>
        <MovieCard 
          v-for="movie in movies" 
          :key="movie.id" 
          :movie="movie" 
          @view-sessions="emit('viewSessions', $event)"
        />
      </tbody>
    </table>
  </section>
</template>

<script setup lang="ts">
import type { Movie } from '~/schemas'
import MovieCard from './MovieCard.vue'

interface Props {
  movies: Movie[]
  pending: boolean
  error: string | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  viewSessions: [id: string | number]
}>()
</script>
