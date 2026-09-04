import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['packages/*/tests/**/*.test.ts', 'tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      exclude: ['**/dist/**', '**/node_modules/**', '**/tests/**', '**/*.config.ts', '**/types/**'],
    },
  },
});
