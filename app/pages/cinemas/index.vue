<script setup lang="ts">
const { $api } = useNuxtApp()
const { data, pending, error } = await useAsyncData('cinemas', () => $api('/cinemas'))
const cinemas = computed(() => (data.value as any[]) || [])
const viewSessions = (id: string | number) => navigateTo(`/cinemas/${id}`)
</script>

<template>
  <section aria-labelledby="cinemas-title">
    <h1 id="cinemas-title" class="text-2xl font-semibold mb-4">Кинотеатры</h1>
    <div v-if="pending">Загрузка…</div>
    <div v-else-if="error">Ошибка загрузки кинотеатров</div>
    <table v-else class="w-full border-collapse">
      <thead class="text-left text-zinc-300">
        <tr class="border-b border-zinc-700">
          <th class="py-2">Кинотеатр</th>
          <th class="py-2">Адрес</th>
          <th class="py-2"></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="c in cinemas" :key="c.id" class="border-b border-zinc-800">
          <td class="py-2">{{ c.name }}</td>
          <td class="py-2">{{ c.address }}</td>
          <td class="py-2"><button class="px-3 py-1 rounded border border-zinc-600 hover:bg-zinc-800" @click="viewSessions(c.id)">Посмотреть сеансы</button></td>
        </tr>
      </tbody>
    </table>
  </section>
</template>

<style scoped></style>
