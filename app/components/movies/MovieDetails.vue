<template>
  <section v-if="movie" class="flex gap-4 mb-6">
    <img 
      :src="posterFullUrl" 
      :alt="title || 'Movie poster'"
      width="140"
      height="200"
      class="w-[140px] h-[200px] object-cover bg-zinc-800" 
      loading="lazy"
      decoding="async"
    />
    <div class="grid gap-1">
      <h2 class="text-xl font-medium">{{ title }}</h2>
      <p class="text-zinc-300">{{ description }}</p>
      <div>Год: {{ year }}</div>
      <div>Продолжительность: {{ `${lengthMinutes} мин` }}</div>
      <div>Рейтинг: {{ rating }}</div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { Movie } from '~/schemas'

type Props = {
  movie: Movie | null
}

const { movie } = defineProps<Props>()

// Destructure movie properties for cleaner template access
const { 
  posterFullUrl,
  title,
  description,
  year,
  lengthMinutes,
  rating
} = movie || {}
</script>
