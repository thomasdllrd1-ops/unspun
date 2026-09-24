// @ts-check
import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';

// Static site: every page is plain HTML built ahead of time.
// Interactive pieces (map, sliders, quiz) are small Preact "islands".
export default defineConfig({
  site: 'https://unspun.netlify.app', // TODO: update once the Netlify URL is final
  output: 'static',
  trailingSlash: 'ignore',
  integrations: [preact()],
});
