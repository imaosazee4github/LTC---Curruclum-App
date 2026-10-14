import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    tailwindcss(),

    VitePWA({
      registerType: 'prompt',

      // Enable PWA support during development
      devOptions: {
        enabled: true,
      },

      includeAssets: [
        'favicon.svg',
        'pwa-192.png',
        'pwa-512.png',
      ],

      manifest: {
        name: 'LTC Pioneer Portal & Student Tracking System',
        short_name: 'LTC Pioneer',
        description:
          'Light Training Center Pioneer learning, progress, and student support portal.',

        theme_color: '#0b2e59',
        background_color: '#f8fafc',

        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        lang: 'en',

        icons: [
          {
            src: '/pwa-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/pwa-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },

      workbox: {
        globPatterns: [
          '**/*.{js,css,html,svg,ico,png,woff2,webmanifest}',
        ],
      },
    }),
  ],
})