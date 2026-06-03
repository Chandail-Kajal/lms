/* eslint-disable react/no-unescaped-entities */
"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { toast } from "sonner";
import { useApi } from "@/hooks/useApi";

const schema = yup.object({
  username: yup
    .string()
    .required("Email or Mobile Number is required"),
  password: yup
    .string()
    .required("Password is required"),
  remember: yup.boolean().default(false),
});

type LoginFormData = {
  username: string;
  password: string;
  remember: boolean;
};

const LoginPage = () => {
  const {
    request,
    loading,
    success,
    error,
    message,
  } = useApi();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      remember: false,
    },
  });

  useEffect(() => {
    if (success) {
      toast.success(message || "Login successful 🎉");
    }
  }, [success, message]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const onSubmit = async (
    data: LoginFormData
  ) => {
    const response = await request({
      url: "/auth/login",
      method: "POST",
      body: data,
    });

    if (response) {
      console.log(response);

      // Example:
      // localStorage.setItem(
      //   "accessToken",
      //   response.data.accessToken
      // );

      // router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-indigo-950 to-slate-900 flex items-center justify-center px-4 py-10">
      {/* Decorative Blurs */}
      <div className="absolute top-0 left-0 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl" />

      <div className="relative w-full max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl">
        <div className="grid md:grid-cols-2">
          {/* Left Side */}
          <div className="hidden md:flex flex-col justify-center p-10 bg-linear-to-br from-indigo-900/50 to-slate-900/50">
            <h1 className="text-5xl font-bold text-white leading-tight">
              Welcome
              <span className="block text-cyan-400">
                Back
              </span>
            </h1>

            <p className="mt-6 text-slate-300 text-lg">
              Continue your learning journey and
              access courses, certifications,
              assignments, and events.
            </p>

            <div className="mt-10 flex gap-4">
              <div className="rounded-xl bg-white/10 px-5 py-4">
                <p className="text-2xl font-bold text-cyan-400">
                  100+
                </p>
                <p className="text-sm text-slate-300">
                  Courses
                </p>
              </div>

              <div className="rounded-xl bg-white/10 px-5 py-4">
                <p className="text-2xl font-bold text-cyan-400">
                  10k+
                </p>
                <p className="text-sm text-slate-300">
                  Students
                </p>
              </div>
            </div>
          </div>

          {/* Login Form */}
          <div className="p-6 sm:p-10 flex items-center">
            <div className="w-full">
              <div className="mb-8 text-center">
                <h2 className="text-3xl font-bold text-white">
                  Sign In
                </h2>

                <p className="mt-2 text-slate-400">
                  Login to continue learning
                </p>
              </div>

              <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-5"
              >
                {/* Username */}
                <div>
                  <input
                    type="text"
                    placeholder="Email or Mobile Number"
                    {...register("username")}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
                  />

                  {errors.username && (
                    <p className="mt-1 text-sm text-red-400">
                      {errors.username.message}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <input
                    type="password"
                    placeholder="Password"
                    {...register("password")}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
                  />

                  {errors.password && (
                    <p className="mt-1 text-sm text-red-400">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                {/* Remember Me */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      {...register("remember")}
                      className="h-4 w-4 rounded border-slate-500 bg-transparent accent-cyan-500"
                    />

                    <span className="text-sm text-slate-300">
                      Remember Me
                    </span>
                  </label>
                  <a href="/forgot-password">
                  <button
                    type="button"
                    className="text-sm text-cyan-400 hover:text-cyan-300"
                  >
                    Forgot Password?
                  </button>
                  </a>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-linear-to-r from-cyan-500 to-indigo-500 py-3 font-semibold text-white transition hover:scale-[1.02] hover:shadow-lg hover:shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading
                    ? "Signing In..."
                    : "Sign In"}
                </button>

                <p className="text-center text-sm text-slate-400">
                  Don't have an account?{" "}
                  <span className="cursor-pointer text-cyan-400 hover:text-cyan-300">
                    Create Account
                  </span>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;