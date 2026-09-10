"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Clock3,
  Flag,
  Plus,
  Target,
  Trash2,
  TrendingUp,
  X,
  Sliders,
  Sparkles,
} from "lucide-react";

import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import {
  deleteGoal,
  fetchGoals,
  updateGoal,
} from "@/features/goals/goalSlice";
import { fetchEmployees } from "@/features/employees/employeeSlice";
import { Goal } from "@/types/goal";
import GoalForm from "@/components/goals/GoalForm";

export default function GoalsPage() {
  const dispatch = useAppDispatch();

  const { goals, loading, error } = useAppSelector((state) => state.goals);
  const employees = useAppSelector((state) => state.employees.employees);

  const [showCreate, setShowCreate] = useState(false);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  useEffect(() => {
    dispatch(fetchEmployees({}));
    dispatch(fetchGoals({}));
  }, [dispatch]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    goals.forEach((g) => {
      if (g.category) set.add(g.category);
    });
    return Array.from(set);
  }, [goals]);

  const filteredGoals = useMemo(() => {
    return goals.filter((goal: Goal) => {
      const matchesStatus =
        statusFilter === "ALL" || goal.status === statusFilter;

      const matchesPriority =
        priorityFilter === "ALL" ||
        (goal as Goal & { priority?: string }).priority === priorityFilter;

      const matchesCategory =
        categoryFilter === "ALL" || goal.category === categoryFilter;

      return matchesStatus && matchesPriority && matchesCategory;
    });
  }, [goals, statusFilter, priorityFilter, categoryFilter]);

  const completedGoals = goals.filter((g) => g.status === "COMPLETED").length;
  const inProgressGoals = goals.filter((g) => g.status === "IN_PROGRESS").length;
  const notStartedGoals = goals.filter((g) => g.status === "NOT_STARTED").length;

  const averageProgress =
    goals.length > 0
      ? goals.reduce((sum: number, goal: Goal) => {
          const progress =
            goal.progress !== undefined
              ? goal.progress
              : (goal.targetValue ?? 0) > 0
              ? Math.min(
                  ((goal.currentValue ?? 0) / (goal.targetValue ?? 1)) * 100,
                  100
                )
              : 0;
          return sum + progress;
        }, 0) / goals.length
      : 0;

  const getProgress = (current: number, target: number) => {
    if (target <= 0) return 0;
    return Math.min(Math.round((current / target) * 100), 100);
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-emerald-50 text-emerald-700 border border-emerald-200";
      case "IN_PROGRESS":
        return "bg-blue-50 text-blue-700 border border-blue-200";
      case "ON_HOLD":
        return "bg-orange-50 text-orange-700 border border-orange-200";
      default:
        return "bg-slate-100 text-slate-700 border border-slate-200";
    }
  };

  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case "CRITICAL":
        return "bg-red-50 text-red-700 border border-red-200";
      case "HIGH":
        return "bg-orange-50 text-orange-700 border border-orange-200";
      case "MEDIUM":
        return "bg-amber-50 text-amber-700 border border-amber-200";
      default:
        return "bg-slate-100 text-slate-600 border border-slate-200";
    }
  };

  const handleSliderChange = async (goal: Goal, newPercent: number) => {
    const target = goal.targetValue || 100;
    const newVal = Math.round((newPercent / 100) * target);
    const newStatus =
      newPercent >= 100
        ? "COMPLETED"
        : newPercent > 0
        ? "IN_PROGRESS"
        : "NOT_STARTED";

    await dispatch(
      updateGoal({
        id: goal.id,
        data: {
          currentValue: newVal,
          status: newStatus as any,
        },
      })
    );
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm("Are you sure you want to delete this goal?");
    if (!confirmed) return;

    try {
      await dispatch(deleteGoal(id)).unwrap();
    } catch (err: unknown) {
      window.alert(
        err instanceof Error ? err.message : "Failed to delete goal."
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Goals & OKRs</h1>
          <p className="mt-1 text-sm text-slate-500 font-medium">
            Align quarterly corporate objectives, track progress sliders, and evaluate employee outcomes.
          </p>
        </div>

        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0F766E] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#115E59] shadow-sm transition"
        >
          <Plus size={16} />
          New Goal / OKR
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                Total OKRs
              </p>
              <p className="mt-2 text-2xl font-bold text-slate-900">{goals.length}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3 text-slate-700">
              <Target size={20} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                Average Progress
              </p>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                {Math.round(averageProgress)}%
              </p>
            </div>
            <div className="rounded-xl bg-teal-50 p-3 text-[#0F766E]">
              <TrendingUp size={20} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                In Progress
              </p>
              <p className="mt-2 text-2xl font-bold text-slate-900">{inProgressGoals}</p>
            </div>
            <div className="rounded-xl bg-blue-50 p-3 text-[#2563EB]">
              <Clock3 size={20} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                Completed
              </p>
              <p className="mt-2 text-2xl font-bold text-slate-900">{completedGoals}</p>
            </div>
            <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
              <CheckCircle2 size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-bold text-slate-900">Corporate & Employee Goals</p>
          <p className="text-xs text-slate-500 font-medium">
            {filteredGoals.length} goal{filteredGoals.length !== 1 ? "s" : ""} matching filters
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold outline-none focus:border-[#0F766E]"
          >
            <option value="ALL">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold outline-none focus:border-[#0F766E]"
          >
            <option value="ALL">All Statuses</option>
            <option value="NOT_STARTED">Not Started</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="ON_HOLD">On Hold</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold outline-none focus:border-[#0F766E]"
          >
            <option value="ALL">All Priorities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Goals Cards Grid */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        {loading && goals.length === 0 ? (
          <div className="col-span-full rounded-2xl border border-slate-200 bg-white px-5 py-12 text-center text-sm text-slate-500">
            Loading goals & OKRs...
          </div>
        ) : filteredGoals.length === 0 ? (
          <div className="col-span-full rounded-2xl border border-slate-200 bg-white px-5 py-14 text-center">
            <Target size={36} className="mx-auto text-slate-300" />
            <p className="mt-3 text-base font-bold text-slate-800">No goals found</p>
            <p className="mt-1 text-xs text-slate-400">
              Create a goal to start tracking progress.
            </p>
          </div>
        ) : (
          filteredGoals.map((goal: Goal) => {
            const currentVal = goal.currentValue ?? 0;
            const targetVal = goal.targetValue ?? 100;
            const progress =
              goal.progress !== undefined
                ? goal.progress
                : getProgress(currentVal, targetVal);

            return (
              <div
                key={goal.id}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between hover:border-teal-200 transition"
              >
                <div>
                  {/* Top Badges & Delete */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${getPriorityClass(
                            goal.priority || "MEDIUM"
                          )}`}
                        >
                          <span className="inline-flex items-center gap-1">
                            <Flag size={12} />
                            {goal.priority || "MEDIUM"}
                          </span>
                        </span>

                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${getStatusClass(
                            goal.status
                          )}`}
                        >
                          {goal.status.replace("_", " ")}
                        </span>

                        {goal.category && (
                          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                            {goal.category}
                          </span>
                        )}
                      </div>

                      <h3 className="mt-3 text-base font-bold text-slate-900">
                        {goal.title}
                      </h3>

                      <p className="mt-1 text-xs text-slate-500 font-medium">
                        Assignee:{" "}
                        <span className="text-slate-800 font-semibold">
                          {goal.employee
                            ? `${goal.employee.firstName} ${goal.employee.lastName}`
                            : "General Staff"}
                        </span>
                      </p>
                    </div>

                    <button
                      onClick={() => handleDelete(goal.id)}
                      className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 transition"
                      title="Delete goal"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {/* Description */}
                  {goal.description && (
                    <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-slate-600">
                      {goal.description}
                    </p>
                  )}

                  {/* Interactive Progress Slider */}
                  <div className="mt-5 rounded-xl bg-slate-50 p-3.5 border border-slate-100">
                    <div className="mb-2 flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                        <Sliders className="h-3.5 w-3.5 text-[#0F766E]" />
                        Quick Progress Slider
                      </span>
                      <span className="font-bold text-slate-900 text-sm">{progress}%</span>
                    </div>

                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={progress}
                      onChange={(e) =>
                        handleSliderChange(goal, Number(e.target.value))
                      }
                      className="w-full cursor-pointer accent-[#0F766E]"
                    />

                    <div className="mt-2 flex justify-between text-[11px] text-slate-400 font-medium">
                      <span>{currentVal} completed</span>
                      <span>Target: {targetVal}</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Card Footer */}
                <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3.5 text-xs text-slate-500">
                  <div>
                    <span>Due: </span>
                    <span className="font-semibold text-slate-800">
                      {goal.dueDate
                        ? new Date(goal.dueDate).toLocaleDateString()
                        : "—"}
                    </span>
                  </div>

                  <div>
                    <span>Dept: </span>
                    <span className="font-semibold text-slate-800">
                      {goal.employee?.department?.name || "General"}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create Goal Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-6 py-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Create Goal / OKR</h2>
                <p className="mt-1 text-xs text-slate-500">
                  Define a measurable corporate or individual objective.
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
              <GoalForm
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