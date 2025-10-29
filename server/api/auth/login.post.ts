import { z } from 'zod'

const bodySchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1)
})

export default defineEventHandler(async (event) => {
  const { username, password } = await readValidatedBody(event, bodySchema.parse)

  try {
    // Use existing API to validate credentials (note: backend uses /login not /auth/login)
    const apiResponse = await $fetch<{ token: string }>('/login', {
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
  } catch (error: unknown) {
    console.error('Login API error:', error)

    const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null

    // Get more specific error message if available
    const errorMessage = isRecord(error) && isRecord(error.data) && typeof error.data.message === 'string'
      ? error.data.message
      : isRecord(error) && typeof error.message === 'string'
      ? error.message
      : 'Bad credentials'

    const statusCode = isRecord(error) && typeof error.statusCode === 'number' ? error.statusCode : 401

    throw createError({
      statusCode,
      message: errorMessage
    })
  }
})
