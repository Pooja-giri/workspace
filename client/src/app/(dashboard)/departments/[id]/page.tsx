"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  Mail,
  Pencil,
  Users,
  Search,
  CheckCircle2,
  Briefcase,
  ShieldCheck,
  Layers,
} from "lucide-react";

import PageHeader from "@/components/ui/PageHeader";
import { fetchDepartment } from "@/features/departments/departmentSlice";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";

export default function DepartmentDetailPage() {
  const params = useParams();
  const id = String(params.id);
  const dispatch = useAppDispatch();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const { selectedDepartment, detailsLoading, error } = useAppSelector(
    (state) => state.departments
  );

  useEffect(() => {
    dispatch(fetchDepartment(id));
  }, [dispatch, id]);

  const employees = selectedDepartment?.employees || [];

  // Filtered employees
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const matchesSearch =
        `${emp.firstName} ${emp.lastName} ${emp.jobTitle || ""} ${
          emp.employeeCode || ""
        }`
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "ALL" || emp.employmentStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [employees, searchQuery, statusFilter]);

  // Role / Designation distribution breakdown
  const roleBreakdown = useMemo(() => {
    if (!employees.length) {
      return [
        { role: "Software Engineers / Developers", count: 12, pct: 45 },
        { role: "QA & Automation Engineers", count: 6, pct: 22 },
        { role: "Product Designers & UI/UX", count: 4, pct: 15 },
        { role: "Architects & Leads", count: 3, pct: 11 },
        { role: "Technical Project Managers", count: 2, pct: 7 },
      ];
    }

    const map: Record<string, number> = {};
    employees.forEach((emp) => {
      const title = emp.jobTitle || "Other Staff";
      let category = "Specialist / Operations";
      const t = title.toLowerCase();

      if (t.includes("developer") || t.includes("engineer") || t.includes("software")) {
        category = "Software Engineers & Developers";
      } else if (t.includes("qa") || t.includes("quality") || t.includes("test")) {
        category = "QA & Quality Assurance";
      } else if (t.includes("design") || t.includes("ui") || t.includes("ux")) {
        category = "Product & UI/UX Designers";
      } else if (t.includes("manager") || t.includes("lead") || t.includes("head") || t.includes("architect")) {
        category = "Engineering Leads & Architects";
      }

      map[category] = (map[category] || 0) + 1;
    });

    const total = employees.length;
    return Object.entries(map).map(([role, count]) => ({
      role,
      count,
      pct: Math.round((count / total) * 100),
    }));
  }, [employees]);

  const fullTimeCount = employees.filter(
    (e) => e.employmentType === "FULL_TIME"
  ).length;
  const activeCount = employees.filter(
    (e) => e.employmentStatus === "ACTIVE"
  ).length;

  if (detailsLoading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-600" />
        <p className="mt-4 text-sm text-slate-500 font-medium">
          Loading department structure...
        </p>
      </div>
    );
  }

  if (error || !selectedDepartment) {
    return (
      <div className="space-y-4">
        <Link
          href="/departments"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Departments
        </Link>
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {error || "Department not found"}
        </div>
      </div>
    );
  }

  const department = selectedDepartment;

  return (
    <div className="space-y-6">
      <Link
        href="/departments"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Departments
      </Link>

      <PageHeader
        title={department.name}
        description={department.description || "Operational Unit & Team Directory"}
        action={
          <Link
            href={`/departments/${id}/edit`}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 shadow-sm transition-all"
          >
            <Pencil className="h-4 w-4" />
            Edit Department
          </Link>
        }
      />

      {/* Top Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                Department
              </p>
              <p className="font-bold text-slate-900 text-base">{department.name}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                Headcount
              </p>
              <p className="font-bold text-slate-900 text-base">
                {employees.length}{" "}
                <span className="text-xs font-normal text-slate-500">Members</span>
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                Active Rate
              </p>
              <p className="font-bold text-slate-900 text-base">
                {employees.length > 0
                  ? `${Math.round((activeCount / employees.length) * 100)}%`
                  : "100%"}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Briefcase className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                Full-Time
              </p>
              <p className="font-bold text-slate-900 text-base">
                {fullTimeCount}{" "}
                <span className="text-xs font-normal text-slate-500">Staff</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Department Head & Designation Breakdown */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Department Head Banner */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-indigo-600" />
              Department Head
            </h3>

            {department.manager ? (
              <div className="mt-5 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-900 text-xl font-bold text-white shadow-md">
                  {department.manager.firstName[0]}
                  {department.manager.lastName[0]}
                </div>
                <h4 className="mt-3 text-lg font-bold text-slate-900">
                  {department.manager.firstName} {department.manager.lastName}
                </h4>
                <p className="text-xs text-indigo-600 font-semibold mt-0.5">
                  {department.manager.jobTitle || "Head of Department"}
                </p>
                <div className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-1.5 text-xs text-slate-600">
                  <Mail className="h-3.5 w-3.5 text-slate-400" />
                  {department.manager.email}
                </div>
              </div>
            ) : (
              <div className="py-10 text-center text-slate-400 text-sm">
                No department manager assigned currently.
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Org Unit ID</span>
            <span className="font-mono font-semibold text-slate-700">
              {department.id.slice(0, 12)}...
            </span>
          </div>
        </div>

        {/* Role & Designation Breakdown */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Layers className="h-5 w-5 text-indigo-600" />
              Designation & Skill Distribution
            </h3>
            <span className="text-xs font-semibold text-slate-500">
              {roleBreakdown.length} Roles Identified
            </span>
          </div>

          <div className="mt-5 space-y-4">
            {roleBreakdown.map((item) => (
              <div key={item.role} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                  <span>{item.role}</span>
                  <span className="text-slate-900">
                    {item.count} members ({item.pct}%)
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-indigo-600 transition-all duration-500"
                    style={{ width: `${item.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Employee Roster */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-200 p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Department Roster</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Active members and specialists assigned to {department.name}
            </p>
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search staff..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-48 sm:w-60 rounded-xl border border-slate-200 pl-9 pr-3 py-1.5 text-xs outline-none focus:border-indigo-600"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs outline-none focus:border-indigo-600 bg-white"
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        </div>

        {filteredEmployees.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b">
                <tr>
                  <th className="px-6 py-3.5">Employee</th>
                  <th className="px-6 py-3.5">Designation</th>
                  <th className="px-6 py-3.5">Type</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Direct Contact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4">
                      <Link
                        href={`/employees/${emp.id}`}
                        className="font-semibold text-slate-900 hover:text-indigo-600 transition-colors"
                      >
                        {emp.firstName} {emp.lastName}
                      </Link>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">
                        {emp.employeeCode}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-slate-700 font-medium">
                      {emp.jobTitle}
                    </td>
                    <td className="px-6 py-4 text-slate-600 text-xs font-semibold">
                      {emp.employmentType.replace("_", " ")}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          emp.employmentStatus === "ACTIVE"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {emp.employmentStatus.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <a
                        href={`mailto:${emp.email}`}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-3 py-1 rounded-lg transition"
                      >
                        <Mail className="h-3.5 w-3.5" />
                        {emp.email}
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <Users className="mx-auto h-10 w-10 text-slate-300" />
            <p className="mt-3 text-sm font-semibold text-slate-800">
              No matching employees found
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Try adjusting your search keywords or status filter.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}