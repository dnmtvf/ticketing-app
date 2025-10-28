export default defineNuxtRouteMiddleware(async (to) => {
  const { loggedIn, refresh } = useAuth()

  if (process.client) {
    // If state unknown, try to refresh session on guarded routes
    if (!loggedIn.value) {
      await refresh()
    }
  }

  if (!loggedIn.value) {
    return navigateTo({ path: '/login', query: { redirect: to.fullPath } })
  }
})
