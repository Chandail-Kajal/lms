import "express-serve-static-core";

declare module "express-serve-static-core" {
  interface Response {
    apiResponse: (
      statusCode: number,
      message?: string | null,
      data?: any,
      meta?: {
        pagination?: any;
        stack?: string | null;
        errors?: any;
      } | null,
    ) => this;
  }

  interface Request {
    userSettings?: {
      timeZone: string;
      locale: string;
    };
    auth?: { userId: string | number; userRole: string | null };
  }
}
