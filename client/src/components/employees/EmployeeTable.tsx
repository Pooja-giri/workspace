"use client";

import { useState } from "react";
import Link from "next/link";
import {
  MoreHorizontal,
  Eye,
  Pencil,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Columns,
  Check,
} from "lucide-react";
import type { Employee } from "@/types/employee";

interface EmployeeTableProps {
  employees: Employee[];
  loading: boolean;
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onSelectAll: (all: boolean) => void;
  sortBy: string;
  sortOrder: "asc" | "desc";
  onSort: (field: string) => void;
  visibleColumns: {
    employee: boolean;
    department: boolean;
    jobTitle: boolean;
    type: boolean;
    status: boolean;
    joiningDate: boolean;
    actions: boolean;
  };
}

function getInitials(firstName: string, lastName: string) {
  return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();
}

function statusClasses(status: string) {
  switch (status) {
    case "ACTIVE":
      return "bg-emerald-50 text-emerald-700";
    case "ON_LEAVE":
      return "bg-amber-50 text-amber-700";
    case "INACTIVE":
      return "bg-slate-100 text-slate-600";
    case "TERMINATED":
      return "bg-red-50 text-red-700";
    default:
      return "bg-slate-100 text-slate-600";
  }
}

export default function EmployeeTable({
  employees,
  loading,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  sortBy,
  sortOrder,
  onSort,
  visibleColumns,
}: EmployeeTableProps) {
  const isAllSelected = employees.length > 0 && selectedIds.length === employees.length;

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white">
        <div className="space-y-4 p-6">
          {[1, 2, 3, 4, 5].map((item) => (
            <div key={item} className="h-14 animate-pulse rounded-xl bg-slate-100" />
          ))}
        </div>
      </div>
    );
  }

  if (employees.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
          <MoreHorizontal className="h-5 w-5 text-slate-500" />
        </div>
        <h3 className="text-base font-semibold text-slate-900">No employees found</h3>
        <p className="mt-1 text-sm text-slate-500">Try changing your search or filters.</p>
      </div>
    );
  }

  const renderSortIcon = (field: string) => {
    if (sortBy !== field) {
      return <ArrowUpDown className="h-3.5 w-3.5 text-slate-400 opacity-60 group-hover:opacity-100" />;
    }
    return sortOrder === "asc" ? (
      <ArrowUp className="h-3.5 w-3.5 text-slate-900" />
    ) : (
      <ArrowDown className="h-3.5 w-3.5 text-slate-900" />
    );
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-semibold uppercase tracking-wider text-slate-500">
              {/* Checkbox Header */}
              <th className="w-12 px-4 py-3.5 text-center">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={(e) => onSelectAll(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
                />
              </th>

              {visibleColumns.employee && (
                <th
                  onClick={() => onSort("name")}
                  className="group cursor-pointer px-6 py-3.5 text-left transition hover:text-slate-900"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Employee</span>
                    {renderSortIcon("name")}
                  </div>
                </th>
              )}

              {visibleColumns.department && (
                <th
                  onClick={() => onSort("department")}
                  className="group cursor-pointer px-6 py-3.5 text-left transition hover:text-slate-900"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Department</span>
                    {renderSortIcon("department")}
                  </div>
                </th>
              )}

              {visibleColumns.jobTitle && (
                <th
                  onClick={() => onSort("jobTitle")}
                  className="group cursor-pointer px-6 py-3.5 text-left transition hover:text-slate-900"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Role / Designation</span>
                    {renderSortIcon("jobTitle")}
                  </div>
                </th>
              )}

              {visibleColumns.type && (
                <th className="px-6 py-3.5 text-left">
                  <span>Type</span>
                </th>
              )}

              {visibleColumns.status && (
                <th
                  onClick={() => onSort("status")}
                  className="group cursor-pointer px-6 py-3.5 text-left transition hover:text-slate-900"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Status</span>
                    {renderSortIcon("status")}
                  </div>
                </th>
              )}

              {visibleColumns.joiningDate && (
                <th
                  onClick={() => onSort("joiningDate")}
                  className="group cursor-pointer px-6 py-3.5 text-left transition hover:text-slate-900"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Joined</span>
                    {renderSortIcon("joiningDate")}
                  </div>
                </th>
              )}

              {visibleColumns.actions && (
                <th className="px-6 py-3.5 text-right">
                  <span>Actions</span>
                </th>
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {employees.map((employee) => {
              const isSelected = selectedIds.includes(employee.id);
              return (
                <tr
                  key={employee.id}
                  className={`transition hover:bg-slate-50/70 ${isSelected ? "bg-slate-50/90" : ""}`}
                >
                  {/* Row Checkbox */}
                  <td className="w-12 px-4 py-4 text-center">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleSelect(employee.id)}
                      className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
                    />
                  </td>

                  {visibleColumns.employee && (
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
                          {getInitials(employee.firstName, employee.lastName)}
                        </div>

                        <div className="min-w-0">
                          <Link
                            href={`/employees/${employee.id}`}
                            className="font-semibold text-slate-900 hover:underline hover:text-indigo-600 truncate block text-sm"
                          >
                            {employee.firstName} {employee.lastName}
                          </Link>
                          <p className="text-xs text-slate-400 font-mono">{employee.employeeCode}</p>
                        </div>
                      </div>
                    </td>
                  )}

                  {visibleColumns.department && (
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {employee.department?.name || "Unassigned"}
                    </td>
                  )}

                  {visibleColumns.jobTitle && (
                    <td className="px-6 py-4 text-sm font-medium text-slate-700">
                      {employee.jobTitle}
                    </td>
                  )}

                  {visibleColumns.type && (
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {employee.employmentType.replace("_", " ")}
                    </td>
                  )}

                  {visibleColumns.status && (
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusClasses(
                          employee.employmentStatus
                        )}`}
                      >
                        {employee.employmentStatus.replace("_", " ")}
                      </span>
                    </td>
                  )}

                  {visibleColumns.joiningDate && (
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {new Date(employee.joiningDate).toLocaleDateString("en-US", {
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                  )}

                  {visibleColumns.actions && (
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1">
                        <Link
                          href={`/employees/${employee.id}`}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition"
                          title="View Profile"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>

                        <Link
                          href={`/employees/${employee.id}/edit`}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition"
                          title="Edit Employee"
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}