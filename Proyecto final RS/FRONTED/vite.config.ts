import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Esto permite que el código encuentre tus componentes usando "@"
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Asegura que la carpeta de salida sea la que espera Vercel
    outDir: 'dist',
  },
});
