// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://motodest.com',
  trailingSlash: 'always',
  build: { format: 'directory', inlineStylesheets: 'auto' },
  compressHTML: true,
  prefetch: { prefetchAll: true, defaultStrategy: 'hover' },
  image: { responsiveStyles: true, layout: 'constrained' },
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/gracias/'),
      i18n: undefined,
    }),
  ],
});
