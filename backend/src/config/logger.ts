import { createLogger, LogLevels } from "@/libs/logger";

export const logger = createLogger(
    {},
    process.env.NODE_ENV === "production",
    (process.env.LOG_LEVEL || "info") as LogLevels
);
