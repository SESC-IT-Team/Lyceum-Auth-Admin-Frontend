import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import path from "path"
import tailwindcss from "@tailwindcss/vite"


const allowedHosts = [
  process.env.VITE_DOMAIN,
  process.env.VITE_AUTH_DOMAIN,
].filter((host): host is string => Boolean(host))

export default defineConfig({
  //base: '/auth-admin/',
  server: {
    host: '0.0.0.0',
    allowedHosts,
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true
      }
    }
  },
  preview: {
    host: '0.0.0.0',
    port: 4000,
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
