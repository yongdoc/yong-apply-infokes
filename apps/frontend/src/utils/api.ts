import { treaty } from '@elysiajs/eden'
import type { App } from 'backend' // Imports the type directly from your backend folder

// Point this to your Elysia server port
export const api = treaty<App>('http://localhost:3000') as any