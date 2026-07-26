import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        invento: resolve(__dirname, 'projects/invento.html'),
        personal: resolve(__dirname, 'projects/personal-works.html'),
        seedex: resolve(__dirname, 'projects/seedex.html')
      }
    }
  }
});
