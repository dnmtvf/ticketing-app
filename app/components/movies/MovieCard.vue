<template>
  <tr class="border-b border-zinc-800">
    <td class="py-2">
      <img 
        :src="movie.posterImage ? `${apiBase}${movie.posterImage}` : '/placeholder-movie.jpg'" 
        alt="" 
        class="w-12 h-12 object-cover bg-zinc-800" 
        onerror="this.style.display='none'"
      />
    </td>
    <td class="py-2">{{ movie.title || movie.name }}</td>
    <td class="py-2">{{ movie.lengthMinutes ? `${movie.lengthMinutes} мин` : (movie.duration || movie.runtime || '-') }}</td>
    <td class="py-2">{{ movie.rating }}</td>
    <td class="py-2">
      <button 
        class="px-3 py-1 rounded border border-zinc-600 hover:bg-zinc-800" 
        @click="$emit('viewSessions', movie.id)"
      >
        Посмотреть сеансы
      </button>
    </td>
  </tr>
</template>

<script setup lang="ts">
import type { Movie } from '~/schemas'

interface Props {
  movie: Movie
}

const props = defineProps<Props>()

const emit = defineEmits<{
  viewSessions: [id: string | number]
}>()

const apiBase = computed(() => {
  const config = useRuntimeConfig()
  return config.public.apiBase
})
</script>
