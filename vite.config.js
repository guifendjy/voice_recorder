import { defineConfig } from "vite";

export default defineConfig({
  base: "/voice_recorder/",
  define: {
    master: "window.master",
  },
});
