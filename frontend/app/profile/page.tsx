/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useRef } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface UserProfile {
  id: string;
  name: string;
  email: string;
  mobileNumber?: string | null;
  role: string;
  profilePicture?: string | null;
  emailVerified: boolean;
  createdAt: string;
}

// ─── API helpers ──────────────────────────────────────────────────────────────
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api/v1";

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("accessToken");
}

async function fetchProfile(): Promise<UserProfile> {
  const res = await fetch(`${API_BASE}/auth/profile`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!res.ok) throw new Error("Failed to fetch profile");
  const json = await res.json();
  return json.data;
}

async function updateProfile(data: Partial<UserProfile>) {
  const res = await fetch(`${API_BASE}/auth/profile`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message ?? "Failed to update profile");
  }
  return res.json();
}

async function changePassword(payload: {
  previousPassword?: string;
  newPassword: string;
  confirmPassword: string;
}) {
  const res = await fetch(`${API_BASE}/auth/profile/change-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message ?? "Failed to change password");
  }
  return res.json();
}

// ─── Avatar initials ──────────────────────────────────────────────────────────
function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// ─── Eye icon ─────────────────────────────────────────────────────────────────
function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ message, type, onClose }: { message: string; type: "success" | "error"; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div
      style={{
        position: "fixed",
        bottom: "2rem",
        right: "2rem",
        zIndex: 9999,
        background: type === "success" ? "var(--sage)" : "#e07070",
        color: "#fff",
        padding: "0.85rem 1.4rem",
        borderRadius: "14px",
        fontFamily: "var(--font-body)",
        fontSize: "0.875rem",
        fontWeight: 500,
        boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
        animation: "slideUp 0.3s cubic-bezier(.34,1.56,.64,1)",
        display: "flex",
        alignItems: "center",
        gap: "0.6rem",
      }}
    >
      {type === "success" ? "✦" : "✕"} {message}
    </div>
  );
}

// ─── Change Password Modal ────────────────────────────────────────────────────
function ChangePasswordModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({ previousPassword: "", newPassword: "", confirmPassword: "" });
  const [show, setShow] = useState({ prev: false, next: false, confirm: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  function handleOverlayClick(e: React.MouseEvent) {
    if (e.target === overlayRef.current) onClose();
  }

  async function handleSubmit() {
    setError("");
    if (!form.newPassword || !form.confirmPassword) {
      setError("New password and confirm password are required.");
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    if (form.newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    try {
      await changePassword({
        ...(form.previousPassword ? { previousPassword: form.previousPassword } : {}),
        newPassword: form.newPassword,
        confirmPassword: form.confirmPassword,
      });
      setSuccess(true);
      setTimeout(onClose, 1600);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  const pwField = (
    key: "previousPassword" | "newPassword" | "confirmPassword",
    label: string,
    showKey: "prev" | "next" | "confirm",
    placeholder: string
  ) => (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
      <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--muted)", letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "var(--font-body)" }}>
        {label}
      </label>
      <div style={{ position: "relative" }}>
        <input
          type={show[showKey] ? "text" : "password"}
          placeholder={placeholder}
          value={form[key]}
          onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
          style={{
            width: "100%",
            padding: "0.75rem 2.8rem 0.75rem 1rem",
            borderRadius: "12px",
            border: "1.5px solid var(--border)",
            background: "var(--input-bg)",
            fontFamily: "var(--font-body)",
            fontSize: "0.9rem",
            color: "var(--text)",
            outline: "none",
            transition: "border-color 0.2s",
            boxSizing: "border-box",
          }}
          onFocus={(e) => (e.target.style.borderColor = "var(--sage)")}
          onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
        />
        <button
          type="button"
          onClick={() => setShow((s) => ({ ...s, [showKey]: !s[showKey] }))}
          style={{
            position: "absolute",
            right: "0.85rem",
            top: "50%",
            transform: "translateY(-50%)",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--muted)",
            padding: 0,
            display: "flex",
          }}
        >
          <EyeIcon open={show[showKey]} />
        </button>
      </div>
    </div>
  );

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(30,34,30,0.35)",
        backdropFilter: "blur(6px)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
    >
      <div
        style={{
          background: "var(--card)",
          borderRadius: "24px",
          padding: "2.5rem",
          width: "100%",
          maxWidth: "420px",
          boxShadow: "0 24px 80px rgba(0,0,0,0.18)",
          animation: "popIn 0.35s cubic-bezier(.34,1.56,.64,1)",
          position: "relative",
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "1.2rem",
            right: "1.2rem",
            background: "var(--chip-bg)",
            border: "none",
            borderRadius: "50%",
            width: "32px",
            height: "32px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--muted)",
            fontSize: "1rem",
            transition: "background 0.2s",
          }}
        >
          ✕
        </button>

        {/* Header */}
        <div style={{ marginBottom: "1.8rem" }}>
          <div style={{
            width: "48px",
            height: "48px",
            borderRadius: "14px",
            background: "var(--sage-light)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.4rem",
            marginBottom: "1rem",
          }}>
            🔑
          </div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", color: "var(--text)", margin: 0, fontWeight: 700 }}>
            Change Password
          </h2>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "0.875rem", color: "var(--muted)", margin: "0.3rem 0 0" }}>
            Keep your account safe with a strong password.
          </p>
        </div>

        {success ? (
          <div style={{
            textAlign: "center",
            padding: "2rem 0",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0.75rem",
          }}>
            <div style={{ fontSize: "3rem" }}>✦</div>
            <p style={{ fontFamily: "var(--font-body)", color: "var(--sage-dark)", fontWeight: 600, fontSize: "1rem" }}>
              Password updated!
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
            {pwField("previousPassword", "Previous Password (optional)", "prev", "Leave blank if not set")}
            {pwField("newPassword", "New Password", "next", "Min. 8 characters")}
            {pwField("confirmPassword", "Confirm Password", "confirm", "Repeat new password")}

            {error && (
              <p style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.83rem",
                color: "#c0504d",
                background: "#fdf0f0",
                padding: "0.65rem 0.9rem",
                borderRadius: "10px",
                margin: 0,
              }}>
                {error}
              </p>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                marginTop: "0.4rem",
                padding: "0.9rem",
                borderRadius: "14px",
                background: loading ? "var(--border)" : "var(--sage)",
                color: "#fff",
                border: "none",
                fontFamily: "var(--font-body)",
                fontWeight: 700,
                fontSize: "0.95rem",
                cursor: loading ? "not-allowed" : "pointer",
                letterSpacing: "0.03em",
                transition: "background 0.2s, transform 0.15s",
              }}
              onMouseEnter={(e) => !loading && ((e.target as HTMLButtonElement).style.background = "var(--sage-dark)")}
              onMouseLeave={(e) => !loading && ((e.target as HTMLButtonElement).style.background = "var(--sage)")}
            >
              {loading ? "Updating…" : "Update Password"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", mobileNumber: "" });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const settingsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchProfile()
      .then((data) => {
        setProfile(data);
        setEditForm({ name: data.name, mobileNumber: data.mobileNumber ?? "" });
      })
      .catch(() => setToast({ message: "Could not load profile.", type: "error" }))
      .finally(() => setLoading(false));
  }, []);

  // close settings dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        setShowSettings(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function handleSave() {
    setSaving(true);
    try {
      const updated = await updateProfile({
        name: editForm.name,
        mobileNumber: editForm.mobileNumber || undefined,
      });
      setProfile(updated.data);
      setEditing(false);
      setToast({ message: "Profile updated!", type: "success" });
    } catch (e: any) {
      setToast({ message: e.message, type: "error" });
    } finally {
      setSaving(false);
    }
  }

  const joinDate = profile
    ? new Date(profile.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : "";

  return (
    <>
      {/* ── Global styles ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@400;500;600;700&display=swap');

        :root {
          --font-display: 'Fraunces', Georgia, serif;
          --font-body: 'DM Sans', sans-serif;
          --bg: #f5f4ef;
          --card: #ffffff;
          --card-alt: #f9f8f3;
          --text: #1c1e1a;
          --muted: #7a7d74;
          --border: #e4e3db;
          --sage: #5a7a5e;
          --sage-dark: #3f5c43;
          --sage-light: #d4e8d7;
          --teal: #4a8080;
          --teal-light: #d0e8e8;
          --amber: #b58a3a;
          --amber-light: #f0e4c8;
          --chip-bg: #f0efe8;
          --input-bg: #fafaf6;
          --shadow: 0 2px 16px rgba(0,0,0,0.07);
          --shadow-lg: 0 8px 40px rgba(0,0,0,0.10);
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          background: var(--bg);
          font-family: var(--font-body);
          color: var(--text);
          min-height: 100vh;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.92); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .page-enter { animation: fadeIn 0.5s cubic-bezier(.25,.8,.25,1) both; }
        .card-enter { animation: fadeIn 0.5s cubic-bezier(.25,.8,.25,1) both; }
        .card-enter:nth-child(2) { animation-delay: 0.07s; }
        .card-enter:nth-child(3) { animation-delay: 0.14s; }

        input::placeholder { color: #b0b3aa; }
        input:focus { outline: none; }
        button:focus-visible { outline: 2px solid var(--sage); outline-offset: 2px; }
      `}</style>

      {/* ── Background decoration ── */}
      <div style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        overflow: "hidden",
        zIndex: 0,
      }}>
        <div style={{
          position: "absolute",
          top: "-120px",
          right: "-80px",
          width: "480px",
          height: "480px",
          borderRadius: "50%",
          background: "radial-gradient(circle, var(--sage-light) 0%, transparent 70%)",
          opacity: 0.5,
        }} />
        <div style={{
          position: "absolute",
          bottom: "-80px",
          left: "-60px",
          width: "360px",
          height: "360px",
          borderRadius: "50%",
          background: "radial-gradient(circle, var(--teal-light) 0%, transparent 70%)",
          opacity: 0.4,
        }} />
      </div>

      {/* ── Page wrapper ── */}
      <main style={{
        position: "relative",
        zIndex: 1,
        minHeight: "100vh",
        padding: "3rem 1.5rem",
        maxWidth: "760px",
        margin: "0 auto",
      }}>

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", paddingTop: "8rem" }}>
            <div style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              border: "3px solid var(--border)",
              borderTopColor: "var(--sage)",
              animation: "spin 0.8s linear infinite",
            }} />
          </div>
        ) : profile ? (
          <div className="page-enter">

            {/* ── Header row ── */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2.5rem" }}>
              <div>
                <p style={{ fontFamily: "var(--font-body)", fontSize: "0.78rem", fontWeight: 600, color: "var(--muted)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "0.3rem" }}>
                  Your Account
                </p>
                <h1 style={{ fontFamily: "var(--font-display)", fontSize: "2.2rem", fontWeight: 700, color: "var(--text)", lineHeight: 1.15 }}>
                  Profile
                </h1>
              </div>

              {/* Settings button */}
              <div style={{ position: "relative" }} ref={settingsRef}>
                <button
                  onClick={() => setShowSettings((s) => !s)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.6rem 1.1rem",
                    borderRadius: "40px",
                    border: "1.5px solid var(--border)",
                    background: showSettings ? "var(--chip-bg)" : "var(--card)",
                    cursor: "pointer",
                    fontFamily: "var(--font-body)",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    color: "var(--text)",
                    transition: "background 0.2s, border-color 0.2s",
                    boxShadow: "var(--shadow)",
                  }}
                >
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                  </svg>
                  Settings
                </button>

                {/* Dropdown */}
                {showSettings && (
                  <div style={{
                    position: "absolute",
                    top: "calc(100% + 8px)",
                    right: 0,
                    background: "var(--card)",
                    border: "1.5px solid var(--border)",
                    borderRadius: "16px",
                    padding: "0.5rem",
                    minWidth: "210px",
                    boxShadow: "var(--shadow-lg)",
                    animation: "popIn 0.2s cubic-bezier(.34,1.56,.64,1)",
                    zIndex: 100,
                  }}>
                    <button
                      onClick={() => { setShowSettings(false); setShowChangePassword(true); }}
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                        padding: "0.75rem 1rem",
                        borderRadius: "12px",
                        border: "none",
                        background: "none",
                        cursor: "pointer",
                        fontFamily: "var(--font-body)",
                        fontSize: "0.9rem",
                        fontWeight: 600,
                        color: "var(--text)",
                        textAlign: "left",
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "var(--chip-bg)")}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "none")}
                    >
                      <span style={{ fontSize: "1rem" }}>🔑</span>
                      Change Password
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* ── Hero card ── */}
            <div className="card-enter" style={{
              background: "var(--card)",
              borderRadius: "24px",
              padding: "2.5rem",
              marginBottom: "1.25rem",
              boxShadow: "var(--shadow-lg)",
              border: "1px solid var(--border)",
              display: "flex",
              gap: "2rem",
              alignItems: "flex-start",
              flexWrap: "wrap",
            }}>
              {/* Avatar */}
              <div style={{ flexShrink: 0 }}>
                {profile.profilePicture ? (
                  <img
                    src={profile.profilePicture}
                    alt={profile.name}
                    style={{ width: "88px", height: "88px", borderRadius: "50%", objectFit: "cover", border: "3px solid var(--sage-light)" }}
                  />
                ) : (
                  <div style={{
                    width: "88px",
                    height: "88px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, var(--sage-light), var(--teal-light))",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "var(--font-display)",
                    fontSize: "1.8rem",
                    fontWeight: 700,
                    color: "var(--sage-dark)",
                    border: "3px solid #fff",
                    boxShadow: "0 0 0 2px var(--sage-light)",
                  }}>
                    {getInitials(profile.name)}
                  </div>
                )}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: "180px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap", marginBottom: "0.35rem" }}>
                  <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.6rem", fontWeight: 700, color: "var(--text)" }}>
                    {profile.name}
                  </h2>
                  <span style={{
                    padding: "0.2rem 0.7rem",
                    borderRadius: "20px",
                    background: "var(--sage-light)",
                    color: "var(--sage-dark)",
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                  }}>
                    {profile.role}
                  </span>
                </div>
                <p style={{ color: "var(--muted)", fontSize: "0.9rem", marginBottom: "1rem" }}>{profile.email}</p>

                <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
                  <span style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.35rem",
                    padding: "0.3rem 0.8rem",
                    borderRadius: "20px",
                    background: profile.emailVerified ? "var(--sage-light)" : "var(--amber-light)",
                    color: profile.emailVerified ? "var(--sage-dark)" : "var(--amber)",
                    fontSize: "0.78rem",
                    fontWeight: 600,
                  }}>
                    {profile.emailVerified ? "✦ Verified" : "⚠ Unverified"}
                  </span>
                  <span style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.35rem",
                    padding: "0.3rem 0.8rem",
                    borderRadius: "20px",
                    background: "var(--chip-bg)",
                    color: "var(--muted)",
                    fontSize: "0.78rem",
                    fontWeight: 600,
                  }}>
                    Joined {joinDate}
                  </span>
                </div>
              </div>
            </div>

            {/* ── Details card ── */}
            <div className="card-enter" style={{
              background: "var(--card)",
              borderRadius: "24px",
              padding: "2rem 2.5rem",
              marginBottom: "1.25rem",
              boxShadow: "var(--shadow)",
              border: "1px solid var(--border)",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.15rem", fontWeight: 600, color: "var(--text)" }}>
                  Personal Details
                </h3>
                {!editing && (
                  <button
                    onClick={() => setEditing(true)}
                    style={{
                      padding: "0.45rem 1rem",
                      borderRadius: "30px",
                      border: "1.5px solid var(--border)",
                      background: "none",
                      cursor: "pointer",
                      fontFamily: "var(--font-body)",
                      fontSize: "0.82rem",
                      fontWeight: 600,
                      color: "var(--sage-dark)",
                      transition: "background 0.2s",
                    }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "var(--sage-light)")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "none")}
                  >
                    Edit
                  </button>
                )}
              </div>

              {editing ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
                  {[
                    { label: "Full Name", key: "name" as const, placeholder: "Your name" },
                    { label: "Mobile Number", key: "mobileNumber" as const, placeholder: "e.g. 9876543210" },
                  ].map(({ label, key, placeholder }) => (
                    <div key={key}>
                      <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "var(--muted)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "0.4rem" }}>
                        {label}
                      </label>
                      <input
                        value={editForm[key]}
                        onChange={(e) => setEditForm((f) => ({ ...f, [key]: e.target.value }))}
                        placeholder={placeholder}
                        style={{
                          width: "100%",
                          padding: "0.75rem 1rem",
                          borderRadius: "12px",
                          border: "1.5px solid var(--border)",
                          background: "var(--input-bg)",
                          fontFamily: "var(--font-body)",
                          fontSize: "0.9rem",
                          color: "var(--text)",
                          transition: "border-color 0.2s",
                        }}
                        onFocus={(e) => (e.target.style.borderColor = "var(--sage)")}
                        onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                      />
                    </div>
                  ))}

                  <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      style={{
                        flex: 1,
                        padding: "0.8rem",
                        borderRadius: "12px",
                        border: "none",
                        background: saving ? "var(--border)" : "var(--sage)",
                        color: "#fff",
                        fontFamily: "var(--font-body)",
                        fontWeight: 700,
                        fontSize: "0.9rem",
                        cursor: saving ? "not-allowed" : "pointer",
                        transition: "background 0.2s",
                      }}
                      onMouseEnter={(e) => !saving && ((e.currentTarget as HTMLButtonElement).style.background = "var(--sage-dark)")}
                      onMouseLeave={(e) => !saving && ((e.currentTarget as HTMLButtonElement).style.background = "var(--sage)")}
                    >
                      {saving ? "Saving…" : "Save Changes"}
                    </button>
                    <button
                      onClick={() => { setEditing(false); setEditForm({ name: profile.name, mobileNumber: profile.mobileNumber ?? "" }); }}
                      style={{
                        padding: "0.8rem 1.4rem",
                        borderRadius: "12px",
                        border: "1.5px solid var(--border)",
                        background: "none",
                        color: "var(--muted)",
                        fontFamily: "var(--font-body)",
                        fontWeight: 600,
                        fontSize: "0.9rem",
                        cursor: "pointer",
                        transition: "background 0.2s",
                      }}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "var(--chip-bg)")}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "none")}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                  {[
                    { label: "Full Name", value: profile.name },
                    { label: "Email", value: profile.email },
                    { label: "Mobile", value: profile.mobileNumber || "—" },
                    { label: "Role", value: profile.role },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--muted)", letterSpacing: "0.09em", textTransform: "uppercase", marginBottom: "0.3rem" }}>
                        {label}
                      </p>
                      <p style={{ fontSize: "0.95rem", fontWeight: 500, color: "var(--text)" }}>{value}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── Quick actions card ── */}
            <div className="card-enter" style={{
              background: "var(--card-alt)",
              borderRadius: "24px",
              padding: "1.5rem 2.5rem",
              border: "1px solid var(--border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "1rem",
            }}>
              <div>
                <p style={{ fontFamily: "var(--font-display)", fontSize: "1rem", fontWeight: 600, color: "var(--text)", marginBottom: "0.15rem" }}>
                  Account Security
                </p>
                <p style={{ fontSize: "0.83rem", color: "var(--muted)" }}>
                  Manage your password and login preferences.
                </p>
              </div>
              <button
                onClick={() => setShowChangePassword(true)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.65rem 1.3rem",
                  borderRadius: "40px",
                  border: "1.5px solid var(--sage-light)",
                  background: "var(--card)",
                  cursor: "pointer",
                  fontFamily: "var(--font-body)",
                  fontSize: "0.875rem",
                  fontWeight: 700,
                  color: "var(--sage-dark)",
                  transition: "background 0.2s, border-color 0.2s",
                  boxShadow: "var(--shadow)",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "var(--sage-light)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "var(--card)"; }}
              >
                🔑 Change Password
              </button>
            </div>

          </div>
        ) : (
          <p style={{ textAlign: "center", color: "var(--muted)", fontFamily: "var(--font-body)", paddingTop: "6rem" }}>
            Profile not available. Please log in.
          </p>
        )}
      </main>

      {/* ── Modals & Toasts ── */}
      {showChangePassword && (
        <ChangePasswordModal onClose={() => setShowChangePassword(false)} />
      )}
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </>
  );
}
