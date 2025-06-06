import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,       // same as '0.0.0.0'
    port: 21567,       // your desired port

    proxy: {
        '/ws': {
            target: 'http://localhost:21568',
            ws: true,
            changeOrigin: true,
        }
    },
    allowedHosts: ["crosswordroyale.xyz"]
  }


})
