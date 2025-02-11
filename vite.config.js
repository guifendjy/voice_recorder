import { defineConfig } from "vite";

export default defineConfig({
  base: "/voice_recorder/",
  esbuild: {
    target: "esnext", // ensure support for top-level await
  },
});
