import { createApp } from "./app";
import { env } from "./env";
import { prisma } from "./lib/prisma";

const server = createApp().listen(env.PORT, () => {
  console.info(`Pickova API listening on http://localhost:${env.PORT} (${env.NODE_ENV})`);
});

async function shutdown(signal: string) {
  console.info(`${signal} received — shutting down`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("SIGINT", () => void shutdown("SIGINT"));
