import { readdirSync } from 'node:fs'
import js from '@eslint/js'
import { defineConfig, globalIgnores } from 'eslint/config'
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript'
import { importX } from 'eslint-plugin-import-x'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import globals from 'globals'
import tseslint from 'typescript-eslint'

// Ver ARQUITECTURE.md: dirección de dependencias app -> features -> capas compartidas.
const compartidas = ['components', 'hooks', 'lib', 'utils', 'stores', 'api', 'data', 'i18n']
// Cada carpeta de src/features es una feature; las nuevas quedan protegidas solas.
const features = readdirSync(`${import.meta.dirname}/src/features`, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name)

const MSG_RELATIVOS = 'Usa el alias @/ en vez de imports relativos.'

export default defineConfig([
  globalIgnores(['dist', 'playwright-report', 'test-results']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: { globals: globals.browser },
  },
  // shadcn/ui exporta variantes (cva) junto al componente
  { files: ['src/components/ui/**'], rules: { 'react-refresh/only-export-components': 'off' } },
  // Imports siempre con alias @/, nunca relativos
  {
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        { patterns: [{ group: ['.', '..', './*', '../*'], message: MSG_RELATIVOS }] },
      ],
      // la regla nativa no revisa import() dinámico
      'no-restricted-syntax': [
        'error',
        { selector: 'ImportExpression[source.value=/^\\.{1,2}(\\/|$)/]', message: MSG_RELATIVOS },
      ],
    },
  },
  // Dirección de dependencias (src/testing y src/main.tsx quedan fuera: no tienen zona como target)
  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: { 'import-x': importX },
    settings: {
      'import-x/resolver-next': [
        createTypeScriptImportResolver({ project: `${import.meta.dirname}/tsconfig.app.json` }),
      ],
    },
    rules: {
      'import-x/no-restricted-paths': [
        'error',
        {
          // zonas relativas a la raíz del repo, no al cwd desde donde se lance eslint
          basePath: import.meta.dirname,
          zones: [
            // las capas compartidas no conocen features ni app
            ...compartidas.flatMap((c) => [
              { target: `./src/${c}`, from: './src/features' },
              { target: `./src/${c}`, from: './src/app' },
            ]),
            // las features no conocen app
            { target: './src/features', from: './src/app' },
            // una feature no importa de otra
            ...features.map((f) => ({
              target: `./src/features/${f}`,
              from: './src/features',
              except: [`./${f}`],
            })),
          ],
        },
      ],
    },
  },
])
