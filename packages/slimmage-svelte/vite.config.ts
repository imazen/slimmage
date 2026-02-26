import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      formats: ['es'],
      fileName: 'index',
    },
    minify: false,
    rollupOptions: {
      external: ['svelte', 'svelte/internal', /^svelte\//],
    },
  },
  plugins: [svelte()],
});
