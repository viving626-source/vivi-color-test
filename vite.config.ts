import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import postcssImport from "postcss-import";
import tailwindcss from "@tailwindcss/postcss";
import autoprefixer from "autoprefixer";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const client = path.join(root, "client");
const shared = path.join(root, "shared");

export default defineConfig({
  root: client,
  plugins: [react()],
  resolve: {
    alias: [
      // 平台依賴 → 本地 shim（具體路徑在前，根包在後）
      {
        find: /^@lark-apaas\/client-toolkit\/logger$/,
        replacement: path.join(client, "src/shims/logger.ts"),
      },
      {
        find: /^@lark-apaas\/client-toolkit\/utils\/getAxiosForBackend$/,
        replacement: path.join(client, "src/shims/apiClient.ts"),
      },
      {
        find: /^@lark-apaas\/client-toolkit\/utils\/resolveAppUrl$/,
        replacement: path.join(client, "src/shims/resolveAppUrl.ts"),
      },
      {
        find: /^@lark-apaas\/client-toolkit\/dataloom$/,
        replacement: path.join(client, "src/shims/dataloom.ts"),
      },
      {
        find: /^@lark-apaas\/client-toolkit\/tools\/storage$/,
        replacement: path.join(client, "src/shims/tools-storage.ts"),
      },
      {
        find: /^@lark-apaas\/client-toolkit\/components\/AppContainer$/,
        replacement: path.join(client, "src/shims/AppContainer.tsx"),
      },
      {
        find: /^@lark-apaas\/client-toolkit\/components\/ErrorRender$/,
        replacement: path.join(client, "src/shims/ErrorRender.tsx"),
      },
      {
        find: /^@lark-apaas\/client-toolkit\/components\/UniversalLink$/,
        replacement: path.join(client, "src/shims/UniversalLink.tsx"),
      },
      {
        find: /^@lark-apaas\/client-toolkit\/antd-table$/,
        replacement: path.join(client, "src/shims/antd-table.tsx"),
      },
      {
        find: /^@lark-apaas\/client-toolkit$/,
        replacement: path.join(client, "src/shims/capabilityClient.ts"),
      },
      // 路徑別名
      { find: /^@client\/(.*)$/, replacement: path.join(client, "$1") },
      { find: /^@shared\/(.*)$/, replacement: path.join(shared, "$1") },
      { find: /^@\/(.*)$/, replacement: path.join(client, "src/$1") },
    ],
  },
  css: {
    postcss: {
      plugins: [postcssImport(), tailwindcss(), autoprefixer()],
    },
  },
  build: {
    outDir: path.join(client, "dist"),
    emptyOutDir: true,
  },
  server: {
    port: 5173,
  },
});
