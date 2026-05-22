import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: '/auth-admin/',
  plugins: [react(), tailwindcss()],
  server: {
    host: '0.0.0.0',
    allowedHosts: ['sesc-it-team.ru', 'auth.sesc-it-team.ru'],
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
    allowedHosts: ['sesc-it-team.ru', 'auth.sesc-it-team.ru'],
  },
})