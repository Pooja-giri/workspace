"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  XCircle,
  Plus,
  Calendar,
  Layers,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Filter,
  UserCheck,
} from "lucide-react";

import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import {
  fetchLeaveRequests,
  updateLeaveRequestStatus,
} from "@/features/leave/leaveSlice";
import { fetchEmployeeLeaveBalances } from "@/features/leaveBalance/leaveBalanceSlice";
import { fetchEmployees } from "@/features/employees/employeeSlice";
import LeaveBalanceCard from "@/components/leave/LeaveBalanceCard";
import ApplyLeaveForm from "@/components/leave/ApplyLeaveForm";

type ActiveTab = "requests" | "approvals" | "calendar" | "balances";

export default function LeavePage() {
  const dispatch = useAppDispatch();

  const [activeTab, setActiveTab] = useState<ActiveTab>("requests");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Rejection reason modal state
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectingRequestId, setRejectingRequestId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  // Calendar month state
  const today = new Date();
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());

  const { requests, loading, error } = useAppSelector((state) => state.leave);
  const { employees } = useAppSelector((state) => state.employees);

  useEffect(() => {
    dispatch(fetchEmployees({ page: 1, limit: 100 }));
    dispatch(fetchLeaveRequests({ page: 1, limit: 100 }));
  }, [dispatch]);

  /* Calculate statistics */
  const totalRequests = requests.length;
  const pendingRequests = requests.filter((r) => r.status === "PENDING");
  const approvedRequests = requests.filter((r) => r.status === "APPROVED");
  const rejectedRequests = requests.filter((r) => r.status === "REJECTED");

  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      if (statusFilter === "ALL") return true;
      return req.status === statusFilter;
    });
  }, [requests, statusFilter]);

  /* Approve leave */
  const handleApprove = async (id: string) => {
    const result = await dispatch(
      updateLeaveRequestStatus({
        id,
        status: "APPROVED",
      })
    );

    if (updateLeaveRequestStatus.fulfilled.match(result)) {
      await dispatch(fetchLeaveRequests({ page: 1, limit: 100 }));
      if (selectedEmployeeId) {
        await dispatch(fetchEmployeeLeaveBalances(selectedEmployeeId));
      }
    }
  };

  /* Open Reject Modal */
  const openRejectModal = (id: string) => {
    setRejectingRequestId(id);
    setRejectReason("");
    setRejectModalOpen(true);
  };

  /* Confirm Reject with Reason */
  const handleConfirmReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingRequestId) return;

    await dispatch(
      updateLeaveRequestStatus({
        id: rejectingRequestId,
        status: "REJECTED",
      })
    );

    setRejectModalOpen(false);
    setRejectingRequestId(null);
    dispatch(fetchLeaveRequests({ page: 1, limit: 100 }));
  };

  /* Format date */
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  /* Status badge */
  const getStatusClass = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "bg-emerald-50 text-emerald-700 border border-emerald-200";
      case "REJECTED":
        return "bg-red-50 text-red-700 border border-red-200";
      case "CANCELLED":
        return "bg-slate-100 text-slate-600 border border-slate-200";
      default:
        return "bg-amber-50 text-amber-700 border border-amber-200";
    }
  };

  // Calendar calculations
  const daysInCalMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(calYear, calMonth, 1).getDay(); // 0 = Sun
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const nextCalMonth = () => {
    if (calMonth === 11) {
      setCalMonth(0);
      setCalYear((y) => y + 1);
    } else {
      setCalMonth((m) => m + 1);
    }
  };

  const prevCalMonth = () => {
    if (calMonth === 0) {
      setCalMonth(11);
      setCalYear((y) => y - 1);
    } else {
      setCalMonth((m) => m - 1);
    }
  };

  // Find approved leaves overlapping with a specific date
  const getLeavesForDate = (day: number) => {
    const currentTargetDate = new Date(calYear, calMonth, day);
    currentTargetDate.setHours(0, 0, 0, 0);

    return requests.filter((r) => {
      if (r.status !== "APPROVED") return false;
      const start = new Date(r.startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(r.endDate);
      end.setHours(23, 59, 59, 999);
      return currentTargetDate >= start && currentTargetDate <= end;
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Leave Management</h1>
          <p className="mt-1 text-sm text-slate-500 font-medium">
            Manage employee leave requests, approval workflows, and company-wide calendar.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowApplyForm(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Apply Leave
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                Total Requests
              </p>
              <p className="mt-2 text-2xl font-bold text-slate-900">{totalRequests}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3 text-slate-700">
              <CalendarDays className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide">
                Pending Approvals
              </p>
              <p className="mt-2 text-2xl font-bold text-slate-900">{pendingRequests.length}</p>
            </div>
            <div className="rounded-xl bg-amber-50 p-3 text-amber-600">
              <Clock3 className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide">
                Approved
              </p>
              <p className="mt-2 text-2xl font-bold text-slate-900">{approvedRequests.length}</p>
            </div>
            <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-red-600 uppercase tracking-wide">
                Rejected
              </p>
              <p className="mt-2 text-2xl font-bold text-slate-900">{rejectedRequests.length}</p>
            </div>
            <div className="rounded-xl bg-red-50 p-3 text-red-600">
              <XCircle className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 bg-white p-2 rounded-2xl border shadow-sm overflow-x-auto">
        <button
          onClick={() => setActiveTab("requests")}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
            activeTab === "requests"
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          }`}
        >
          <Layers className="h-4 w-4" />
          All Requests ({requests.length})
        </button>

        <button
          onClick={() => setActiveTab("approvals")}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
            activeTab === "approvals"
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          }`}
        >
          <ShieldCheck className="h-4 w-4 text-amber-500" />
          Pending Approvals
          {pendingRequests.length > 0 && (
            <span className="rounded-full bg-amber-500 text-white px-2 py-0.5 text-[10px]">
              {pendingRequests.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("calendar")}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
            activeTab === "calendar"
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          }`}
        >
          <Calendar className="h-4 w-4" />
          Leave Calendar
        </button>

        <button
          onClick={() => setActiveTab("balances")}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
            activeTab === "balances"
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          }`}
        >
          <UserCheck className="h-4 w-4" />
          Leave Balances
        </button>
      </div>

      {/* TAB 1: ALL REQUESTS */}
      {activeTab === "requests" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
              <Filter className="h-4 w-4 text-slate-400" />
              Filter by Status:
            </div>
            <div className="flex gap-2">
              {["ALL", "PENDING", "APPROVED", "REJECTED"].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
                    statusFilter === st
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-4">
              <h2 className="text-base font-bold text-slate-900">Leave Requests Directory</h2>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="h-7 w-7 animate-spin rounded-full border-2 border-slate-300 border-t-indigo-600" />
                <span className="ml-3 text-sm text-slate-500 font-medium">
                  Loading leave requests...
                </span>
              </div>
            ) : filteredRequests.length === 0 ? (
              <div className="py-12 text-center">
                <CalendarDays className="mx-auto h-10 w-10 text-slate-300" />
                <p className="mt-3 text-sm font-semibold text-slate-700">
                  No leave requests found
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  No records match the current status filter.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase font-semibold text-slate-500">
                    <tr>
                      <th className="px-6 py-3.5">Employee</th>
                      <th className="px-6 py-3.5">Leave Type</th>
                      <th className="px-6 py-3.5">Dates</th>
                      <th className="px-6 py-3.5">Days</th>
                      <th className="px-6 py-3.5">Reason</th>
                      <th className="px-6 py-3.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredRequests.map((request) => (
                      <tr key={request.id} className="hover:bg-slate-50/70 transition">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-slate-900">
                            {request.employee?.firstName} {request.employee?.lastName}
                          </div>
                          <div className="text-xs text-slate-400 font-mono">
                            {request.employee?.employeeCode}
                          </div>
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-800">
                          {request.leaveType?.name || "General"}
                        </td>
                        <td className="px-6 py-4 text-slate-600 text-xs">
                          <div>{formatDate(request.startDate)}</div>
                          <div className="text-slate-400">to {formatDate(request.endDate)}</div>
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-900">
                          {request.totalDays}
                        </td>
                        <td className="max-w-[200px] px-6 py-4 text-slate-600 text-xs truncate">
                          {request.reason || "—"}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusClass(
                              request.status
                            )}`}
                          >
                            {request.status}
                          </span>
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

      {/* TAB 2: PENDING APPROVALS SCREEN */}
      {activeTab === "approvals" && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-900">
              Manager Approval Queue
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Review and act on pending leave requests with automated attendance and quota adjustments.
            </p>
          </div>

          {pendingRequests.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
              <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
              <p className="mt-3 text-base font-bold text-slate-900">
                All Approvals Complete!
              </p>
              <p className="mt-1 text-xs text-slate-500">
                There are currently no pending leave requests awaiting review.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {pendingRequests.map((req) => (
                <div
                  key={req.id}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between hover:border-indigo-200 transition"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-bold text-amber-700">
                        {req.leaveType?.name || "Leave Request"}
                      </span>
                      <span className="text-sm font-bold text-slate-900">
                        {req.totalDays} Day{req.totalDays > 1 ? "s" : ""}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-base font-bold text-slate-900">
                        {req.employee?.firstName} {req.employee?.lastName}
                      </h4>
                      <p className="text-xs text-slate-500 font-medium">
                        {req.employee?.department?.name || "General"} &bull;{" "}
                        {req.employee?.employeeCode}
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-700 space-y-1">
                      <p className="font-semibold text-slate-900">
                        Period: {formatDate(req.startDate)} - {formatDate(req.endDate)}
                      </p>
                      {req.reason && (
                        <p className="text-slate-600 italic">&ldquo;{req.reason}&rdquo;</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-5 flex gap-2 pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => handleApprove(req.id)}
                      className="flex-1 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 transition"
                    >
                      Approve Request
                    </button>
                    <button
                      type="button"
                      onClick={() => openRejectModal(req.id)}
                      className="flex-1 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-xs font-semibold text-red-700 hover:bg-red-100 transition"
                    >
                      Reject with Reason
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: COMPANY-WIDE LEAVE CALENDAR */}
      {activeTab === "calendar" && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-slate-200 p-6 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-3">
              <button
                onClick={prevCalMonth}
                className="rounded-lg border border-slate-200 bg-white p-1.5 hover:bg-slate-50 text-slate-600"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <h2 className="text-lg font-bold text-slate-900">
                {monthNames[calMonth]} {calYear}
              </h2>
              <button
                onClick={nextCalMonth}
                className="rounded-lg border border-slate-200 bg-white p-1.5 hover:bg-slate-50 text-slate-600"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <div className="text-xs font-medium text-slate-500">
              Showing approved team absences
            </div>
          </div>

          <div className="p-4">
            {/* Days of week header */}
            <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-500 uppercase pb-2 border-b border-slate-100">
              <span>Sun</span>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-2 pt-2">
              {/* Empty leading days */}
              {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
                <div key={`empty-${idx}`} className="min-h-[100px] rounded-xl bg-slate-50/40 p-2" />
              ))}

              {/* Days of current month */}
              {Array.from({ length: daysInCalMonth }, (_, i) => i + 1).map((day) => {
                const dayLeaves = getLeavesForDate(day);
                const isToday =
                  day === today.getDate() &&
                  calMonth === today.getMonth() &&
                  calYear === today.getFullYear();

                return (
                  <div
                    key={`day-${day}`}
                    className={`min-h-[100px] rounded-xl border p-2 flex flex-col justify-between transition ${
                      isToday
                        ? "border-indigo-500 bg-indigo-50/20"
                        : "border-slate-100 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-bold ${
                          isToday
                            ? "flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-white"
                            : "text-slate-800"
                        }`}
                      >
                        {day}
                      </span>
                      {dayLeaves.length > 0 && (
                        <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded-full">
                          {dayLeaves.length} Off
                        </span>
                      )}
                    </div>

                    <div className="mt-1 space-y-1">
                      {dayLeaves.slice(0, 2).map((l) => (
                        <div
                          key={l.id}
                          className="rounded bg-purple-50 border border-purple-200 px-1.5 py-0.5 text-[10px] font-semibold text-purple-800 truncate"
                          title={`${l.employee?.firstName} ${l.employee?.lastName} - ${l.leaveType?.name}`}
                        >
                          {l.employee?.firstName} ({l.leaveType?.name?.slice(0, 3)})
                        </div>
                      ))}
                      {dayLeaves.length > 2 && (
                        <div className="text-[9px] text-slate-400 font-semibold pl-1">
                          +{dayLeaves.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: LEAVE BALANCES */}
      {activeTab === "balances" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-900">
              Employee Leave Balance Explorer
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Select an employee to inspect remaining annual quotas and leave utilization.
            </p>

            <select
              value={selectedEmployeeId}
              onChange={(e) => setSelectedEmployeeId(e.target.value)}
              className="mt-4 w-full max-w-md rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 font-medium"
            >
              <option value="">Select an employee...</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.firstName} {emp.lastName} ({emp.employeeCode})
                </option>
              ))}
            </select>
          </div>

          {selectedEmployeeId ? (
            <LeaveBalanceCard employeeId={selectedEmployeeId} />
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-400 text-sm">
              Please choose an employee from the dropdown above to view balances.
            </div>
          )}
        </div>
      )}

      {/* Reject with Reason Modal */}
      {rejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Reject Leave Request
            </h3>
            <p className="text-xs text-slate-500">
              Provide a clear reason for rejecting this leave application.
            </p>
            <form onSubmit={handleConfirmReject} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Rejection Justification
                </label>
                <textarea
                  required
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="e.g. Critical project deadline conflict during this sprint."
                  className="w-full rounded-xl border border-slate-300 p-3 text-xs outline-none focus:border-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Apply Leave Modal */}
      {showApplyForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">Apply Leave</h2>
                <p className="text-xs text-slate-500">Create a new leave request.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowApplyForm(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              <ApplyLeaveForm onClose={() => setShowApplyForm(false)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
