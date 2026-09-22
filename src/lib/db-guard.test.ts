import { describe, expect, it } from "vitest";
import { assertTestDatabase, resolveDatabaseUrl } from "@/lib/db-guard";

describe("test database isolation", () => {
  it("fails fast when NODE_ENV=test but the URL is not a test database", () => {
    expect(() => assertTestDatabase("postgresql://wrc:wrc@localhost:5433/wrc", "test")).toThrow(/test database/i);
  });

  it("accepts a URL that identifies itself as test", () => {
    expect(() => assertTestDatabase("postgresql://wrc:wrc@localhost:5433/wrc_test", "test")).not.toThrow();
  });

  it("does not require a test name outside test env", () => {
    expect(() => assertTestDatabase("postgresql://wrc:wrc@localhost:5433/wrc", "development")).not.toThrow();
  });

  it("resolveDatabaseUrl uses TEST_DATABASE_URL in test", () => {
    const prevTest = process.env.TEST_DATABASE_URL;
    const prevDb = process.env.DATABASE_URL;
    process.env.TEST_DATABASE_URL = "postgresql://wrc:wrc@localhost:5433/wrc_test";
    process.env.DATABASE_URL = "postgresql://wrc:wrc@localhost:5433/wrc";
    expect(resolveDatabaseUrl()).toContain("wrc_test");
    if (prevTest === undefined) delete process.env.TEST_DATABASE_URL;
    else process.env.TEST_DATABASE_URL = prevTest;
    if (prevDb === undefined) delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL = prevDb;
  });
});
