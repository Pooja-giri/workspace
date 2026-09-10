"use client";

import { FormEvent, useEffect, useState } from "react";
import { X } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import {
  createLeaveRequest,
  fetchLeaveTypes,
  fetchLeaveRequests,
} from "@/features/leave/leaveSlice";
import { fetchEmployees } from "@/features/employees/employeeSlice";

interface Props {
  onClose: () => void;
}

interface LeaveType {
  id: string | number;
  name: string;
  daysPerYear: number;
}

export default function ApplyLeaveForm({ onClose }: Props) {
  const dispatch = useAppDispatch();

  const {
    leaveTypes,
    saving,
    error,
  } = useAppSelector((state) => state.leave);

  const {
    employees,
    loading: employeesLoading,
  } = useAppSelector((state) => state.employees);

  const [employeeId, setEmployeeId] = useState("");
  const [leaveTypeId, setLeaveTypeId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");

  useEffect(() => {
    dispatch(fetchLeaveTypes());

    dispatch(
      fetchEmployees({
        page: 1,
        limit: 100,
      })
    );
  }, [dispatch]);

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!employeeId || !leaveTypeId) {
      return;
    }

    if (endDate < startDate) {
      return;
    }

    try {
      await dispatch(
        createLeaveRequest({
          employeeId,
          leaveTypeId,
          startDate,
          endDate,
          reason,
        })
      ).unwrap();

      await dispatch(fetchLeaveRequests());

      onClose();
    } catch {
      // Redux stores the API error.
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl dark:bg-slate-900">
        {/* Header */}

        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Apply for Leave
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Submit a leave request for an employee
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

        <form
          onSubmit={handleSubmit}
          className="space-y-6 p-6"
        >
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
              onChange={(e) =>
                setEmployeeId(e.target.value)
              }
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
                <option
                  key={employee.id}
                  value={employee.id}
                >
                  {employee.firstName}{" "}
                  {employee.lastName}
                  {employee.employeeCode
                    ? ` (${employee.employeeCode})`
                    : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Leave Type */}

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
              Leave Type
            </label>

            <select
              value={leaveTypeId}
              onChange={(e) =>
                setLeaveTypeId(e.target.value)
              }
              required
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              <option value="">
                Select leave type
              </option>

              {leaveTypes.map((leaveType: LeaveType) => (
                <option
                  key={leaveType.id}
                  value={leaveType.id}
                >
                  {leaveType.name} —{" "}
                  {leaveType.daysPerYear} days/year
                </option>
              ))}
            </select>
          </div>

          {/* Dates */}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
                Start Date
              </label>

              <input
                type="date"
                value={startDate}
                onChange={(e) =>
                  setStartDate(e.target.value)
                }
                required
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
                End Date
              </label>

              <input
                type="date"
                min={startDate}
                value={endDate}
                onChange={(e) =>
                  setEndDate(e.target.value)
                }
                required
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>

          {/* Reason */}

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
              Reason
            </label>

            <textarea
              value={reason}
              onChange={(e) =>
                setReason(e.target.value)
              }
              required
              minLength={3}
              rows={4}
              placeholder="Explain the reason for leave..."
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
              disabled={
                saving ||
                !employeeId ||
                !leaveTypeId ||
                !startDate ||
                !endDate ||
                !reason
              }
              className="rounded-lg bg-[#0F766E] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#115E59] disabled:cursor-not-allowed disabled:opacity-50 transition"
            >
              {saving
                ? "Submitting..."
                : "Submit Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}