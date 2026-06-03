import { env } from "@/config/env";
import { auth, uploadSingle } from "@/middlewares";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "@/shared/jwt";
import express, { NextFunction, Request, Response } from "express";
import { ApiError } from "@/shared/utils";
import { changePassword, forgotPassword, login, registerUser, resendVerificationOTP, resetPassword, verifyPasswordResetOtp } from "./auth.controller";
import { prisma } from "@/config/prisma";
import { mailer } from "@/config/mailer";
import passport from "@/config/passport";
import { User } from "@/generated/prisma/client";

export const authRouter = express.Router();

authRouter.post(
  "/register",
  uploadSingle("profilePicture"),
  async (req, res, next) => {
    try {
      const {
        email,
        password,
        name,
        mobileNumber,
      } = req.body;

      const user =
        await registerUser({
          email,
          password,
          name,
          mobileNumber,
        });

      res.apiResponse(
        200,
        "Registration successful. Please verify your email.",
        user
      );
    } catch (error) {
      next(error);
    }
  }
);

authRouter.post(
  "/verify-email",
  async (req, res, next) => {
    try {
      const { email, otp } = req.body;

      const user =
        await prisma.user.findUnique({
          where: { email },
        });

      if (!user) {
        throw new ApiError(
          404,
          "User not found"
        );
      }

      const verification =
        await prisma.verificationToken.findFirst({
          where: {
            userId: user.id,
            otp,
            verified: false,
            type: "EMAIL_VERIFICATION",
          },
        });

      if (!verification) {
        throw new ApiError(
          400,
          "Invalid OTP"
        );
      }

      if (
        verification.expiresAt <
        new Date()
      ) {
        throw new ApiError(
          400,
          "OTP expired"
        );
      }

      await prisma.$transaction([
        prisma.user.update({
          where: {
            id: user.id,
          },
          data: {
            emailVerified: true,
            emailVerifiedAt: new Date(),
          },
        }),

        prisma.verificationToken.update({
          where: {
            id: verification.id,
          },
          data: {
            verified: true,
          },
        }),
      ]);

      res.apiResponse(
        200,
        "Email verified successfully"
      );
    } catch (error) {
      next(error);
    }
  }
);

authRouter.post(
  "/resend-verification",
  async (req, res, next) => {
    try {
      const { email } = req.body;

      await resendVerificationOTP(
        email
      );

      res.apiResponse(
        200,
        "OTP sent successfully"
      );
    } catch (error) {
      next(error);
    }
  }
);

authRouter.post(
  "/login",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        username,
        password,
        remember = false,
      } = req.body;

      if (!username || !password) {
        throw new ApiError(
          400,
          "Username and password are required"
        );
      }

      const user = await login(
        username,
        password
      );

      const tokenPayload = {
        userId: user.id,
        email: user.email,
        userRole: user.role,
      };

      const accessToken =
        signAccessToken(tokenPayload);

      const refreshToken =
        signRefreshToken(
          tokenPayload,
          remember
            ? 1000 * 60 * 60 * 24 * 30
            : 1000 * 60 * 60 * 24
        );

      res.cookie(
        "refreshToken",
        refreshToken,
        {
          path: "/",
          httpOnly: true,
          secure: env.IS_PRODUCTION,
          sameSite: "strict",
          maxAge: remember
            ? 1000 * 60 * 60 * 24 * 30
            : 1000 * 60 * 60 * 24,
        }
      );

      return res.status(200).json({
        message: "Login successful",
        data: {
          accessToken,
          homeRoute: "/profile",
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            mobileNumber:
              user.mobileNumber,
            role: user.role,
            profilePicture:
              user.profilePicture,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

authRouter.get(
  "/profile",
  auth,
  async (req, res, next) => {
    try {
      const user =
        await prisma.user.findUnique({
          where: {
            id: req.auth?.userId as string,
          },
          select: {
            id: true,
            name: true,
            email: true,
            mobileNumber: true,
            role: true,
            profilePicture: true,
            emailVerified: true,
            createdAt: true,
          },
        });

      if (!user) {
        throw new ApiError(
          404,
          "User not found"
        );
      }

      return res.apiResponse(200, "success", user)
    } catch (error) {
      next(error);
    }
  }
);

authRouter.put(
  "/profile",
  auth,
  uploadSingle("profilePicture"),
  async (req, res, next) => {
    try {
      const {
        name,
        mobileNumber,
        email
      } = req.body;

      const user =
        await prisma.user.update({
          where: {
            id: req.auth!.userId as string,
          },
          data: {
            ...(name && { name }),
            ...(mobileNumber && {
              mobileNumber,
            }),
            ...(email && { email })
          },
          select: {
            id: true,
            name: true,
            email: true,
            mobileNumber: true,
            role: true,
            profilePicture: true,
          },
        });

      return res.status(200).json({
        message:
          "Profile updated successfully",
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }
);

authRouter.post(
  "/profile/change-password",
  auth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        oldPassword: previousPassword,
        newPassword,
      } = req.body;

      const userId = req.auth?.userId as string;

      await changePassword(
        userId,
        previousPassword,
        newPassword,
      );

      return res.apiResponse(200, "Password changed successfully");
    } catch (error) {
      next(error);
    }
  }
);

authRouter.get(
  "/logout",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.clearCookie("refreshToken");
      res.apiResponse(200, "logout success")
    } catch (error) {
      next(error);
    }
  },
);

authRouter.get(
  "/refresh",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const refreshToken = req.cookies?.refreshToken;
      if (!refreshToken) {
        res.apiResponse(400, "Refresh token is required!")
      }

      const decoded = verifyRefreshToken(refreshToken);

      const payload = {
        userId: decoded.userId,
        userRole: decoded.userRole,
      };

      const newAccessToken = signAccessToken(payload);
      res.apiResponse(200, null, { accessToken: newAccessToken })
    } catch (error) {
      next(error);
    }
  },
);

