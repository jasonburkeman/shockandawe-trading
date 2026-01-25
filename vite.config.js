import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Critical for Netlify deployment to work correctly
  server: {
    open: true, // Automatically opens the browser when you run 'npm run dev'
  }
})