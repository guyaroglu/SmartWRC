import { execFileSync } from "node:child_process";

const SOURCE = "wrc_test";
const PROBE = "wrc_restore_probe";
const DEV = "wrc";

function assertSafeSource(name: string) {
  if (name === DEV || !/test/i.test(name)) {
    throw new Error(`Restore drill source must be an isolated test database, not "${name}"`);
  }
}

function docker(args: string[], input?: string) {
  return execFileSync("docker", args, {
    encoding: "utf8",
    input,
    maxBuffer: 80 * 1024 * 1024,
    stdio: ["pipe", "pipe", "pipe"],
  });
}

function psql(db: string, sql: string) {
  return docker(["exec", "-i", "wrc-postgres", "psql", "-U", "wrc", "-d", db, "-v", "ON_ERROR_STOP=1", "-tAc", sql]);
}

async function main() {
  assertSafeSource(SOURCE);
  if ([SOURCE, PROBE].includes(DEV)) {
    throw new Error("Refusing to use the DEV database as dump source or restore target");
  }

  const beforeDevUsers = Number(psql(DEV, "SELECT count(*) FROM \"User\";").trim());
  const sourceUsers = Number(psql(SOURCE, "SELECT count(*) FROM \"User\";").trim());
  if (!Number.isFinite(sourceUsers) || sourceUsers < 1) {
    throw new Error("Source test database has no users; drill aborted");
  }

  const dump = docker(["exec", "wrc-postgres", "pg_dump", "-U", "wrc", "-d", SOURCE, "--no-owner", "--no-acl"]);
  if (!dump.includes("CREATE TABLE") && !dump.includes("CREATE TABLE IF NOT EXISTS")) {
    throw new Error("pg_dump of wrc_test did not produce a schema dump");
  }

  psql("postgres", `SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '${PROBE}' AND pid <> pg_backend_pid();`);
  psql("postgres", `DROP DATABASE IF EXISTS ${PROBE};`);
  psql("postgres", `CREATE DATABASE ${PROBE} OWNER wrc;`);
  docker(["exec", "-i", "wrc-postgres", "psql", "-U", "wrc", "-d", PROBE, "-v", "ON_ERROR_STOP=1"], dump);

  const restoredUsers = Number(psql(PROBE, "SELECT count(*) FROM \"User\";").trim());
  const restoredReleases = Number(psql(PROBE, "SELECT count(*) FROM \"Release\";").trim());
  if (restoredUsers !== sourceUsers) {
    throw new Error(`Restore mismatch: source users ${sourceUsers}, probe ${restoredUsers}`);
  }

  psql("postgres", `SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '${PROBE}' AND pid <> pg_backend_pid();`);
  psql("postgres", `DROP DATABASE ${PROBE};`);

  const afterDevUsers = Number(psql(DEV, "SELECT count(*) FROM \"User\";").trim());
  if (afterDevUsers !== beforeDevUsers) {
    throw new Error("DEV database user count changed during restore drill");
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        source: SOURCE,
        probe: PROBE,
        restoredUsers,
        restoredReleases,
        devUsersUnchanged: afterDevUsers,
      },
      null,
      2,
    ),
  );
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
