import { defineConfig } from "vitest/config";
import path from "node:path";
import { readFileSync } from "node:fs";

try {
  for (const line of readFileSync(".env", "utf8").split(/\r?\n/)) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m && !process.env[m[1].trim()]) {
      process.env[m[1].trim()] = m[2].trim().replace(/^"(.*)"$/, "$1");
    }
  }
} catch {
  /* local env file optional for unit tests */
}

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    globalSetup: ["src/test/global-setup.ts"],
    env: {
      NODE_ENV: "test",
      TEST_DATABASE_URL:
        process.env.TEST_DATABASE_URL || "postgresql://wrc:wrc_dev_only@localhost:5433/wrc_test",
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
