import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import type { IncomingMessage } from 'http';
import path from 'path';
import {defineConfig} from 'vite';
import { analyzeProduct } from './src/server/analyze';

export default defineConfig(({mode}) => {
  const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1];
  const base =
    process.env.GITHUB_ACTIONS === 'true' && repoName ? `/${repoName}/` : '/';

  return {
    base,
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'local-openai-compatible-proxy',
        configureServer(server) {
          server.middlewares.use('/api/analyze', async (req, res, next) => {
            if (req.method !== 'POST') {
              next();
              return;
            }

            try {
              const body = await readJsonBody(req);
              const report = await analyzeProduct(body);
              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 200;
              res.end(JSON.stringify(report));
            } catch (error: any) {
              res.setHeader('Content-Type', 'application/json');
              res.statusCode = error.statusCode || 500;
              res.end(JSON.stringify({
                error: error.message || '服务端分析失败，请稍后重试。',
              }));
            }
          });
        },
      },
    ],
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

async function readJsonBody(req: IncomingMessage) {
  const chunks: Buffer[] = [];

  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }

  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}
