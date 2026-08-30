// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
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
    build: {
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

