import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'
import { configDefaults, defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    // e2e/ es de Playwright, no de Vitest
    exclude: [...configDefaults.exclude, 'e2e/**'],
    environment: 'jsdom',
    // jsdom se crea una vez por worker y no por archivo (mantiene el aislamiento entre archivos): la
    // suite pasa de ~9 s a ~5 s. Si algún día la memoria crece, volver a 'forks' (el valor por defecto)
    pool: 'vmThreads',
    setupFiles: ['./src/testing/setup.ts'],
    // findBy espera hasta 5 s (testing/setup.ts); el test necesita margen por encima de eso para
    // la primera carga de la ficha (Recharts y sus bloques) cuando toda la suite corre en paralelo
    testTimeout: 15000,
  },
})
