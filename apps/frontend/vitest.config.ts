import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config.ts';

export default mergeConfig(
  viteConfig,
  defineConfig({
    define: {
      'import.meta.env.VITE_API_BASE_URL': JSON.stringify('http://localhost:3333'),
    },
    test: {
      globals: true,
      environment: 'happy-dom',
      setupFiles: ['./src/test/setup.ts'],
      include: ['src/**/*.test.ts'],
      coverage: {
        provider: 'v8',
        enabled: true,
        reporter: ['text', 'lcov'],
        reportsDirectory: './coverage/frontend',
        thresholds: {
          lines: 80,
          functions: 80,
        },
        include: ['src/**/*.{ts,vue}'],
        exclude: ['src/**/*.test.ts', 'src/test/**'],
      },
    },
  })
);
