<template>
  <section aria-labelledby="login-title" class="max-w-md">
    <h1 id="login-title" class="text-2xl font-semibold mb-4">Вход</h1>
    <form @submit.prevent="onSubmit" class="grid gap-3">
      <div>
        <label for="username" class="block text-sm font-medium mb-1">Логин</label>
        <input
          id="username"
          v-model="form.username"
          type="text"
          placeholder="Введите логин"
          class="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
        />
      </div>
      <div>
        <label for="password" class="block text-sm font-medium mb-1">Пароль</label>
        <input
          id="password"
          v-model="form.password"
          type="password"
          placeholder="Введите пароль"
          class="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
        />
      </div>
      <p v-if="errorMessage" class="text-rose-400 text-sm">{{ errorMessage }}</p>
      <BaseButton :loading="auth.loading.value" type="submit">Войти</BaseButton>
    </form>
    <p class="mt-6 text-sm text-zinc-300">
      Если у вас нет аккаунта <NuxtLink class="text-sky-400 underline" to="/register">зарегистрируйтесь</NuxtLink>
    </p>
  </section>
</template>

<script setup lang="ts">
import { useToast } from 'vue-toastification'

const auth = useAuth()
const route = useRoute()
const toast = useToast()

const form = reactive({ username: '', password: '' })
const errorMessage = computed(() => auth.error.value)

const onSubmit = async () => {
  const ok = await auth.login({ username: form.username, password: form.password })
  if (ok) {
    toast.success('Успешный вход')
    const rq = route.query.redirect
    const redirect = typeof rq === 'string' ? rq : '/tickets'
    await navigateTo(redirect)
  }
}
</script>

