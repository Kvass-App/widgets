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
      },
    },
  },
  resolve: {
    extensions: ['.js', '.ts', '.json', '.vue'],
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
        'icon-selector': fileURLToPath(
          new URL('./src/icon-selector/main.js', import.meta.url),
        ),
        'location-selector': fileURLToPath(
          new URL('./src/location-selector/main.js', import.meta.url),
        ),
        'table-builder': fileURLToPath(
          new URL('./src/table-builder/main.js', import.meta.url),
        ),
        'chart-builder': fileURLToPath(
          new URL('./src/chart-builder/main.js', import.meta.url),
        ),
        'residential-expenses': fileURLToPath(
          new URL('./src/residential-expenses/main.js', import.meta.url),
        ),
        'loan-calculator': fileURLToPath(
          new URL('./src/loan-calculator/main.js', import.meta.url),
        ),
        knips: fileURLToPath(new URL('./src/knips/main.js', import.meta.url)),
        finn: fileURLToPath(new URL('./src/finn/main.js', import.meta.url)),
        directories: fileURLToPath(
          new URL('./src/directories/main.js', import.meta.url),
        ),
        nabolagsprofil: fileURLToPath(
          new URL('./src/nabolagsprofil/main.js', import.meta.url),
        ),
      },
    },
  },
  server: {
    port: 3010,
  },
})
