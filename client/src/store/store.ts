import { configureStore } from "@reduxjs/toolkit";

import authReducer from "@/features/auth/authSlice";
import employeeReducer from "@/features/employees/employeeSlice";
import departmentReducer from "@/features/departments/departmentSlice";
import attendanceReducer from "@/features/attendance/attendanceSlice";
import leaveReducer from "@/features/leave/leaveSlice";
import leaveBalanceReducer from "@/features/leaveBalance/leaveBalanceSlice";
import performanceReducer from "@/features/performance/performanceSlice";
import goalReducer from "@/features/goals/goalSlice";
import documentReducer from "@/components/documents/documentSlice";
import analyticsReducer from "@/features/analytics/analyticsSlice";
import notificationReducer from "@/features/notifications/notificationSlice";
import activityReducer from "@/features/activity/activitySlice";

export const store = configureStore({
  reducer: {
  auth: authReducer,
  employees: employeeReducer,
  departments: departmentReducer,
  attendance: attendanceReducer,
  leave: leaveReducer,
  leaveBalances: leaveBalanceReducer,
  performance: performanceReducer,
  goals: goalReducer,
  documents: documentReducer,
  analytics: analyticsReducer,
  notifications: notificationReducer,
  activities: activityReducer,
},
});

export type RootState =
  ReturnType<typeof store.getState>;

export type AppDispatch =
  typeof store.dispatch;