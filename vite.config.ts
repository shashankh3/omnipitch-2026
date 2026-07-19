/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  test: {
    environment: 'jsdom',
    // @ts-ignore
    environmentMatchGlobs: [
      ['src/services/**', 'node'],
      ['src/store/**', 'node'],
      ['tests/unit/**', 'node'],
      ['src/composables/!(useHealthStatus|useStadiumScene).test.ts', 'node']
    ],
    // @ts-ignore
    isolate: false,
    coverage: {
      provider: 'v8',
      include: [
        'src/services/**',
        'src/store/**',
        'src/data/**',
        'src/composables/**',
        'src/components/**'
      ],
      exclude: [
        'src/**/*.test.ts',
        'src/main.ts',
        'src/router/**',
        '**/MainLiveChart.vue',
        '**/MetricChart.vue',
        '**/FanMap.vue',
        '**/useStadiumScene.ts',
        '**/useStadiumFootball.ts'
      ],
      thresholds: {
        lines: 90,
        branches: 85,
        functions: 90,
        statements: 90
      },
      reporter: ['text', 'lcov', 'html']
    }
  },
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'OmniPitch 2026',
        short_name: 'OmniPitch',
        description: 'FIFA World Cup 2026 Stadium Operations',
        theme_color: '#0f172a',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        // Offline-first caching strategies
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    }),
    visualizer({ open: false, filename: 'dist/stats.html', gzipSize: true })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      }
    }
  },
  build: {
    // three-vendor and charts-vendor exceed 500 kB but are lazy-loaded per route,
    // never on the critical path (login loads ~125 kB of JS)
    chunkSizeWarningLimit: 1300,
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules')) {
            if (id.includes('three')) return 'three-vendor';
            if (id.includes('apexcharts')) return 'charts-vendor';
            if (id.includes('@supabase')) return 'supabase-vendor';
            if (id.includes('@google/genai')) return 'ai-vendor';
            if (id.includes('vue') || id.includes('pinia')) return 'vue-vendor';
          }
        }
      }
    }
  }
});
