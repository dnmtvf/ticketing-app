<template>
  <div class="min-h-dvh grid grid-cols-[240px_1fr]">
    <aside class="border-r border-zinc-700 p-4">
      <nav aria-label="Основная навигация">
        <ul class="flex flex-col gap-3">
          <li><NuxtLink class="hover:underline" to="/movies" active-class="font-bold underline">Фильмы</NuxtLink></li>
          <li><NuxtLink class="hover:underline" to="/cinemas" active-class="font-bold underline">Кинотеатры</NuxtLink></li>
          <li><NuxtLink class="hover:underline" to="/tickets" active-class="font-bold underline">Мои билеты</NuxtLink></li>
          <li v-if="auth.loggedIn"><button class="text-sky-400 hover:underline text-left" @click="onLogout">Выход</button></li>
          <li v-else><NuxtLink class="hover:underline" to="/login" active-class="font-bold underline">Вход</NuxtLink></li>
        </ul>
      </nav>
    </aside>
    <main class="p-6" role="main">
      <slot />
    </main>
  </div>
  
</template>

<script setup lang="ts">
const auth = useAuth()

const onLogout = async () => {
  await auth.logout()
  await navigateTo('/movies')
}
</script>

<style scoped></style>
