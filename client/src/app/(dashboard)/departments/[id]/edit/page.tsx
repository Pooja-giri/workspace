"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  Building2,
  Save,
} from "lucide-react";

import { useAppDispatch, useAppSelector } from "@/hooks/redux";

import {
  fetchDepartment,
  updateDepartment,
  clearSelectedDepartment,
} from "@/features/departments/departmentSlice";

import { fetchEmployees } from "@/features/employees/employeeSlice";

const departmentSchema = z.object({
  name: z
    .string()
    .min(2, "Department name must be at least 2 characters"),

  description: z
    .string()
    .optional(),

  managerId: z
    .string()
    .optional(),
});

type DepartmentFormValues = z.infer<typeof departmentSchema>;

export default function EditDepartmentPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const departmentId = String(params.id);

  const {
    selectedDepartment,
    detailsLoading,
    loading,
    error,
  } = useAppSelector(
    (state) => state.departments
  );

  const {
    employees,
    loading: employeesLoading,
  } = useAppSelector(
    (state) => state.employees
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DepartmentFormValues>({
    resolver: zodResolver(departmentSchema),

    defaultValues: {
      name: "",
      description: "",
      managerId: "",
    },
  });

  useEffect(() => {
    dispatch(fetchDepartment(departmentId));

    dispatch(
      fetchEmployees({
        page: 1,
        limit: 100,
      })
    );

    return () => {
      dispatch(clearSelectedDepartment());
    };
  }, [dispatch, departmentId]);

  useEffect(() => {
    if (!selectedDepartment) {
      return;
    }

    reset({
      name: selectedDepartment.name,

      description:
        selectedDepartment.description || "",

      managerId:
        selectedDepartment.manager?.id ||
        selectedDepartment.managerId ||
        "",
    });
  }, [selectedDepartment, reset]);

  const onSubmit = async (
    values: DepartmentFormValues
  ) => {
    const result = await dispatch(
      updateDepartment({
        id: departmentId,

        data: {
          name: values.name.trim(),

          description:
            values.description?.trim() || null,

          managerId:
            values.managerId || null,
        },
      })
    );

    if (updateDepartment.fulfilled.match(result)) {
      router.push(`/departments/${departmentId}`);
    }
  };

  if (detailsLoading && !selectedDepartment) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-sm text-slate-500">
          Loading department...
        </div>
      </div>
    );
  }

  if (!selectedDepartment && !detailsLoading) {
    return (
      <div className="space-y-4">
        <Link
          href="/departments"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Departments
        </Link>

        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {error || "Department not found."}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href={`/departments/${departmentId}`}
          className="mb-3 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Department
        </Link>

        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white">
            <Building2 className="h-5 w-5" />
          </div>

          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              Edit Department
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Update department information and department head.
            </p>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Form */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="max-w-3xl"
      >
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-5">
            <h2 className="text-base font-semibold text-slate-900">
              Department Information
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Update the information for this department.
            </p>
          </div>

          <div className="space-y-6 p-6">
            {/* Department Name */}
            <div>
              <label
                htmlFor="name"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Department Name
                <span className="ml-1 text-red-500">*</span>
              </label>

              <input
                id="name"
                type="text"
                placeholder="e.g. Engineering"
                {...register("name")}
                className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200 ${
                  errors.name
                    ? "border-red-400"
                    : "border-slate-300"
                }`}
              />

              {errors.name && (
                <p className="mt-1.5 text-sm text-red-600">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Description
              </label>

              <textarea
                id="description"
                rows={4}
                placeholder="Describe the purpose or responsibilities of this department..."
                {...register("description")}
                className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
              />
            </div>

            {/* Department Manager */}
            <div>
              <label
                htmlFor="managerId"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Department Head
              </label>

              <select
                id="managerId"
                {...register("managerId")}
                disabled={employeesLoading}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:bg-slate-100"
              >
                <option value="">
                  {employeesLoading
                    ? "Loading employees..."
                    : "No department head"}
                </option>

                {employees.map((employee) => (
                  <option
                    key={employee.id}
                    value={employee.id}
                  >
                    {employee.firstName} {employee.lastName}
                    {employee.jobTitle
                      ? ` — ${employee.jobTitle}`
                      : ""}
                  </option>
                ))}
              </select>

              <p className="mt-1.5 text-xs text-slate-500">
                Select a different employee or choose the
                first option to remove the department head.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
            <Link
              href={`/departments/${departmentId}`}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save className="h-4 w-4" />

              {loading
                ? "Saving..."
                : "Save Changes"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}