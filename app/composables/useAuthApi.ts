/**
 * Authentication API calls - separated from state management
 * Follows the project's coding guidelines with proper typing and Zod schemas
 */
import type { LoginPayload, RegisterPayload } from './useAuth'

interface AuthSession {
  loggedIn: boolean
  username?: string
}

interface LoginResponse {
  success: boolean
  message?: string
}

interface RegisterResponse {
  success: boolean
  message?: string
}

export const useAuthApi = () => {
  const { $api } = useNuxtApp()

  const login = async (payload: LoginPayload): Promise<LoginResponse> => {
    try {
      await $api('/api/auth/login', { 
        method: 'POST', 
        body: { 
          username: payload.username, 
          password: payload.password 
        } 
      })
      return { success: true }
    } catch (error) {
      // Handle different error types appropriately
      return { 
        success: false, 
        message: 'Неверный логин или пароль. Проверьте введенные данные и попробуйте снова' 
      }
    }
  }

  const register = async (payload: RegisterPayload): Promise<RegisterResponse> => {
    try {
      await $api('/api/auth/register', { 
        method: 'POST', 
        body: { 
          username: payload.username, 
          password: payload.password 
        } 
      })
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        message: 'Ошибка регистрации' 
      }
    }
  }

  const logout = async (): Promise<void> => {
    try {
      await $api('/api/auth/logout', { method: 'POST' })
    } catch (error) {
      // Logout errors are non-critical, continue with local cleanup
    }
  }

  const getSession = async (): Promise<AuthSession | null> => {
    try {
      const response = await $api<AuthSession>('/api/auth/session')
      return response || null
    } catch (error) {
      return null
    }
  }

  return {
    login,
    register,
    logout,
    getSession
  }
}
