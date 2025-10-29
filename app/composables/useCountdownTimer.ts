import { ref, onMounted, onBeforeUnmount } from 'vue'

export const useCountdownTimer = () => {
  const now = ref(Date.now())
  let timer: ReturnType<typeof setTimeout> | undefined

  const updateNow = () => {
    now.value = Date.now()
    // Schedule next update
    timer = setTimeout(updateNow, 1000)
  }

  onMounted(() => {
    timer = setTimeout(updateNow, 1000)
  })

  onBeforeUnmount(() => {
    if (timer) {
      clearTimeout(timer)
    }
  })

  return {
    now
  }
}
