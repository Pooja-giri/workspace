import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "@/lib/api";

import {
  AnalyticsOverview,
  DepartmentHeadcount,
  EmployeeGrowth,
  AttendanceTrend,
  LeaveAnalytics,
  PerformanceAnalytics,
  DepartmentPerformance,
  RecentActivity,
} from "@/types/analytics";

interface AnalyticsState {
  overview: AnalyticsOverview | null;
  departmentHeadcount: DepartmentHeadcount[];
  employeeGrowth: EmployeeGrowth[];
  attendanceTrend: AttendanceTrend[];
  leaveAnalytics: LeaveAnalytics[];
  performanceAnalytics: PerformanceAnalytics[];
  departmentPerformance: DepartmentPerformance[];
  recentActivity: RecentActivity[];

  loading: boolean;
  error: string | null;
}

const initialState: AnalyticsState = {
  overview: null,
  departmentHeadcount: [],
  employeeGrowth: [],
  attendanceTrend: [],
  leaveAnalytics: [],
  performanceAnalytics: [],
  departmentPerformance: [],
  recentActivity: [],

  loading: false,
  error: null,
};

export const fetchAnalytics = createAsyncThunk(
  "analytics/fetchAnalytics",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/analytics");

      return response.data.data;
    } catch (error: unknown) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to load analytics"
      );
    }
  }
);

const analyticsSlice = createSlice({
  name: "analytics",
  initialState,
  reducers: {
    clearAnalytics: (state) => {
      state.overview = null;
      state.departmentHeadcount = [];
      state.employeeGrowth = [];
      state.attendanceTrend = [];
      state.leaveAnalytics = [];
      state.performanceAnalytics = [];
      state.departmentPerformance = [];
      state.recentActivity = [];
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchAnalytics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchAnalytics.fulfilled, (state, action) => {
        state.loading = false;

        state.overview = action.payload.overview;

        state.departmentHeadcount =
          action.payload.departmentHeadcount || [];

        state.employeeGrowth = action.payload.employeeGrowth || [];

        state.attendanceTrend =
          action.payload.attendanceTrend || [];

        state.leaveAnalytics =
          action.payload.leaveAnalytics || [];

        state.performanceAnalytics =
          action.payload.performanceAnalytics || [];

        state.departmentPerformance =
          action.payload.departmentPerformance || [];

        state.recentActivity =
          action.payload.recentActivity || [];
      })

      .addCase(fetchAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearAnalytics } = analyticsSlice.actions;

export default analyticsSlice.reducer;