"use client";

import { useEffect } from "react";
import {
  Bell,
  CheckCheck,
  Clock,
  FileText,
  Target,
  UserCheck,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { useAppDispatch, useAppSelector } from "@/hooks/redux";

import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/features/notifications/notificationSlice";

import { Notification } from "@/types/notification";

const getNotificationIcon = (
  type: Notification["type"]
) => {
  switch (type) {
    case "LEAVE_REQUEST":
    case "LEAVE_APPROVED":
    case "LEAVE_REJECTED":
      return <Clock size={18} />;

    case "PERFORMANCE_REVIEW":
      return <UserCheck size={18} />;

    case "GOAL_ASSIGNED":
      return <Target size={18} />;

    default:
      return <FileText size={18} />;
  }
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleString([], {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

export default function NotificationsPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const {
    notifications,
    unreadCount,
    loading,
  } = useAppSelector(
    (state) => state.notifications
  );

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  const handleClick = (
    notification: Notification
  ) => {
    if (!notification.readAt) {
      dispatch(
        markNotificationRead(notification.id)
      );
    }

    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Notifications
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Stay updated with important workforce events.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            dispatch(markAllNotificationsRead())
          }
          disabled={unreadCount === 0}
          className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <CheckCheck size={16} />
          Mark all as read
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {loading ? (
          <div className="space-y-4 p-6">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="flex animate-pulse gap-4"
              >
                <div className="h-10 w-10 rounded-lg bg-slate-200" />

                <div className="flex-1 space-y-2">
                  <div className="h-4 w-1/3 rounded bg-slate-200" />
                  <div className="h-3 w-2/3 rounded bg-slate-200" />
                  <div className="h-3 w-20 rounded bg-slate-200" />
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
              <Bell
                size={25}
                className="text-slate-400"
              />
            </div>

            <h2 className="font-semibold text-slate-900">
              You&apos;re all caught up
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              New notifications will appear here.
            </p>
          </div>
        ) : (
          <div>
            {notifications.map((notification) => (
              <button
                key={notification.id}
                type="button"
                onClick={() =>
                  handleClick(notification)
                }
                className={`flex w-full gap-4 border-b border-slate-100 p-5 text-left transition last:border-b-0 hover:bg-slate-50 ${
                  !notification.readAt
                    ? "bg-blue-50/40"
                    : ""
                }`}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                  {getNotificationIcon(
                    notification.type
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3
                        className={`text-sm ${
                          !notification.readAt
                            ? "font-semibold text-slate-900"
                            : "font-medium text-slate-700"
                        }`}
                      >
                        {notification.title}
                      </h3>

                      <p className="mt-1 text-sm leading-6 text-slate-500">
                        {notification.message}
                      </p>
                    </div>

                    {!notification.readAt && (
                      <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-blue-500" />
                    )}
                  </div>

                  <p className="mt-2 text-xs text-slate-400">
                    {formatDate(notification.createdAt)}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
