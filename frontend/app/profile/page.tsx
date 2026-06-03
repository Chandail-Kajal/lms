/* eslint-disable react/no-unescaped-entities */
"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { toast } from "sonner";
import { useApi } from "@/hooks/useApi";
import router from "next/navigation";
import { Pencil } from "lucide-react";

const profileSchema = yup.object({
  name: yup.string().required("Name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  mobileNumber: yup.string().default(""),
  profilePicture: yup.string().default(""),
});

const passwordSchema = yup.object({
  oldPassword: yup.string().required("Current password is required"),
  newPassword: yup
    .string()
    .min(8, "Password must be at least 8 characters")
    .required("New password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("newPassword")], "Passwords must match")
    .required("Confirm password is required"),
});

type ProfileFormData = {
  name: string;
  email: string;
  mobileNumber: string;
  profilePicture: string;
};

type PasswordFormData = {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
};

const ProfilePage = () => {
  const profileApi = useApi<any>();
  const updateApi = useApi<any>();
  const passwordApi = useApi<any>();

  const [profile, setProfile] = useState<any>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<File | null>(null);

  const profileForm = useForm<ProfileFormData>({
    resolver: yupResolver(profileSchema),
  });

  const passwordForm = useForm<PasswordFormData>({
    resolver: yupResolver(passwordSchema),
  });

  const token =
    typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

  useEffect(() => {
    const loadProfile = async () => {
      const response: any = await profileApi.request({
        url: "/auth/profile",
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const user = response?.data;

      if (user) {
        setProfile(user);
        setPreview(user.profilePicture || null);

        profileForm.reset({
          name: user.name ?? "",
          email: user.email ?? "",
          mobileNumber: user.mobileNumber ?? "",
          profilePicture: user.profilePicture ?? "",
        });
      }
    };

    loadProfile();
  }, []);

  useEffect(() => {
    if (profileApi.error) {
      router.redirect("/login");
    }
  }, [profileApi.loading, profileApi.error]);

  useEffect(() => {
    if (updateApi.success) {
      toast.success(updateApi.message || "Profile updated successfully");
    }
  }, [updateApi.success, updateApi.message]);

  useEffect(() => {
    if (updateApi.error) {
      toast.error(updateApi.error);
    }
  }, [updateApi.error]);

  useEffect(() => {
    if (passwordApi.success) {
      toast.success(passwordApi.message || "Password updated successfully");
      passwordForm.reset();
    }
  }, [passwordApi.success, passwordApi.message]);

  useEffect(() => {
    if (passwordApi.error) {
      toast.error(passwordApi.error);
    }
  }, [passwordApi.error]);

  const onProfileSubmit = async (data: ProfileFormData) => {
    const formData = new FormData();

    formData.append("name", data.name);
    formData.append("email", data.email);
    formData.append("mobileNumber", data.mobileNumber);

    if (profileImage) {
      formData.append("profilePicture", profileImage);
    }

    const response: any = await updateApi.request({
      url: "/auth/profile",
      method: "PUT",
      body: formData,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response?.data) {
      setProfile(response.data);
    }
  };

  const onPasswordSubmit = async (data: PasswordFormData) => {
    await passwordApi.request({
      url: "/auth/profile/change-password",
      method: "POST",
      body: {
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-indigo-950 to-slate-900 px-4 py-10">
      <div className="absolute top-0 left-0 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl" />

      <div className="relative mx-auto max-w-6xl space-y-8">
        {/* PROFILE CARD */}

        <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl">
          <div className="border-b border-white/10 p-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="h-28 w-28 rounded-full border border-white/10 bg-white/5">
                <div className="relative">
                  <div className="h-28 w-28 overflow-hidden rounded-full border border-white/10 bg-white/5">
                    {preview ? (
                      <img
                        src={preview}
                        alt={profile?.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-4xl font-bold text-cyan-400">
                        {profile?.name?.charAt(0)?.toUpperCase()}
                      </div>
                    )}
                  </div>

                  <label
                    htmlFor="profile-image"
                    className="absolute bottom-0 right-0 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-cyan-500 text-white shadow-lg transition hover:scale-110"
                  >
                    <Pencil size={16} />
                  </label>

                  <input
                    id="profile-image"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];

                      if (!file) return;

                      setProfileImage(file);
                      setPreview(URL.createObjectURL(file));
                    }}
                  />
                </div>
              </div>

              <div>
                <h1 className="text-3xl font-bold text-white">
                  {profile?.name}
                </h1>

                <p className="mt-1 text-slate-400">{profile?.email}</p>

                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-full bg-cyan-500/20 px-3 py-1 text-xs text-cyan-300">
                    {profile?.role}
                  </span>

                  <span
                    className={`rounded-full px-3 py-1 text-xs ${
                      profile?.emailVerified
                        ? "bg-green-500/20 text-green-300"
                        : "bg-yellow-500/20 text-yellow-300"
                    }`}
                  >
                    {profile?.emailVerified
                      ? "Email Verified"
                      : "Email Not Verified"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8">
            <h2 className="mb-6 text-2xl font-bold text-white">
              Profile Information
            </h2>

            <form
              onSubmit={profileForm.handleSubmit(onProfileSubmit)}
              className="grid gap-5 md:grid-cols-2"
            >
              <div>
                <input
                  {...profileForm.register("name")}
                  placeholder="Full Name"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-cyan-400"
                />

                <p className="mt-1 text-sm text-red-400">
                  {profileForm.formState.errors.name?.message}
                </p>
              </div>

              <div>
                <input
                  {...profileForm.register("email")}
                  readOnly={profile?.emailVerified}
                  placeholder="Email"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-cyan-400"
                />

                <p className="mt-1 text-sm text-red-400">
                  {profileForm.formState.errors.email?.message}
                </p>
              </div>

              <div>
                <input
                  {...profileForm.register("mobileNumber")}
                  placeholder="Mobile Number"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-cyan-400"
                />

                <p className="mt-1 text-sm text-red-400">
                  {profileForm.formState.errors.mobileNumber?.message}
                </p>
              </div>

              <div className="md:col-span-2">
                <button
                  type="submit"
                  disabled={updateApi.loading}
                  className="rounded-xl bg-linear-to-r from-cyan-500 to-indigo-500 px-8 py-3 font-semibold text-white transition hover:scale-[1.02] disabled:opacity-50"
                >
                  {updateApi.loading ? "Updating..." : "Update Profile"}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* ACCOUNT INFO */}

        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
          <h2 className="mb-6 text-2xl font-bold text-white">
            Account Information
          </h2>

          <div className="grid gap-6 md:grid-cols-3">
            <div>
              <p className="text-sm text-slate-400">Role</p>
              <p className="mt-1 text-white">{profile?.role}</p>
            </div>

            <div>
              <p className="text-sm text-slate-400">Email Status</p>
              <p className="mt-1 text-white">
                {profile?.emailVerified ? "Verified" : "Pending Verification"}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-400">Member Since</p>
              <p className="mt-1 text-white">
                {profile?.createdAt
                  ? new Date(profile.createdAt).toLocaleDateString()
                  : "-"}
              </p>
            </div>
          </div>
        </div>

        {/* PASSWORD CARD */}

        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
          <h2 className="mb-6 text-2xl font-bold text-white">
            Change Password
          </h2>

          <form
            onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
            className="grid gap-5 md:grid-cols-2"
          >
            <div className="md:col-span-2">
              <input
                type="password"
                placeholder="Current Password"
                {...passwordForm.register("oldPassword")}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-cyan-400"
              />

              <p className="mt-1 text-sm text-red-400">
                {passwordForm.formState.errors.oldPassword?.message}
              </p>
            </div>

            <div>
              <input
                type="password"
                placeholder="New Password"
                {...passwordForm.register("newPassword")}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-cyan-400"
              />

              <p className="mt-1 text-sm text-red-400">
                {passwordForm.formState.errors.newPassword?.message}
              </p>
            </div>

            <div>
              <input
                type="password"
                placeholder="Confirm Password"
                {...passwordForm.register("confirmPassword")}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-cyan-400"
              />

              <p className="mt-1 text-sm text-red-400">
                {passwordForm.formState.errors.confirmPassword?.message}
              </p>
            </div>

            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={passwordApi.loading}
                className="rounded-xl bg-linear-to-r from-cyan-500 to-indigo-500 px-8 py-3 font-semibold text-white transition hover:scale-[1.02] disabled:opacity-50"
              >
                {passwordApi.loading ? "Updating..." : "Change Password"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
