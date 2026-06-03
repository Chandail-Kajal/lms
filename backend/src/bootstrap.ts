import { bootstrapChecks, env } from "./env";

const run = async () => {
    bootstrapChecks();
    const { logger } = await import("./config/logger")
    logger.info(`Starting server in [${env.NODE_ENV}] environment...`)
    const { startServer } = await import("./server");
    await startServer();
};

run();