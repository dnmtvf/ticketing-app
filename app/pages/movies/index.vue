<template>
  <MovieTable
    :movies="state.movies"
    :pending="state.pending"
    :error="state.error"
    @view-sessions="viewSessions"
  />
</template>

<script setup lang="ts">
import { z } from 'zod'
import { MovieSchema, type Movie } from '~/schemas'
import MovieTable from '~/components/movies/MovieTable.vue'

const { $api } = useNuxtApp()

const state = reactive<{ pending: boolean; error: string; movies: Movie[] }>({ pending: true, error: '', movies: [] })

try {
  const res = await $api('/movies')
  const parsed = z.array(MovieSchema).safeParse(res)
  if (!parsed.success) {
    state.error = 'Ошибка загрузки фильмов'
  } else {
    state.movies = parsed.data
  }
} catch {
  state.error = 'Ошибка загрузки фильмов'
} finally {
  state.pending = false
}

const viewSessions = (id: string | number) => navigateTo(`/movies/${id}`)
</script>
