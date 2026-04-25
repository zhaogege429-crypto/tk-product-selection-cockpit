import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1];
  const base =
    process.env.GITHUB_ACTIONS === 'true' && repoName ? `/${repoName}/` : '/';

  return {
    base,
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // Keep local HMR behavior unchanged while allowing GitHub Pages builds to use a repo base path.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
