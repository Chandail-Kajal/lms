import { CorsOptions } from "cors";
import { env } from "@/env";

export const corsConfig: CorsOptions = {
    origin: env.ALLOWED_ORIGINS,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Content-Disposition"],
}