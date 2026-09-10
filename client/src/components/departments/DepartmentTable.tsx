"use client";

import Link from "next/link";

import {
  Building2,
  ChevronRight,
  Users,
} from "lucide-react";

import type { Department } from "@/types/department";

interface DepartmentTableProps {
  departments: Department[];
}

export default function DepartmentTable({
  departments,
}: DepartmentTableProps) {
  if (departments.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
        <Building2 className="mx-auto h-10 w-10 text-slate-400" />

        <h3 className="mt-4 text-lg font-semibold text-slate-900">
          No departments found
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          Create your first department to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[750px]">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                Department
              </th>

              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                Department Head
              </th>

              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                Employees
              </th>

              <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                Action
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {departments.map((department) => {
              const employeeCount =
                department._count?.employees ?? 0;

              return (
                <tr
                  key={department.id}
                  className="transition hover:bg-slate-50"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-[#0F766E]">
                        <Building2 className="h-5 w-5" />
                      </div>

                      <div>
                        <Link
                          href={`/departments/${department.id}`}
                          className="font-semibold text-slate-900 hover:text-[#0F766E] transition"
                        >
                          {department.name}
                        </Link>

                        {department.description && (
                          <p className="mt-0.5 max-w-md truncate text-xs text-slate-500">
                            {department.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    {department.manager ? (
                      <div>
                        <p className="font-semibold text-slate-900">
                          {department.manager.firstName}{" "}
                          {department.manager.lastName}
                        </p>

                        <p className="text-xs text-slate-500">
                          {department.manager.jobTitle ||
                            "Department Head"}
                        </p>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">
                        Not assigned
                      </span>
                    )}
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                      <Users className="h-4 w-4 text-slate-400" />

                      {employeeCount}
                    </div>
                  </td>

                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/departments/${department.id}`}
                      className="inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-semibold text-[#0F766E] hover:bg-teal-50 transition"
                    >
                      View
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}