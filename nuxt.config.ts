// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/eslint'],
  css: ['~/assets/css/tailwind.css'],
  postcss: {
    plugins: {
      '@tailwindcss/postcss': {}
    }
  },
  devServer: {
    port: 8282
  },
  runtimeConfig: {
    public: {
      // Default API base falls back to backend's default port; override via env if different
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:3022'
    }
  }
})
