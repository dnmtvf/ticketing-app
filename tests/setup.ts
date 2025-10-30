import { vi } from 'vitest'
import * as vue from 'vue'

// Make Vue composables available globally for Nuxt auto-imports
globalThis.ref = vue.ref
globalThis.reactive = vue.reactive
globalThis.computed = vue.computed
globalThis.watch = vue.watch
globalThis.watchEffect = vue.watchEffect
globalThis.onMounted = vue.onMounted
globalThis.onUnmounted = vue.onUnmounted
globalThis.nextTick = vue.nextTick
