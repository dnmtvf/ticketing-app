<script setup lang="ts">
const { $api } = useNuxtApp()
const { data, pending, error } = await useAsyncData('cinemas', () => $api('/cinemas'))
const cinemas = computed(() => (data.value as any[]) || [])
const viewSessions = (id: string | number) => navigateTo(`/cinemas/${id}`)
</script>

<template>
  <div>
    <h1>Кинотеатры</h1>
    <div v-if="pending">Загрузка…</div>
    <div v-else-if="error">Ошибка загрузки кинотеатров</div>
    <table v-else class="grid">
      <thead>
        <tr>
          <th>Кинотеатр</th>
          <th>Адрес</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="c in cinemas" :key="c.id">
          <td>{{ c.name }}</td>
          <td>{{ c.address }}</td>
          <td><button @click="viewSessions(c.id)">Посмотреть сеансы</button></td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.grid { width: 100%; border-collapse: collapse; }
th, td { border-bottom: 1px solid #333; padding: 10px; text-align: left; }
</style>
