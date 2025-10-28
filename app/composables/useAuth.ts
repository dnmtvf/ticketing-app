export interface LoginPayload {
  username: string
  password: string
}

export interface RegisterPayload {
  username: string
  password: string
  passwordConfirmation: string
}

export const useAuth = () => {
  const loggedIn = useState<boolean>('auth:loggedIn', () => false)
  const username = useState<string | null>('auth:username', () => null)
  const loading = useState<boolean>('auth:loading', () => false)
  const error = useState<string | null>('auth:error', () => null)

  const authApi = useAuthApi()

  const login = async (payload: LoginPayload): Promise<boolean> => {
    loading.value = true
    error.value = null
    
    try {
      const result = await authApi.login(payload)
      if (result.success) {
        loggedIn.value = true
        username.value = payload.username
        return true
      } else {
        error.value = result.message || 'Ошибка входа'
        return false
      }
    } catch {
      error.value = 'Неверный логин или пароль. Проверьте введенные данные и попробуйте снова'
      return false
    } finally {
      loading.value = false
    }
  }

  const register = async (payload: RegisterPayload): Promise<boolean> => {
    loading.value = true
    error.value = null
    
    try {
      const result = await authApi.register(payload)
      if (result.success) {
        loggedIn.value = true
        username.value = payload.username
        return true
      } else {
        error.value = result.message || 'Ошибка регистрации'
        return false
      }
    } catch {
      error.value = 'Ошибка регистрации'
      return false
    } finally {
      loading.value = false
    }
  }

  const logout = async (): Promise<void> => {
    loading.value = true
    
    try {
      await authApi.logout()
    } finally {
      loggedIn.value = false
      username.value = null
      loading.value = false
    }
  }

  const refresh = async (): Promise<boolean> => {
    try {
      const session = await authApi.getSession()
      if (session) {
        loggedIn.value = Boolean(session.loggedIn)
        username.value = session.username || null
        return true
      }
      loggedIn.value = false
      return false
    } catch {
      loggedIn.value = false
      username.value = null
      return false
    }
  }

  return { 
    loggedIn, 
    username, 
    loading, 
    error, 
    login, 
    register, 
    logout, 
    refresh 
  }
}
