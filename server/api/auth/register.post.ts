import { z } from 'zod'

const bodySchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
  passwordConfirmation: z.string().min(1)
})

export default defineEventHandler(async (event) => {
  const { username, password, passwordConfirmation } = await readValidatedBody(event, bodySchema.parse)

  if (password !== passwordConfirmation) {
    throw createError({
      statusCode: 400,
      message: 'Password confirmation does not match'
    })
  }

  try {
    // Use existing API to register user (note: backend uses /register not /auth/register)
    const apiResponse = await $fetch<{ token: string }>('/register', {
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
    console.error('Registration API error:', error)

    const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null

    // Get more specific error message if available
    const errorMessage = isRecord(error) && isRecord(error.data) && typeof error.data.message === 'string'
      ? error.data.message
      : isRecord(error) && typeof error.message === 'string'
      ? error.message
      : 'Registration failed'

    const statusCode = isRecord(error) && typeof error.statusCode === 'number' ? error.statusCode : 400

    throw createError({
      statusCode,
      message: errorMessage
    })
  }
})
