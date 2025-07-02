import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  const config = {
    plugins: [react()],
    server: {
      port: 5173,
      host: true,
    },
    define: {
      global: 'globalThis',
    }
  }

  // Configuración para HTTPS local
  if (mode === 'production-sim' || command === 'serve') {
    const certPath = path.resolve(__dirname, '../../ssl/localhost.pem')
    const keyPath = path.resolve(__dirname, '../../ssl/localhost-key.pem')
    
    if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
      config.server.https = {
        key: fs.readFileSync(keyPath),
        cert: fs.readFileSync(certPath),
      }
    }
  }

  return config
})
