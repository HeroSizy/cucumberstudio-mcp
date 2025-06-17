import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: 'node',
    globals: true,
    restoreMocks: true,
    clearMocks: true,
    setupFiles: ['./test/setup/vitest.setup.ts'],
    include: ['test/**/*.test.ts'],
    exclude: ['node_modules', 'build', 'dist'],
    reporters: ['default'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/*.test.ts',
        'src/**/*.spec.ts',
        'src/**/index.ts',
        'node_modules/',
        'build/',
        'dist/',
        'test/',
        '**/*.test.ts',
        '**/*.spec.ts',
        '**/*.d.ts',
        'vitest.config.ts',
        'eslint.config.js',
        '.prettierrc'
      ],
      thresholds: {
        global: {
          branches: 85,
          functions: 85,
          lines: 85,
          statements: 85
        }
      }
    }
  }
})