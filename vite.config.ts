import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  // Root in dev; served under /Circuitect/ on GitHub Pages (must match the
  // repo name exactly — Pages paths are case-sensitive).
  base: command === 'build' ? '/Circuitect/' : '/',
  plugins: [react()],
  server: {
    port: 8888,
    allowedHosts: ["f81e314afba9.ngrok-free.app", "localhost:8888"],
  },
}))
