<script setup lang="ts">
import { z } from 'zod'
import { CinemaSchema } from '~/app/schemas'
const { $api } = useNuxtApp()
const state = reactive({ pending: true, error: '' as string, cinemas: [] as any[] })
try {
  const res = await $api('/cinemas')
  const parsed = z.array(CinemaSchema).safeParse(res)
  if (!parsed.success) throw new Error('Schema mismatch')
  state.cinemas = parsed.data
} catch (e) {
  state.error = 'Ошибка загрузки кинотеатров'
} finally {
  state.pending = false
}
const viewSessions = (id: string | number) => navigateTo(`/cinemas/${id}`)
</script>

<template>
  <section aria-labelledby="cinemas-title">
    <h1 id="cinemas-title" class="text-2xl font-semibold mb-4">Кинотеатры</h1>
    <div v-if="state.pending">Загрузка…</div>
    <div v-else-if="state.error">{{ state.error }}</div>
    <table v-else class="w-full border-collapse">
      <thead class="text-left text-zinc-300">
        <tr class="border-b border-zinc-700">
          <th class="py-2">Кинотеатр</th>
          <th class="py-2">Адрес</th>
          <th class="py-2"></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="c in state.cinemas" :key="c.id" class="border-b border-zinc-800">
          <td class="py-2">{{ c.name }}</td>
          <td class="py-2">{{ c.address }}</td>
          <td class="py-2"><button class="px-3 py-1 rounded border border-zinc-600 hover:bg-zinc-800" @click="viewSessions(c.id)">Посмотреть сеансы</button></td>
        </tr>
      </tbody>
    </table>
  </section>
</template>

<style scoped></style>
