import { User, VerificationType } from "@/generated/prisma/client";
import bcrypt from "bcrypt"
import { ApiError } from "@/shared/utils";
import { prisma } from "@/config/prisma";
import { generateOTP } from "@/shared/utils/generateOTP";
import { verificationEmailTemplate } from "@/templates/verification-email.template"
import { mailer } from "@/config/mailer";

export const login = async (
  username: string,
  password: string,
) => {
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        {
          email: username.toLowerCase(),
        },
        {
          mobileNumber: username,
        },
      ],
      isDeleted: false,
      isActive: true,
    },
  });

  if (!user) {
    throw new ApiError(401, "Invalid credentials");
  
  }
  console.log(user);

  if(!user.emailVerified){
    throw new ApiError(401, "Please verify email before login")
  }

  if (!user.password) {
    throw new ApiError(
      401,
      "Please login using your social account"
    );
  }

  const isPasswordValid = await bcrypt.compare(
    password,
    user.password
  );

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid credentials");
  }

  return user;
};



export const registerUser = async (
  user: Partial<User>
) => {
  const existing =
    await prisma.user.findUnique({
      where: {
        email: user.email,
      },
    });

  if (existing) {
    throw new ApiError(
      409,
      "User already exists with this email"
    );
  }

  const passwordHash =
    await bcrypt.hash(
      user.password as string,
      10
    );

  const createdUser =
    await prisma.user.create({
      data: {
        ...user,
        password: passwordHash,
      } as User,
    });

  const otp = generateOTP();

  await prisma.verificationToken.create({
    data: {
      userId: createdUser.id,
      otp,
      type: "EMAIL_VERIFICATION",
      expiresAt: new Date(
        Date.now() + 10 * 60 * 1000
      ),
    },
  });

  await mailer.sendMail({
    to: createdUser.email,
    subject: "Verify Your Email",
    html: verificationEmailTemplate(
      createdUser.name,
      otp
    ),
    attachments: [],
  });

  return {
    id: createdUser.id,
    email: createdUser.email,
    emailVerified:
      createdUser.emailVerified,
  };
};


export const resendVerificationOTP =
  async (email: string) => {
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

    const otp = generateOTP();

    await prisma.verificationToken.deleteMany({
      where: {
        userId: user.id,
        verified: false,
        type: "EMAIL_VERIFICATION",
      },
    });

    await prisma.verificationToken.create({
      data: {
        userId: user.id,
        otp,
        type: "EMAIL_VERIFICATION",
        expiresAt: new Date(
          Date.now() + 10 * 60 * 1000
        ),
      },
    });

    await mailer.sendMail({
      to: user.email,
      subject: "Verify Your Email",
      html: verificationEmailTemplate(
        user.name,
        otp
      ),
      attachments: [],
    });
  };

  export const forgotPassword = async (
  email: string
) => {
  const user = await prisma.user.findFirst({
    where: {
      email: email.toLowerCase(),
      isDeleted: false,
      isActive: true,
    },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const otp = Math.floor(
    100000 + Math.random() * 900000
  ).toString();

  await prisma.verificationToken.deleteMany({
    where: {
      userId: user.id,
      type: VerificationType.PASSWORD_RESET,
      verified: false,
    },
  });

  await prisma.verificationToken.create({
    data: {
      userId: user.id,
      otp,
      type: VerificationType.PASSWORD_RESET,
      expiresAt: new Date(
        Date.now() + 10 * 60 * 1000
      ), // 10 minutes
    },
  });

  return {
    user,
    otp,
  };
};

export const verifyPasswordResetOtp =
  async (
    email: string,
    otp: string
  ) => {
    const user =
      await prisma.user.findUnique({
        where: {
          email:
            email.toLowerCase(),
        },
      });

    if (!user) {
      throw new ApiError(
        404,
        "User not found"
      );
    }

    const verificationToken =
      await prisma.verificationToken.findFirst({
        where: {
          userId: user.id,
          otp,
          type: VerificationType.PASSWORD_RESET,
          verified: false,
          expiresAt: {
            gt: new Date(),
          },
        },
      });

    if (!verificationToken) {
      throw new ApiError(
        400,
        "Invalid or expired OTP"
      );
    }

    await prisma.verificationToken.update({
      where: {
        id: verificationToken.id,
      },
      data: {
        verified: true,
      },
    });

    return user;
  };
  export const resetPassword =
  async (
    email: string,
    password: string
  ) => {
    const user =
      await prisma.user.findUnique({
        where: {
          email:
            email.toLowerCase(),
        },
      });

    if (!user) {
      throw new ApiError(
        404,
        "User not found"
      );
    }

    const verifiedToken =
      await prisma.verificationToken.findFirst({
        where: {
          userId: user.id,
          type: VerificationType.PASSWORD_RESET,
          verified: true,
          expiresAt: {
            gt: new Date(),
          },
        },
      });

    if (!verifiedToken) {
      throw new ApiError(
        400,
        "Please verify OTP first"
      );
    }

    const hashedPassword =
      await bcrypt.hash(
        password,
        10
      );

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        password:
          hashedPassword,
      },
    });

    await prisma.verificationToken.deleteMany({
      where: {
        userId: user.id,
        type: VerificationType.PASSWORD_RESET,
      },
    });

    return true;
  };
  
  export const changePassword = async (
  userId: string,
  previousPassword: string | undefined,
  newPassword: string,
  confirmPassword: string
) => {
  if (!newPassword || !confirmPassword) {
    throw new ApiError(400, "New password and confirm password are required");
  }

  if (newPassword !== confirmPassword) {
    throw new ApiError(400, "New password and confirm password do not match");
  }

  if (newPassword.length < 8) {
    throw new ApiError(400, "New password must be at least 8 characters long");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // If user already has a password AND caller supplied the old one, verify it
  if (user.password && previousPassword) {
    const isValid = await bcrypt.compare(previousPassword, user.password);
    if (!isValid) {
      throw new ApiError(400, "Previous password is incorrect");
    }
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });

  return true;
};
