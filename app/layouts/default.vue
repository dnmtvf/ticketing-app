<template>
  <div class="layout">
    <aside class="sidebar">
      <nav>
        <NuxtLink to="/movies" active-class="active">Фильмы</NuxtLink>
        <NuxtLink to="/cinemas" active-class="active">Кинотеатры</NuxtLink>
        <NuxtLink to="/tickets" active-class="active">Мои билеты</NuxtLink>
        <button v-if="auth.loggedIn" class="linklike" @click="onLogout">Выход</button>
        <NuxtLink v-else to="/login" active-class="active">Вход</NuxtLink>
      </nav>
    </aside>
    <main class="content">
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

<style scoped>
.layout { display: grid; grid-template-columns: 240px 1fr; min-height: 100dvh; }
.sidebar { border-right: 1px solid #444; padding: 16px; }
.sidebar nav { display: flex; flex-direction: column; gap: 12px; }
.content { padding: 24px; }
.active { font-weight: 700; text-decoration: underline; }
.linklike { background: none; border: none; color: #61dafb; text-align: left; padding: 0; cursor: pointer; }
.linklike:hover { text-decoration: underline; }
</style>
