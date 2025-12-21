import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Use relative base so assets resolve correctly both locally and on GitHub Pages
// without depending on a fixed repository name.
const basePath = process.env.BASE_PATH ?? './';

export default defineConfig(() => ({
  plugins: [react()],
  base: basePath,
}));
