import fs from 'fs';
import path from 'path';
import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// Domaine du site, lu au build : SITE_URL (https://hylst.fr par defaut). Il remplace %SITE_URL% dans index.html
// et dans les fichiers publics listes, pour que l'app change de domaine sans toucher au code.
const SITE_URL = (process.env.SITE_URL || 'https://hylst.fr').replace(/\/+$/, '');
const siteUrl = (fichiersPublics: string[]): Plugin => {
  let outDir = '';
  return {
    name: 'site-url',
    configResolved(config) {
      outDir = path.resolve(config.root, config.build.outDir);
    },
    transformIndexHtml: { order: 'pre', handler: (html) => html.replaceAll('%SITE_URL%', SITE_URL) },
    writeBundle: {
      order: 'pre',
      sequential: true,
      handler() {
        for (const f of fichiersPublics) {
          const p = path.join(outDir, f);
          fs.writeFileSync(p, fs.readFileSync(p, 'utf8').replaceAll('%SITE_URL%', SITE_URL));
        }
      },
    },
  };
};

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    base: '/asciiverse/',
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [
      siteUrl(['sitemap.xml', 'robots.txt']),
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
        manifest: {
          id: './',
          name: 'ASCIIverse Studio',
          short_name: 'ASCIIverse',
          description: 'The ultimate creative text suite. ASCII art, Kaomoji, and social tools.',
          lang: 'en',
          dir: 'ltr',
          theme_color: '#0f172a',
          background_color: '#0f172a',
          display: 'standalone',
          icons: [
            {
              src: 'pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png'
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable'
            }
          ]
        }
      })
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
