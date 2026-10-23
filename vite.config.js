import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// The API key stays on the dev server and is never sent to the browser.
// The app calls /anthropic/v1/messages; this proxy adds auth and forwards it.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  if (!env.ANTHROPIC_API_KEY) {
    console.warn("\n  No ANTHROPIC_API_KEY found. Copy .env.example to .env and add your key.\n");
  }
  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        "/anthropic": {
          target: "https://api.anthropic.com",
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/anthropic/, ""),
          headers: {
            "x-api-key": env.ANTHROPIC_API_KEY || "",
            "anthropic-version": "2023-06-01",
          },
        },
      },
    },
  };
});
