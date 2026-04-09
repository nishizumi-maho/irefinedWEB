import { defineConfig } from "vite";
import { viteStaticCopy } from "vite-plugin-static-copy";
import packageJson from "./package.json" with { type: "json" };

const repoUrl = packageJson.repository;
const displayVersion = packageJson.displayVersion || `v${String(packageJson.version).split(".")[0]}`;
const repoSlug = repoUrl.replace("https://github.com/", "").replace(/\/+$/, "");

export default defineConfig({
  publicDir: false,
  define: {
    __IREF_VERSION__: JSON.stringify(packageJson.version),
    __IREF_DISPLAY_VERSION__: JSON.stringify(displayVersion),
    __IREF_REPO_URL__: JSON.stringify(repoUrl),
    __IREF_REPO_SLUG__: JSON.stringify(repoSlug),
    __IREF_RELEASES_URL__: JSON.stringify(`${repoUrl}/releases/latest`),
    __IREF_RELEASES_API_URL__: JSON.stringify(`https://api.github.com/repos/${repoSlug}/releases/latest`),
  },
  plugins: [
    viteStaticCopy({
      targets: [
        { src: "public/manifest.json", dest: "." },
        { src: "public/icons/*", dest: "icons" },
      ],
    }),
  ],
  build: {
    emptyOutDir: true,
    sourcemap: true,
    assetsInlineLimit: 10 * 1024,
    lib: {
      entry: "src/main.js",
      formats: ["es"],
      fileName: () => "main.js",
      cssFileName: "extension",
    },
    rollupOptions: {
      output: {
        assetFileNames: "[name][extname]",
      },
    },
  },
});
