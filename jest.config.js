// Jest exige export default en su archivo de configuración (excepción a la regla de named exports).
/** @type {import('jest').Config} */
const config = {
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  setupFiles: ['<rootDir>/jest/env.cjs'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testMatch: ['**/*.test.{ts,tsx}'],

  // Babel solo para Jest (inline, sin babel.config en raíz) para no interferir con Vite/Storybook.
  // transform-vite-meta-env sustituye import.meta.env, que Jest (CommonJS) no sabe interpretar.
  transform: {
    '^.+\.[jt]sx?$': [
      'babel-jest',
      {
        presets: [
          ['@babel/preset-env', { targets: { node: 'current' } }],
          ['@babel/preset-react', { runtime: 'automatic' }],
          '@babel/preset-typescript',
        ],
        plugins: ['babel-plugin-transform-vite-meta-env'],
      },
    ],
  },

  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\.(png|jpe?g|gif|webp|avif|svg|ico|woff2?|ttf|eot)$': '<rootDir>/jest/fileMock.cjs',
  },

  // Coverage: solo código de producción — fuera stories, tipos, barrels y el entry point.
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{ts,tsx}',
    '!src/**/index.ts',
    '!src/main.tsx',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'html', 'lcov'],

  clearMocks: true,
};

export default config;
