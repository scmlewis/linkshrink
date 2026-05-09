// Vitest loads PostCSS while running component tests, and optional native
// bindings can be missing in that context. Skip PostCSS plugins only for
// test runs; keep full Tailwind processing for builds so production styles
// are always generated.
const isTestRun = Boolean(
  process.env.VITEST ||
    process.env.NODE_ENV === 'test' ||
    process.env.npm_lifecycle_event?.startsWith('test')
);

const config = {
  plugins: isTestRun
    ? {}
    : {
        '@tailwindcss/postcss': {},
      },
};

export default config;
