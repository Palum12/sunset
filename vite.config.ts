import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Default to a relative base so assets resolve both on GitHub Pages and custom domains.
const basePath = process.env.BASE_PATH ?? './';

export default defineConfig(() => ({
  plugins: [react()],
  base: basePath,
}));
