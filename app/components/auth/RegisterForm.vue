<template>
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
    <BaseButton :loading="loading || isSubmitting" :disabled="isSubmitting" type="submit">Зарегистрироваться</BaseButton>
  </form>
</template>

<script setup lang="ts">
import useVuelidate from '@vuelidate/core'
import { required, minLength, helpers, sameAs } from '@vuelidate/validators'

type Props = {
  loading?: boolean
}

type FormData = {
  username: string
  password: string
  passwordConfirmation: string
}

defineProps<Props>()

const emit = defineEmits<{
  submit: [FormData]
}>()

const form = reactive<FormData>({ username: '', password: '', passwordConfirmation: '' })
const isSubmitting = ref(false)

const hasUpper = helpers.regex(/[A-ZА-Я]/)
const hasDigit = helpers.regex(/\d/)

const rules = computed(() => ({
  form: {
    username: { required, minLength: minLength(8) },
    password: { required, minLength: minLength(8), hasUpper, hasDigit },
    passwordConfirmation: { required, sameAsPassword: sameAs(form.password) }
  }
}))

const v$ = useVuelidate(rules, { form })

const usernameError = computed(() => {
  if (v$.value.form.username.required.$invalid) return 'Логин обязателен'
  if (v$.value.form.username.minLength.$invalid) return 'Логин должен быть не менее 8 символов'
  return ''
})

const passwordError = computed(() => {
  const p = v$.value.form.password
  if (p.required.$invalid) return 'Пароль обязателен'

  const errors = []
  if (p.minLength.$invalid) errors.push('минимум 8 символов')
  if (p.hasUpper.$invalid) errors.push('минимум 1 заглавная буква')
  if (p.hasDigit.$invalid) errors.push('минимум 1 цифра')

  if (errors.length > 0) return `Пароль: ${errors.join(', ')}`
  return ''
})

const onSubmit = async () => {
  if (isSubmitting.value) return

  const valid = await v$.value.$validate()
  if (!valid) return

  isSubmitting.value = true
  try {
    emit('submit', form)
  } finally {
    isSubmitting.value = false
  }
}
</script>
