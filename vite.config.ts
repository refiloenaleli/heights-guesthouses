import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import netlify from "@netlify/vite-plugin-tanstack-start";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  server: {
    port: 8080,
  },
  plugins: [
    tailwindcss(), // ← This is the key line for Tailwind v4
    tsconfigPaths(),
    tanstackStart(),
    react(),
    netlify(),
  ],
});
