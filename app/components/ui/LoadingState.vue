<template>
  <div class="flex items-center justify-center py-8">
    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-400 mr-3"></div>
    <span :class="['text-zinc-300', sizeClasses[size]]">{{ message }}</span>
  </div>
</template>

<script setup lang="ts">
type Props = {
  message?: string
  size?: 'sm' | 'md' | 'lg'
}

withDefaults(defineProps<Props>(), {
  message: 'Загрузка…',
  size: 'md'
})

const sizeClasses = {
  sm: 'text-sm',
  md: 'text-base', 
  lg: 'text-lg'
}
</script>

