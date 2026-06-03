import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { logger } from "@/config/logger";

export function loadEnv(file = ".env") {
  try {
    const envPath = path.resolve(process.cwd(), file);
    console.log(envPath);
    if (!fs.existsSync(envPath)) {
      throw new Error("Could not load env file! File not found!");
    }
    
    dotenv.config({ path: envPath, override: true });
    return process.env;
  } catch (error) {
    logger.error((error as Error)?.message);
    process.exit(1);
  }
}
