"use client";

import { FormEvent, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import {
  clearAttendanceError,
  createAttendance,
  fetchAttendance,
} from "@/features/attendance/attendanceSlice";
import { fetchEmployees } from "@/features/employees/employeeSlice";
import { AttendanceStatus } from "@/types/attendance";
import { X } from "lucide-react";

interface Props {
  onClose: () => void;
}

export default function MarkAttendanceForm({ onClose }: Props) {
  const dispatch = useAppDispatch();

  const { saving, error } = useAppSelector((state) => state.attendance);
  const { employees, loading: employeesLoading } = useAppSelector(
    (state) => state.employees
  );

  const [employeeId, setEmployeeId] = useState("");
  const [date, setDate] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });
  const [status, setStatus] =
    useState<AttendanceStatus>("PRESENT");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    dispatch(clearAttendanceError());

    dispatch(
      fetchEmployees({
        page: 1,
        limit: 100,
      })
    );

    return () => {
      dispatch(clearAttendanceError());
    };
  }, [dispatch]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!employeeId || !date) {
      return;
    }

    const formatDateTime = (t: string) => {
      if (!t) return undefined;
      if (t.includes("T")) return t;
      return `${date}T${t}:00`;
    };

    try {
      await dispatch(
        createAttendance({
          employeeId,
          date,
          status,
          checkIn: formatDateTime(checkIn),
          checkOut: formatDateTime(checkOut),
          notes: notes.trim() || undefined,
        })
      ).unwrap();

      await dispatch(
        fetchAttendance({})
      );

      onClose();
    } catch {
      // Error is already stored in Redux
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl dark:bg-slate-900">
        {/* Header */}

        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Mark Attendance
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Record attendance for an employee
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}

        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Employee */}

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
              Employee
            </label>

            <select
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              required
              disabled={employeesLoading}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              <option value="">
                {employeesLoading
                  ? "Loading employees..."
                  : "Select employee"}
              </option>

              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.firstName} {employee.lastName}
                  {employee.employeeCode
                    ? ` (${employee.employeeCode})`
                    : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Date + Status */}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
                Date
              </label>

              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
                Status
              </label>

              <select
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value as AttendanceStatus)
                }
                required
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="PRESENT">Present</option>
                <option value="ABSENT">Absent</option>
                <option value="HALF_DAY">Half Day</option>
                <option value="WORK_FROM_HOME">
                  Work From Home
                </option>
                <option value="ON_LEAVE">On Leave</option>
              </select>
            </div>
          </div>

          {/* Time */}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
                Check In
              </label>

              <input
                type="time"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
                Check Out
              </label>

              <input
                type="time"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>

          {/* Notes */}

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
              Notes
            </label>

            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Optional notes..."
              className="w-full resize-none rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          {/* Actions */}

          <div className="flex justify-end gap-3 border-t border-slate-200 pt-5 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving || !employeeId}
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Saving..." : "Mark Attendance"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}