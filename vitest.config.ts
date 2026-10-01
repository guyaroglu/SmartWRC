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
    // Files share one wrc_test DB and clean up their own releases in afterAll; run them one at a time
    // so a global query in one file never reads rows another file is deleting.
    fileParallelism: false,
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
