import { resolve } from "node:path";
import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: "esm",
  target: "esnext",
  clean: true,
  sourcemap: true,
  esbuildOptions(options) {
    options.alias = {
      "@": resolve(__dirname, "src"),
    };
  },
});
