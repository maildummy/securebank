import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Helper function to load plugins dynamically
function loadPlugins() {
  const plugins = [react(), runtimeErrorOverlay()];
  
  // Only add cartographer in development on Replit
  if (process.env.NODE_ENV !== "production" && process.env.REPL_ID !== undefined) {
    // We'll handle this plugin asynchronously in the configuration
    plugins.push({
      name: 'async-cartographer',
      // This will be executed during the build but not at config parse time
      configResolved: async () => {
        const cartographerModule = await import("@replit/vite-plugin-cartographer");
        const cartographer = cartographerModule.cartographer();
        Object.assign(plugins[plugins.length - 1], cartographer);
      }
    });
  }
  
  return plugins;
}

export default defineConfig({
  plugins: loadPlugins(),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets"),
    },
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
