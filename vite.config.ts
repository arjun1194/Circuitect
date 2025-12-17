import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/circuitect/',
  plugins: [react()],
  server: {
    port: 8888,
    allowedHosts: ["f81e314afba9.ngrok-free.app", "localhost:8888"],
  },
})
