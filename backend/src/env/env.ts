import { logger } from "@/config/logger";
import { loadEnv } from "@/libs/env";
import { LogLevels } from "@/libs/logger";
const envFile = `.env.${process.env.NODE_ENV || "dev"}`;
const raw = loadEnv(envFile);

export const env = {
    IS_PRODUCTION: raw.NODE_ENV === "production" ? true : false,
    NODE_ENV: raw.NODE_ENV || "dev",
    PORT: Number(raw.PORT) || 3000,
    ALLOWED_ORIGINS: raw.ALLOWED_ORIGINS?.split(" ") || ["*"],

   
    ACCESS_TOKEN_SECRET: raw.ACCESS_TOKEN_SECRET || "ACCESSS_SECRET_V2",
    REFRESH_TOKEN_SECRET: raw.REFRESH_TOKEN_SECRET || "REFRESH_SECRET_V2",

    DATABASE_URL: raw.DATABASE_URL|| "",
    

    
   
    PUBLIC_URL: raw.PUBLIC_URL || "",


    MAIL_HOST: raw.MAIL_HOST,
    MAIL_PORT: Number(raw.MAIL_PORT) || 587,
    MAIL_USER: raw.MAIL_USER,
    MAIL_PASS: raw.MAIL_PASS,
    MAIL_FROM: raw.MAIL_FROM,
    MAIL_SECURITY: raw.MAIL_SECURITY === "true",

   
    LOG_LEVEL: (raw.LOG_LEVEL || "info") as LogLevels,

  
};
