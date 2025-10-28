<template>
  <div>
    <h1>Регистрация</h1>
    <form @submit.prevent="onSubmit" class="form">
      <label>
        Логин
        <input v-model="form.username" type="text" placeholder="Введите логин" required />
      </label>
      <label>
        Пароль
        <input v-model="form.password" type="password" placeholder="Введите пароль" required />
      </label>
      <label>
        Пароль
        <input v-model="form.passwordConfirmation" type="password" placeholder="Подтвердите пароль" required />
      </label>
      <p v-if="passwordMismatch" class="error">Пароль не совпадает</p>
      <p v-if="validationError" class="error">{{ validationError }}</p>
      <button :disabled="auth.loading || !!passwordMismatch" type="submit">Зарегистрироваться</button>
    </form>
    <p>
      Если вы уже зарегистрированы <NuxtLink to="/login">войдите</NuxtLink>
    </p>
  </div>
</template>

<script setup lang="ts">
const auth = useAuth()
const form = reactive({ username: '', password: '', passwordConfirmation: '' })

const passwordMismatch = computed(() => form.password && form.passwordConfirmation && form.password !== form.passwordConfirmation)

const validationError = computed(() => {
  if (form.username && form.username.length < 8) return 'Логин должен быть не менее 8 символов'
  const pass = form.password
  if (pass) {
    const hasUpper = /[A-ZА-Я]/.test(pass)
    const hasDigit = /\d/.test(pass)
    if (pass.length < 8 || !hasUpper || !hasDigit) {
      return 'Пароль: минимум 8 символов, минимум 1 заглавная буква и 1 цифра'
    }
  }
  return ''
})

const onSubmit = async () => {
  if (passwordMismatch.value || validationError.value) return
  const ok = await auth.register({
    username: form.username,
    password: form.password,
    passwordConfirmation: form.passwordConfirmation
  })
  if (ok) await navigateTo('/tickets')
}
</script>

<style scoped>
.form { display: grid; gap: 12px; max-width: 360px; }
input { width: 100%; padding: 8px; border: 1px solid #555; background: #111; color: #fff; }
button { padding: 8px 12px; }
.error { color: #ff6b6b; }
</style>
