// When running tests or in CI the native optional dependencies may fail to
// install on some runners which causes PostCSS plugin loading to throw.
// Try to dynamically load the Tailwind PostCSS plugin and fall back to an
// empty plugin set if loading fails. This is less coarse than skipping
// plugins entirely for tests and allows normal behavior in dev/prod.
const isTest = Boolean(process.env.VITEST || process.env.CI || process.env.NODE_ENV === 'test');

const config = { plugins: {} };

if (!isTest) {
  try {
    // Attempt to import the Tailwind PostCSS plugin. Use dynamic import so
    // we can catch failures caused by optional native bindings on some
    // CI environments and continue without the plugin.
    await import('@tailwindcss/postcss');
    config.plugins = {
      '@tailwindcss/postcss': {},
    };
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn(
      'Warning: failed to load @tailwindcss/postcss. Continuing without Tailwind PostCSS plugin.',
      err?.message || err,
    );
    config.plugins = {};
  }
}

export default config;
