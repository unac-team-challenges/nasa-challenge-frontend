/**
 * Cliente de la API del backend (Rust + Axum), con tipos generados desde su openapi.json:
 *   pnpm gen   →  src/api/schema.d.ts
 * La URL sale de VITE_API_URL (ver .env.example). Sin URL, el frontend usa directo la copia local.
 * VITE_FUENTE_DATOS=local la fuerza aunque haya URL; vacío = API con la copia local de respaldo.
 */
import createClient from 'openapi-fetch'
import type { paths } from '@/api/schema'

export const API_URL =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ?? ''

/** Si la API tarda más que esto, se usa la copia local (la demo no puede quedarse esperando). */
const ESPERA_MS = 4000

export const api = createClient<paths>({
  baseUrl: API_URL,
  fetch: (req) => fetch(req, { signal: AbortSignal.timeout(ESPERA_MS) }),
})

export const hayApi = API_URL !== '' && import.meta.env.VITE_FUENTE_DATOS !== 'local'
