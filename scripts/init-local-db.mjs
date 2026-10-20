import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import dotenv from "dotenv";

const envFile = existsSync(".env.local") ? ".env.local" : ".env";
dotenv.config({ path: envFile });

const composeEnv = { ...process.env };
const run = (args, options = {}) => {
  const result = spawnSync("docker", ["compose", ...args], {
    stdio: "inherit",
    env: composeEnv,
    ...options,
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
};

run(["up", "-d", "--wait", "postgres"]);

const check = spawnSync(
  "docker",
  [
    "compose",
    "exec",
    "-T",
    "postgres",
    "sh",
    "-lc",
    "psql -U \"$POSTGRES_USER\" -d \"$POSTGRES_DB\" -tAc \"select to_regclass('public.users') is not null\"",
  ],
  { encoding: "utf8", env: composeEnv },
);

if (check.status !== 0) process.exit(check.status ?? 1);

if (check.stdout.trim() !== "t") {
  run([
    "exec",
    "-T",
    "postgres",
    "sh",
    "-lc",
    "psql -v ON_ERROR_STOP=1 -U \"$POSTGRES_USER\" -d \"$POSTGRES_DB\" -f /docker-entrypoint-initdb.d/0031_local_init.sql",
  ]);
} else {
  console.log("Local database schema already exists; no initialization needed.");
}

console.log("Local database initialization complete.");
