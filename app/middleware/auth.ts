export default defineNuxtRouteMiddleware(async (to) => {
  const { loggedIn, refresh } = useAuth()

  if (import.meta.client) {
    if (!loggedIn.value) {
      await refresh()
    }
  }

  if (!loggedIn.value) {
    return navigateTo({ path: '/login', query: { redirect: to.fullPath } })
  }
})
