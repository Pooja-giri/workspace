"use client";

import { useEffect, useState } from "react";
import {
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import {
  fetchLeaveTypes,
} from "@/features/leave/leaveSlice";
import api from "@/lib/api";
import { LeaveType } from "@/types/leave";
import LeaveTypeForm from "@/components/leave/LeaveTypeForm";



export default function LeaveTypesPage() {
  const dispatch = useAppDispatch();

  const {
    leaveTypes,
    loading,
    error,
  } = useAppSelector((state) => state.leave);

  const [showForm, setShowForm] = useState(false);

  const [editingType, setEditingType] =
    useState<LeaveType | null>(null);

  useEffect(() => {
    dispatch(fetchLeaveTypes());
  }, [dispatch]);

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this leave type?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`/leave-types/${id}`);

      dispatch(fetchLeaveTypes());
    } catch (error: unknown) {
      const responseMessage =
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        typeof error.response === "object" &&
        error.response !== null &&
        "data" in error.response &&
        typeof error.response.data === "object" &&
        error.response.data !== null &&
        "message" in error.response.data &&
        typeof error.response.data.message === "string"
          ? error.response.data.message
          : undefined;

      window.alert(
        responseMessage || "Failed to delete leave type"
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Leave Types
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Configure leave policies for your organization
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingType(null);
            setShowForm(true);
          }}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus size={18} />
          Add Leave Type
        </button>
      </div>

      {/* Error */}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Table */}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/50">
              <tr>
                <th className="px-6 py-4 font-semibold">
                  Name
                </th>

                <th className="px-6 py-4 font-semibold">
                  Code
                </th>

                <th className="px-6 py-4 font-semibold">
                  Days / Year
                </th>

                <th className="px-6 py-4 font-semibold">
                  Paid
                </th>

                <th className="px-6 py-4 font-semibold">
                  Carry Forward
                </th>

                <th className="px-6 py-4 font-semibold">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-slate-500"
                  >
                    Loading leave types...
                  </td>
                </tr>
              ) : leaveTypes.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-slate-500"
                  >
                    No leave types configured.
                  </td>
                </tr>
              ) : (
                leaveTypes.map((leaveType) => (
                  <tr
                    key={leaveType.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40"
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900 dark:text-white">
                        {leaveType.name}
                      </div>

                      {leaveType.description && (
                        <div className="mt-1 text-xs text-slate-500">
                          {leaveType.description}
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-4 font-mono text-xs">
                      {leaveType.code}
                    </td>

                    <td className="px-6 py-4">
                      {leaveType.daysPerYear}
                    </td>

                    <td className="px-6 py-4">
                      {leaveType.isPaid ? (
                        <span className="text-emerald-600">
                          Yes
                        </span>
                      ) : (
                        <span className="text-slate-500">
                          No
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      {leaveType.carryForward
                        ? "Yes"
                        : "No"}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingType(
                              leaveType
                            );
                            setShowForm(true);
                          }}
                          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-blue-600 dark:hover:bg-slate-800"
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(
                              leaveType.id
                            )
                          }
                          className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-slate-800"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form placeholder */}

      {showForm && (
        <LeaveTypeForm
          leaveType={editingType}
          onClose={() => {
            setShowForm(false);
            setEditingType(null);
          }}
          onSaved={() => {
            setShowForm(false);
            setEditingType(null);
            dispatch(fetchLeaveTypes());
          }}
        />
      )}
    </div>
  );
}