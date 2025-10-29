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
    const apiResponse = await $fetch('/register', {
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
    console.error('Registration API error:', error)
    // Get more specific error message if available
    const errorMessage = error?.data?.message || error?.message || 'Registration failed'
    
    throw createError({
      statusCode: error?.statusCode || 400,
      message: errorMessage
    })
  }
})
