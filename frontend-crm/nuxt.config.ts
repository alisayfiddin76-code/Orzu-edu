// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',

  future: {
    compatibilityVersion: 4,
  },

  experimental: {
    appManifest: false,
  },

  app: {
    head: {
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: 'anonymous' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap' },
      ],
    },
  },

  dir: {
    pages: 'pages',
    layouts: 'layouts',
  },

  modules: [
    '@pinia/nuxt',
    '@nuxtjs/tailwindcss',
    '@nuxt/icon',
  ],

  tailwindcss: {
    exposeConfig: true,
    viewer: true,
  },

  pinia: {
    storesDirs: ['./stores/**'],
  },

  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '',
        },
      },
    },
  },

  runtimeConfig: {
    public: {
      apiUrl: process.env.NUXT_PUBLIC_API_URL || '',
    },
  },

  devServer: {
    host: '0.0.0.0',
  },

  routeRules: {
    '/api/**': { proxy: `${process.env.API_PROXY_TARGET || 'https://orzu-edu.onrender.com'}/api/**` },
    '/uploads/**': { proxy: `${process.env.API_PROXY_TARGET || 'https://orzu-edu.onrender.com'}/uploads/**` },
  },

  icon: {
    clientBundle: {
      scan: true,
      icons: [
        // Navigation & UI
        'lucide:search', 'lucide:x', 'lucide:plus', 'lucide:loader-2',
        'lucide:settings', 'lucide:arrow-left', 'lucide:arrow-right',
        'lucide:chevron-down', 'lucide:chevron-up', 'lucide:chevron-left', 'lucide:chevron-right',
        // User
        'lucide:user', 'lucide:user-plus', 'lucide:user-plus-2', 'lucide:users',
        // Status
        'lucide:check-circle', 'lucide:alert-circle', 'lucide:info', 'lucide:star',
        'lucide:check', 'lucide:save',
        // Finance
        'lucide:wallet', 'lucide:banknote', 'lucide:bar-chart-3', 'lucide:pie-chart',
        'lucide:target', 'lucide:magnet',
        // Communication
        'lucide:phone', 'lucide:phone-call', 'lucide:mail', 'lucide:at-sign',
        'lucide:share-2', 'lucide:instagram', 'lucide:send', 'lucide:inbox', 'lucide:bell',
        // Location
        'lucide:map-pin', 'lucide:building-2', 'lucide:door-open',
        // Misc
        'lucide:clock', 'lucide:calendar', 'lucide:calendar-days', 'lucide:calendar-clock',
        'lucide:upload-cloud', 'lucide:file', 'lucide:history',
        'lucide:edit-3', 'lucide:clipboard-check',
        'lucide:graduation-cap',
      ],
    },
  },
});
