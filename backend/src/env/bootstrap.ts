import { validateEnv } from "./env.validate";
import { logger } from "@/config/logger";

export function bootstrapChecks() {

    try {
        validateEnv();
        logger.info("Environment validation successful");
    } catch (error: any) {
        logger.error("Environment validation failed");
        logger.error(error.message);
        process.exit(0)
    }

}