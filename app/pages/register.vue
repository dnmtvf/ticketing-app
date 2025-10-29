<template>
  <section aria-labelledby="register-title" class="max-w-md">
    <h1 id="register-title" class="text-2xl font-semibold mb-4">Регистрация</h1>
    <RegisterForm :loading="auth.loading.value" @submit="handleRegister" />
    <p class="mt-6 text-sm text-zinc-300">
      Если вы уже зарегистрированы <NuxtLink class="text-sky-400 underline" to="/login">войдите</NuxtLink>
    </p>
  </section>
</template>

<script setup lang="ts">
import { useToast } from 'vue-toastification'
import RegisterForm from '~/components/auth/RegisterForm.vue'

const auth = useAuth()
const toast = useToast()

const handleRegister = async (formData: { username: string; password: string; passwordConfirmation: string }) => {
  const ok = await auth.register(formData)
  if (ok) {
    toast.success('Регистрация выполнена')
    await navigateTo('/tickets')
  }
}
</script>

