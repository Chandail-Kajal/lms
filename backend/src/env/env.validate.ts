import { env } from "./env";
import { logger } from "@/config/logger";
import { REQUIRED_ENV } from "./env.required";

export function validateEnv() {
    validateRequired();
    validateSecurity();
    validateFormats();
    validateWarnings();
}

function validateRequired() {
    const required =
        REQUIRED_ENV[env.NODE_ENV] || [];

    const missing: string[] = [];

    for (const key of required) {
        const value =
            process.env[key];
        if (
            value === undefined ||
            value === null ||
            value.trim() === ""
        ) {
            missing.push(key);
        }
    }

    if (missing.length > 0) {
        throw new Error(
            `Missing required env vars:\n${missing.join(
                "\n",
            )}`,
        );
    }
}

function validateSecurity() {
    if (
        env.IS_PRODUCTION &&
        env.ACCESS_TOKEN_SECRET ===
        "ACCESSS_SECRET_V2"
    ) {
        throw new Error(
            "Default ACCESS_TOKEN_SECRET cannot be used in production",
        );
    }

    if (
        env.IS_PRODUCTION &&
        env.REFRESH_TOKEN_SECRET ===
        "REFRESH_SECRET_V2"
    ) {
        throw new Error(
            "Default REFRESH_TOKEN_SECRET cannot be used in production",
        );
    }

    
}

function validateFormats() {
    

    


    
}

function validateWarnings() {
    if (!env.MAIL_HOST) {
        logger.warn(
            "Mailer is not configured",
        );
    }

   

    if (
        env.ALLOWED_ORIGINS.includes("*") &&
        env.IS_PRODUCTION
    ) {
        logger.warn(
            "ALLOWED_ORIGINS contains '*' in production",
        );
    }
}