"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import Link from "next/link";

import {
  ArrowLeft,
  UserPlus,
} from "lucide-react";

import PageHeader from "@/components/ui/PageHeader";

import { useAppDispatch } from "@/hooks/redux";

import {
  createEmployee,
} from "@/features/employees/employeeSlice";

export default function NewEmployeePage() {
  const router = useRouter();

  const dispatch = useAppDispatch();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    jobTitle: "",
    employmentType: "FULL_TIME",
    joiningDate: "",
    password: "",
  });

  const [error, setError] =
    useState("");

  const [saving, setSaving] =
    useState(false);

  function updateField(
    field: string,
    value: string
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(
    event: React.FormEvent
  ) {
    event.preventDefault();

    setError("");
    setSaving(true);

    try {
      await dispatch(
        createEmployee(form)
      ).unwrap();

      router.push("/employees");
    } catch (err) {
      setError(
        typeof err === "string"
          ? err
          : "Failed to create employee"
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <Link
        href="/employees"
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to employees
      </Link>

      <PageHeader
        title="Add Employee"
        description="Create a new employee account and workforce profile."
      />

      <form
        onSubmit={handleSubmit}
        className="max-w-3xl space-y-6"
      >
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
              <UserPlus className="h-5 w-5 text-slate-700" />
            </div>

            <div>
              <h2 className="font-semibold text-slate-900">
                Basic Information
              </h2>

              <p className="text-sm text-slate-500">
                Employee identity and contact details.
              </p>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Full Name
              </label>

              <input
                required
                value={form.name}
                onChange={(e) =>
                  updateField(
                    "name",
                    e.target.value
                  )
                }
                placeholder="John Doe"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-900"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Email
              </label>

              <input
                required
                type="email"
                value={form.email}
                onChange={(e) =>
                  updateField(
                    "email",
                    e.target.value
                  )
                }
                placeholder="john@company.com"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-900"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Phone
              </label>

              <input
                value={form.phone}
                onChange={(e) =>
                  updateField(
                    "phone",
                    e.target.value
                  )
                }
                placeholder="+91 9876543210"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-900"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Job Title
              </label>

              <input
                required
                value={form.jobTitle}
                onChange={(e) =>
                  updateField(
                    "jobTitle",
                    e.target.value
                  )
                }
                placeholder="Frontend Developer"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-900"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Employment Type
              </label>

              <select
                value={
                  form.employmentType
                }
                onChange={(e) =>
                  updateField(
                    "employmentType",
                    e.target.value
                  )
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-slate-900"
              >
                <option value="FULL_TIME">
                  Full Time
                </option>

                <option value="PART_TIME">
                  Part Time
                </option>

                <option value="CONTRACTOR">
                  Contractor
                </option>

                <option value="INTERN">
                  Intern
                </option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Joining Date
              </label>

              <input
                required
                type="date"
                value={
                  form.joiningDate
                }
                onChange={(e) =>
                  updateField(
                    "joiningDate",
                    e.target.value
                  )
                }
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-900"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Temporary Password
              </label>

              <input
                required
                type="password"
                minLength={8}
                value={form.password}
                onChange={(e) =>
                  updateField(
                    "password",
                    e.target.value
                  )
                }
                placeholder="Minimum 8 characters"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-900"
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-3">
          <Link
            href="/employees"
            className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
          >
            {saving
              ? "Creating..."
              : "Create Employee"}
          </button>
        </div>
      </form>
    </div>
  );
}