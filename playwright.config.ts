import { defineConfig, devices } from '@playwright/test'

// E2E_PORT permite usar otro puerto si el 4173 ya está ocupado
const puerto = process.env.E2E_PORT ?? '4173'

export default defineConfig({
  testDir: 'e2e',
  // WebGL por software (SwiftShader) es lento: el recorrido completo pasa de 1 min con el mapa 3D
  timeout: 150_000,
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
  projects: [
    // Todo lo que ya existía: Chromium de escritorio (los specs de celular fijan su propio viewport)
    { name: 'escritorio', testIgnore: /celular\.spec\.ts$/ },
    // Un celular de verdad (Pixel 7: 412 × 915, 2,6x, táctil, user agent móvil) con las comprobaciones
    // que el documento de UX pide para que no se rompa lo arreglado en celular
    { name: 'celular', testMatch: /celular\.spec\.ts$/, use: { ...devices['Pixel 7'] } },
  ],
  webServer: {
    command: `pnpm build && pnpm preview --port ${puerto} --strictPort`,
    url: `http://localhost:${puerto}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
