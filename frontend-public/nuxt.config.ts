// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-04-03",

  // Nuxt 4 - app/ papkasini asosiy manba sifatida ishlatadi
  future: {
    compatibilityVersion: 4,
  },

  // Disable appManifest to prevent "#app-manifest" Vite errors in dev mode
  experimental: {
    appManifest: false,
  },

  app: {
    head: {
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: 'anonymous' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap' }
      ]
    }
  },


  // Modules
  modules: [
    "@pinia/nuxt",
    "@nuxtjs/tailwindcss",
    "@nuxt/icon"
  ],

  // Tailwind CSS
  tailwindcss: {
    exposeConfig: true,
    viewer: false,
    cssPath: '~/assets/css/tailwind.css',
  },

  // Pinia
  pinia: {
    storesDirs: ["./app/stores/**"],
  },

  // Runtime config
  runtimeConfig: {
    public: {
      apiUrl: process.env.NUXT_PUBLIC_API_URL || ''
    }
  },

  // Enable network access (WiFi)
  devServer: {
    host: '0.0.0.0'
  },

  // Proxy API requests to backend
  routeRules: {
    '/api/v1/**': { proxy: `${process.env.API_PROXY_TARGET || 'http://127.0.0.1:5001'}/api/v1/**` },
    '/uploads/**': { proxy: `${process.env.API_PROXY_TARGET || 'http://127.0.0.1:5001'}/uploads/**` }
  }
})
