"use client";

import { useEffect, useSyncExternalStore } from "react";

import {
  Activity,
  AlertCircle,
  CheckCircle2,
  Clock3,
  FileText,
  RefreshCw,
  UserPlus,
  XCircle,
} from "lucide-react";

import {
  useAppDispatch,
  useAppSelector,
} from "@/hooks/redux";

import { fetchActivities } from "@/features/activity/activitySlice";

const subscribeTime = (callback: () => void) => {
  const timer = setInterval(callback, 60000);
  return () => clearInterval(timer);
};

const getClientTime = () => Date.now();
const getServerTime = () => 0;

function useCurrentTime() {
  return useSyncExternalStore(subscribeTime, getClientTime, getServerTime);
}

const getActionStyles = (action: string) => {
  switch (action.toUpperCase()) {
    case "CREATED":
      return {
        icon: UserPlus,
        wrapper:
          "bg-blue-50 text-blue-600 ring-blue-100",
      };

    case "APPROVED":
      return {
        icon: CheckCircle2,
        wrapper:
          "bg-emerald-50 text-emerald-600 ring-emerald-100",
      };

    case "REJECTED":
      return {
        icon: XCircle,
        wrapper:
          "bg-red-50 text-red-600 ring-red-100",
      };

    case "CANCELLED":
      return {
        icon: XCircle,
        wrapper:
          "bg-amber-50 text-amber-600 ring-amber-100",
      };

    case "UPDATED":
      return {
        icon: RefreshCw,
        wrapper:
          "bg-violet-50 text-violet-600 ring-violet-100",
      };

    default:
      return {
        icon: Activity,
        wrapper:
          "bg-slate-50 text-slate-600 ring-slate-100",
      };
  }
};

const formatEntityType = (value: string) => {
  return value
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
};

const formatAction = (value: string) => {
  return value
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
};

const formatDate = (date: string) => {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
};

const getRelativeTime = (
  date: string,
  now: number
) => {
  if (now === 0) {
    return formatDate(date);
  }

  const created = new Date(date).getTime();

  const difference = now - created;

  const seconds = Math.floor(
    difference / 1000
  );

  const minutes = Math.floor(
    seconds / 60
  );

  const hours = Math.floor(
    minutes / 60
  );

  const days = Math.floor(
    hours / 24
  );

  if (seconds < 60) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  if (hours < 24) {
    return `${hours}h ago`;
  }

  if (days < 7) {
    return `${days}d ago`;
  }

  return formatDate(date);
};

export default function ActivityPage() {
  const dispatch = useAppDispatch();
  const currentTime = useCurrentTime();

  const {
    activities,
    loading,
    error,
  } = useAppSelector(
    (state) => state.activities
  );

  useEffect(() => {
    dispatch(
      fetchActivities({
        limit: 100,
      })
    );
  }, [dispatch]);

  const approvedCount =
    activities.filter(
      (activity) =>
        activity.action.toUpperCase() ===
        "APPROVED"
    ).length;

  const recentCount =
    currentTime === 0
      ? 0
      : activities.filter((activity) => {
          const created =
            new Date(
              activity.createdAt
            ).getTime();

          return (
            currentTime - created <
            24 * 60 * 60 * 1000
          );
        }).length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white">
              <Activity className="h-5 w-5" />
            </div>

            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                Activity Center
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Track important actions and changes
                across your organization.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          disabled={loading}
          onClick={() =>
            dispatch(
              fetchActivities({
                limit: 100,
              })
            )
          }
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw
            className={`h-4 w-4 ${
              loading ? "animate-spin" : ""
            }`}
          />

          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Total */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Total Activities
              </p>

              <p className="mt-2 text-2xl font-semibold text-slate-900">
                {activities.length}
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
              <Activity className="h-5 w-5 text-slate-600" />
            </div>
          </div>
        </div>

        {/* Approved */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Approved
              </p>

              <p className="mt-2 text-2xl font-semibold text-emerald-600">
                {approvedCount}
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            </div>
          </div>
        </div>

        {/* Recent */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Last 24 Hours
              </p>

              <p className="mt-2 text-2xl font-semibold text-blue-600">
                {recentCount}
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
              <Clock3 className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

          <div>
            <p className="font-semibold">
              Unable to load activities
            </p>

            <p className="mt-1">
              {error}
            </p>
          </div>
        </div>
      )}

      {/* Activity Card */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {/* Card Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Recent Activity
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Organization-wide audit history.
            </p>
          </div>

          <FileText className="h-5 w-5 text-slate-400" />
        </div>

        {/* Loading */}
        {loading ? (
          <div className="space-y-5 p-6">
            {[1, 2, 3, 4, 5].map(
              (item) => (
                <div
                  key={item}
                  className="flex animate-pulse gap-4"
                >
                  <div className="h-10 w-10 shrink-0 rounded-full bg-slate-100" />

                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-1/3 rounded bg-slate-100" />

                    <div className="h-3 w-2/3 rounded bg-slate-100" />

                    <div className="h-3 w-1/4 rounded bg-slate-100" />
                  </div>
                </div>
              )
            )}
          </div>
        ) : activities.length === 0 ? (
          /* Empty */
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
              <Activity className="h-7 w-7 text-slate-400" />
            </div>

            <h3 className="mt-4 text-sm font-semibold text-slate-900">
              No activity yet
            </h3>

            <p className="mt-1 max-w-md text-sm text-slate-500">
              Activity will appear here when users
              create, approve, reject, or cancel
              records.
            </p>
          </div>
        ) : (
          /* Activity List */
          <div className="divide-y divide-slate-100">
            {activities.map(
              (activity) => {
                const styles =
                  getActionStyles(
                    activity.action
                  );

                const Icon =
                  styles.icon;

                const metadata =
                  activity.metadata ??
                  {};

                const employeeName =
                  typeof metadata.employeeName ===
                  "string"
                    ? metadata.employeeName
                    : null;

                const leaveType =
                  typeof metadata.leaveType ===
                  "string"
                    ? metadata.leaveType
                    : null;

                return (
                  <div
                    key={activity.id}
                    className="flex gap-4 px-6 py-5 transition hover:bg-slate-50"
                  >
                    {/* Activity Icon */}
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ring-4 ${styles.wrapper}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>

                    {/* Activity Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {formatAction(
                              activity.action
                            )}{" "}
                            {formatEntityType(
                              activity.entityType
                            )}
                          </p>

                          <p className="mt-1 text-sm text-slate-500">
                            {activity.user?.name ||
                              "System"}

                            {employeeName &&
                              ` • ${employeeName}`}

                            {leaveType &&
                              ` • ${leaveType}`}
                          </p>
                        </div>

                        <span className="shrink-0 text-xs text-slate-400">
                          {getRelativeTime(
                            activity.createdAt,
                            currentTime
                          )}
                        </span>
                      </div>

                      {/* Tags */}
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium uppercase tracking-wide text-slate-600">
                          {activity.entityType.replace(
                            /_/g,
                            " "
                          )}
                        </span>

                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                          {activity.action}
                        </span>

                        <span className="text-xs text-slate-400">
                          {formatDate(
                            activity.createdAt
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        )}
      </div>
    </div>
  );
}
