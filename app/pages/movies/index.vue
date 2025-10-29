<template>
  <div>
    <MovieTable 
      :movies="movies" 
      :pending="pending" 
      :error="errorMessage"
      @movie-select="viewSessions" 
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { z } from 'zod'
import { MovieSchema, type Movie } from '~/schemas'
import MovieTable from '~/components/movies/MovieTable.vue'
import { normalizeMovie } from '~/utils/transformers'

const moviesResponseSchema = z.array(MovieSchema)

const { $api } = useNuxtApp()
const { public: { apiBase } } = useRuntimeConfig()
const parsingError = ref<string | null>(null)

const { data: moviesData, pending, error } = await useAsyncData<Movie[]>(
  'movies',
  async () => {
    const res = await $api('/movies')
    const parsed = moviesResponseSchema.safeParse(res)
    if (!parsed.success) {
      parsingError.value = 'Не удалось обработать данные фильмов'
      return []
    }
    return parsed.data.map(movie => normalizeMovie({ movie, apiBase }))
  }
)

const movies = computed<Movie[]>(() => moviesData.value ?? [])
const errorMessage = computed<string | null>(() => {
  if (error.value?.message) {
    return error.value.message
  }
  if (parsingError.value) {
    return parsingError.value
  }
  return null
})

const viewSessions = (id: number) => {
  return navigateTo({
    name: 'movies-id',
    params: { id: String(id) }
  })
}
</script>
