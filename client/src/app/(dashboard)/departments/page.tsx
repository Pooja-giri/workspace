"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import {
  Building2,
  Plus,
  Search,
  Users,
} from "lucide-react";

import PageHeader from "@/components/ui/PageHeader";
import DepartmentTable from "@/components/departments/DepartmentTable";

import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { fetchDepartments } from "@/features/departments/departmentSlice";

export default function DepartmentsPage() {
  const dispatch = useAppDispatch();

  const {
    departments,
    loading,
    error,
  } = useAppSelector(
    (state) => state.departments
  );

  const [search, setSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(fetchDepartments(search));
    }, 300);

    return () => clearTimeout(timer);
  }, [dispatch, search]);

  const totalEmployees = departments.reduce(
    (total, department) =>
      total +
      (department._count?.employees ?? 0),
    0
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Departments"
        description="Manage your organization's departments and structure."
        action={
          <Link
            href="/departments/new"
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" />
            Add Department
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Total Departments
              </p>

              <p className="mt-2 text-3xl font-bold text-slate-900">
                {departments.length}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50">
              <Building2 className="h-5 w-5 text-indigo-600" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Employees Assigned
              </p>

              <p className="mt-2 text-3xl font-bold text-slate-900">
                {totalEmployees}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-50">
              <Users className="h-5 w-5 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Department Heads
              </p>

              <p className="mt-2 text-3xl font-bold text-slate-900">
                {
                  departments.filter(
                    (department) =>
                      department.manager
                  ).length
                }
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-amber-50">
              <Users className="h-5 w-5 text-amber-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search departments..."
            className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-600" />

          <p className="mt-4 text-sm text-slate-500">
            Loading departments...
          </p>
        </div>
      ) : (
        <DepartmentTable
          departments={departments}
        />
      )}
    </div>
  );
}