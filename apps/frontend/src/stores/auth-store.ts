import { reactive, readonly } from 'vue'
import { api } from '@/utils/api'
import { extractApiErrorMessage } from '@/utils/api-error'

export interface User {
  id: string
  name: string
  username: string
  email: string
}

interface AuthState {
  token: string | null
  user: User | null
  isLoading: boolean
  error: string | null
}

const state = reactive<AuthState>({
  token: null,
  user: null,
  isLoading: false,
  error: null
})

const TOKEN_KEY = 'infokes_token'
const USER_KEY = 'infokes_user'

function setAuth(token: string, user: User): void {
  state.token = token
  state.user = user
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

function clearAuth(): void {
  state.token = null
  state.user = null
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  return 'An unexpected error occurred.'
}

export const authStore = {
  state: readonly(state),

  loadFromStorage(): void {
    const token = localStorage.getItem(TOKEN_KEY)
    const userJson = localStorage.getItem(USER_KEY)
    if (token && userJson) {
      try {
        const user = JSON.parse(userJson) as User
        state.token = token
        state.user = user
      } catch {
        clearAuth()
      }
    }
  },

  async login(identifier: string, password: string): Promise<boolean> {
    state.isLoading = true
    state.error = null
    try {
      const { data, error } = await api.api.auth.login.post({ identifier, password })
      if (error) {
        state.error = extractApiErrorMessage(error, 'Login failed.')
        return false
      }
      if (!data) {
        state.error = 'Login failed.'
        return false
      }
      setAuth(data.token, data.user)
      return true
    } catch (err) {
      state.error = getErrorMessage(err)
      return false
    } finally {
      state.isLoading = false
    }
  },

  async register(name: string, username: string, email: string, password: string): Promise<boolean> {
    state.isLoading = true
    state.error = null
    try {
      const { error } = await api.api.auth.register.post({ name, username, email, password })
      if (error) {
        state.error = extractApiErrorMessage(error, 'Registration failed.')
        return false
      }
      return true
    } catch (err) {
      state.error = getErrorMessage(err)
      return false
    } finally {
      state.isLoading = false
    }
  },

  logout(): void {
    clearAuth()
  },

  async updatePassword(oldPassword: string, newPassword: string): Promise<boolean> {
    state.isLoading = true
    state.error = null
    try {
      const { error } = await api.api.auth.password.put({ old_password: oldPassword, new_password: newPassword })
      if (error) {
        state.error = extractApiErrorMessage(error, 'Password update failed.')
        return false
      }
      return true
    } catch (err) {
      state.error = getErrorMessage(err)
      return false
    } finally {
      state.isLoading = false
    }
  },

  clearError(): void {
    state.error = null
  }
}
