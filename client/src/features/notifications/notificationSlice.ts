import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { isAxiosError } from "axios";
import api from "@/lib/api";
import { NotificationState } from "@/types/notification";

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message || fallback;
  }

  return fallback;
};

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
};

export const fetchNotifications = createAsyncThunk(
  "notifications/fetchNotifications",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/notifications");

      return response.data.data;
    } catch (error: unknown) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to fetch notifications")
      );
    }
  }
);

export const markNotificationRead = createAsyncThunk(
  "notifications/markNotificationRead",
  async (notificationId: string, { rejectWithValue }) => {
    try {
      await api.patch(
        `/notifications/${notificationId}/read`
      );

      return notificationId;
    } catch (error: unknown) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to mark notification as read")
      );
    }
  }
);

export const markAllNotificationsRead = createAsyncThunk(
  "notifications/markAllNotificationsRead",
  async (_, { rejectWithValue }) => {
    try {
      await api.patch("/notifications/read-all");

      return true;
    } catch (error: unknown) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to mark notifications as read")
      );
    }
  }
);

export const deleteNotification = createAsyncThunk(
  "notifications/deleteNotification",
  async (notificationId: string, { rejectWithValue }) => {
    try {
      await api.delete(
        `/notifications/${notificationId}`
      );

      return notificationId;
    } catch (error: unknown) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to delete notification")
      );
    }
  }
);

const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    clearNotificationError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;

        state.notifications =
          action.payload.notifications;

        state.unreadCount =
          action.payload.unreadCount;
      })

      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(
        markNotificationRead.fulfilled,
        (state, action) => {
          const notification =
            state.notifications.find(
              (item) => item.id === action.payload
            );

          if (notification && !notification.readAt) {
            notification.readAt =
              new Date().toISOString();

            state.unreadCount = Math.max(
              0,
              state.unreadCount - 1
            );
          }
        }
      )

      .addCase(
        markAllNotificationsRead.fulfilled,
        (state) => {
          const now = new Date().toISOString();

          state.notifications.forEach(
            (notification) => {
              if (!notification.readAt) {
                notification.readAt = now;
              }
            }
          );

          state.unreadCount = 0;
        }
      )

      .addCase(
        deleteNotification.fulfilled,
        (state, action) => {
          const notification =
            state.notifications.find(
              (item) => item.id === action.payload
            );

          if (notification && !notification.readAt) {
            state.unreadCount = Math.max(
              0,
              state.unreadCount - 1
            );
          }

          state.notifications =
            state.notifications.filter(
              (item) => item.id !== action.payload
            );
        }
      );
  },
});

export const {
  clearNotificationError,
} = notificationSlice.actions;

export default notificationSlice.reducer;