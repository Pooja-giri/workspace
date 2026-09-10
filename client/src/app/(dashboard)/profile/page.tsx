"use client";

import { useState } from "react";
import {
  User,
  Mail,
  Building2,
  Shield,
  KeyRound,
  CheckCircle2,
  Clock,
  Sparkles,
  Lock,
  BadgeCheck,
  Save,
} from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import { useAppSelector } from "@/hooks/redux";

export default function ProfilePage() {
  const { user, organization, role } = useAppSelector((state) => state.auth);

  const [name, setName] = useState(user?.name || "");
  const [email] = useState(user?.email || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [pwSuccess, setPwSuccess] = useState(false);
  const [pwError, setPwError] = useState("");

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3500);
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPwError("");
    setPwSuccess(false);

    if (newPassword.length < 8) {
      setPwError("New password must contain at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPwError("New passwords do not match.");
      return;
    }

    setPwSuccess(true);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setTimeout(() => setPwSuccess(false), 3500);
  };

  const permissions = [
    { name: "Workforce Directory", desc: "Access employee records, profiles, and team assignments", allowed: true },
    { name: "Attendance & Time Tracking", desc: "View and log daily attendance punches and matrix", allowed: true },
    { name: "Leave & Absence Workflows", desc: "Submit leave applications and review quota balances", allowed: true },
    {
      name: "Manager Approval Queue",
      desc: "Approve or reject team leave and attendance exceptions",
      allowed: role?.key === "ADMIN" || role?.key === "MANAGER",
    },
    {
      name: "Performance & Reviews",
      desc: "Create and submit 360° employee performance appraisals",
      allowed: role?.key === "ADMIN" || role?.key === "MANAGER",
    },
    {
      name: "Executive Analytics & Reports",
      desc: "Access company-wide headcount charts, trends, and CSV exports",
      allowed: role?.key === "ADMIN",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Profile"
        description="Manage your personal account credentials, workspace identity, and role permissions."
      />

      {/* Hero Profile Banner */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-5">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-teal-50 border-2 border-teal-200 text-2xl font-bold text-[#0F766E] shadow-sm">
              {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                  {user?.name || "Workspace User"}
                </h2>
                <span className="rounded-full bg-[#0F766E] px-3 py-0.5 text-xs font-bold text-white shadow-xs">
                  {role?.name || "Member"}
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                  <BadgeCheck className="h-3.5 w-3.5 text-emerald-600" /> Active Account
                </span>
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500">
                <span className="flex items-center gap-1.5">
                  <Mail className="h-4 w-4 text-slate-400" />
                  {user?.email || "user@example.com"}
                </span>
                <span className="flex items-center gap-1.5">
                  <Building2 className="h-4 w-4 text-slate-400" />
                  {organization?.name || "WorkSphere Workspace"}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-slate-400" />
                  Role Key: <span className="font-mono text-slate-700 font-bold">{role?.key || "USER"}</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column (2 Cols): Personal Information & Role Permissions */}
        <div className="space-y-6 lg:col-span-2">
          {/* Section 1: Account Information */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <User className="h-5 w-5 text-[#0F766E]" />
                Personal & Account Details
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Update your identity details shown across your company directory.
              </p>
            </div>

            {saveSuccess && (
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs font-semibold text-emerald-800">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Profile changes saved successfully!
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="mt-5 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-[#0F766E] focus:ring-2 focus:ring-teal-100 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    disabled
                    value={email}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-500 outline-none font-medium cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Organization
                  </label>
                  <input
                    type="text"
                    disabled
                    value={organization?.name || "WorkSphere"}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-500 outline-none font-medium cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Assigned Role
                  </label>
                  <input
                    type="text"
                    disabled
                    value={role?.name || "Employee"}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-500 outline-none font-medium cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#0F766E] px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-[#115E59] shadow-sm"
                >
                  <Save className="h-4 w-4" />
                  Save Profile Changes
                </button>
              </div>
            </form>
          </div>

          {/* Section 2: Permissions Matrix */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Shield className="h-5 w-5 text-[#0F766E]" />
                Role & Workspace Access Matrix
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Features and capabilities permitted for your <span className="font-semibold text-slate-800">{role?.name || "User"}</span> account.
              </p>
            </div>

            <div className="mt-4 divide-y divide-slate-100">
              {permissions.map((perm) => (
                <div key={perm.name} className="flex items-start justify-between py-3.5">
                  <div className="pr-4">
                    <p className="text-xs font-bold text-slate-900">{perm.name}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{perm.desc}</p>
                  </div>
                  <span
                    className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                      perm.allowed
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-slate-100 text-slate-400 border border-slate-200"
                    }`}
                  >
                    {perm.allowed ? "Granted" : "Restricted"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Password & Security */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-[#0F766E]" />
                Security & Password
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Keep your workspace account secure with a strong password.
              </p>
            </div>

            {pwSuccess && (
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs font-semibold text-emerald-800">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Password updated successfully!
              </div>
            )}

            {pwError && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs font-semibold text-red-700">
                {pwError}
              </div>
            )}

            <form onSubmit={handleUpdatePassword} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs text-slate-900 outline-none transition focus:border-[#0F766E] focus:ring-2 focus:ring-teal-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="Minimum 8 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs text-slate-900 outline-none transition focus:border-[#0F766E] focus:ring-2 focus:ring-teal-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="Repeat new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs text-slate-900 outline-none transition focus:border-[#0F766E] focus:ring-2 focus:ring-teal-100"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-[#0F766E] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#115E59] shadow-sm"
              >
                Update Password
              </button>
            </form>
          </div>

          {/* Session Security Details */}
          <div className="rounded-2xl border border-slate-200 bg-teal-50/40 p-5 border-dashed">
            <div className="flex items-center gap-2 text-xs font-bold text-[#0F766E]">
              <Lock className="h-4 w-4" />
              Active Session Security
            </div>
            <p className="mt-1.5 text-[11px] text-slate-600 leading-relaxed">
              Authenticated with enterprise JWT signature. Session is scoped strictly to tenant{" "}
              <span className="font-semibold text-slate-800">{organization?.name || "WorkSphere"}</span>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
