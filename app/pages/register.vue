<template>
  <section aria-labelledby="register-title" class="max-w-md">
    <h1 id="register-title" class="text-2xl font-semibold mb-4">Регистрация</h1>
    <UForm :state="form" @submit="onSubmit" class="grid gap-3">
      <UFormGroup name="username" label="Логин" :error="v$.form.username.$error ? usernameError : ''">
        <UInput v-model="form.username" placeholder="Введите логин" />
      </UFormGroup>
      <UFormGroup name="password" label="Пароль" :error="v$.form.password.$error ? passwordError : ''">
        <UInput v-model="form.password" type="password" placeholder="Введите пароль" />
      </UFormGroup>
      <UFormGroup name="passwordConfirmation" label="Пароль" :error="v$.form.passwordConfirmation.$error ? 'Пароль не совпадает' : ''">
        <UInput v-model="form.passwordConfirmation" type="password" placeholder="Подтвердите пароль" />
      </UFormGroup>
      <UButton :loading="auth.loading.value" type="submit">Зарегистрироваться</UButton>
    </UForm>
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
  if (ok) {
    const toast = useToast()
    toast.add({ title: 'Регистрация выполнена' })
    await navigateTo('/tickets')
  }
}
</script>

<style scoped></style>
