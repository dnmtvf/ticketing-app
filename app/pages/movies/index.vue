<template>
  <div>
    <MovieTable @movie-select="viewSessions" />
  </div>
</template>

<script setup lang="ts">
import MovieTable from '~/components/movies/MovieTable.vue'

const viewSessions = (id: number) => {
  return navigateTo({
    name: 'movies-id',
    params: { id: String(id) }
  })
}
</script>
