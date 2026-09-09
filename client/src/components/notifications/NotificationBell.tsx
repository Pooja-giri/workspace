"use client";

import { useEffect, useState } from "react";
import {
  Bell,
  CheckCheck,
  Clock,
  FileText,
  Target,
  UserCheck,
  X,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/features/notifications/notificationSlice";
import { Notification } from "@/types/notification";
import { useRouter } from "next/navigation";

const getNotificationIcon = (
  type: Notification["type"]
) => {
  switch (type) {
    case "LEAVE_REQUEST":
    case "LEAVE_APPROVED":
    case "LEAVE_REJECTED":
      return <Clock size={16} />;

    case "PERFORMANCE_REVIEW":
      return <UserCheck size={16} />;

    case "GOAL_ASSIGNED":
      return <Target size={16} />;

    default:
      return <FileText size={16} />;
  }
};

const formatTime = (date: string) => {
  const value = new Date(date);
  const now = new Date();

  const diff =
    Math.floor((now.getTime() - value.getTime()) / 1000);

  if (diff < 60) {
    return "Just now";
  }

  if (diff < 3600) {
    return `${Math.floor(diff / 60)}m ago`;
  }

  if (diff < 86400) {
    return `${Math.floor(diff / 3600)}h ago`;
  }

  if (diff < 604800) {
    return `${Math.floor(diff / 86400)}d ago`;
  }

  return value.toLocaleDateString();
};

export default function NotificationBell() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const {
    notifications,
    unreadCount,
  } = useAppSelector(
    (state) => state.notifications
  );

  const [open, setOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  const handleNotificationClick = (
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

    setOpen(false);
  };

  const handleMarkAllRead = () => {
    if (unreadCount > 0) {
      dispatch(markAllNotificationsRead());
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
      >
        <Bell size={19} />

        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Close notifications"
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setOpen(false)}
          />

          <div className="absolute right-0 z-50 mt-3 w-[380px] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <div>
                <h3 className="font-semibold text-slate-900">
                  Notifications
                </h3>

                <p className="text-xs text-slate-500">
                  {unreadCount} unread
                </p>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  disabled={unreadCount === 0}
                  className="flex items-center gap-1 rounded-md px-2 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <CheckCheck size={14} />
                  Mark all read
                </button>

                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="max-h-[430px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                    <Bell
                      size={22}
                      className="text-slate-400"
                    />
                  </div>

                  <p className="font-medium text-slate-800">
                    No notifications
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    You&apos;re all caught up.
                  </p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <button
                    key={notification.id}
                    type="button"
                    onClick={() =>
                      handleNotificationClick(
                        notification
                      )
                    }
                    className={`flex w-full gap-3 border-b border-slate-100 px-4 py-3 text-left transition hover:bg-slate-50 ${
                      !notification.readAt
                        ? "bg-blue-50/50"
                        : "bg-white"
                    }`}
                  >
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                      {getNotificationIcon(
                        notification.type
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p
                          className={`text-sm ${
                            !notification.readAt
                              ? "font-semibold text-slate-900"
                              : "font-medium text-slate-700"
                          }`}
                        >
                          {notification.title}
                        </p>

                        {!notification.readAt && (
                          <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                        )}
                      </div>

                      <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
                        {notification.message}
                      </p>

                      <p className="mt-1.5 text-[11px] text-slate-400">
                        {formatTime(
                          notification.createdAt
                        )}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>

            {notifications.length > 0 && (
              <div className="border-t border-slate-100 px-4 py-3">
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    router.push("/notifications");
                  }}
                  className="w-full rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                >
                  View all notifications
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}