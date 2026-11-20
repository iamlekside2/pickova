// Starts / stops the project-local development Postgres cluster in ./.pgdata.
// It listens on 127.0.0.1:5433 with trust auth, so it needs no password and is
// never reachable from outside this machine. Production uses a managed database.
import { spawn, spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const dataDir = join(root, ".pgdata");
const port = "5433";
const user = "pickova";

function findBin() {
  if (process.env.PG_BIN) return process.env.PG_BIN;
  for (const version of ["18", "17", "16", "15", "14"]) {
    const dir = `C:\\Program Files\\PostgreSQL\\${version}\\bin`;
    if (existsSync(dir)) return dir;
  }
  return ""; // fall back to PATH
}

const bin = findBin();
const exe = (name) => (bin ? join(bin, process.platform === "win32" ? `${name}.exe` : name) : name);
const run = (name, args) => spawnSync(exe(name), args, { stdio: "inherit" });
const ready = () =>
  spawnSync(exe("pg_isready"), ["-h", "127.0.0.1", "-p", port], { stdio: "ignore" }).status === 0;

const action = process.argv[2];

if (action === "start") {
  if (!existsSync(dataDir)) {
    run("initdb", ["-D", dataDir, "-U", user, "-A", "trust", "-E", "UTF8", "--locale=C"]);
  }
  if (ready()) {
    console.log(`Postgres already running on 127.0.0.1:${port}`);
  } else {
    // Detached so the server outlives this script.
    spawn(
      exe("pg_ctl"),
      ["-D", dataDir, "-o", `-p ${port} -c listen_addresses=127.0.0.1`, "-l", join(dataDir, "server.log"), "start"],
      { detached: true, stdio: "ignore" },
    ).unref();
    // Wait up to 60s — after an unclean shutdown Postgres replays its log first.
    const pause = (ms) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
    for (let i = 0; i < 60 && !ready(); i++) pause(1000);
    console.log(ready() ? `Postgres started on 127.0.0.1:${port}` : "Postgres did not start — see .pgdata/server.log");
  }
  for (const db of ["pickova_dev", "pickova_test"]) {
    spawnSync(exe("createdb"), ["-h", "127.0.0.1", "-p", port, "-U", user, db], { stdio: "ignore" });
  }
} else if (action === "stop") {
  run("pg_ctl", ["-D", dataDir, "stop", "-m", "fast"]);
} else {
  console.log("Usage: node scripts/local-db.mjs <start|stop>");
  process.exit(1);
}
