import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: 'product.mfe-server.test',
    port: 5175,
    strictPort: true,
    allowedHosts: ['product.mfe-server.test', 'auth.mfe-server.test', 'user.mfe-server.test'],
  }
})
