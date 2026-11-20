import { execSync } from "node:child_process";

/** Brings the test database up to the current schema and seeds the sample catalogue. */
export default function setup() {
  const env = { ...process.env, DATABASE_URL: process.env.TEST_DATABASE_URL!, ADMIN_EMAIL: "", ADMIN_PASSWORD: "", SEED_SAMPLE_CATALOGUE: "true" };
  execSync("npx prisma migrate deploy", { env, stdio: "pipe" });
  execSync("npx tsx prisma/seed.ts", { env, stdio: "pipe" });
}
