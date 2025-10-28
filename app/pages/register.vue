<template>
  <section aria-labelledby="register-title" class="max-w-md">
    <h1 id="register-title" class="text-2xl font-semibold mb-4">Регистрация</h1>
    <form @submit.prevent="onSubmit" class="grid gap-3">
      <label class="grid gap-1">
        <span class="text-sm text-zinc-300">Логин</span>
        <input v-model.trim="form.username" type="text" class="px-3 py-2 rounded border border-zinc-700 bg-zinc-900" placeholder="Введите логин" aria-required="true" />
        <span v-if="v$.form.username.$error" class="text-rose-400 text-xs">{{ usernameError }}</span>
      </label>
      <label class="grid gap-1">
        <span class="text-sm text-zinc-300">Пароль</span>
        <input v-model="form.password" type="password" class="px-3 py-2 rounded border border-zinc-700 bg-zinc-900" placeholder="Введите пароль" aria-required="true" />
        <span v-if="v$.form.password.$error" class="text-rose-400 text-xs">{{ passwordError }}</span>
      </label>
      <label class="grid gap-1">
        <span class="text-sm text-zinc-300">Пароль</span>
        <input v-model="form.passwordConfirmation" type="password" class="px-3 py-2 rounded border border-zinc-700 bg-zinc-900" placeholder="Подтвердите пароль" aria-required="true" />
        <span v-if="v$.form.passwordConfirmation.$error" class="text-rose-400 text-xs">Пароль не совпадает</span>
      </label>
      <button :disabled="auth.loading || v$.$invalid" type="submit" class="justify-self-start mt-2 inline-flex items-center gap-2 px-4 py-2 rounded bg-sky-600 hover:bg-sky-500 disabled:opacity-50">Зарегистрироваться</button>
    </form>
    <p class="mt-6 text-sm text-zinc-300">
      Если вы уже зарегистрированы <NuxtLink class="text-sky-400 underline" to="/login">войдите</NuxtLink>
    </p>
  </section>
</template>

<script setup lang="ts">
import useVuelidate from '@vuelidate/core'
import { required, minLength, helpers, sameAs } from '@vuelidate/validators'

const auth = useAuth()
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
  if (ok) await navigateTo('/tickets')
}
</script>

<style scoped></style>
