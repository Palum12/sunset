import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Use repo-relative base so bundled assets resolve on GitHub Pages under /sunset/.
const basePath = process.env.BASE_PATH ?? '/sunset/';

export default defineConfig(() => ({
  plugins: [react()],
  base: basePath,
}));
