<script setup lang="ts">
import { z } from 'zod'
import { MovieSchema, type Movie } from '~/schemas'
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

<template>
  <section aria-labelledby="movies-title">
    <h1 id="movies-title" class="text-2xl font-semibold mb-4">Фильмы / Главная</h1>
    <div v-if="state.pending">Загрузка…</div>
    <div v-else-if="state.error">{{ state.error }}</div>
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
        <tr v-for="m in state.movies" :key="m.id" class="border-b border-zinc-800">
          <td class="py-2"><img :src="m.posterUrl" alt="" class="w-12 h-12 object-cover" /></td>
          <td class="py-2">{{ m.title || m.name }}</td>
          <td class="py-2">{{ m.duration || m.runtime }}</td>
          <td class="py-2">{{ m.rating }}</td>
          <td class="py-2"><button class="px-3 py-1 rounded border border-zinc-600 hover:bg-zinc-800" @click="viewSessions(m.id)">Посмотреть сеансы</button></td>
        </tr>
      </tbody>
    </table>
  </section>
  
</template>

<style scoped></style>
