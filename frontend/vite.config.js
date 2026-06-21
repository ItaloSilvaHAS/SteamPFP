import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    // Permite que o servidor local escute em todas as interfaces de rede (essencial para o preview do Replit funcionar)
    host: true,
    port: 5173,
    strictPort: true, // Evita que mude de porta sozinho caso a 5173 esteja ocupada por um processo fantasma
  }
})