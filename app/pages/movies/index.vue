<script setup lang="ts">
const { $api } = useNuxtApp()
const { data, pending, error } = await useAsyncData('movies', () => $api('/movies'))

const movies = computed(() => (data.value as any[]) || [])

const viewSessions = (id: string | number) => navigateTo(`/movies/${id}`)
</script>

<template>
  <section aria-labelledby="movies-title">
    <h1 id="movies-title" class="text-2xl font-semibold mb-4">Фильмы / Главная</h1>
    <div v-if="pending">Загрузка…</div>
    <div v-else-if="error">Ошибка загрузки фильмов</div>
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
        <tr v-for="m in movies" :key="m.id" class="border-b border-zinc-800">
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
