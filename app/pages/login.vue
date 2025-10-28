<template>
  <section aria-labelledby="login-title" class="max-w-md">
    <h1 id="login-title" class="text-2xl font-semibold mb-4">Вход</h1>
    <form @submit.prevent="onSubmit" class="grid gap-3">
      <label class="grid gap-1">
        <span class="text-sm text-zinc-300">Логин</span>
        <input v-model.trim="form.username" type="text" class="px-3 py-2 rounded border border-zinc-700 bg-zinc-900" placeholder="Введите логин" aria-required="true" />
      </label>
      <label class="grid gap-1">
        <span class="text-sm text-zinc-300">Пароль</span>
        <input v-model="form.password" type="password" class="px-3 py-2 rounded border border-zinc-700 bg-zinc-900" placeholder="Введите пароль" aria-required="true" />
      </label>
      <p v-if="errorMessage" class="text-rose-400 text-sm">{{ errorMessage }}</p>
      <button :disabled="auth.loading" type="submit" class="justify-self-start mt-2 inline-flex items-center gap-2 px-4 py-2 rounded bg-sky-600 hover:bg-sky-500 disabled:opacity-50">Войти</button>
    </form>
    <p class="mt-6 text-sm text-zinc-300">
      Если у вас нет аккаунта <NuxtLink class="text-sky-400 underline" to="/register">зарегистрируйтесь</NuxtLink>
    </p>
  </section>
</template>

<script setup lang="ts">
const auth = useAuth()
const route = useRoute()

const form = reactive({ username: '', password: '' })
const errorMessage = computed(() => auth.error.value)

const onSubmit = async () => {
  const ok = await auth.login({ username: form.username, password: form.password })
  if (ok) {
    const redirect = (route.query.redirect as string) || '/tickets'
    await navigateTo(redirect)
  }
}
</script>

<style scoped></style>
