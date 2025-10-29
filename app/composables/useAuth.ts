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
  // Use the official nuxt-auth-utils composable
  const { loggedIn, user, session, fetch: refreshSession, clear: clearSession } = useUserSession()
  
  // Local loading and error states
  const loading = ref(false)
  const error = ref<string | null>(null)

  const login = async (payload: LoginPayload): Promise<boolean> => {
    loading.value = true
    error.value = null
    
    try {
      await $fetch('/api/auth/login', {
        method: 'POST',
        body: payload
      })

      // Refresh the session after successful login
      await refreshSession()
      return true
    } catch (err) {
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
      await $fetch('/api/auth/register', {
        method: 'POST',
        body: payload
      })

      // Refresh the session after successful registration
      await refreshSession()
      return true
    } catch (err) {
      error.value = 'Ошибка регистрации'
      return false
    } finally {
      loading.value = false
    }
  }

  const logout = async (): Promise<void> => {
    loading.value = true
    
    try {
      await $fetch('/api/auth/logout', {
        method: 'POST'
      })
    } finally {
      await clearSession()
      loading.value = false
    }
  }

  // Computed properties for compatibility with existing code
  const username = computed(() => user.value?.username || null)

  return { 
    loggedIn, 
    username, 
    loading, 
    error, 
    login, 
    register, 
    logout, 
    refresh: refreshSession 
  }
}
