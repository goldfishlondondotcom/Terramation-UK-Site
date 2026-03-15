// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import netlify from '@astrojs/netlify';

// https://astro.build/config
export default defineConfig({
  site: "https://terramation.uk",
  // Trailing slash always — matches original WordPress URLs (important for SEO / no redirect loops)
  trailingSlash: "always",
  // Static by default; server routes use `export const prerender = false`
  output: "static",
  adapter: netlify(),
  integrations: [
    sitemap(),
  ],
});
