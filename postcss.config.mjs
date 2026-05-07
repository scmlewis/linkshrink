// When running tests or in CI the native optional dependencies may fail to
// install on some runners which causes PostCSS plugin loading to throw.
// Skip PostCSS plugins in test/CI to avoid failing the test run.
const isTest = Boolean(process.env.VITEST || process.env.CI || process.env.NODE_ENV === 'test');

const config = {
  plugins: isTest
    ? {}
    : {
        '@tailwindcss/postcss': {},
      },
};

export default config;
