import { z } from 'zod'

const bodySchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1)
})

export default defineEventHandler(async (event) => {
  const { username, password } = await readValidatedBody(event, bodySchema.parse)

  try {
    // Use existing API to validate credentials (note: backend uses /login not /auth/login)
    const apiResponse = await $fetch('/login', {
      baseURL: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:3022',
      method: 'POST',
      body: { username, password }
    })

    // Set the user session in the cookie using nuxt-auth-utils
    await setUserSession(event, {
      user: {
        username,
        // Store the token for future API calls
        token: apiResponse.token
      }
    })

    return { success: true }
  } catch (error) {
    console.error('Login API error:', error)
    // Get more specific error message if available
    const errorMessage = error?.data?.message || error?.message || 'Bad credentials'
    
    throw createError({
      statusCode: error?.statusCode || 401,
      message: errorMessage
    })
  }
})
