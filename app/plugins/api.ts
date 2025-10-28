export default defineNuxtPlugin(() => {
  const isServer = import.meta.server
  const baseURL = isServer ? `${useRequestURL().origin}/api/proxy` : '/api/proxy'
  const api = $fetch.create({ baseURL, credentials: 'include' })
  return { provide: { api } }
})
