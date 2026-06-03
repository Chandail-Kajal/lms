import { Request, Response, NextFunction } from "express";
import { APIResponse } from "@/shared/utils/ApiResponse";
import { httpStatus } from "@/config/httpStatus";

/**
 * Middleware to add `res.apiResponse()` for standardized responses.
 * @param {import("express").Request} req
 * @param {CustomResponse} res
 * @param {import("express").NextFunction} next
 */

export const apiResponseMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  res.apiResponse = function (
    statusCode: number,
    message: string | null = null,
    data: any = null,
    meta: any = null
  ) {
    const httpRes = httpStatus[statusCode];
    const finalMessage = message ?? httpRes?.message ?? "Unknown Status Code";

    const response = new APIResponse(finalMessage, statusCode, data, meta);
    return this.status(statusCode).json(response);
  };

  next();
};
