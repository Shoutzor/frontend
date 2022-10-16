import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import svgLoader from 'vite-svg-loader'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), svgLoader()],
  resolve: {
    alias: {
      '@components': path.resolve(__dirname + '/src/components'),
      '@js': path.resolve(__dirname + '/src/js'),
      '@models': path.resolve(__dirname + '/src/js/models'),
      '@scss': path.resolve(__dirname + '/src/scss'),
      '@static': path.resolve(__dirname + '/src/assets'),
      '@graphql': path.resolve(__dirname + '/src/js/graphql'),
      '~bootstrap': path.resolve(__dirname, 'node_modules/bootstrap'),
      '~vue3-perfect-scrollbar': path.resolve(__dirname, 'node_modules/vue3-perfect-scrollbar'),
      '~vue-slider-component': path.resolve(__dirname, 'node_modules/vue-slider-component'),
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "./src/assets/scss/_theme.scss";`
      }
    }
  }
})
