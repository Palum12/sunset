import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Update `base` if you deploy to a different repository name or custom domain.
export default defineConfig(() => ({
  plugins: [react()],
  base: process.env.BASE_PATH || '/sunset/',
}));
