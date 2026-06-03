/* eslint-disable @next/next/no-img-element */
"use client"
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useApi } from "@/hooks/useApi";
import { toast } from "sonner";

const schema = yup.object({
    name: yup.string().required("Name is required"),
    email: yup
        .string()
        .email("Enter a valid email")
        .required("Email is required"),
    mobileNumber: yup
        .string()
        .matches(/^[0-9]{10}$/, "Enter a valid mobile number")
        .required("Mobile number is required"),
    password: yup
        .string()
        .min(8, "Minimum 8 characters")
        .required("Password is required"),
    confirmPassword: yup
        .string()
        .oneOf([yup.ref("password")], "Passwords do not match")
        .required("Confirm password is required"),
    profilePicture: yup.mixed<FileList>().optional(),
});
const otpSchema = yup.object({
    otp: yup
        .string()
        .length(6, "OTP must be 6 digits")
        .required("OTP is required"),
});

type OtpFormData = {
    otp: string;
};

type RegistrationFormData = {
    name: string;
    email: string;
    mobileNumber: string;
    password: string;
    confirmPassword: string;
    profilePicture?: FileList;
};

const RegistrationPage = () => {
    const [preview, setPreview] = useState<string | null>(null);
    const [step, setStep] = useState<"register" | "verify">(
        "register"
    );

    const [registeredEmail, setRegisteredEmail] =
        useState("");
    const {
        request,
        loading,
        error,
        success,
        message,
    } = useApi();
    const verifyApi = useApi();
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<RegistrationFormData>({
        resolver: yupResolver(schema),
    });
    const {
        register: registerOtp,
        handleSubmit: handleOtpSubmit,
        formState: { errors: otpErrors },
    } = useForm<OtpFormData>({
        resolver: yupResolver(otpSchema),
    });
    useEffect(() => {
        if (success) {
            toast.success(message || "Registration successful 🎉");
        }
    }, [success, message]);

    useEffect(() => {
        if (error) {
            toast.error(error);
        }
    }, [error]);

    const onSubmit = async (
        data: RegistrationFormData
    ) => {
        const formData = new FormData();

        formData.append("name", data.name);
        formData.append("email", data.email);
        formData.append(
            "mobileNumber",
            data.mobileNumber
        );
        formData.append("password", data.password);

        if (data.profilePicture?.[0]) {
            formData.append(
                "profilePicture",
                data.profilePicture[0]
            );
        }

        const response = await request({
            url: "/auth/register",
            method: "POST",
            body: formData,
        });

        if (response) {
            setRegisteredEmail(data.email);
            setStep("verify");
        }
    };
    const onVerifyOtp = async (
        data: OtpFormData
    ) => {
        const response =
            await verifyApi.request({
                url: "/auth/verify-email",
                method: "POST",
                body: {
                    email: registeredEmail,
                    otp: data.otp,
                },
            });

        if (response) {
            toast.success(
                "Email verified successfully 🎉"
            );

            // router.push("/login")
        }
    };
    const resendOtp = async () => {
        await verifyApi.request({
            url: "/auth/resend-verification",
            method: "POST",
            body: {
                email: registeredEmail,
            },
        });
    };

    return (
        <div className="min-h-screen bg-linear-to-br from-slate-950 via-indigo-950 to-slate-900 flex items-center justify-center px-4 py-10">
            {/* Decorative Blur */}
            <div className="absolute top-0 left-0 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl" />
            <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl" />

            <div className="relative w-full max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl">
                <div className="grid md:grid-cols-2">
                    {/* Left Side */}
                    <div className="hidden md:flex flex-col justify-center p-10 bg-linear-to-br from-indigo-900/50 to-slate-900/50">
                        <h1 className="text-5xl font-bold text-white leading-tight">
                            Start Your
                            <span className="block text-cyan-400">
                                Learning Journey
                            </span>
                        </h1>

                        <p className="mt-6 text-slate-300 text-lg">
                            Create your account and access courses, certifications,
                            events, and learning resources.
                        </p>

                        <div className="mt-10 flex gap-4">
                            <div className="rounded-xl bg-white/10 px-5 py-4">
                                <p className="text-2xl font-bold text-cyan-400">100+</p>
                                <p className="text-sm text-slate-300">Courses</p>
                            </div>

                            <div className="rounded-xl bg-white/10 px-5 py-4">
                                <p className="text-2xl font-bold text-cyan-400">10k+</p>
                                <p className="text-sm text-slate-300">Students</p>
                            </div>
                        </div>
                    </div>

                    {/* Form */}
                    <div className="p-6 sm:p-10">
                        <div className="mb-8 text-center">
                            <h2 className="text-3xl font-bold text-white">
                                Create Account
                            </h2>

                            <p className="mt-2 text-slate-400">
                                Register to continue
                            </p>
                        </div>

                        {step === "register" ? <form
                            onSubmit={handleSubmit(onSubmit)}
                            className="space-y-5"
                        >
                            {/* Profile Upload */}
                            <div className="flex flex-col items-center">
                                <label className="cursor-pointer">
                                    <div className="h-24 w-24 overflow-hidden rounded-full border-4 border-cyan-500/30 bg-slate-800 flex items-center justify-center">
                                        {preview ? (
                                            <img
                                                src={preview}
                                                alt="preview"
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-3xl text-slate-400">
                                                👤
                                            </span>
                                        )}
                                    </div>

                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        {...register("profilePicture")}
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                setPreview(URL.createObjectURL(file));
                                            }
                                        }}
                                    />
                                </label>

                                <span className="mt-2 text-xs text-slate-400">
                                    Upload Profile Picture (Optional)
                                </span>
                            </div>

                            {/* Name */}
                            <div>
                                <input
                                    type="text"
                                    placeholder="Full Name"
                                    {...register("name")}
                                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
                                />
                                {errors.name && (
                                    <p className="mt-1 text-sm text-red-400">
                                        {errors.name.message}
                                    </p>
                                )}
                            </div>

                            {/* Email */}
                            <div>
                                <input
                                    type="email"
                                    placeholder="Email Address"
                                    {...register("email")}
                                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
                                />
                                {errors.email && (
                                    <p className="mt-1 text-sm text-red-400">
                                        {errors.email.message}
                                    </p>
                                )}
                            </div>

                            {/* Mobile */}
                            <div>
                                <input
                                    type="text"
                                    placeholder="Mobile Number"
                                    {...register("mobileNumber")}
                                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
                                />
                                {errors.mobileNumber && (
                                    <p className="mt-1 text-sm text-red-400">
                                        {errors.mobileNumber.message}
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

                            {/* Confirm Password */}
                            <div>
                                <input
                                    type="password"
                                    placeholder="Confirm Password"
                                    {...register("confirmPassword")}
                                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
                                />
                                {errors.confirmPassword && (
                                    <p className="mt-1 text-sm text-red-400">
                                        {errors.confirmPassword.message}
                                    </p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full rounded-xl bg-linear-to-r from-cyan-500 to-indigo-500 py-3 font-semibold text-white transition hover:scale-[1.02] hover:shadow-lg hover:shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? "Creating Account..." : "Create Account"}
                            </button>
                            <p className="text-center text-sm text-slate-400">
                                Already have an account?{" "}
                                <span className="cursor-pointer text-cyan-400 hover:text-cyan-300">
                                    Sign In
                                </span>
                            </p>
                        </form> :
                            <form
                                onSubmit={handleOtpSubmit(onVerifyOtp)}
                                className="space-y-5"
                            >
                                <div className="text-center">
                                    <h2 className="text-3xl font-bold text-white">
                                        Verify Email
                                    </h2>

                                    <p className="mt-2 text-slate-400">
                                        We have sent a verification code to
                                    </p>

                                    <p className="font-medium text-cyan-400">
                                        {registeredEmail}
                                    </p>
                                </div>

                                <div>
                                    <input
                                        type="text"
                                        maxLength={6}
                                        placeholder="Enter OTP"
                                        {...registerOtp("otp")}
                                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-center text-xl tracking-[0.5em] text-white outline-none focus:border-cyan-400"
                                    />

                                    {otpErrors.otp && (
                                        <p className="mt-1 text-sm text-red-400">
                                            {otpErrors.otp.message}
                                        </p>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={verifyApi.loading}
                                    className="w-full rounded-xl bg-linear-to-r from-cyan-500 to-indigo-500 py-3 font-semibold text-white"
                                >
                                    {verifyApi.loading
                                        ? "Verifying..."
                                        : "Verify OTP"}
                                </button>

                                <button
                                    type="button"
                                    onClick={resendOtp}
                                    className="w-full text-cyan-400 hover:text-cyan-300"
                                >
                                    Resend OTP
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setStep("register")}
                                    className="w-full text-slate-400 hover:text-slate-300"
                                >
                                    Back to Registration
                                </button>
                            </form>
                        }
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegistrationPage;