<template>
  <section aria-labelledby="login-title" class="max-w-md">
    <h1 id="login-title" class="text-2xl font-semibold mb-4">Вход</h1>
    <LoginForm
      :error-message="auth.error.value"
      :loading="auth.loading.value"
      @submit="handleLogin"
    />
    <p class="mt-6 text-sm text-zinc-300">
      Если у вас нет аккаунта <NuxtLink class="text-sky-400 underline" to="/register">зарегистрируйтесь</NuxtLink>
    </p>
  </section>
</template>

<script setup lang="ts">
import { useToast } from 'vue-toastification'
import LoginForm from '~/components/auth/LoginForm.vue'

const auth = useAuth()
const route = useRoute()
const toast = useToast()

const handleLogin = async (formData: { username: string; password: string }) => {
  const ok = await auth.login(formData)
  if (ok) {
    toast.success('Успешный вход')
    const rq = route.query.redirect
    const redirect = typeof rq === 'string' ? rq : '/tickets'
    await navigateTo(redirect)
  }
}
</script>

