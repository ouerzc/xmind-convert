import path from "node:path"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from "vitest/config"

function resolveBasePath() {
  if (process.env.VITE_BASE_PATH) {
    return process.env.VITE_BASE_PATH
  }

  const repositoryName = process.env.GITHUB_REPOSITORY?.split("/")[1]
  if (!repositoryName || repositoryName.endsWith(".github.io")) {
    return "/"
  }

  return `/${repositoryName}/`
}

export default defineConfig({
  base: resolveBasePath(),
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "node",
  },
})
