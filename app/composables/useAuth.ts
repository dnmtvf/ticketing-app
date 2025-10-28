type LoginPayload = { username: string; password: string }
type RegisterPayload = { username: string; password: string; passwordConfirmation: string }

export const useAuth = () => {
  const { $api } = useNuxtApp()
  const loggedIn = useState<boolean>('auth:loggedIn', () => false)
  const username = useState<string | null>('auth:username', () => null)
  const loading = useState<boolean>('auth:loading', () => false)
  const error = useState<string | null>('auth:error', () => null)

  const login = async (payload: LoginPayload) => {
    loading.value = true
    error.value = null
    try {
      await $fetch('/api/auth/login', { method: 'POST', body: { username: payload.username, password: payload.password } })
      loggedIn.value = true
      username.value = payload.username
      return true
    } catch (e) {
      error.value = 'Неверный логин или пароль. Проверьте введенные данные и попробуйте снова'
      return false
    } finally {
      loading.value = false
    }
  }

  const register = async (payload: RegisterPayload) => {
    loading.value = true
    error.value = null
    try {
      await $fetch('/api/auth/register', { method: 'POST', body: { username: payload.username, password: payload.password } })
      loggedIn.value = true
      username.value = payload.username
      return true
    } catch (e) {
      error.value = 'Ошибка регистрации'
      return false
    } finally {
      loading.value = false
    }
  }

  const logout = async () => {
    loading.value = true
    try {
      try { await $fetch('/api/auth/logout', { method: 'POST' }) } catch {}
    } finally {
      loggedIn.value = false
      username.value = null
      loading.value = false
    }
  }

  // Verify session using a cheap authenticated call
  const refresh = async () => {
    try {
      const res = await $fetch<{ loggedIn: boolean }>('/api/auth/session')
      loggedIn.value = Boolean(res?.loggedIn)
      return true
    } catch {
      loggedIn.value = false
      return false
    }
  }

  return { loggedIn, username, loading, error, login, register, logout, refresh }
}
