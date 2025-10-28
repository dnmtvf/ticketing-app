import { defineEventHandler, getCookie, getQuery, readBody } from 'h3'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const token = getCookie(event, 'auth_token')
  const pathParts = event.context.params?.path as string[] | undefined
  const pathname = '/' + (pathParts?.join('/') || '')
  const url = `${config.public.apiBase}${pathname}`

  const method = event.method as 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  const query = getQuery(event)
  const body = method === 'GET' ? undefined : await readBody(event)

  try {
    return await $fetch(url, {
      method,
      query,
      body,
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    })
  } catch (e: any) {
    const statusCode = e?.response?.status || e?.statusCode || 500
    const message = e?.response?._data?.message || e.message || 'Proxy error'
    throw createError({ statusCode, statusMessage: message, data: e?.response?._data })
  }
})
