import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          if (id.includes('/react/') || id.includes('/react-dom/') || id.includes('/react-router')) return 'vendor-react';
          if (id.includes('@supabase')) return 'vendor-supabase';
          if (id.includes('@tanstack')) return 'vendor-query';
          if (id.includes('@radix-ui') || id.includes('/lucide-react/') || id.includes('/sonner/')) return 'vendor-ui';
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Remove console.* and debugger statements in production
    minify: "esbuild",
    sourcemap: false,
  },
  esbuild: {
    drop: mode === "production" ? ["console", "debugger"] : [],
  },
}));
