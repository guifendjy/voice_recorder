import { defineConfig } from "vite";

export default defineConfig({
  base: "/voice_recorder/",
  build: {
    target: "esnext", // ensure support for top-level await
  },
  esbuild: {
    target: "esnext", // ensure support for top-level await
  },
});
