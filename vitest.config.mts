import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

/**
 * Testes de lógica pura (model do editor). Sem DOM — os componentes React
 * são testados por Playwright/e2e mais adiante, não aqui.
 */
export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
