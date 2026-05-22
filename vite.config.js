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
    strictPort: true,
    allowedHosts: ['sesc-it-team.ru', 'auth.sesc-it-team.ru'],
  },
})