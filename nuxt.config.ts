// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  devtools: { enabled: true },

  modules: ['@nuxtjs/tailwindcss', '@pinia/nuxt'],

  css: ['~/assets/css/main.css'],

  app: {
    head: {
      title: 'Attendance Registrar',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content: 'Mark attendees present or absent. Responses sync to Google Sheets.'
        },
        // Open Graph
        { property: 'og:title', content: 'Attendance Registrar' },
        { property: 'og:type', content: 'website' },
        {
          property: 'og:description',
          content: 'Mark attendees present or absent. Responses sync to Google Sheets.'
        }
      ]
    }
  },

  runtimeConfig: {
    // Set via NUXT_GOOGLE_SCRIPT_URL env var. The Apps Script Web App URL.
    googleScriptUrl: '',
    // Optional shared secret checked by the Apps Script.
    googleScriptSecret: ''
  }
})
