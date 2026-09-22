import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { assertTestDatabase } from "../lib/db-guard";

function loadEnv() {
  try {
    for (const line of readFileSync(path.resolve(".env"), "utf8").split(/\r?\n/)) {
      const m = line.match(/^([^#=]+)=(.*)$/);
      if (m && !process.env[m[1].trim()]) {
        process.env[m[1].trim()] = m[2].trim().replace(/^"(.*)"$/, "$1");
      }
    }
  } catch {
    /* local env optional */
  }
}

export default async function setup() {
  loadEnv();
  const testUrl =
    process.env.TEST_DATABASE_URL || "postgresql://wrc:wrc_dev_only@localhost:5433/wrc_test";
  process.env.TEST_DATABASE_URL = testUrl;
  assertTestDatabase(testUrl, "test");
  process.env.DATABASE_URL = testUrl;

  try {
    execSync('docker exec wrc-postgres psql -U wrc -d postgres -c "CREATE DATABASE wrc_test;"', {
      stdio: "pipe",
    });
  } catch {
    /* database may already exist */
  }

  execSync("npx prisma db push --skip-generate", {
    stdio: "inherit",
    env: { ...process.env, DATABASE_URL: testUrl, NODE_ENV: "test" },
  });
  execSync("npx prisma db seed", {
    stdio: "inherit",
    env: { ...process.env, DATABASE_URL: testUrl, NODE_ENV: "test" },
  });
}
