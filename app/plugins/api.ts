export default defineNuxtPlugin(() => {
  const api = $fetch.create({
    baseURL: '/api/proxy',
    credentials: 'include',
  })
  return { provide: { api } }
})
