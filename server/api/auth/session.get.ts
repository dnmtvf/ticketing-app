export default defineEventHandler(async (event) => {
  // Get the current session from nuxt-auth-utils
  const session = await getUserSession(event)
  
  return {
    loggedIn: !!session.user,
    username: session.user?.username || null,
    hasToken: !!session.user?.token
  }
})
