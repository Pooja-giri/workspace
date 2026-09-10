"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Award,
  CheckCircle2,
  Clock3,
  Eye,
  Plus,
  Star,
  TrendingUp,
  X,
  Sparkles,
  ShieldCheck,
  UserCheck,
} from "lucide-react";

import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { fetchEmployees } from "@/features/employees/employeeSlice";
import {
  deletePerformanceReview,
  fetchPerformanceReviews,
} from "@/features/performance/performanceSlice";
import { PerformanceReview } from "@/types/performance";
import PerformanceReviewForm from "@/components/performance/PerformanceReviewForm";

export default function PerformancePage() {
  const dispatch = useAppDispatch();

  const { reviews, loading, error } = useAppSelector(
    (state) => state.performance
  );
  const employees = useAppSelector((state) => state.employees.employees);

  const [showCreate, setShowCreate] = useState(false);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedReview, setSelectedReview] = useState<PerformanceReview | null>(null);

  useEffect(() => {
    dispatch(fetchEmployees({}));
    dispatch(fetchPerformanceReviews({}));
  }, [dispatch]);

  const filteredReviews = useMemo(() => {
    if (statusFilter === "ALL") {
      return reviews;
    }
    return reviews.filter(
      (review: PerformanceReview) => review.status === statusFilter
    );
  }, [reviews, statusFilter]);

  const averageRating = useMemo(() => {
    if (!reviews.length) return 0;
    const total = reviews.reduce(
      (sum: number, review: PerformanceReview) =>
        sum + Number(review.overallRating || 0),
      0
    );
    return total / reviews.length;
  }, [reviews]);

  const submittedCount = reviews.filter(
    (r: PerformanceReview) => r.status === "SUBMITTED"
  ).length;

  const acknowledgedCount = reviews.filter(
    (r: PerformanceReview) => r.status === "ACKNOWLEDGED"
  ).length;

  const draftCount = reviews.filter(
    (r: PerformanceReview) => r.status === "DRAFT"
  ).length;

  const getEmployeeName = (
    review: PerformanceReview & {
      employee?: { firstName: string; lastName: string };
    }
  ) => {
    if (review.employee) {
      return `${review.employee.firstName} ${review.employee.lastName}`;
    }
    return "Unknown Employee";
  };

  const getReviewerName = (
    review: PerformanceReview & {
      reviewer?: { firstName: string; lastName: string };
    }
  ) => {
    if (review.reviewer) {
      return `${review.reviewer.firstName} ${review.reviewer.lastName}`;
    }
    return "System Lead";
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "ACKNOWLEDGED":
      case "COMPLETED":
        return "bg-emerald-50 text-emerald-700 border border-emerald-200";
      case "SUBMITTED":
        return "bg-blue-50 text-blue-700 border border-blue-200";
      case "DRAFT":
        return "bg-slate-100 text-slate-700 border border-slate-200";
      default:
        return "bg-slate-100 text-slate-700 border border-slate-200";
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const confirmed = window.confirm(
      "Are you sure you want to delete this draft review?"
    );
    if (!confirmed) return;

    try {
      await dispatch(deletePerformanceReview(id)).unwrap();
    } catch (err: unknown) {
      window.alert(
        err instanceof Error ? err.message : "Unable to delete review."
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Performance Management
          </h1>
          <p className="mt-1 text-sm text-slate-500 font-medium">
            360° reviews, multi-criteria evaluations (Technical, Leadership, Communication), and development roadmaps.
          </p>
        </div>

        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0F766E] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#115E59] shadow-sm transition"
        >
          <Plus size={16} />
          New Performance Review
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                Total Reviews
              </p>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                {reviews.length}
              </p>
            </div>
            <div className="rounded-xl bg-teal-50 p-3 text-[#0F766E]">
              <Award size={20} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                Average Rating
              </p>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                {averageRating.toFixed(1)}
                <span className="ml-1 text-sm font-normal text-slate-400">
                  / 5.0
                </span>
              </p>
            </div>
            <div className="rounded-xl bg-amber-50 p-3 text-amber-500">
              <Star size={20} className="fill-amber-400" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                Submitted Cycles
              </p>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                {submittedCount}
              </p>
            </div>
            <div className="rounded-xl bg-blue-50 p-3 text-[#2563EB]">
              <TrendingUp size={20} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                Acknowledged
              </p>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                {acknowledgedCount}
              </p>
            </div>
            <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
              <CheckCircle2 size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between shadow-sm">
        <div>
          <p className="text-sm font-bold text-slate-900">
            Performance Reviews Directory
          </p>
          <p className="text-xs text-slate-500 font-medium">
            {draftCount} draft &bull; {filteredReviews.length} shown
          </p>
        </div>

        <div className="flex gap-2">
          {["ALL", "DRAFT", "SUBMITTED", "ACKNOWLEDGED"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition ${
                statusFilter === st
                  ? "bg-[#0F766E] text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Reviews Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase font-semibold text-slate-500">
              <tr>
                <th className="px-6 py-3.5">Employee</th>
                <th className="px-6 py-3.5">Review Cycle</th>
                <th className="px-6 py-3.5">Reviewer</th>
                <th className="px-6 py-3.5">Criteria & Rating</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading && reviews.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-500">
                    Loading performance reviews...
                  </td>
                </tr>
              ) : filteredReviews.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Award size={32} className="mx-auto text-slate-300" />
                    <p className="mt-3 text-sm font-semibold text-slate-800">
                      No performance reviews found
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      Create your first multi-criteria employee review.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredReviews.map((review) => (
                  <tr
                    key={review.id}
                    onClick={() => setSelectedReview(review)}
                    className="cursor-pointer hover:bg-slate-50/70 transition"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-bold text-slate-900">
                          {getEmployeeName(review)}
                        </p>
                        <p className="text-xs text-slate-400 font-mono mt-0.5">
                          {review.employee?.employeeCode || "EMP"}
                        </p>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-xs text-slate-600 font-medium">
                      {new Date(review.periodStart).toLocaleDateString()} &mdash;{" "}
                      {new Date(review.periodEnd).toLocaleDateString()}
                    </td>

                    <td className="px-6 py-4 text-xs text-slate-700 font-semibold">
                      {getReviewerName(review)}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <Star size={16} className="fill-amber-400 text-amber-400" />
                        <span className="text-sm font-bold text-slate-900">
                          {review.overallRating}
                        </span>
                        <span className="text-xs text-slate-400">/ 5.0</span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusClass(
                          review.status
                        )}`}
                      >
                        {review.status}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedReview(review);
                          }}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-teal-50 hover:text-[#0F766E] transition"
                          title="Inspect full review"
                        >
                          <Eye size={16} />
                        </button>
                        {review.status === "DRAFT" && (
                          <button
                            onClick={(e) => handleDelete(review.id, e)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition"
                            title="Delete draft"
                          >
                            <X size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* INSPECTION MODAL */}
      {selectedReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <span className="rounded-full bg-teal-50 border border-teal-200 px-3 py-1 text-xs font-bold text-[#0F766E]">
                  Performance Evaluation Scorecard
                </span>
                <h3 className="mt-2 text-xl font-bold text-slate-900">
                  {getEmployeeName(selectedReview)}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Evaluated by {getReviewerName(selectedReview)} &bull; Cycle:{" "}
                  {new Date(selectedReview.periodStart).toLocaleDateString()} to{" "}
                  {new Date(selectedReview.periodEnd).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedReview(null)}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            {/* Criteria Breakdown Grid */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Evaluation Criteria Breakdown
              </h4>
              <div className="grid gap-3 sm:grid-cols-2">
                <CriteriaMeter
                  label="Overall Rating"
                  score={selectedReview.overallRating || 4}
                  color="bg-[#0F766E]"
                />
                <CriteriaMeter
                  label="Technical Competency"
                  score={selectedReview.technicalRating || selectedReview.overallRating || 4}
                  color="bg-emerald-500"
                />
                <CriteriaMeter
                  label="Communication & Clarity"
                  score={selectedReview.communicationRating || 4}
                  color="bg-[#2563EB]"
                />
                <CriteriaMeter
                  label="Leadership & Teamwork"
                  score={selectedReview.leadershipRating || selectedReview.teamworkRating || 4}
                  color="bg-purple-500"
                />
              </div>
            </div>

            {/* Qualitative Feedback */}
            <div className="space-y-4">
              {selectedReview.strengths && (
                <div className="rounded-xl bg-emerald-50/60 border border-emerald-100 p-4">
                  <p className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4" />
                    Key Strengths & High Performance Areas
                  </p>
                  <p className="mt-1.5 text-xs text-emerald-900/90 leading-relaxed">
                    {selectedReview.strengths}
                  </p>
                </div>
              )}

              {selectedReview.improvements && (
                <div className="rounded-xl bg-amber-50/60 border border-amber-100 p-4">
                  <p className="text-xs font-bold text-amber-800 flex items-center gap-1.5">
                    <TrendingUp className="h-4 w-4" />
                    Development & Improvement Opportunities
                  </p>
                  <p className="mt-1.5 text-xs text-amber-900/90 leading-relaxed">
                    {selectedReview.improvements}
                  </p>
                </div>
              )}

              {selectedReview.comments && (
                <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
                  <p className="text-xs font-bold text-slate-700">Reviewer Notes</p>
                  <p className="mt-1.5 text-xs text-slate-600 italic leading-relaxed">
                    &ldquo;{selectedReview.comments}&rdquo;
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t">
              <button
                onClick={() => setSelectedReview(null)}
                className="rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-semibold text-white hover:bg-slate-800"
              >
                Close Scorecard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-6 py-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Create Performance Review
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Submit multi-criteria review (Technical, Leadership, Communication) for employee.
                </p>
              </div>

              <button
                onClick={() => setShowCreate(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <PerformanceReviewForm
                employees={employees}
                onClose={() => setShowCreate(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CriteriaMeter({
  label,
  score,
  color,
}: {
  label: string;
  score: number;
  color: string;
}) {
  const pct = (score / 5) * 100;
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3.5">
      <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-2">
        <span>{label}</span>
        <span className="font-bold text-slate-900">{score} / 5.0</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}