authRouter.post(
  "/forgot-password",
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { email } = req.body;

      if (!email) {
        throw new ApiError(
          400,
          "Email is required"
        );
      }

      const { user, otp } =
        await forgotPassword(email);

      await mailer.sendMail({
        to: user.email!,
        subject: "Password Reset OTP",
        html: `
          <h2>Password Reset Request</h2>
          <p>Your OTP is:</p>
          <h1>${otp}</h1>
          <p>This OTP will expire in 10 minutes.</p>
        `,
        attachments: []
      });

      return res.status(200).json({
        message:
          "Password reset OTP sent successfully",
      });
    } catch (error) {
      next(error);
    }
  }
);


authRouter.post(
  "/verify-reset-otp",
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { email, otp } =
        req.body;

      await verifyPasswordResetOtp(
        email,
        otp
      );

      return res.status(200).json({
        message:
          "OTP verified successfully",
      });
    } catch (error) {
      next(error);
    }
  }
);

authRouter.post(
  "/reset-password",
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const {
        email,
        password,
      } = req.body;

      if (
        !email ||
        !password
      ) {
        throw new ApiError(
          400,
          "Email and password are required"
        );
      }

      await resetPassword(
        email,
        password
      );

      return res.status(200).json({
        message:
          "Password reset successful",
      });
    } catch (error) {
      next(error);
    }
  }
);


//Google and Linkedin Login Code
// authRouter.get(
//   "/google",
//   passport.authenticate(
//     "google",
//     {
//       scope: [
//         "profile",
//         "email",
//       ],
//     }
//   )
// );

// authRouter.get(
//   "/linkedin",
//   passport.authenticate(
//     "linkedin"
//   )
// );

// authRouter.get(
//   "/google/callback",
//   passport.authenticate("google", {
//     session: false,
//   }),
//   async (
//     req: Request,
//     res: Response,
//     next: NextFunction
//   ) => {
//     try {
//       const user = req.user as User;

//       const tokenPayload = {
//         userId: user.id,
//         email: user.email,
//         role: user.role,
//       };

//       const accessToken =
//         signAccessToken(tokenPayload);

//       const refreshToken =
//         signRefreshToken(tokenPayload);

//       res.cookie(
//         "refreshToken",
//         refreshToken,
//         {
//           path: "/",
//           httpOnly: true,
//           secure: env.IS_PRODUCTION,
//           sameSite: "strict",
//           maxAge:
//             1000 * 60 * 60 * 24 * 30,
//         }
//       );

//       return res.redirect(
//         `${env.FRONTEND_URL}/auth/social-success?token=${accessToken}`
//       );
//     } catch (error) {
//       next(error);
//     }
//   }
// );

// authRouter.get(
//   "/linkedin/callback",
//   passport.authenticate("linkedin", {
//     session: false,
//   }),
//   async (
//     req: Request,
//     res: Response,
//     next: NextFunction
//   ) => {
//     try {
//       const user = req.user as User;

//       const tokenPayload = {
//         userId: user.id,
//         email: user.email,
//         role: user.role,
//       };

//       const accessToken =
//         signAccessToken(tokenPayload);

//       const refreshToken =
//         signRefreshToken(tokenPayload);

//       res.cookie(
//         "refreshToken",
//         refreshToken,
//         {
//           path: "/",
//           httpOnly: true,
//           secure: env.IS_PRODUCTION,
//           sameSite: "strict",
//           maxAge:
//             1000 * 60 * 60 * 24 * 30,
//         }
//       );

//       return res.redirect(
//         `${env.FRONTEND_URL}/auth/social-success?token=${accessToken}`
//       );
//     } catch (error) {
//       next(error);
//     }
//   }
// );



