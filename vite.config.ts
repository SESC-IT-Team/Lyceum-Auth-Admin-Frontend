import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import path from "path"
import tailwindcss from "@tailwindcss/vite"


const allowedHosts = [
  process.env.DOMAIN,
  process.env.AUTH_DOMAIN,
].filter((host): host is string => Boolean(host))

export default defineConfig({
  base: '/auth-admin/',
  server: {
    host: '0.0.0.0',
    allowedHosts,
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
    strictPort: true,
    allowedHosts,
  },
  plugins: [
    react(),
    tailwindcss(),
    babel({ presets: [reactCompilerPreset()] })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
