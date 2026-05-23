import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['pwa-192.png', 'pwa-512.png', 'apple-touch-icon.png', 'assets/**/*'],
      manifest: {
        name: 'TB e-Tracker - Liberia National HMIS',
        short_name: 'TB e-Tracker',
        description: 'Liberia National Tuberculosis e-Tracker built on DHIS2. Real-time TB surveillance, patient tracking, and treatment outcome monitoring across all 15 counties.',
        theme_color: '#1e3a5f',
        background_color: '#0f172a',
        display: 'standalone',
        orientation: 'any',
        scope: '/',
        start_url: '/',
        lang: 'en',
        categories: ['health', 'medical', 'productivity'],
        icons: [
          {
            src: 'pwa-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable',
          },
          {
            src: 'pwa-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
        screenshots: [
          {
            src: 'assets/vid_intro.png',
            sizes: '1280x720',
            type: 'image/png',
            form_factor: 'wide',
            label: 'TB e-Tracker National Dashboard',
          },
          {
            src: 'assets/tb_exterior.png',
            sizes: '390x844',
            type: 'image/png',
            form_factor: 'narrow',
            label: 'TB e-Tracker on Mobile',
          },
        ],
      },
      workbox: {
        // Cache all app shell assets with cache-first strategy
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        // Network-first for navigation (always get latest page if online)
        navigateFallback: 'index.html',
        navigateFallbackDenylist: [/^\/_/, /\/[^/?]+\.[^/]+$/],
        runtimeCaching: [
          {
            // Cache Google Fonts
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Cache YouTube thumbnails
            urlPattern: /^https:\/\/i\.ytimg\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'youtube-thumb-cache',
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Network-first for API-like requests
            urlPattern: /^https:\/\/tb-tracker-demo-.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
})
