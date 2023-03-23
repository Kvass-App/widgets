import { fileURLToPath } from 'url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue({ customElement: true })],
  build: {
    rollupOptions: {
      output: {
        manualChunks: false,
        entryFileNames: `[name].js`,
        chunkFileNames: `[name].js`,
        assetFileNames: `[name].[ext]`,
      },
      input: {
        contact: fileURLToPath(
          new URL('./src/contact/main.js', import.meta.url),
        ),
        'img-comparison-slider': fileURLToPath(
          new URL('./src/img-comparison-slider/main.js', import.meta.url),
        'project-portal': fileURLToPath(
          new URL('./src/project-portal/main.js'),
          import.meta.url,
        ),
      },
    },
  },
  server: {
    port: 3001,
  },
})
