import { app } from "@/app";

import { logger } from "@/config/logger";

import { env } from "@/env";


import type { Server } from "http";

let server: Server;
let shuttingDown = false;

async function shutdown(signal: string) {
  if (shuttingDown) return;
  shuttingDown = true;

  logger.info(`${signal} received. Starting graceful shutdown...`);

  const shutdownTimeout = setTimeout(() => {
    logger.error("Forced shutdown after timeout");
    process.exit(1);
  }, 15000);

  shutdownTimeout.unref();

  try {
    await new Promise<void>((resolve, reject) => {
      server.close((err) => {
        if (err) return reject(err);
        logger.info("HTTP server closed");
        resolve();
      });
    });

    
    clearTimeout(shutdownTimeout);

    logger.info("Graceful shutdown complete");
    process.exit(0);

  } catch (err) {
    clearTimeout(shutdownTimeout);

    logger.error("Error during shutdown", { error: err });
    process.exit(1);
  }
}

export async function startServer() {
  try {
   
    server = app.listen(env.PORT, () => {
      logger.info(`Server running on http://localhost:${env.PORT}`);
    });

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));

    process.on("uncaughtException", (err) => {
      logger.error("Uncaught Exception", { error: err });
      shutdown("uncaughtException");
    });

    process.on("unhandledRejection", (reason) => {
      logger.error("Unhandled Rejection", { error: reason });
      shutdown("unhandledRejection");
    });

  } catch (err) {
    logger.error("Failed to start server", { error: err });
    process.exit(1);
  }
}
