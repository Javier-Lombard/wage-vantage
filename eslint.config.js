// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import boundaries from 'eslint-plugin-boundaries';
import eslintConfigPrettier from 'eslint-config-prettier/flat';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([globalIgnores(['dist']), {
  files: ['**/*.{ts,tsx}'],
  extends: [
    js.configs.recommended,
    tseslint.configs.recommendedTypeChecked,
    reactHooks.configs.flat.recommended,
    reactRefresh.configs.vite,
  ],
  languageOptions: {
    globals: globals.browser,
    parserOptions: {
      projectService: true,
      tsconfigRootDir: import.meta.dirname,
    },
  },
}, {
  // ── Arquitectura feature-based: hace cumplir los límites de importación de docs/architecture.md §1–§2 ──
  files: ['src/**/*.{ts,tsx}'],
  plugins: { boundaries },
  settings: {
    // boundaries usa el sistema de resolvers de eslint-plugin-import para mapear cada import
    // a un archivo real. Sin esto, el alias '@/' no se resuelve a 'src/' y las dependencias
    // quedan sin clasificar → las reglas de límites no se aplicarían (falso negativo).
    'import/resolver': {
      typescript: { project: './tsconfig.app.json' },
    },
    'boundaries/include': ['src/**/*'],
    // Las stories son tooling de desarrollo (Storybook), no código de producción —
    // quedan fuera del alcance de los límites arquitectónicos.
    'boundaries/ignore': ['**/*.stories.@(ts|tsx)'],
    // Cada archivo recibe solo el tipo del PRIMER descriptor que coincide (no acumula).
    'boundaries/elements-single-type': true,
    // Los element descriptors clasifican por CARPETA (capturan segmentos de ruta).
    'boundaries/elements': [
      { type: 'app', pattern: 'src/app/**' },
      { type: 'pages', pattern: 'src/pages/**' },
      // 'capture' extrae el nombre de la feature (primer segmento tras features/)
      // para poder distinguir imports dentro de la misma feature de los que cruzan a otra.
      {
        type: 'features',
        pattern: 'src/features/*/**',
        capture: ['feature'],
      },
      { type: 'shared', pattern: 'src/shared/**' },
    ],
    // 'main' son archivos sueltos en la raíz de src/ (entry point + App + estilos).
    // Los file descriptors clasifican archivos individuales, no carpetas — por eso
    // 'main' va aquí como categoría de fichero y no como element type.
    'boundaries/files': [
      {
        category: 'main',
        pattern: ['src/main.tsx', 'src/App.tsx', 'src/index.css'],
      },
    ],
  },
  rules: {
    'boundaries/dependencies': [
      'error',
      {
        // Por defecto se prohíbe toda dependencia; solo se permite lo listado explícitamente.
        default: 'disallow',
        policies: [
          // main → app, shared (elementos) y main (App.tsx / index.css, que el entry importa).
          {
            from: { file: { categories: 'main' } },
            allow: [
              { to: { element: { types: { anyOf: ['app', 'shared'] } } } },
              { to: { file: { categories: 'main' } } },
            ],
          },
          // app → features, shared, pages (routes.tsx ensambla las páginas del router).
          {
            from: { element: { types: 'app' } },
            allow: { to: { element: { types: { anyOf: ['features', 'shared', 'pages'] } } } },
          },
          // pages → features, shared, app.
          {
            from: { element: { types: 'pages' } },
            allow: { to: { element: { types: { anyOf: ['features', 'shared', 'app'] } } } },
          },
          // features → shared.
          {
            from: { element: { types: 'features' } },
            allow: { to: { element: { types: 'shared' } } },
          },
          // features → la MISMA feature: sus propias entrañas (cualquier archivo interno).
          // El capture 'feature' del destino debe coincidir con el del origen.
          {
            from: { element: { types: 'features' } },
            allow: {
              to: {
                element: { types: 'features', captured: { feature: '{{from.feature}}' } },
              },
            },
          },
          // features → OTRA feature, pero SOLO a través de su barrel público (index.ts).
          // fileInternalPath casa la ruta del archivo destino: se exige que sea el index
          // en la raíz de una feature; importar de sus entrañas (components/, hooks/, api/…)
          // no casa este patrón y queda prohibido por defecto.
          {
            from: { element: { types: 'features' } },
            allow: {
              to: {
                element: {
                  types: 'features',
                  fileInternalPath: 'src/features/*/index.{ts,tsx}',
                },
              },
            },
          },
          // shared → shared (nada de features, app ni pages).
          {
            from: { element: { types: 'shared' } },
            allow: { to: { element: { types: 'shared' } } },
          },
        ],
      },
    ],
  },
}, {
  files: ['.claude/hooks/*.js'],
  extends: [js.configs.recommended],
  languageOptions: {
    globals: globals.node,
  },
}, // Must stay last: disables stylistic rules that would conflict with Prettier formatting.
eslintConfigPrettier, ...storybook.configs["flat/recommended"]]);
