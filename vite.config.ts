import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  // Disable Nitro server for SPA-only build (no SSR/server functions)
  nitro: false,
  tanstackStart: {
    // Enable TanStack Start SPA mode with prerendering
    // This generates a _shell.html that the app boots from client-side
    // See: https://tanstack.com/start/latest/docs/framework/react/guide/spa-mode
    spa: {
      enabled: true,
      maskPath: '/',
      prerender: {
        enabled: true,
        outputPath: '/_shell.html',
        crawlLinks: false,
        retryCount: 0,
      },
    },
  },
  vite: {
    // Use relative paths for Capacitor WebView (doesn't support absolute /assets)
    base: './',
    resolve: {
      // Use native Vite tsconfigPaths resolution (replaces vite-tsconfig-paths plugin)
      tsconfigPaths: true,
    },
    build: {
      // FIX #36: Production minification enabled by default (Vite optimizes for production)
      // Assets will be minified, tree-shaken, and optimized automatically
      // Ensure we only build client-side output
      ssrManifest: false,
      // Disable code-splitting for single bundle output
      rollupOptions: {
        output: {
          // Single bundle - no code-splitting
          manualChunks: undefined,
        },
      },
    },
  },
});

