"use client";

import { useEffect, useState, useMemo } from "react";
import {
  FileSpreadsheet,
  Printer,
  Download,
  Calendar,
  Building2,
  Users,
  CheckCircle2,
  Clock,
  BarChart2,
  Filter,
} from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { fetchEmployees } from "@/features/employees/employeeSlice";
import { fetchDepartments } from "@/features/departments/departmentSlice";
import { fetchAttendance } from "@/features/attendance/attendanceSlice";
import { fetchLeaveRequests } from "@/features/leave/leaveSlice";

type ReportType = "EMPLOYEE_DIRECTORY" | "ATTENDANCE_SUMMARY" | "LEAVE_UTILIZATION" | "DEPARTMENT_STATS";

export default function ReportsPage() {
  const dispatch = useAppDispatch();
  const [reportType, setReportType] = useState<ReportType>("EMPLOYEE_DIRECTORY");
  const [selectedDept, setSelectedDept] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  const { employees, loading: empLoading } = useAppSelector((state) => state.employees);
  const { departments } = useAppSelector((state) => state.departments);
  const { records: attendanceRecords } = useAppSelector((state) => state.attendance);
  const { requests: leaveRequests } = useAppSelector((state) => state.leave);

  useEffect(() => {
    dispatch(fetchEmployees({ page: 1, limit: 200 }));
    dispatch(fetchDepartments());
    dispatch(fetchAttendance({}));
    dispatch(fetchLeaveRequests({ page: "1", limit: "200" }));
  }, [dispatch]);

  // Filtered employees
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const matchDept = selectedDept === "ALL" || (emp as any).departmentId === selectedDept || emp.department?.id === selectedDept;
      const matchStatus = selectedStatus === "ALL" || emp.employmentStatus === selectedStatus;
      return matchDept && matchStatus;
    });
  }, [employees, selectedDept, selectedStatus]);

  // Export CSV
  const handleExportCSV = () => {
    let headers: string[] = [];
    let rows: (string | number)[][] = [];
    let filename = "WorkSphere_Report.csv";

    if (reportType === "EMPLOYEE_DIRECTORY") {
      filename = `Employee_Directory_${new Date().toISOString().split("T")[0]}.csv`;
      headers = ["Employee Code", "Full Name", "Email", "Phone", "Job Title", "Department", "Type", "Status", "Joining Date"];
      rows = filteredEmployees.map((e) => [
        e.employeeCode,
        `"${e.firstName} ${e.lastName}"`,
        e.email,
        e.phone || "—",
        `"${e.jobTitle}"`,
        `"${e.department?.name || "Unassigned"}"`,
        e.employmentType,
        e.employmentStatus,
        new Date(e.joiningDate).toLocaleDateString(),
      ]);
    } else if (reportType === "ATTENDANCE_SUMMARY") {
      filename = `Attendance_Summary_${new Date().toISOString().split("T")[0]}.csv`;
      headers = ["Employee Code", "Employee Name", "Department", "Date", "Status", "Check In", "Check Out", "Notes"];
      rows = attendanceRecords.map((a) => [
        a.employee?.employeeCode || "—",
        `"${a.employee?.firstName || ""} ${a.employee?.lastName || ""}"`,
        `"${a.employee?.department?.name || "—"}"`,
        new Date(a.date).toLocaleDateString(),
        a.status,
        a.checkIn ? new Date(a.checkIn).toLocaleTimeString() : "—",
        a.checkOut ? new Date(a.checkOut).toLocaleTimeString() : "—",
        `"${(a as any).notes || ""}"`,
      ]);
    } else if (reportType === "LEAVE_UTILIZATION") {
      filename = `Leave_Utilization_${new Date().toISOString().split("T")[0]}.csv`;
      headers = ["Employee Name", "Employee Code", "Leave Type", "Start Date", "End Date", "Days", "Status", "Reason"];
      rows = leaveRequests.map((l) => [
        l.employee ? `"${l.employee.firstName} ${l.employee.lastName}"` : "Unknown",
        l.employee?.employeeCode || "—",
        `"${l.leaveType?.name || "Leave"}"`,
        new Date(l.startDate).toLocaleDateString(),
        new Date(l.endDate).toLocaleDateString(),
        l.totalDays,
        l.status,
        `"${l.reason || ""}"`,
      ]);
    } else if (reportType === "DEPARTMENT_STATS") {
      filename = `Department_Statistics_${new Date().toISOString().split("T")[0]}.csv`;
      headers = ["Department Name", "Head of Department", "Total Employees", "Description"];
      rows = departments.map((d) => [
        `"${d.name}"`,
        d.manager ? `"${d.manager.firstName} ${d.manager.lastName}"` : "Unassigned",
        d.employees?.length ?? d._count?.employees ?? 0,
        `"${d.description || ""}"`,
      ]);
    }

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print / PDF View
  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header with Print and Export Actions */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center print:hidden">
        <PageHeader
          title="Enterprise Reports Center"
          description="Generate, export and print compliance reports and workforce statistics."
        />

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <Download className="h-4 w-4 text-slate-600" />
            Export CSV
          </button>

          <button
            onClick={handlePrintPDF}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800"
          >
            <Printer className="h-4 w-4" />
            Print / PDF
          </button>
        </div>
      </div>

      {/* Report Type Selector Tabs */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 print:hidden">
        <button
          onClick={() => setReportType("EMPLOYEE_DIRECTORY")}
          className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition ${
            reportType === "EMPLOYEE_DIRECTORY"
              ? "border-slate-900 bg-slate-900 text-white shadow-sm"
              : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
          }`}
        >
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
              reportType === "EMPLOYEE_DIRECTORY" ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-600"
            }`}
          >
            <Users className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold text-sm">Employee Directory</p>
            <p className={`text-xs ${reportType === "EMPLOYEE_DIRECTORY" ? "text-slate-300" : "text-slate-500"}`}>
              {employees.length} records
            </p>
          </div>
        </button>

        <button
          onClick={() => setReportType("ATTENDANCE_SUMMARY")}
          className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition ${
            reportType === "ATTENDANCE_SUMMARY"
              ? "border-slate-900 bg-slate-900 text-white shadow-sm"
              : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
          }`}
        >
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
              reportType === "ATTENDANCE_SUMMARY" ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-600"
            }`}
          >
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold text-sm">Attendance Summary</p>
            <p className={`text-xs ${reportType === "ATTENDANCE_SUMMARY" ? "text-slate-300" : "text-slate-500"}`}>
              {attendanceRecords.length} records
            </p>
          </div>
        </button>

        <button
          onClick={() => setReportType("LEAVE_UTILIZATION")}
          className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition ${
            reportType === "LEAVE_UTILIZATION"
              ? "border-slate-900 bg-slate-900 text-white shadow-sm"
              : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
          }`}
        >
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
              reportType === "LEAVE_UTILIZATION" ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-600"
            }`}
          >
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold text-sm">Leave Utilization</p>
            <p className={`text-xs ${reportType === "LEAVE_UTILIZATION" ? "text-slate-300" : "text-slate-500"}`}>
              {leaveRequests.length} requests
            </p>
          </div>
        </button>

        <button
          onClick={() => setReportType("DEPARTMENT_STATS")}
          className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition ${
            reportType === "DEPARTMENT_STATS"
              ? "border-slate-900 bg-slate-900 text-white shadow-sm"
              : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
          }`}
        >
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
              reportType === "DEPARTMENT_STATS" ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-600"
            }`}
          >
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold text-sm">Department Stats</p>
            <p className={`text-xs ${reportType === "DEPARTMENT_STATS" ? "text-slate-300" : "text-slate-500"}`}>
              {departments.length} departments
            </p>
          </div>
        </button>
      </div>

      {/* Filters (Shown for Employee Directory) */}
      {reportType === "EMPLOYEE_DIRECTORY" && (
        <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between print:hidden">
          <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
            <Filter className="h-4 w-4 text-slate-400" />
            Report Filters
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-slate-900"
            >
              <option value="ALL">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-slate-900"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="ON_LEAVE">On Leave</option>
              <option value="INACTIVE">Inactive</option>
              <option value="TERMINATED">Terminated</option>
            </select>
          </div>
        </div>
      )}

      {/* Printable Report View */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm print:border-none print:shadow-none">
        {/* Printable Report Header */}
        <div className="border-b border-slate-200 p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-lg bg-slate-900 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-white">
                  WorkSphere Enterprise
                </span>
                <span className="text-xs text-slate-400">Official Report</span>
              </div>
              <h2 className="mt-2 text-xl font-bold text-slate-900">
                {reportType === "EMPLOYEE_DIRECTORY" && "Employee Master Directory Report"}
                {reportType === "ATTENDANCE_SUMMARY" && "Workforce Attendance Summary Report"}
                {reportType === "LEAVE_UTILIZATION" && "Leave Utilization & Policy Report"}
                {reportType === "DEPARTMENT_STATS" && "Department Structure & Headcount Report"}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Generated on {new Date().toLocaleDateString("en-IN", { dateStyle: "full" })} at{" "}
                {new Date().toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>

        {/* Data Tables */}
        <div className="overflow-x-auto">
          {reportType === "EMPLOYEE_DIRECTORY" && (
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase text-slate-500">
                <tr>
                  <th className="px-6 py-3.5">Code</th>
                  <th className="px-6 py-3.5">Employee Name</th>
                  <th className="px-6 py-3.5">Department</th>
                  <th className="px-6 py-3.5">Job Title</th>
                  <th className="px-6 py-3.5">Type</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEmployees.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50">
                    <td className="px-6 py-3.5 font-mono text-xs text-slate-500">{e.employeeCode}</td>
                    <td className="px-6 py-3.5 font-medium text-slate-900">
                      {e.firstName} {e.lastName}
                    </td>
                    <td className="px-6 py-3.5 text-slate-600">{e.department?.name || "Unassigned"}</td>
                    <td className="px-6 py-3.5 text-slate-600">{e.jobTitle}</td>
                    <td className="px-6 py-3.5 text-xs text-slate-500">{e.employmentType.replace("_", " ")}</td>
                    <td className="px-6 py-3.5">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                          e.employmentStatus === "ACTIVE"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {e.employmentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-xs text-slate-500">
                      {new Date(e.joiningDate).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {reportType === "ATTENDANCE_SUMMARY" && (
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase text-slate-500">
                <tr>
                  <th className="px-6 py-3.5">Date</th>
                  <th className="px-6 py-3.5">Employee</th>
                  <th className="px-6 py-3.5">Department</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Check In</th>
                  <th className="px-6 py-3.5">Check Out</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {attendanceRecords.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50">
                    <td className="px-6 py-3.5 text-slate-600">{new Date(a.date).toLocaleDateString()}</td>
                    <td className="px-6 py-3.5 font-medium text-slate-900">
                      {a.employee.firstName} {a.employee.lastName}
                    </td>
                    <td className="px-6 py-3.5 text-slate-600">{a.employee.department?.name || "—"}</td>
                    <td className="px-6 py-3.5">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                          a.status === "PRESENT"
                            ? "bg-emerald-50 text-emerald-700"
                            : a.status === "ON_LEAVE"
                            ? "bg-purple-50 text-purple-700"
                            : "bg-red-50 text-red-700"
                        }`}
                      >
                        {a.status}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-xs text-slate-500">
                      {a.checkIn ? new Date(a.checkIn).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}
                    </td>
                    <td className="px-6 py-3.5 text-xs text-slate-500">
                      {a.checkOut ? new Date(a.checkOut).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {reportType === "LEAVE_UTILIZATION" && (
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase text-slate-500">
                <tr>
                  <th className="px-6 py-3.5">Employee</th>
                  <th className="px-6 py-3.5">Leave Type</th>
                  <th className="px-6 py-3.5">Dates</th>
                  <th className="px-6 py-3.5">Duration</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leaveRequests.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50">
                    <td className="px-6 py-3.5 font-medium text-slate-900">
                      {l.employee ? `${l.employee.firstName} ${l.employee.lastName}` : "Unknown"}
                    </td>
                    <td className="px-6 py-3.5 text-slate-600">{l.leaveType?.name || "Leave"}</td>
                    <td className="px-6 py-3.5 text-xs text-slate-500">
                      {new Date(l.startDate).toLocaleDateString()} - {new Date(l.endDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-3.5 font-semibold text-slate-900">{l.totalDays} day(s)</td>
                    <td className="px-6 py-3.5">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                          l.status === "APPROVED"
                            ? "bg-emerald-50 text-emerald-700"
                            : l.status === "PENDING"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-red-50 text-red-700"
                        }`}
                      >
                        {l.status}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-xs text-slate-500 max-w-xs truncate">{l.reason || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {reportType === "DEPARTMENT_STATS" && (
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase text-slate-500">
                <tr>
                  <th className="px-6 py-3.5">Department</th>
                  <th className="px-6 py-3.5">Head of Department</th>
                  <th className="px-6 py-3.5">Total Employees</th>
                  <th className="px-6 py-3.5">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {departments.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50">
                    <td className="px-6 py-3.5 font-semibold text-slate-900">{d.name}</td>
                    <td className="px-6 py-3.5 text-slate-600">
                      {d.manager ? `${d.manager.firstName} ${d.manager.lastName}` : "Not Assigned"}
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="rounded-md bg-slate-100 px-2.5 py-1 font-semibold text-slate-900">
                        {d.employees?.length ?? d._count?.employees ?? 0}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-xs text-slate-500">{d.description || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
