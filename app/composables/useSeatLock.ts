export type SeatLockResult = {
  lockId: string | null
  expiresAt: number | null // epoch ms
}

export const useSeatLock = (sessionId: string) => {
  const { $api } = useNuxtApp()
  const lockId = ref<string | null>(null)
  const expiresAt = ref<number | null>(null)
  const supported = ref<boolean | null>(null)

  const now = ref(Date.now())
  let timer: any
  onMounted(() => { timer = setInterval(() => (now.value = Date.now()), 1000) })
  onBeforeUnmount(async () => { clearInterval(timer); await release() })

  const remaining = computed(() => {
    if (!expiresAt.value) return null
    const sec = Math.max(0, Math.floor((expiresAt.value - now.value) / 1000))
    return sec
  })

  const parseLockResponse = (res: any): SeatLockResult => {
    if (!res) return { lockId: null, expiresAt: null }
    const id = res.lockId || res.id || null
    const exp = res.expiresAt || res.expires_at || null
    return { lockId: id, expiresAt: exp ? new Date(exp).getTime?.() || Number(exp) || null : null }
  }

  const tryEndpoints = async (seats: string[]) => {
    const bodies = [ { seats }, { data: { seats } } ]
    const paths = [
      `/movieSessions/${sessionId}/locks`,
      `/movieSessions/${sessionId}/lock`,
      `/movieSessions/${sessionId}/seats/lock`
    ]
    for (const path of paths) {
      for (const body of bodies) {
        try {
          const res = await $api(path, { method: 'POST', body })
          const parsed = parseLockResponse(res)
          if (parsed.lockId) {
            lockId.value = parsed.lockId
            expiresAt.value = parsed.expiresAt
            supported.value = true
            return true
          }
        } catch (e: any) {
          // ignore and try next endpoint
        }
      }
    }
    supported.value = false
    return false
  }

  const ensure = async (seats: string[]) => {
    if (!seats.length) { await release(); return false }
    if (supported.value === false) return false
    // If we already have a lock, attempt to refresh by re-locking with the new selection
    const ok = await tryEndpoints(seats)
    return ok
  }

  const release = async () => {
    if (!lockId.value) return
    const id = lockId.value
    lockId.value = null
    expiresAt.value = null
    // Best-effort release across possible endpoints
    const candidates: Array<{ path: string; method: 'DELETE' | 'POST'; body?: any }> = [
      { path: `/movieSessions/${sessionId}/locks/${id}`, method: 'DELETE' },
      { path: `/movieSessions/${sessionId}/locks/release`, method: 'POST', body: { lockId: id } },
      { path: `/movieSessions/${sessionId}/lock/release`, method: 'POST', body: { lockId: id } },
      { path: `/movieSessions/${sessionId}/lock`, method: 'DELETE', body: { lockId: id } }
    ]
    for (const c of candidates) {
      try {
        await $api(c.path, { method: c.method, body: c.body })
        break
      } catch {}
    }
  }

  return { lockId, expiresAt, remaining, supported, ensure, release }
}
