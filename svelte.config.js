import adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    adapter: adapter({ pages: 'build', assets: 'build', fallback: undefined, strict: true }),
    // GitHub Pages project site: https://rongzhichen.github.io/cs1710-steam-reach/
    paths: { base: '/cs1710-steam-reach' }
  }
};

export default config;
