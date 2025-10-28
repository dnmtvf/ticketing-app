<template>
  <section v-if="movie" class="flex gap-4 mb-6">
    <img :src="movie.posterImage ? `${apiBase}${movie.posterImage}` : '/placeholder-movie.jpg'" alt="" class="w-[140px] h-[200px] object-cover bg-zinc-800" onerror="this.style.display='none'" />
    <div class="grid gap-1">
      <h2 class="text-xl font-medium">{{ movie.title || movie.name }}</h2>
      <p class="text-zinc-300">{{ movie.description }}</p>
      <div>Год: {{ movie.year }}</div>
      <div>Продолжительность: {{ movie.lengthMinutes ? `${movie.lengthMinutes} мин` : (movie.duration || movie.runtime || '-') }}</div>
      <div>Рейтинг: {{ movie.rating }}</div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { Movie } from '~/schemas'

interface Props {
  movie: Movie | null
}

const props = defineProps<Props>()

const apiBase = computed(() => {
  const config = useRuntimeConfig()
  return config.public.apiBase
})
</script>
