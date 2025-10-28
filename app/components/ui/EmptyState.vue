<template>
  <div class="flex flex-col items-center justify-center py-12 text-center">
    <div class="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center mb-4">
      <svg class="w-8 h-8 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" :d="selectedIconPath" />
      </svg>
    </div>
    <h3 class="text-lg font-medium text-zinc-200 mb-2">{{ title }}</h3>
    <p class="text-zinc-400 mb-6 max-w-sm">{{ message }}</p>
    <UButton 
      v-if="showAction"
      @click="emitAction"
    >
      {{ actionText }}
    </UButton>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title?: string
  message?: string
  icon?: 'ticket' | 'movie' | 'cinema' | 'search' | 'default'
  actionText?: string
  showAction?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Нет данных',
  message: 'Здесь пока ничего нет',
  icon: 'default',
  actionText: 'Добавить',
  showAction: false
})

const emit = defineEmits<{
  action: []
}>()

const emitAction = () => {
  emit('action')
}

const iconPaths = {
  ticket: 'M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z',
  movie: 'M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 110 2h-1v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6H3a1 1 0 110-2h4zM9 6v10h6V6H9z',
  cinema: 'M3 4h18v2H3V4zm0 4h18v10H3V8zm2 2v6h14v-6H5z',
  search: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
  default: 'M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4'
}

const selectedIconPath = computed(() => iconPaths[props.icon])
</script>

