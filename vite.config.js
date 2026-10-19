import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'url'
import { defineConfig } from 'vite'
import Widgets from './widgets.config.js'
import Manifest from './plugins/manifest.js'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue({
      customElement: true,
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag.startsWith('visuado-'),
        },
      },
    }),
    Manifest(Widgets),
  ],
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
      input: Object.fromEntries(
        Object.entries(Widgets).map(([name, { path }]) => [
          name,
          fileURLToPath(new URL(path, import.meta.url)),
        ]),
      ),
    },
  },
  server: {
    port: 3010,
    cors: true,
  },
})
