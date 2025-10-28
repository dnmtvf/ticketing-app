<script setup lang="ts">
const { $api } = useNuxtApp()
const { data, pending, error } = await useAsyncData('movies', () => $api('/movies'))

const movies = computed(() => (data.value as any[]) || [])

const viewSessions = (id: string | number) => navigateTo(`/movies/${id}`)
</script>

<template>
  <div>
    <h1>Фильмы / Главная</h1>
    <div v-if="pending">Загрузка…</div>
    <div v-else-if="error">Ошибка загрузки фильмов</div>
    <table v-else class="grid">
      <thead>
        <tr>
          <th></th>
          <th>Название</th>
          <th>Продолжительность</th>
          <th>Рейтинг</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="m in movies" :key="m.id">
          <td style="width:64px"><img :src="m.posterUrl" alt="" style="width:48px;height:48px;object-fit:cover" /></td>
          <td>{{ m.title || m.name }}</td>
          <td>{{ m.duration || m.runtime }}</td>
          <td>{{ m.rating }}</td>
          <td><button @click="viewSessions(m.id)">Посмотреть сеансы</button></td>
        </tr>
      </tbody>
    </table>
  </div>
  
</template>

<style scoped>
.grid { width: 100%; border-collapse: collapse; }
th, td { border-bottom: 1px solid #333; padding: 10px; text-align: left; }
</style>
