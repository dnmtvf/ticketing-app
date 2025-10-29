import { defineEventHandler, getCookie, getQuery, readBody, getRequestURL } from 'h3'

export default defineEventHandler(async (event) => {
  const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null
  const config = useRuntimeConfig(event)
  
  // Get token from nuxt-auth-utils session
  const session = await getUserSession(event)
  const token = session?.user?.token || null
  
  const urlObj = getRequestURL(event)
  const pathname = urlObj.pathname.startsWith('/api/proxy') ? urlObj.pathname.slice('/api/proxy'.length) || '/' : urlObj.pathname
  const url = `${config.public.apiBase}${pathname}`

  const method = event.method as 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  const query = getQuery(event)
  const body = method === 'GET' ? undefined : await readBody(event)

  try {
    const result: unknown = await $fetch(url, {
      method,
      query,
      body,
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    })
    return result
  } catch (e) {
    const statusCode = (() => {
      if (isRecord(e) && isRecord(e.response)) {
        const st = e.response.status
        if (typeof st === 'number') return st
      }
      if (isRecord(e) && typeof e.statusCode === 'number') return e.statusCode
      return 500
    })()
    const message = (() => {
      if (isRecord(e)) {
        const msg = e.message
        if (typeof msg === 'string') return msg
        if (isRecord(e.response) && isRecord(e.response._data)) {
          const dm = e.response._data.message
          if (typeof dm === 'string') return dm
        }
      }
      return 'Proxy error'
    })()
    throw createError({ statusCode, statusMessage: message })
  }
})
