import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./setupTests.ts"],
    css: true,
    coverage: {
      reporter: ["text", "lcov"],
      include: ["src/**/*.{ts,tsx}"],
    },
  },
  esbuild: {
    jsx: "automatic",
    jsxImportSource: "react",
  },
});
