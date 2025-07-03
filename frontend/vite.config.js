import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      // Optional: your import aliases here
    },
  },
  build: {
    outDir: 'dist', // ✅ default for Vite, but explicit here
  },
})

