import { env } from "@/env";
import { AuthJwtPayload } from "@/types";
import jwt, { SignOptions } from "jsonwebtoken";

const ACCESS_TOKEN_SECRET = env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = env.REFRESH_TOKEN_SECRET;

export const signAccessToken = (payload: any) => {
  return jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
};

export const signRefreshToken = (
  payload: any,
  expiresIn: SignOptions["expiresIn"] = "7d",
) => {
  return jwt.sign(payload, REFRESH_TOKEN_SECRET, {
    expiresIn,
  });
};

export const verifyAccessToken = (token: string): AuthJwtPayload => {
  return jwt.verify(token, ACCESS_TOKEN_SECRET) as AuthJwtPayload;
};

export const verifyRefreshToken = (token: string): AuthJwtPayload => {
  return jwt.verify(token, REFRESH_TOKEN_SECRET) as AuthJwtPayload;
};
