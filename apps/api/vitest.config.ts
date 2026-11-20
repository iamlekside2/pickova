import "dotenv/config";
import { defineConfig } from "vitest/config";

const testDb = process.env.TEST_DATABASE_URL;
if (!testDb) throw new Error("TEST_DATABASE_URL must be set to run the API tests.");
// Guard against ever pointing the suite (which writes and deletes rows) at a real database.
if (testDb === process.env.DATABASE_URL) throw new Error("TEST_DATABASE_URL must differ from DATABASE_URL.");

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    globalSetup: ["tests/global-setup.ts"],
    fileParallelism: false,
    // One worker process for the whole run. Prisma's native query engine can
    // crash a worker on exit when several are started and torn down in turn
    // (seen intermittently on Windows as "Worker exited unexpectedly").
    pool: "forks",
    poolOptions: { forks: { singleFork: true } },
    testTimeout: 20_000,
    env: {
      NODE_ENV: "test",
      DATABASE_URL: testDb,
      JWT_SECRET: "test-only-secret-0123456789abcdef0123456789abcdef",
      WEB_ORIGIN: "http://localhost:3009",
      // Fake key: the test suite never contacts Paystack (fetch is stubbed).
      PAYSTACK_SECRET_KEY: "sk_test_0000000000000000000000000000000000000000",
      RESEND_API_KEY: "",
    },
  },
});
