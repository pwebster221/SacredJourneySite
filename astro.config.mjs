// @ts-check
import { defineConfig } from 'astro/config';

import sentry from '@sentry/astro';
import spotlightjs from '@spotlightjs/astro';

// https://astro.build/config
export default defineConfig({
  // Enable SSR for API interactions
  output: 'server',

  // Site configuration
  site: 'https://pathsofreverence.dubtown.design',

  // Development server
  server: {
    port: 4321,
    host: true, // Allow external access for Tailscale
  },

  // Vite configuration
  vite: {
    define: {
      'import.meta.env.PUBLIC_API_BASE': JSON.stringify(
        process.env.PUBLIC_API_BASE || 'https://neo4jmiddleware.robin-alligator.ts.net'
      ),
    },
  },

  integrations: [sentry(), spotlightjs()],
});