import { treaty } from '@elysiajs/eden'
import type { App } from 'backend/src/index'

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? 'http://localhost:3333'

function getAuthToken(): string | null {
  return localStorage.getItem('infokes_token')
}

export const api = treaty<App>(API_BASE_URL, {
  headers: () => {
    const token = getAuthToken()
    return token ? { Authorization: `Bearer ${token}` } : {}
  }
})

export type ApiClient = typeof api
