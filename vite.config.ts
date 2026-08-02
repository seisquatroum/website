// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

const githubPages = process.env.GITHUB_PAGES === "true";
const base = "/";

export default defineConfig({
  vite: {
    base,
  },
  // Nitro targets Cloudflare by default (Lovable). Disable it for static GitHub Pages builds
  // so TanStack Start can prerender an SPA shell under dist/client.
  nitro: githubPages ? false : undefined,
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    server: { entry: "server" },
    ...(githubPages
      ? {
          spa: {
            enabled: true,
            prerender: {
              // GitHub Pages serves index.html for `/` and 404.html for unknown routes.
              outputPath: "/index.html",
            },
          },
        }
      : {}),
  },
});
