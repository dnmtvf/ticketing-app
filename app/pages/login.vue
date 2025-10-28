<template>
  <div>
    <h1>Вход</h1>
    <form @submit.prevent="onSubmit" class="form">
      <label>
        Логин
        <input v-model="form.username" type="text" placeholder="Введите логин" required />
      </label>
      <label>
        Пароль
        <input v-model="form.password" type="password" placeholder="Введите пароль" required />
      </label>
      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
      <button :disabled="auth.loading" type="submit">Войти</button>
    </form>
    <p>
      Если у вас нет аккаунта <NuxtLink to="/register">зарегистрируйтесь</NuxtLink>
    </p>
  </div>
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

<style scoped>
.form { display: grid; gap: 12px; max-width: 360px; }
input { width: 100%; padding: 8px; border: 1px solid #555; background: #111; color: #fff; }
button { padding: 8px 12px; }
.error { color: #ff6b6b; }
</style>
