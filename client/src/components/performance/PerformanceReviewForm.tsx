"use client";

import { useState } from "react";
import { useAppDispatch } from "@/hooks/redux";
import {
  createPerformanceReview,
  fetchPerformanceReviews,
} from "@/features/performance/performanceSlice";
import { CreatePerformanceReviewPayload } from "@/types/performance";

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

function RatingSelect({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-700">
        {label}
      </label>

      <select
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-gray-900"
      >
        {[1, 2, 3, 4, 5].map((rating) => (
          <option key={rating} value={rating}>
            {rating} / 5
          </option>
        ))}
      </select>
    </div>
  );
}

export default function PerformanceReviewForm({
  employees,
  onClose,
}: Props) {
  const dispatch = useAppDispatch();

  const [form, setForm] = useState({
    employeeId: "",
    reviewerId: "",
    periodStart: "",
    periodEnd: "",

    overallRating: 3,
    technicalRating: 3,
    communicationRating: 3,
    teamworkRating: 3,
    leadershipRating: 3,

    strengths: "",
    improvements: "",
    comments: "",

    status: "DRAFT" as const,
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const updateField = (field: string, value: string | number) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");

    if (!form.employeeId) {
      setError("Please select an employee.");
      return;
    }

    if (!form.reviewerId) {
      setError("Please select a reviewer.");
      return;
    }

    if (!form.periodStart || !form.periodEnd) {
      setError("Please select the review period.");
      return;
    }

    if (new Date(form.periodStart) > new Date(form.periodEnd)) {
      setError("Period start cannot be after period end.");
      return;
    }

    const payload: CreatePerformanceReviewPayload = {
      employeeId: form.employeeId,
      reviewerId: form.reviewerId,

      periodStart: form.periodStart,
      periodEnd: form.periodEnd,

      overallRating: form.overallRating,
      technicalRating: form.technicalRating,
      communicationRating: form.communicationRating,
      teamworkRating: form.teamworkRating,
      leadershipRating: form.leadershipRating,

      strengths: form.strengths,
      improvements: form.improvements,
      comments: form.comments,

      status: form.status,
    };

    try {
      setSaving(true);

      await dispatch(createPerformanceReview(payload)).unwrap();

      await dispatch(fetchPerformanceReviews({}));

      onClose();
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : typeof err === "string"
            ? err
            : "Failed to create performance review."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Employee
          </label>

          <select
            value={form.employeeId}
            onChange={(e) => updateField("employeeId", e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-gray-900"
          >
            <option value="">Select employee</option>

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

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Reviewer
          </label>

          <select
            value={form.reviewerId}
            onChange={(e) => updateField("reviewerId", e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-gray-900"
          >
            <option value="">Select reviewer</option>

            {employees.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.firstName} {employee.lastName}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-gray-900">
          Review Period
        </h3>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Start Date
            </label>

            <input
              type="date"
              value={form.periodStart}
              onChange={(e) =>
                updateField("periodStart", e.target.value)
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-gray-900"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              End Date
            </label>

            <input
              type="date"
              value={form.periodEnd}
              onChange={(e) => updateField("periodEnd", e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-gray-900"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-sm font-semibold text-gray-900">
          Performance Ratings
        </h3>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <RatingSelect
            label="Overall Rating"
            value={form.overallRating}
            onChange={(value) => updateField("overallRating", value)}
          />

          <RatingSelect
            label="Technical Skills"
            value={form.technicalRating}
            onChange={(value) => updateField("technicalRating", value)}
          />

          <RatingSelect
            label="Communication"
            value={form.communicationRating}
            onChange={(value) => updateField("communicationRating", value)}
          />

          <RatingSelect
            label="Teamwork"
            value={form.teamworkRating}
            onChange={(value) => updateField("teamworkRating", value)}
          />

          <RatingSelect
            label="Leadership"
            value={form.leadershipRating}
            onChange={(value) => updateField("leadershipRating", value)}
          />
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Strengths
          </label>

          <textarea
            rows={3}
            value={form.strengths}
            onChange={(e) =>
              updateField("strengths", e.target.value)
            }
            placeholder="What does this employee do particularly well?"
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-gray-900"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Areas for Improvement
          </label>

          <textarea
            rows={3}
            value={form.improvements}
            onChange={(e) =>
              updateField("improvements", e.target.value)
            }
            placeholder="What areas should the employee improve?"
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-gray-900"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Additional Comments
          </label>

          <textarea
            rows={3}
            value={form.comments}
            onChange={(e) =>
              updateField("comments", e.target.value)
            }
            placeholder="Additional feedback..."
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-gray-900"
          />
        </div>
      </div>

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
          className="rounded-lg bg-[#0F766E] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#115E59] disabled:cursor-not-allowed disabled:opacity-50 transition shadow-sm"
        >
          {saving ? "Saving..." : "Create Review"}
        </button>
      </div>
    </form>
  );
}