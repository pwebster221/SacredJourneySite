// @ts-check
import { defineConfig } from 'astro/config';

import node from '@astrojs/node';
import sentry from '@sentry/astro';
import spotlightjs from '@spotlightjs/astro';

// https://astro.build/config
export default defineConfig({
  // Enable SSR for API interactions
  output: 'server',
  adapter: node({ mode: 'standalone' }),

  // Site configuration
  site: 'https://practice.dubtown-server.us',

  // Development server
  server: {
    port: 4321,
    host: true, // Allow external access for Tailscale
  },

  // Vite configuration
  vite: {
    define: {
      'import.meta.env.PUBLIC_API_BASE': JSON.stringify(
        process.env.PUBLIC_API_BASE || 'https://repository.sacredjourney.io'
      ),
    },
    server: {
      allowedHosts: ['practice.dubtown-server.us'],
    },
  },

  integrations: [sentry(), spotlightjs()],
});
