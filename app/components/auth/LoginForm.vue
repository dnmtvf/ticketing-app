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
      <p v-if="v$.form.username.$error" class="text-rose-400 text-sm mt-1">
        {{ v$.form.username.required.$invalid ? 'Логин обязателен' : '' }}
      </p>
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
      <p v-if="v$.form.password.$error" class="text-rose-400 text-sm mt-1">
        {{ v$.form.password.required.$invalid ? 'Пароль обязателен' : '' }}
      </p>
    </div>
    <p v-if="errorMessage" class="text-rose-400 text-sm">{{ errorMessage }}</p>
    <BaseButton :loading="loading || isSubmitting" :disabled="isSubmitting" type="submit">Войти</BaseButton>
  </form>
</template>

<script setup lang="ts">
import useVuelidate from '@vuelidate/core'
import { required } from '@vuelidate/validators'

type Props = {
  errorMessage?: string | null
  loading?: boolean
}

type FormData = {
  username: string
  password: string
}

defineProps<Props>()

const emit = defineEmits<{
  submit: [FormData]
}>()

const form = reactive<FormData>({ username: '', password: '' })
const isSubmitting = ref(false)

const rules = computed(() => ({
  form: {
    username: { required },
    password: { required }
  }
}))

const v$ = useVuelidate(rules, { form })

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
