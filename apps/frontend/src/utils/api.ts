import { treaty } from '@elysiajs/eden'
import type { App } from 'backend/src/index'

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? 'http://localhost:3333'

export function getAuthToken(): string | null {
  return localStorage.getItem('infokes_token')
}

// @ts-expect-error: monorepo workspace resolution can load two Elysia type instances,
// but the runtime client works correctly with the single installed package.
export const api = treaty<App>(API_BASE_URL, {
  headers: () => {
    const token = getAuthToken()
    return token ? { Authorization: `Bearer ${token}` } : {}
  }
})
