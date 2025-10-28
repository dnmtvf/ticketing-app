<template>
  <div class="flex flex-col items-center justify-center py-8 text-center">
    <div class="w-12 h-12 rounded-full bg-rose-500/20 flex items-center justify-center mb-4">
      <svg class="w-6 h-6 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
    </div>
    <p class="text-zinc-300 mb-4">{{ errorMessage }}</p>
    <UButton 
      v-if="showRetry"
      variant="outline" 
      color="rose"
      @click="handleRetry"
    >
      Попробовать снова
    </UButton>
  </div>
</template>

<script setup lang="ts">
import type { NuxtError } from '#app'

interface Props {
  error?: string | NuxtError | null
  message?: string
  showRetry?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  error: null,
  message: 'Произошла ошибка',
  showRetry: false
})

const emit = defineEmits<{
  retry: []
}>()

const errorMessage = computed(() => {
  if (typeof props.error === 'string') {
    return props.error
  }
  if (props.error && typeof props.error === 'object' && 'message' in props.error) {
    return props.error.message || props.message
  }
  return props.message
})

const handleRetry = () => {
  emit('retry')
}
</script>

