import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const repoBase = process.env.VITE_BASE_PATH ?? '/hear-me-read-me/'

export default defineConfig({
  base: repoBase,
  plugins: [react(), tailwindcss()],
})
