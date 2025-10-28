import { defineEventHandler, readBody, setCookie } from 'h3'

export default defineEventHandler(async (event) => {
  const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null
  const config = useRuntimeConfig(event)
  const body = await readBody<{ username: string; password: string }>(event)
  const username = body?.username
  const password = body?.password
  if (!username || !password) {
    throw createError({ statusCode: 400, statusMessage: 'Требуется имя пользователя и пароль' })
  }

  try {
    const res = await $fetch<{ token: string }>(`${config.public.apiBase}/login`, {
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
  } catch (e) {
    const statusCode = (() => {
      if (isRecord(e) && isRecord(e.response)) {
        const st = e.response.status
        if (typeof st === 'number') return st
      }
      if (isRecord(e) && typeof e.statusCode === 'number') return e.statusCode
      return 401
    })()
    const message = (() => {
      if (isRecord(e) && isRecord(e.response) && isRecord(e.response._data)) {
        const msg = e.response._data.message
        if (typeof msg === 'string') return msg
      }
      return 'Неверный логин или пароль. Проверьте введенные данные и попробуйте снова'
    })()
    throw createError({ statusCode, statusMessage: message })
  }
})
