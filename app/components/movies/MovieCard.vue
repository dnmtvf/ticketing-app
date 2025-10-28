<template>
  <tr class="border-b border-zinc-800">
    <td class="py-2">
      <img 
        :src="posterFullUrl" 
        :alt="title || 'Movie poster'"
        width="48"
        height="48"
        class="w-12 h-12 object-cover bg-zinc-800" 
        loading="lazy"
        decoding="async"
      />
    </td>
    <td class="py-2">{{ title }}</td>
    <td class="py-2">{{ `${lengthMinutes} мин` }}</td>
    <td class="py-2">{{ rating }}</td>
    <td class="py-2">
      <button 
        class="px-3 py-1 rounded border border-zinc-600 hover:bg-zinc-800" 
        @click="$emit('movie-select', movie.id)"
      >
        Посмотреть сеансы
      </button>
    </td>
  </tr>
</template>

<script setup lang="ts">
import type { Movie } from '~/schemas'

type Props = {
  movie: Movie
}

const { movie } = defineProps<Props>()

// Destructure nested properties with defaults
const { 
  posterFullUrl, 
  title, 
  lengthMinutes, 
  rating
} = movie

defineEmits<{
  'movie-select': [id: number]
}>()
</script>
