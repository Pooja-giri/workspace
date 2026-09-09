"use client";

import { FormEvent, useState } from "react";
import { X } from "lucide-react";
import api from "@/lib/api";
import { LeaveType } from "@/types/leave";

export interface LeaveTypeFormProps {
  leaveType: LeaveType | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function LeaveTypeForm({
  leaveType,
  onClose,
  onSaved,
}: LeaveTypeFormProps) {
  const [name, setName] = useState(
    leaveType?.name ?? ""
  );

  const [code, setCode] = useState(
    leaveType?.code ?? ""
  );

  const [description, setDescription] =
    useState(leaveType?.description ?? "");

  const [daysPerYear, setDaysPerYear] =
    useState(
      String(leaveType?.daysPerYear ?? 12)
    );

  const [isPaid, setIsPaid] = useState(
    leaveType?.isPaid ?? true
  );

  const [carryForward, setCarryForward] =
    useState(
      leaveType?.carryForward ?? false
    );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setSaving(true);
    setError("");

    try {
      const payload = {
        name,
        code: code.toUpperCase(),
        description: description || undefined,
        daysPerYear: Number(daysPerYear),
        isPaid,
        carryForward,
      };

      if (leaveType) {
        await api.put(
          `/leave-types/${leaveType.id}`,
          payload
        );
      } else {
        await api.post(
          "/leave-types",
          payload
        );
      }

      onSaved();
    } catch (error: unknown) {
      const response =
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        typeof error.response === "object" &&
        error.response !== null
          ? error.response
          : null;
      const data =
        response !== null &&
        "data" in response &&
        typeof response.data === "object" &&
        response.data !== null
          ? response.data
          : null;
      const message =
        data !== null &&
        "message" in data &&
        typeof data.message === "string"
          ? data.message
          : "Failed to save leave type";

      setError(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              {leaveType
                ? "Edit Leave Type"
                : "Add Leave Type"}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Configure leave policy
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
          className="space-y-5 p-6"
        >
          {error && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm font-medium">
              Name
            </label>

            <input
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              placeholder="Annual Leave"
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Code
            </label>

            <input
              value={code}
              onChange={(e) =>
                setCode(e.target.value)
              }
              placeholder="ANNUAL"
              required
              maxLength={20}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm uppercase outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Days Per Year
            </label>

            <input
              type="number"
              min="0"
              value={daysPerYear}
              onChange={(e) =>
                setDaysPerYear(
                  e.target.value
                )
              }
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Description
            </label>

            <textarea
              value={description}
              onChange={(e) =>
                setDescription(
                  e.target.value
                )
              }
              rows={3}
              placeholder="Description of this leave policy..."
              className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-3 text-sm">
              <input
                type="checkbox"
                checked={isPaid}
                onChange={(e) =>
                  setIsPaid(e.target.checked)
                }
                className="h-4 w-4 rounded"
              />

              Paid Leave
            </label>

            <label className="flex items-center gap-3 text-sm">
              <input
                type="checkbox"
                checked={carryForward}
                onChange={(e) =>
                  setCarryForward(
                    e.target.checked
                  )
                }
                className="h-4 w-4 rounded"
              />

              Allow Carry Forward
            </label>
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-200 pt-5 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium dark:border-slate-700"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : leaveType
                  ? "Update Leave Type"
                  : "Create Leave Type"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}