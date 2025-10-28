<template>
  <section aria-labelledby="login-title" class="max-w-md">
    <h1 id="login-title" class="text-2xl font-semibold mb-4">Вход</h1>
    <UForm :state="form" @submit="onSubmit" class="grid gap-3">
      <UFormGroup name="username" label="Логин">
        <UInput v-model="form.username" placeholder="Введите логин" />
      </UFormGroup>
      <UFormGroup name="password" label="Пароль">
        <UInput v-model="form.password" type="password" placeholder="Введите пароль" />
      </UFormGroup>
      <p v-if="errorMessage" class="text-rose-400 text-sm">{{ errorMessage }}</p>
      <UButton :loading="auth.loading.value" type="submit" color="primary">Войти</UButton>
    </UForm>
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
    const toast = useToast()
    toast.add({ title: 'Успешный вход' })
    const rq = route.query.redirect
    const redirect = typeof rq === 'string' ? rq : '/tickets'
    await navigateTo(redirect)
  }
}
</script>

