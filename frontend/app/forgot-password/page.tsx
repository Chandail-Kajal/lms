/* eslint-disable react/no-unescaped-entities */
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { toast } from "sonner";
import { useApi } from "@/hooks/useApi";

const emailSchema = yup.object({
  email: yup
    .string()
    .email("Enter a valid email")
    .required("Email is required"),
});

const otpSchema = yup.object({
  otp: yup
    .string()
    .required("OTP is required")
    .length(6, "OTP must be 6 digits"),
});

const passwordSchema = yup.object({
  password: yup
    .string()
    .required("Password is required")
    .min(
      8,
      "Password must be at least 8 characters"
    ),

  confirmPassword: yup
    .string()
    .required("Confirm Password is required")
    .oneOf(
      [yup.ref("password")],
      "Passwords must match"
    ),
});

type EmailFormData = {
  email: string;
};

type OtpFormData = {
  otp: string;
};

type PasswordFormData = {
  password: string;
  confirmPassword: string;
};

const ForgotPasswordPage = () => {
  const router = useRouter();

  const {
    request,
    loading,
    success,
    error,
    message,
  } = useApi();

  const [step, setStep] =
    useState(1);

  const [email, setEmail] =
    useState("");

  const [otp, setOtp] =
    useState("");

  useEffect(() => {
    if (success && message) {
      toast.success(message);
    }
  }, [success, message]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // EMAIL FORM

  const {
    register:
      registerEmail,
    handleSubmit:
      handleEmailSubmit,
    formState: {
      errors: emailErrors,
    },
  } = useForm<EmailFormData>({
    resolver: yupResolver(
      emailSchema
    ),
  });

  // OTP FORM

  const {
    register:
      registerOtp,
    handleSubmit:
      handleOtpSubmit,
    formState: {
      errors: otpErrors,
    },
  } = useForm<OtpFormData>({
    resolver: yupResolver(
      otpSchema
    ),
  });

  // PASSWORD FORM

  const {
    register:
      registerPassword,
    handleSubmit:
      handlePasswordSubmit,
    formState: {
      errors:
        passwordErrors,
    },
  } =
    useForm<PasswordFormData>({
      resolver:
        yupResolver(
          passwordSchema
        ),
    });

  const sendOtp = async (
    data: EmailFormData
  ) => {
    const response =
      await request({
        url:
          "/auth/forgot-password",
        method: "POST",
        body: data,
      });

    if (response) {
      setEmail(data.email);
      setStep(2);
    }
  };

  const verifyOtp = async (
    data: OtpFormData
  ) => {
    const response =
      await request({
        url:
          "/auth/verify-reset-otp",
        method: "POST",
        body: {
          email,
          otp: data.otp,
        },
      });

    if (response) {
      setOtp(data.otp);
      setStep(3);
    }
  };

  const resetPassword =
    async (
      data: PasswordFormData
    ) => {
      const response =
        await request({
          url:
            "/auth/reset-password",
          method: "POST",
          body: {
            email,
            otp,
            password:
              data.password,
          },
        });

      if (response) {
        setStep(4);
      }
    };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-indigo-950 to-slate-900 flex items-center justify-center px-4 py-10">
      {/* Background Effects */}
      <div className="absolute top-0 left-0 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl" />

      <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl p-8">
        {/* STEP 1 */}
        {step === 1 && (
          <>
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white">
                Forgot Password
              </h1>

              <p className="mt-3 text-slate-400">
                Enter your email
                address and we'll
                send you a reset
                OTP.
              </p>
            </div>

            <form
              onSubmit={handleEmailSubmit(
                sendOtp
              )}
              className="space-y-5"
            >
              <div>
                <input
                  type="email"
                  placeholder="Enter your email"
                  {...registerEmail(
                    "email"
                  )}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-cyan-400"
                />

                {emailErrors.email && (
                  <p className="mt-1 text-sm text-red-400">
                    {
                      emailErrors
                        .email
                        .message
                    }
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={
                  loading
                }
                className="w-full rounded-xl bg-linear-to-r from-cyan-500 to-indigo-500 py-3 font-semibold text-white disabled:opacity-50"
              >
                {loading
                  ? "Sending..."
                  : "Send OTP"}
              </button>
            </form>
          </>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <>
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white">
                Verify OTP
              </h1>

              <p className="mt-3 text-slate-400">
                Enter the OTP sent
                to
              </p>

              <p className="text-cyan-400 mt-1">
                {email}
              </p>
            </div>

            <form
              onSubmit={handleOtpSubmit(
                verifyOtp
              )}
              className="space-y-5"
            >
              <div>
                <input
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  maxLength={
                    6
                  }
                  {...registerOtp(
                    "otp"
                  )}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-center tracking-[8px] text-white outline-none focus:border-cyan-400"
                />

                {otpErrors.otp && (
                  <p className="mt-1 text-sm text-red-400">
                    {
                      otpErrors
                        .otp
                        .message
                    }
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={
                  loading
                }
                className="w-full rounded-xl bg-linear-to-r from-cyan-500 to-indigo-500 py-3 font-semibold text-white disabled:opacity-50"
              >
                {loading
                  ? "Verifying..."
                  : "Verify OTP"}
              </button>
            </form>
          </>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <>
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white">
                Reset Password
              </h1>

              <p className="mt-3 text-slate-400">
                Create a new secure
                password.
              </p>
            </div>

            <form
              onSubmit={handlePasswordSubmit(
                resetPassword
              )}
              className="space-y-5"
            >
              <div>
                <input
                  type="password"
                  placeholder="New Password"
                  {...registerPassword(
                    "password"
                  )}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-cyan-400"
                />

                {passwordErrors.password && (
                  <p className="mt-1 text-sm text-red-400">
                    {
                      passwordErrors
                        .password
                        .message
                    }
                  </p>
                )}
              </div>

              <div>
                <input
                  type="password"
                  placeholder="Confirm Password"
                  {...registerPassword(
                    "confirmPassword"
                  )}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-cyan-400"
                />

                {passwordErrors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-400">
                    {
                      passwordErrors
                        .confirmPassword
                        .message
                    }
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={
                  loading
                }
                className="w-full rounded-xl bg-linear-to-r from-cyan-500 to-indigo-500 py-3 font-semibold text-white disabled:opacity-50"
              >
                {loading
                  ? "Updating..."
                  : "Reset Password"}
              </button>
            </form>
          </>
        )}

        {/* STEP 4 */}
        {step === 4 && (
          <div className="text-center">
            <div className="text-6xl mb-4">
              🎉
            </div>

            <h2 className="text-3xl font-bold text-white">
              Success
            </h2>

            <p className="mt-3 text-slate-400">
              Your password has
              been reset
              successfully.
            </p>

            <button
              onClick={() =>
                router.push(
                  "/login"
                )
              }
              className="mt-6 w-full rounded-xl bg-linear-to-r from-cyan-500 to-indigo-500 py-3 font-semibold text-white"
            >
              Back To Login
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={() =>
            router.back()
          }
          className="mt-6 w-full text-center text-sm text-cyan-400 hover:text-cyan-300"
        >
          Back
        </button>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;