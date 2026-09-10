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
            className="inline-flex items-center gap-2 rounded-xl bg-[#0F766E] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#115E59]"
          >
            <Plus className="h-4 w-4" />
            Add Department
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                Total Departments
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                {departments.length}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-[#0F766E]">
              <Building2 className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                Employees Assigned
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                {totalEmployees}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Users className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                Department Heads
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                {
                  departments.filter(
                    (department) =>
                      department.manager
                  ).length
                }
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Users className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search departments..."
            className="w-full rounded-xl border border-slate-300 bg-white py-2 pl-10 pr-4 text-sm outline-none transition focus:border-[#0F766E] focus:ring-2 focus:ring-teal-100"
          />
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-[#0F766E]" />

          <p className="mt-4 text-sm text-slate-500 font-medium">
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