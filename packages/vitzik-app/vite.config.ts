import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import viteTsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  base: "",
  plugins: [react(), viteTsconfigPaths()],
  server: {
    open: true,
    port: 3000,
  },
  optimizeDeps: {
    include: ["vitzik-ui"],
  },
  test: {
    include: ["./**/*.{test,spec}.{ts,tsx}"],
    globals: true,
    environment: "happy-dom",
    setupFiles: ["./setupTests.jsx"],
  },
});
