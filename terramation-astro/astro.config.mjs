// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import netlify from '@astrojs/netlify';

// https://astro.build/config
const isBuild = process.argv.includes('build');

export default defineConfig({
  site: "https://terramation.uk",
  // Trailing slash always — matches original WordPress URLs (important for SEO / no redirect loops)
  trailingSlash: "always",
  // Static by default; server routes use `export const prerender = false`
  output: "static",
  // The Netlify adapter is needed for production builds, but enabling it in local
  // dev causes the shared stylesheet route to 404 for some pages.
  adapter: isBuild ? netlify() : undefined,
  integrations: [
    sitemap(),
  ],
});
