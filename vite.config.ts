import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  // relative asset URLs: the build works from a domain root or a sub-path (e.g. GitHub Pages /AsiaMotors/)
  base: './',
  plugins: [react(), tailwindcss()],
  // the CGI studio in tools/ is a separate dev-only page and is never bundled
  build: { rollupOptions: { input: 'index.html' } },
})
