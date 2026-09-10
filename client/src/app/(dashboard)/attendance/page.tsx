"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Download,
  Grid,
  Home,
  List,
  Plus,
  Table as TableIcon,
  UserX,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { fetchAttendance } from "@/features/attendance/attendanceSlice";
import { fetchEmployees } from "@/features/employees/employeeSlice";
import MarkAttendanceForm from "@/components/attendance/MarkAttendanceForm";
import PageHeader from "@/components/ui/PageHeader";
import type { AttendanceStatus } from "@/types/attendance";

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatTime(date?: string | null) {
  if (!date) return "—";
  return new Date(date).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatusLabel(status: AttendanceStatus) {
  switch (status) {
    case "PRESENT":
      return "Present";
    case "ABSENT":
      return "Absent";
    case "HALF_DAY":
      return "Half Day";
    case "WORK_FROM_HOME":
      return "Work From Home";
    case "ON_LEAVE":
      return "On Leave";
    default:
      return status;
  }
}

function getStatusClasses(status: AttendanceStatus) {
  switch (status) {
    case "PRESENT":
      return "bg-emerald-50 text-emerald-700";
    case "ABSENT":
      return "bg-red-50 text-red-700";
    case "HALF_DAY":
      return "bg-amber-50 text-amber-700";
    case "WORK_FROM_HOME":
      return "bg-blue-50 text-blue-700";
    case "ON_LEAVE":
      return "bg-purple-50 text-purple-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

export default function AttendancePage() {
  const dispatch = useAppDispatch();

  const { records, loading, error } = useAppSelector(
    (state) => state.attendance
  );
  const { employees } = useAppSelector((state) => state.employees);

  const [viewMode, setViewMode] = useState<"table" | "matrix">("matrix");
  const [date, setDate] = useState("");
  const [status, setStatus] = useState<AttendanceStatus | "">("");
  const [showMarkAttendance, setShowMarkAttendance] = useState(false);

  // Month & Year state for Matrix Grid
  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth()); // 0-indexed

  useEffect(() => {
    dispatch(
      fetchAttendance({
        date: date || undefined,
        status: status || undefined,
      })
    );
    dispatch(fetchEmployees({ page: 1, limit: 100 }));
  }, [dispatch, date, status]);

  const summary = useMemo(() => {
    return {
      total: records.length,
      present: records.filter((r) => r.status === "PRESENT").length,
      absent: records.filter((r) => r.status === "ABSENT").length,
      workFromHome: records.filter((r) => r.status === "WORK_FROM_HOME").length,
    };
  }, [records]);

  // Days in selected month for Matrix
  const daysInMonth = useMemo(() => {
    return new Date(selectedYear, selectedMonth + 1, 0).getDate();
  }, [selectedYear, selectedMonth]);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Helper to determine status badge in matrix
  const getMatrixCellBadge = (empId: string, day: number) => {
    // Construct date string YYYY-MM-DD
    const monthStr = String(selectedMonth + 1).padStart(2, "0");
    const dayStr = String(day).padStart(2, "0");
    const datePrefix = `${selectedYear}-${monthStr}-${dayStr}`;

    const match = records.find((r) => {
      const rEmpId = r.employeeId || r.employee?.id;
      const rDate = r.date.split("T")[0];
      return rEmpId === empId && rDate === datePrefix;
    });

    const dayOfWeek = new Date(selectedYear, selectedMonth, day).getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    if (match) {
      if (match.status === "PRESENT") {
        return <span className="inline-flex h-6 w-6 items-center justify-center rounded bg-emerald-100 text-[11px] font-bold text-emerald-800" title="Present">P</span>;
      }
      if (match.status === "WORK_FROM_HOME") {
        return <span className="inline-flex h-6 w-6 items-center justify-center rounded bg-blue-100 text-[11px] font-bold text-blue-800" title="Work From Home">WFH</span>;
      }
      if (match.status === "ON_LEAVE") {
        return <span className="inline-flex h-6 w-6 items-center justify-center rounded bg-purple-100 text-[11px] font-bold text-purple-800" title="On Leave">L</span>;
      }
      if (match.status === "HALF_DAY") {
        return <span className="inline-flex h-6 w-6 items-center justify-center rounded bg-amber-100 text-[11px] font-bold text-amber-800" title="Half Day">HD</span>;
      }
      return <span className="inline-flex h-6 w-6 items-center justify-center rounded bg-red-100 text-[11px] font-bold text-red-800" title="Absent">A</span>;
    }

    if (isWeekend) {
      return <span className="inline-flex h-6 w-6 items-center justify-center rounded bg-slate-100 text-[11px] font-semibold text-slate-400" title="Weekend">W</span>;
    }

    // Default weekday with no explicit record: Present by default for enterprise simulation
    return <span className="inline-flex h-6 w-6 items-center justify-center rounded bg-emerald-50 text-[11px] font-medium text-emerald-600" title="Present">P</span>;
  };

  const handleExportCSV = () => {
    const headers = ["Employee ID", "Employee Name", "Department", "Date", "Status", "Punch In", "Punch Out"];
    const rows = records.map((r) => [
      r.employee?.employeeCode || r.employeeId,
      `"${r.employee?.firstName || ""} ${r.employee?.lastName || ""}"`,
      `"${r.employee?.department?.name || ""}"`,
      r.date.split("T")[0],
      r.status,
      r.checkIn ? new Date(r.checkIn).toLocaleTimeString() : "",
      r.checkOut ? new Date(r.checkOut).toLocaleTimeString() : "",
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `attendance_export_${selectedYear}_${selectedMonth + 1}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const nextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear((y) => y + 1);
    } else {
      setSelectedMonth((m) => m + 1);
    }
  };

  const prevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear((y) => y - 1);
    } else {
      setSelectedMonth((m) => m - 1);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          title="Attendance Management"
          description="Enterprise punch monitoring, monthly matrix grid, and work-hour tracking"
        />

        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
            <button
              onClick={() => setViewMode("matrix")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                viewMode === "matrix"
                  ? "bg-[#0F766E] text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Grid className="h-3.5 w-3.5" />
              Monthly Matrix
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                viewMode === "table"
                  ? "bg-[#0F766E] text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <List className="h-3.5 w-3.5" />
              Table View
            </button>
          </div>

          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm transition"
          >
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </button>

          <button
            type="button"
            onClick={() => setShowMarkAttendance(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0F766E] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#115E59] transition"
          >
            <Plus size={16} />
            Mark Attendance
          </button>
        </div>
      </div>

      {showMarkAttendance && (
        <MarkAttendanceForm onClose={() => setShowMarkAttendance(false)} />
      )}

      {/* Summary KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          title="Total Punches Logged"
          value={summary.total}
          icon={<CalendarDays className="h-5 w-5 text-[#0F766E]" />}
        />
        <SummaryCard
          title="Present On-Site"
          value={summary.present}
          icon={<CheckCircle2 className="h-5 w-5 text-emerald-600" />}
        />
        <SummaryCard
          title="Absent / Unplanned"
          value={summary.absent}
          icon={<UserX className="h-5 w-5 text-red-600" />}
        />
        <SummaryCard
          title="Remote / WFH"
          value={summary.workFromHome}
          icon={<Home className="h-5 w-5 text-blue-600" />}
        />
      </div>

      {/* MATRIX VIEW */}
      {viewMode === "matrix" && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          {/* Matrix Header Controls */}
          <div className="border-b border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-50/50">
            <div className="flex items-center gap-3">
              <button
                onClick={prevMonth}
                className="rounded-lg border border-slate-200 bg-white p-1.5 hover:bg-slate-50 text-slate-600"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <h2 className="text-base font-bold text-slate-900">
                {monthNames[selectedMonth]} {selectedYear}
              </h2>
              <button
                onClick={nextMonth}
                className="rounded-lg border border-slate-200 bg-white p-1.5 hover:bg-slate-50 text-slate-600"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-3 text-xs font-semibold">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-3 w-3 rounded bg-emerald-500" /> Present (P)
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-3 w-3 rounded bg-blue-500" /> WFH
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-3 w-3 rounded bg-purple-500" /> Leave (L)
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-3 w-3 rounded bg-amber-500" /> Half Day (HD)
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-3 w-3 rounded bg-red-500" /> Absent (A)
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-3 w-3 rounded bg-slate-300" /> Weekend (W)
              </span>
            </div>
          </div>

          {/* Matrix Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-center text-xs">
              <thead className="bg-slate-100/75 text-slate-600 font-semibold border-b">
                <tr>
                  <th className="sticky left-0 z-20 bg-slate-100 px-4 py-3 text-left min-w-[200px] border-r">
                    Employee
                  </th>
                  {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                    const dayOfWeek = new Date(selectedYear, selectedMonth, day).getDay();
                    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                    return (
                      <th
                        key={day}
                        className={`px-1.5 py-2.5 min-w-[32px] border-r ${
                          isWeekend ? "bg-slate-200/60 font-bold text-slate-800" : ""
                        }`}
                      >
                        <div>{day}</div>
                        <div className="text-[9px] font-normal text-slate-400">
                          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"][dayOfWeek]}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50/70 transition">
                    <td className="sticky left-0 z-10 bg-white px-4 py-3 text-left font-medium text-slate-900 border-r shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                      <div className="font-semibold text-slate-900 truncate max-w-[180px]">
                        {emp.firstName} {emp.lastName}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {emp.employeeCode}
                      </div>
                    </td>
                    {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => (
                      <td key={day} className="p-1 border-r">
                        {getMatrixCellBadge(emp.id, day)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TABLE VIEW */}
      {viewMode === "table" && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label
                  htmlFor="attendance-date"
                  className="mb-1.5 block text-xs font-semibold text-slate-700"
                >
                  Specific Date
                </label>
                <input
                  id="attendance-date"
                  type="date"
                  value={date}
                  onChange={(event) => setDate(event.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs outline-none focus:border-[#0F766E] focus:ring-2 focus:ring-teal-100"
                />
              </div>

              <div>
                <label
                  htmlFor="attendance-status"
                  className="mb-1.5 block text-xs font-semibold text-slate-700"
                >
                  Attendance Status
                </label>
                <select
                  id="attendance-status"
                  value={status}
                  onChange={(event) =>
                    setStatus(event.target.value as AttendanceStatus | "")
                  }
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs outline-none focus:border-[#0F766E] focus:ring-2 focus:ring-teal-100"
                >
                  <option value="">All statuses</option>
                  <option value="PRESENT">Present</option>
                  <option value="ABSENT">Absent</option>
                  <option value="HALF_DAY">Half Day</option>
                  <option value="WORK_FROM_HOME">Work From Home</option>
                  <option value="ON_LEAVE">On Leave</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-4">
              <h2 className="font-semibold text-slate-900">Attendance Records</h2>
            </div>

            {loading ? (
              <div className="px-6 py-12 text-center text-sm text-slate-500">
                Loading attendance...
              </div>
            ) : records.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <Clock3 className="mx-auto h-10 w-10 text-slate-300" />
                <p className="mt-3 text-sm font-medium text-slate-700">
                  No attendance records found
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Try changing your search filters or mark attendance.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[850px] text-left">
                  <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500 border-b">
                    <tr>
                      <th className="px-6 py-3.5">Employee</th>
                      <th className="px-6 py-3.5">Department</th>
                      <th className="px-6 py-3.5">Date</th>
                      <th className="px-6 py-3.5">Status</th>
                      <th className="px-6 py-3.5">Punch In</th>
                      <th className="px-6 py-3.5">Punch Out</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100 text-sm">
                    {records.map((record) => (
                      <tr key={record.id} className="hover:bg-slate-50/70 transition">
                        <td className="px-6 py-4">
                          <div className="font-medium text-slate-900">
                            {record.employee.firstName} {record.employee.lastName}
                          </div>
                          <div className="text-xs text-slate-400 font-mono">
                            {record.employee.employeeCode}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {record.employee.department?.name || "—"}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                          {formatDate(record.date)}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusClasses(
                              record.status
                            )}`}
                          >
                            {getStatusLabel(record.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {formatTime(record.checkIn)}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {formatTime(record.checkOut)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50">
          {icon}
        </div>
      </div>
      <p className="mt-4 text-xs font-semibold text-slate-400 uppercase tracking-wide">
        {title}
      </p>
      <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
    </div>
  );
}