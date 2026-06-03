/// <reference path="./types/express/index.d.ts" />
import { env } from "@/env";
import {
  apiResponseMiddleware,
  errorHandler,

} from "@/middlewares";
import { apiRouter } from "@/modules";
import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Application } from "express";


import { corsConfig } from "./config/cors";

import { limiter } from "./middlewares/request-limiter";
import { logger } from "./config/logger";
//import passport from "./config/passport";

export const app: Application = express();



app.use(
  cors(corsConfig),
);

if (env.IS_PRODUCTION) {
  app.use(limiter)
}
//app.use(passport.initialize())
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use(apiResponseMiddleware);

app.use((req, res, next) => {
  logger.info(`URL: [${req.url}]`)
  console.log (req.body)
  next()
})

app.use("/api", apiRouter);

app.use(errorHandler);


