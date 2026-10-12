import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";

// TanStack Router file-based route generation
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";

export default defineConfig({
  server: {
    host: "0.0.0.0",
    port: 8080,
  },
  plugins: [
    TanStackRouterVite({
      // Auto-generate routeTree.gen.ts from src/routes/
      routesDirectory: "./src/routes",
      generatedRouteTree: "./src/routeTree.gen.ts",
      // booking-tracker.tsx lives in src/routes/admin/ but is a shared component
      // module imported by the dashboard, NOT a route. Ignore it so the build
      // stops warning about a missing Route export.
      routeFileIgnorePattern: "booking-tracker",
    }),
    tailwindcss(),
    tsconfigPaths(),
    react(),
  ],
});
