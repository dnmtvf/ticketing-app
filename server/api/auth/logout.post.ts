export default defineEventHandler(async (event) => {
  try {
    // Try to call the existing logout API (note: backend uses /logout not /auth/logout)
    await $fetch('/logout', {
      baseURL: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:3022',
      method: 'POST'
    })
  } catch (error) {
    // Logout errors are non-critical, continue with local cleanup
  }

  // Clear the session using nuxt-auth-utils
  await clearUserSession(event)

  return { success: true }
})
