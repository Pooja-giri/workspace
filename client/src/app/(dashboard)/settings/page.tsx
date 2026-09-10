"use client";

import { useState } from "react";
import {
  Building2,
  Bell,
  ShieldAlert,
  Palette,
  Save,
  CheckCircle2,
  Lock,
  Globe2,
  Sliders,
  Check,
} from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import { useAppSelector } from "@/hooks/redux";

type SettingsTab = "organization" | "notifications" | "security" | "appearance";

export default function SettingsPage() {
  const { organization } = useAppSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState<SettingsTab>("organization");

  // Organization settings state
  const [orgName, setOrgName] = useState(organization?.name || "WorkSphere Enterprise");
  const [orgSlug, setOrgSlug] = useState(organization?.slug || "worksphere");
  const [timezone, setTimezone] = useState("UTC+05:30 (Asia/Kolkata)");
  const [currency, setCurrency] = useState("USD ($)");
  const [fiscalStart, setFiscalStart] = useState("January");

  // Notification settings state
  const [notifications, setNotifications] = useState({
    leaveAlerts: true,
    attendanceReminders: true,
    performanceReviews: true,
    goalMilestones: true,
    securityNotices: true,
    dailyDigest: false,
  });

  // Security settings state
  const [requireMFA, setRequireMFA] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState("60");
  const [passwordComplexity, setPasswordComplexity] = useState(true);

  // Localization settings state
  const [dateFormat, setDateFormat] = useState("DD/MM/YYYY");
  const [language, setLanguage] = useState("English (US)");

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3500);
  };

  const toggleNotif = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Workspace Settings"
        description="Configure organization preferences, notification rules, security policies, and localization."
      />

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 bg-white p-2 rounded-2xl border shadow-sm overflow-x-auto">
        <button
          onClick={() => setActiveTab("organization")}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
            activeTab === "organization"
              ? "bg-[#0F766E] text-white shadow-sm"
              : "text-slate-600 hover:text-[#0F766E] hover:bg-teal-50/50"
          }`}
        >
          <Building2 className="h-4 w-4" />
          Organization Profile
        </button>

        <button
          onClick={() => setActiveTab("notifications")}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
            activeTab === "notifications"
              ? "bg-[#0F766E] text-white shadow-sm"
              : "text-slate-600 hover:text-[#0F766E] hover:bg-teal-50/50"
          }`}
        >
          <Bell className="h-4 w-4" />
          Notification Rules
        </button>

        <button
          onClick={() => setActiveTab("security")}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
            activeTab === "security"
              ? "bg-[#0F766E] text-white shadow-sm"
              : "text-slate-600 hover:text-[#0F766E] hover:bg-teal-50/50"
          }`}
        >
          <ShieldAlert className="h-4 w-4" />
          Security & Access
        </button>

        <button
          onClick={() => setActiveTab("appearance")}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
            activeTab === "appearance"
              ? "bg-[#0F766E] text-white shadow-sm"
              : "text-slate-600 hover:text-[#0F766E] hover:bg-teal-50/50"
          }`}
        >
          <Palette className="h-4 w-4" />
          Theme & Localization
        </button>
      </div>

      {savedSuccess && (
        <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-800 shadow-sm">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          Settings updated and persisted across your workspace!
        </div>
      )}

      {/* TAB 1: ORGANIZATION PROFILE */}
      {activeTab === "organization" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-base font-bold text-slate-900">Organization Identity</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              General company details and regional workspace configuration.
            </p>
          </div>

          <form onSubmit={handleSave} className="mt-6 space-y-5 max-w-2xl">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Organization Display Name
              </label>
              <input
                type="text"
                required
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-[#0F766E] focus:ring-2 focus:ring-teal-100 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Workspace Domain Slug
              </label>
              <div className="flex items-center rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm">
                <span className="text-xs text-slate-400 font-mono">https://worksphere.io/</span>
                <input
                  type="text"
                  required
                  value={orgSlug}
                  onChange={(e) => setOrgSlug(e.target.value)}
                  className="w-full pl-1 text-xs text-slate-900 outline-none font-mono font-semibold"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Primary Timezone
                </label>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:border-[#0F766E] focus:ring-2 focus:ring-teal-100 font-medium"
                >
                  <option value="UTC+05:30 (Asia/Kolkata)">UTC+05:30 (Asia/Kolkata - IST)</option>
                  <option value="UTC+00:00 (GMT/London)">UTC+00:00 (GMT/London)</option>
                  <option value="UTC-05:00 (America/New_York)">UTC-05:00 (America/New_York - EST)</option>
                  <option value="UTC-08:00 (America/Los_Angeles)">UTC-08:00 (America/Los_Angeles - PST)</option>
                  <option value="UTC+08:00 (Asia/Singapore)">UTC+08:00 (Asia/Singapore - SGT)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Reporting Currency
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:border-[#0F766E] focus:ring-2 focus:ring-teal-100 font-medium"
                >
                  <option value="USD ($)">USD ($) - US Dollar</option>
                  <option value="INR (₹)">INR (₹) - Indian Rupee</option>
                  <option value="EUR (€)">EUR (€) - Euro</option>
                  <option value="GBP (£)">GBP (£) - British Pound</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Fiscal Year Start Month
              </label>
              <select
                value={fiscalStart}
                onChange={(e) => setFiscalStart(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:border-[#0F766E] focus:ring-2 focus:ring-teal-100 font-medium"
              >
                <option value="January">January (Calendar Year)</option>
                <option value="April">April (Standard Corporate Fiscal)</option>
                <option value="July">July</option>
                <option value="October">October</option>
              </select>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-xl bg-[#0F766E] px-6 py-2.5 text-xs font-semibold text-white transition hover:bg-[#115E59] shadow-sm"
              >
                <Save className="h-4 w-4" />
                Save Organization Settings
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: NOTIFICATIONS */}
      {activeTab === "notifications" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-base font-bold text-slate-900">Email & Activity Notifications</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Select which events trigger instant notifications or email dispatches.
            </p>
          </div>

          <div className="mt-6 divide-y divide-slate-100 max-w-2xl">
            <div className="flex items-center justify-between py-4">
              <div>
                <p className="text-xs font-bold text-slate-900">Leave Requests & Approvals</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Receive immediate alerts when employees submit leave or managers decide requests.
                </p>
              </div>
              <input
                type="checkbox"
                checked={notifications.leaveAlerts}
                onChange={() => toggleNotif("leaveAlerts")}
                className="h-4 w-4 rounded accent-[#0F766E] cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between py-4">
              <div>
                <p className="text-xs font-bold text-slate-900">Attendance Clocking Warnings</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Reminders for missing punch-in or unplanned absenteeism logs.
                </p>
              </div>
              <input
                type="checkbox"
                checked={notifications.attendanceReminders}
                onChange={() => toggleNotif("attendanceReminders")}
                className="h-4 w-4 rounded accent-[#0F766E] cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between py-4">
              <div>
                <p className="text-xs font-bold text-slate-900">Performance Review Cycle Alerts</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Notifications when quarterly reviews are assigned, submitted, or acknowledged.
                </p>
              </div>
              <input
                type="checkbox"
                checked={notifications.performanceReviews}
                onChange={() => toggleNotif("performanceReviews")}
                className="h-4 w-4 rounded accent-[#0F766E] cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between py-4">
              <div>
                <p className="text-xs font-bold text-slate-900">Goal Milestone Reminders</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Periodic reminders when OKR target due dates approach.
                </p>
              </div>
              <input
                type="checkbox"
                checked={notifications.goalMilestones}
                onChange={() => toggleNotif("goalMilestones")}
                className="h-4 w-4 rounded accent-[#0F766E] cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between py-4">
              <div>
                <p className="text-xs font-bold text-slate-900">Security & Login Alerts</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Alerts on new device logins or administrative permission changes.
                </p>
              </div>
              <input
                type="checkbox"
                checked={notifications.securityNotices}
                onChange={() => toggleNotif("securityNotices")}
                className="h-4 w-4 rounded accent-[#0F766E] cursor-pointer"
              />
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <button
              onClick={handleSave}
              className="inline-flex items-center gap-2 rounded-xl bg-[#0F766E] px-6 py-2.5 text-xs font-semibold text-white transition hover:bg-[#115E59] shadow-sm"
            >
              <Save className="h-4 w-4" />
              Save Notification Preferences
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: SECURITY & ACCESS */}
      {activeTab === "security" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-base font-bold text-slate-900">Workspace Security Policies</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Multi-tenant security parameters, session timeouts, and authentication standards.
            </p>
          </div>

          <div className="mt-6 space-y-5 max-w-2xl">
            <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/50 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-900">Two-Factor Authentication (MFA)</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Enforce authenticator app 2FA for all administrative logins.
                </p>
              </div>
              <input
                type="checkbox"
                checked={requireMFA}
                onChange={() => setRequireMFA(!requireMFA)}
                className="h-4 w-4 rounded accent-[#0F766E] cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Session Inactivity Timeout
              </label>
              <select
                value={sessionTimeout}
                onChange={(e) => setSessionTimeout(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:border-[#0F766E] focus:ring-2 focus:ring-teal-100 font-medium"
              >
                <option value="15">15 Minutes</option>
                <option value="30">30 Minutes</option>
                <option value="60">60 Minutes (Recommended)</option>
                <option value="240">4 Hours</option>
              </select>
            </div>

            <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/50 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-900">Strict Password Complexity</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Require minimum 8 characters, capital letters, and numbers for all user accounts.
                </p>
              </div>
              <input
                type="checkbox"
                checked={passwordComplexity}
                onChange={() => setPasswordComplexity(!passwordComplexity)}
                className="h-4 w-4 rounded accent-[#0F766E] cursor-pointer"
              />
            </div>

            <div className="pt-2">
              <button
                onClick={handleSave}
                className="inline-flex items-center gap-2 rounded-xl bg-[#0F766E] px-6 py-2.5 text-xs font-semibold text-white transition hover:bg-[#115E59] shadow-sm"
              >
                <Save className="h-4 w-4" />
                Update Security Policies
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: THEME & LOCALIZATION */}
      {activeTab === "appearance" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-base font-bold text-slate-900">Theme & Regional Preferences</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Brand theme token assignments and formatting standards.
            </p>
          </div>

          <div className="mt-6 space-y-6 max-w-2xl">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Active Color Theme
              </label>

              <div className="rounded-2xl border-2 border-[#0F766E] bg-teal-50/30 p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0F766E] text-white font-bold shadow-sm">
                      W
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">🌊 Teal + Navy — Enterprise Professional</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Primary: #0F766E &bull; Secondary: #2563EB &bull; Surface: #FFFFFF
                      </p>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1 rounded-full bg-[#0F766E] text-white px-3 py-1 text-xs font-bold shadow-xs">
                    <Check className="h-3.5 w-3.5" /> Active
                  </span>
                </div>

                <div className="mt-4 flex gap-2">
                  <div className="h-5 flex-1 rounded bg-[#0F766E]" title="Primary Teal" />
                  <div className="h-5 flex-1 rounded bg-[#115E59]" title="Primary Dark" />
                  <div className="h-5 flex-1 rounded bg-[#2563EB]" title="Secondary Navy Blue" />
                  <div className="h-5 flex-1 rounded bg-[#0F172A]" title="Deep Navy Text" />
                  <div className="h-5 flex-1 rounded bg-[#16A34A]" title="Success Green" />
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Date Format
                </label>
                <select
                  value={dateFormat}
                  onChange={(e) => setDateFormat(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:border-[#0F766E] focus:ring-2 focus:ring-teal-100 font-medium"
                >
                  <option value="DD/MM/YYYY">DD/MM/YYYY (e.g. 10/09/2026)</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY (e.g. 09/10/2026)</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD (ISO 8601)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Default Language
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:border-[#0F766E] focus:ring-2 focus:ring-teal-100 font-medium"
                >
                  <option value="English (US)">English (US)</option>
                  <option value="English (UK)">English (UK)</option>
                  <option value="Spanish">Spanish (Español)</option>
                  <option value="French">French (Français)</option>
                  <option value="German">German (Deutsch)</option>
                </select>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={handleSave}
                className="inline-flex items-center gap-2 rounded-xl bg-[#0F766E] px-6 py-2.5 text-xs font-semibold text-white transition hover:bg-[#115E59] shadow-sm"
              >
                <Save className="h-4 w-4" />
                Save Formatting Preferences
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
