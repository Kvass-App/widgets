import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'url'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue({ customElement: true })],
  optimizeDeps: {
    include: ['@kvass/vue3-flatfinder'],
    esbuildOptions: {
      supported: {
        'top-level-await': true,
      }
    }
  },
  build: {
    target: 'esnext',
    rollupOptions: {
      output: {
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
        ),
        'project-portal': fileURLToPath(
          new URL('./src/project-portal/main.js', import.meta.url),
        ),
        vimeo: fileURLToPath(new URL('./src/vimeo/main.js', import.meta.url)),
        youtube: fileURLToPath(
          new URL('./src/youtube/main.js', import.meta.url),
        ),
        map: fileURLToPath(new URL('./src/map/main.js', import.meta.url)),
        flatfinder: fileURLToPath(
          new URL('./src/flatfinder/main.js', import.meta.url),
        ),
        'font-selector': fileURLToPath(
          new URL('./src/font-selector/main.js', import.meta.url),
        ),
      },
    },
  },
  server: {
    port: 3001,
  },
})
