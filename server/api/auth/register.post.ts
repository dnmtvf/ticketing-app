import { defineEventHandler, readBody, setCookie } from 'h3'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const body = await readBody<{ username: string; password: string }>(event)
  const { username, password } = body || ({} as any)
  if (!username || !password) {
    throw createError({ statusCode: 400, statusMessage: 'Требуется имя пользователя и пароль' })
  }

  try {
    const res = await $fetch<{ token: string }>(`${config.public.apiBase}/register`, {
      method: 'POST',
      body: { username, password },
    })
    const token = res?.token
    if (!token) throw new Error('No token in response')

    setCookie(event, 'auth_token', token, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60,
    })
    return { ok: true }
  } catch (e: any) {
    const statusCode = e?.response?.status || e?.statusCode || 500
    const message = e?.response?._data?.message || 'Ошибка регистрации'
    throw createError({ statusCode, statusMessage: message, data: e?.response?._data })
  }
})
