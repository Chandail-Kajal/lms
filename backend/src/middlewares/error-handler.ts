/* eslint-disable @typescript-eslint/no-unused-vars */
import { logger } from "@/config/logger";
import { env } from "@/env";
import { ApiError } from "@/shared/utils/ApiError";
import { NextFunction, Request, Response } from "express";
import { MulterError } from "multer";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
): Response => {
  let error: any = { ...err };
  error.message = err.message || "An error occurred";

  // Handle ApiError
  if (err instanceof ApiError) {
    error.statusCode = err.statusCode;
    error.isOperational = err.isOperational;
  }

  // Mongoose & Common Errors
  if (err.name === "ValidationError") {
    error.statusCode = 400;
    error.message = Object.values(err.errors)
      .map((e: any) => e.message)
      .join(". ");
    error.isOperational = true;
  }

  if (err.name === "ValidatorError") {
    error.statusCode = 400;
    error.message = `Error: ${err.message}`;
    error.isOperational = true;
  }

  if (err.code === 11000) {
    error.statusCode = 400;
    error.message = "Duplicate field value entered";
    error.isOperational = true;
  }

  if (err.name === "CastError") {
    error.statusCode = 400;
    error.message = "Invalid resource ID";
    error.isOperational = true;
  }

  if (err instanceof SyntaxError) {
    error.statusCode = 400;
    error.message = "Invalid JSON payload";
    error.isOperational = true;
  }

  if (err.name === "JsonWebTokenError") {
    error.statusCode = 401;
    error.message = "Unauthorised Access!";
    error.isOperational = true;
  }

  if (err.name === "TokenExpiredError") {
    error.statusCode = 401;
    error.message = "Token Expired!";
    error.isOperational = true;
  }

  if (!error.statusCode) {
    error.statusCode = 500;
    error.message = "Intrenal Server Error!";
    error.isOperational = false;
  }

  // Multer Errors
  if (err instanceof MulterError) {
    error.isOperational = true;
    error.statusCode = 400;

    switch (err.code) {
      case "LIMIT_FILE_SIZE":
        error.message = "File size exceeds allowed limit";
        break;

      case "LIMIT_FILE_COUNT":
        error.message = "Too many files uploaded";
        break;

      case "LIMIT_UNEXPECTED_FILE":
        error.message = `Unexpected file field: ${err.field}`;
        break;

      case "LIMIT_PART_COUNT":
        error.message = "Too many form parts";
        break;

      case "LIMIT_FIELD_KEY":
        error.message = "Field name too long";
        break;

      case "LIMIT_FIELD_VALUE":
        error.message = "Field value too long";
        break;

      case "LIMIT_FIELD_COUNT":
        error.message = "Too many fields";
        break;

      default:
        error.message = "File upload error";
    }
  }

  // Logging
  if (env.IS_PRODUCTION) {
    if (error.isOperational) {
      logger.warn(JSON.stringify({ url: req.url, body: req.body }, null, 2));
      logger.warn(error);
    } else {
      logger.error(JSON.stringify({ url: req.url, body: req.body }, null, 2));
      logger.error(error);
    }
  } else {
    logger.error(error);
  }

  // Final API response
  if (res.apiResponse) {
    return res.apiResponse(
      error.statusCode,
      error.message,
      null,
      env.IS_PRODUCTION ? null : { stack: err.stack },
    );
  }

  return res.status(error.statusCode).json({
    success: false,
    message: error.message,
    stack: env.IS_PRODUCTION ? null : err.stack,
  });
};
