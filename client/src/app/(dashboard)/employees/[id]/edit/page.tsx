"use client";

import { useEffect, useState } from "react";

import Link from "next/link";

import { useParams, useRouter } from "next/navigation";

import {
  ArrowLeft,
} from "lucide-react";

import PageHeader from "@/components/ui/PageHeader";

import {
  fetchEmployee,
  updateEmployee,
} from "@/features/employees/employeeSlice";

import {
  useAppDispatch,
  useAppSelector,
} from "@/hooks/redux";

export default function EditEmployeePage() {
  const params = useParams();

  const router = useRouter();

  const id = params.id as string;

  const dispatch = useAppDispatch();

  const employee =
    useAppSelector(
      (state) =>
        state.employees.selectedEmployee
    );

  const [form, setForm] =
    useState<{
      name: string;
      email: string;
      phone: string;
      jobTitle: string;
      employmentType: string;
      employmentStatus: string;
      joiningDate: string;
    } | null>(null);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    dispatch(fetchEmployee(id));
  }, [dispatch, id]);

  const formValues = form ?? (employee && {
    name: `${employee.firstName} ${employee.lastName}`.trim(),
    email: employee.email,
    phone: employee.phone || "",
    jobTitle: employee.jobTitle,
    employmentType: employee.employmentType,
    employmentStatus: employee.employmentStatus,
    joiningDate: employee.joiningDate.slice(0, 10),
  });

  function updateField(
    field: string,
    value: string
  ) {
    setForm((current) => ({
      ...(current ?? formValues!),
      [field]: value,
    }));
  }

  async function handleSubmit(
    event: React.FormEvent
  ) {
    event.preventDefault();

    setSaving(true);
    setError("");

    try {
      await dispatch(
        updateEmployee({
          id,
          data: formValues!,
        })
      ).unwrap();

      router.push(
        `/employees/${id}`
      );
    } catch (err) {
      setError(
        typeof err === "string"
          ? err
          : "Failed to update employee"
      );
    } finally {
      setSaving(false);
    }
  }

  if (!employee) {
    return (
      <div className="p-8 text-sm text-slate-500">
        Loading employee...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        href={`/employees/${id}`}
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to employee
      </Link>

      <PageHeader
        title="Edit Employee"
        description="Update employee information."
      />

      <form
        onSubmit={handleSubmit}
        className="max-w-3xl space-y-6"
      >
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="grid gap-5 md:grid-cols-2">
            <Field
              label="Full Name"
              value={formValues!.name}
              onChange={(value) =>
                updateField(
                  "name",
                  value
                )
              }
            />

            <Field
              label="Email"
              type="email"
              value={formValues!.email}
              onChange={(value) =>
                updateField(
                  "email",
                  value
                )
              }
            />

            <Field
              label="Phone"
              value={formValues!.phone}
              onChange={(value) =>
                updateField(
                  "phone",
                  value
                )
              }
            />

            <Field
              label="Job Title"
              value={formValues!.jobTitle}
              onChange={(value) =>
                updateField(
                  "jobTitle",
                  value
                )
              }
            />

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Employment Type
              </label>

              <select
                value={
                  formValues!.employmentType
                }
                onChange={(e) =>
                  updateField(
                    "employmentType",
                    e.target.value
                  )
                }
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
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
                Employment Status
              </label>

              <select
                value={
                  formValues!.employmentStatus
                }
                onChange={(e) =>
                  updateField(
                    "employmentStatus",
                    e.target.value
                  )
                }
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
              >
                <option value="ACTIVE">
                  Active
                </option>

                <option value="INACTIVE">
                  Inactive
                </option>

                <option value="ON_LEAVE">
                  On Leave
                </option>

                <option value="TERMINATED">
                  Terminated
                </option>
              </select>
            </div>

            <Field
              label="Joining Date"
              type="date"
              value={
                formValues!.joiningDate
              }
              onChange={(value) =>
                updateField(
                  "joiningDate",
                  value
                )
              }
            />
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-3">
          <Link
            href={`/employees/${id}`}
            className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium"
          >
            Cancel
          </Link>

          <button
            disabled={saving}
            className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white disabled:opacity-50"
          >
            {saving
              ? "Saving..."
              : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-900"
      />
    </div>
  );
}