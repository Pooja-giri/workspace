"use client";

import { useState } from "react";

import { useAppDispatch } from "@/hooks/redux";

import {
  createGoal,
  fetchGoals,
} from "@/features/goals/goalSlice";

import {
  CreateGoalPayload,
  GoalPriority,
  GoalStatus,
} from "@/types/goal";

interface Employee {
  id: string;
  employeeCode?: string;
  firstName: string;
  lastName: string;
  designation?: string | null;
}

interface Props {
  employees: Employee[];
  onClose: () => void;
}

export default function GoalForm({
  employees,
  onClose,
}: Props) {
  const dispatch = useAppDispatch();

  const [form, setForm] = useState({
    employeeId: "",

    title: "",
    description: "",
    category: "",

    startDate: "",
    dueDate: "",

    targetValue: 100,
    currentValue: 0,

    status: "NOT_STARTED" as GoalStatus,
    priority: "MEDIUM" as GoalPriority,
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const updateField = (
    field: string,
    value: string | number
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleSubmit = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    setError("");

    if (!form.employeeId) {
      setError("Please select an employee.");
      return;
    }

    if (!form.title.trim()) {
      setError("Goal title is required.");
      return;
    }

    if (!form.startDate || !form.dueDate) {
      setError("Please select the goal dates.");
      return;
    }

    if (
      new Date(form.startDate) >
      new Date(form.dueDate)
    ) {
      setError(
        "Start date cannot be after due date."
      );
      return;
    }

    if (form.targetValue <= 0) {
      setError(
        "Target value must be greater than zero."
      );
      return;
    }

    if (
      form.currentValue < 0 ||
      form.currentValue > form.targetValue
    ) {
      setError(
        "Current value must be between 0 and target value."
      );
      return;
    }

    const payload: CreateGoalPayload = {
      employeeId: form.employeeId,

      title: form.title.trim(),
      description:
        form.description.trim() || undefined,
      category:
        form.category.trim() || undefined,

      startDate: form.startDate,
      dueDate: form.dueDate,

      targetValue: form.targetValue,
      currentValue: form.currentValue,

      status: form.status,
      priority: form.priority,
    };

    try {
      setSaving(true);

      await dispatch(
        createGoal(payload)
      ).unwrap();

      await dispatch(
        fetchGoals({})
      );

      onClose();
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : typeof err === "string"
            ? err
            : "Failed to create goal."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Employee */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Employee
        </label>

        <select
          value={form.employeeId}
          onChange={(event) =>
            updateField(
              "employeeId",
              event.target.value
            )
          }
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-gray-900"
        >
          <option value="">
            Select employee
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

      {/* Title */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Goal Title
        </label>

        <input
          type="text"
          value={form.title}
          onChange={(event) =>
            updateField(
              "title",
              event.target.value
            )
          }
          placeholder="e.g. Improve customer retention by 15%"
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-gray-900"
        />
      </div>

      {/* Category */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Category
        </label>

        <input
          type="text"
          value={form.category}
          onChange={(event) =>
            updateField(
              "category",
              event.target.value
            )
          }
          placeholder="e.g. Sales, Engineering, Leadership"
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-gray-900"
        />
      </div>

      {/* Dates */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Start Date
          </label>

          <input
            type="date"
            value={form.startDate}
            onChange={(event) =>
              updateField(
                "startDate",
                event.target.value
              )
            }
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-gray-900"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Due Date
          </label>

          <input
            type="date"
            value={form.dueDate}
            onChange={(event) =>
              updateField(
                "dueDate",
                event.target.value
              )
            }
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-gray-900"
          />
        </div>
      </div>

      {/* Progress */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-gray-900">
          Goal Progress
        </h3>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Target
            </label>

            <input
              type="number"
              min="1"
              value={form.targetValue}
              onChange={(event) =>
                updateField(
                  "targetValue",
                  Number(event.target.value)
                )
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-gray-900"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Current Progress
            </label>

            <input
              type="number"
              min="0"
              value={form.currentValue}
              onChange={(event) =>
                updateField(
                  "currentValue",
                  Number(event.target.value)
                )
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-gray-900"
            />
          </div>
        </div>
      </div>

      {/* Status + Priority */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Status
          </label>

          <select
            value={form.status}
            onChange={(event) =>
              updateField(
                "status",
                event.target.value
              )
            }
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-gray-900"
          >
            <option value="NOT_STARTED">
              Not Started
            </option>

            <option value="IN_PROGRESS">
              In Progress
            </option>

            <option value="COMPLETED">
              Completed
            </option>

            <option value="ON_HOLD">
              On Hold
            </option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Priority
          </label>

          <select
            value={form.priority}
            onChange={(event) =>
              updateField(
                "priority",
                event.target.value
              )
            }
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-gray-900"
          >
            <option value="LOW">
              Low
            </option>

            <option value="MEDIUM">
              Medium
            </option>

            <option value="HIGH">
              High
            </option>

            <option value="CRITICAL">
              Critical
            </option>
          </select>
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Description
        </label>

        <textarea
          rows={4}
          value={form.description}
          onChange={(event) =>
            updateField(
              "description",
              event.target.value
            )
          }
          placeholder="Describe the expected outcome and success criteria..."
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-gray-900"
        />
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-3 border-t pt-5">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving
            ? "Creating..."
            : "Create Goal"}
        </button>
      </div>
    </form>
  );
}