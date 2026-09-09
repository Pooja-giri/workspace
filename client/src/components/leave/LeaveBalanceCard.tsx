"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { fetchEmployeeLeaveBalances } from "@/features/leaveBalance/leaveBalanceSlice";
import {
  CalendarDays,
  Loader2,
} from "lucide-react";

interface LeaveBalanceCardProps {
  employeeId: string;
}

export default function LeaveBalanceCard({
  employeeId,
}: LeaveBalanceCardProps) {
  const dispatch = useAppDispatch();

  const { balances, loading, error } = useAppSelector(
    (state) => state.leaveBalances
  );

  useEffect(() => {
    if (employeeId) {
      dispatch(fetchEmployeeLeaveBalances(employeeId));
    }
  }, [employeeId, dispatch]);

  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-xl border bg-white p-8">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Loading leave balances...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
        {error}
      </div>
    );
  }

  if (!balances.length) {
    return (
      <div className="rounded-xl border bg-white p-8 text-center">
        <CalendarDays className="mx-auto mb-3 h-8 w-8 text-gray-400" />

        <p className="font-medium text-gray-700">
          No leave balance configured
        </p>

        <p className="mt-1 text-sm text-gray-500">
          Leave balances have not been configured for this employee.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {balances.map((balance: (typeof balances)[number]) => (
        <div
          key={balance.id}
          className="rounded-xl border bg-white p-5 shadow-sm"
        >
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">
                {balance.leaveType.name}
              </h3>

              <p className="text-xs text-gray-500">
                {balance.leaveType.code}
              </p>
            </div>

            <CalendarDays className="h-5 w-5 text-gray-400" />
          </div>

          <div className="mt-5">
            <p className="text-3xl font-bold text-gray-900">
              {balance.availableDays}
            </p>

            <p className="text-sm text-gray-500">
              days available
            </p>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
            <div className="rounded-lg bg-gray-50 p-2">
              <p className="font-semibold text-gray-900">
                {balance.totalDays}
              </p>
              <p className="text-gray-500">Total</p>
            </div>

            <div className="rounded-lg bg-gray-50 p-2">
              <p className="font-semibold text-gray-900">
                {balance.usedDays}
              </p>
              <p className="text-gray-500">Used</p>
            </div>

            <div className="rounded-lg bg-gray-50 p-2">
              <p className="font-semibold text-gray-900">
                {balance.carriedForward}
              </p>
              <p className="text-gray-500">Carry</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}