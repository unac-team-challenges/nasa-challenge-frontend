import type { EscenaPeru } from '@/features/mapa/escena/escena'

/**
 * Escena viva (una sola por página): la usan los botones de girar y recentrar del explorador.
 * Vive aparte de escena.ts para que el explorador no arrastre three.js al bundle (el 2D no lo usa).
 */
export const escenaActiva: { current: EscenaPeru | null } = { current: null }
