import { defineConfig, splitVendorChunkPlugin } from "vite";
import { resolve } from "path";

export default defineConfig({
  publicDir: "public",
  build: {
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: false,
    rollupOptions: {
      input: {
        popup: resolve(__dirname, "popup.html"),
        background: resolve(__dirname, "src/scripts/background.js"),
        content: resolve(__dirname, "src/scripts/content.js"),
        popupScript: resolve(__dirname, "src/scripts/popup.js"),
        pomodoro: resolve(__dirname, "src/scripts/pomodoro.js"),
      },
      output: {
        entryFileNames: "scripts/[name].js",
        assetFileNames: "assets/[name][extname]",
        chunkFileNames: "chunks/[name]-[hash].js",
      },
    },
  },
  plugins: [
    splitVendorChunkPlugin(),
    {
      name: "inject-scripts",
      transformIndexHtml(html) {
        return html.replace(
          "</body>",
          `\n    <script src="./scripts/popupScript.js"></script>\n    <script src="./scripts/pomodoro.js"></script>\n  </body>`
        );
      },
    },
  ],
});
