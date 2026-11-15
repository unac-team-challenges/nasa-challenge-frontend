import { defineConfig } from '@playwright/test'

// E2E_PORT permite usar otro puerto si el 4173 ya está ocupado
const puerto = process.env.E2E_PORT ?? '4173'

export default defineConfig({
  testDir: 'e2e',
  // WebGL por software es lento: el recorrido completo tarda ~22 s y con carga pasaba los 30 s
  timeout: 60_000,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: `http://localhost:${puerto}`,
    trace: 'retain-on-failure',
    // WebGL por software, para que el mapa 3D también funcione en el CI
    launchOptions: {
      args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
    },
  },
  webServer: {
    command: `pnpm build && pnpm preview --port ${puerto} --strictPort`,
    url: `http://localhost:${puerto}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
