import { defineConfig } from 'vitest/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  base: process.env['GITHUB_PAGES'] === 'true' ? '/Breathewise/' : '/',
  plugins: [(tailwindcss as () => unknown)() as never],
  server: { proxy: { '/api': 'http://localhost:3001' } },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['src/test/setup.ts'],
    include: ['src/test/**/*.test.{ts,tsx}'],
  },
});
