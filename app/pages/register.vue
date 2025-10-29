<template>
  <section aria-labelledby="register-title" class="max-w-md">
    <h1 id="register-title" class="text-2xl font-semibold mb-4">Регистрация</h1>
    <form @submit.prevent="onSubmit" class="grid gap-3">
      <div>
        <label for="username" class="block text-sm font-medium mb-1">Логин</label>
        <input
          id="username"
          v-model="form.username"
          type="text"
          placeholder="Введите логин"
          class="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
          :class="{ 'border-rose-500': v$.form.username.$error }"
        />
        <p v-if="v$.form.username.$error" class="text-rose-400 text-sm mt-1">{{ usernameError }}</p>
      </div>
      <div>
        <label for="password" class="block text-sm font-medium mb-1">Пароль</label>
        <input
          id="password"
          v-model="form.password"
          type="password"
          placeholder="Введите пароль"
          class="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
          :class="{ 'border-rose-500': v$.form.password.$error }"
        />
        <p v-if="v$.form.password.$error" class="text-rose-400 text-sm mt-1">{{ passwordError }}</p>
      </div>
      <div>
        <label for="passwordConfirmation" class="block text-sm font-medium mb-1">Подтверждение пароля</label>
        <input
          id="passwordConfirmation"
          v-model="form.passwordConfirmation"
          type="password"
          placeholder="Подтвердите пароль"
          class="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
          :class="{ 'border-rose-500': v$.form.passwordConfirmation.$error }"
        />
        <p v-if="v$.form.passwordConfirmation.$error" class="text-rose-400 text-sm mt-1">Пароль не совпадает</p>
      </div>
      <BaseButton :loading="auth.loading.value" type="submit">Зарегистрироваться</BaseButton>
    </form>
    <p class="mt-6 text-sm text-zinc-300">
      Если вы уже зарегистрированы <NuxtLink class="text-sky-400 underline" to="/login">войдите</NuxtLink>
    </p>
  </section>
</template>

<script setup lang="ts">
import useVuelidate from '@vuelidate/core'
import { required, minLength, helpers, sameAs } from '@vuelidate/validators'
import { useToast } from 'vue-toastification'

const auth = useAuth()
const toast = useToast()
const form = reactive({ username: '', password: '', passwordConfirmation: '' })

const hasUpper = helpers.regex('hasUpper', /[A-ZА-Я]/)
const hasDigit = helpers.regex('hasDigit', /\d/)

const rules = computed(() => ({
  form: {
    username: { required, minLength: minLength(8) },
    password: { required, minLength: minLength(8), hasUpper, hasDigit },
    passwordConfirmation: { required, sameAsPassword: sameAs(form.password) }
  }
}))

const v$ = useVuelidate(rules, { form })

const usernameError = computed(() => v$.value.form.username.required.$invalid ? 'Логин обязателен' : (v$.value.form.username.minLength.$invalid ? 'Логин должен быть не менее 8 символов' : ''))
const passwordError = computed(() => {
  const p = v$.value.form.password
  if (p.required.$invalid) return 'Пароль обязателен'
  if (p.minLength.$invalid || p.hasUpper.$invalid || p.hasDigit.$invalid) return 'Пароль: минимум 8 символов, минимум 1 заглавная буква и 1 цифра'
  return ''
})

const onSubmit = async () => {
  const valid = await v$.value.$validate()
  if (!valid) return
  const ok = await auth.register({
    username: form.username,
    password: form.password,
    passwordConfirmation: form.passwordConfirmation
  })
  if (ok) {
    toast.success('Регистрация выполнена')
    await navigateTo('/tickets')
  }
}
</script>

