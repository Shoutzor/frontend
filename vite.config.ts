import { Plugin, defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import svgLoader from 'vite-svg-loader'
import path from 'path'
import fs from 'fs';

// Replaces {{logo}} with the contents of the shoutzor logo SVG
const htmlInlineSvgLogoPlugin = () => {
  return {
    name: "html-inline-svg-transform",
    transformIndexHtml: (html) => {
      return html.replace("{{logo}}", fs.readFileSync('./src/assets/images/shoutzor-logo.svg', 'utf-8'));
    }
  } as Plugin;
};

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "shoutzor.local",
    port: 5173,
    strictPort: true,
    cors: false
  },
  plugins: [
    vue(), 
    svgLoader({
      // svgo removes the "viewBox" attribute of the shoutzor-logo SVG causing it to scale inproperly
      svgo: false
    }),
    htmlInlineSvgLogoPlugin()
  ],
  resolve: {
    alias: {
      '@components': path.resolve(__dirname + '/src/components'),
      '@js': path.resolve(__dirname + '/src/js'),
      '@models': path.resolve(__dirname + '/src/js/models'),
      '@scss': path.resolve(__dirname + '/src/scss'),
      '@static': path.resolve(__dirname + '/src/assets'),
      '@graphql': path.resolve(__dirname + '/src/js/graphql'),
      '~bootstrap': path.resolve(__dirname, 'node_modules/bootstrap'),
      '~perfect-scrollbar': path.resolve(__dirname, 'node_modules/perfect-scrollbar'),
      '~vue-slider-component': path.resolve(__dirname, 'node_modules/vue-slider-component'),
      '~static': path.resolve(__dirname + '/src/assets'),
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
