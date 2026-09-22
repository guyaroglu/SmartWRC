export function assertTestDatabase(url: string | undefined, envName = process.env.NODE_ENV) {
  if (envName !== "test") return;
  if (!url || !/test/i.test(url)) {
    throw new Error(
      "NODE_ENV=test requires TEST_DATABASE_URL (or DATABASE_URL) whose name clearly identifies a test database.",
    );
  }
}

export function resolveDatabaseUrl(): string {
  const isTest = process.env.NODE_ENV === "test" || process.env.VITEST === "true";
  const url = isTest ? process.env.TEST_DATABASE_URL || process.env.DATABASE_URL : process.env.DATABASE_URL;
  if (isTest) assertTestDatabase(url);
  if (!url) throw new Error("DATABASE_URL is not set");
  return url;
}
