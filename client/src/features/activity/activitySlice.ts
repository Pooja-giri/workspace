import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { isAxiosError } from "axios";
import api from "@/lib/api";

import type {
  ActivityLog,
  ActivityResponse,
  ActivityState,
} from "@/types/activity";

interface FetchActivitiesParams {
  entityType?: string;
  entityId?: string;
  userId?: string;
  limit?: number;
}

const initialState: ActivityState = {
  activities: [],
  loading: false,
  error: null,
};

export const fetchActivities = createAsyncThunk<
  ActivityLog[],
  FetchActivitiesParams | undefined,
  { rejectValue: string }
>(
  "activity/fetchActivities",
  async (params, { rejectWithValue }) => {
    try {
      const response = await api.get<ActivityResponse>(
        "/activities",
        {
          params,
        }
      );

      return response.data.data;
    } catch (error: unknown) {
      return rejectWithValue(
        (isAxiosError<{ message?: string }>(error)
          ? error.response?.data?.message
          : undefined) ||
          "Failed to load activity logs"
      );
    }
  }
);

const activitySlice = createSlice({
  name: "activity",

  initialState,

  reducers: {
    clearActivities: (state) => {
      state.activities = [];
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchActivities.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchActivities.fulfilled, (state, action) => {
        state.loading = false;
        state.activities = action.payload;
        state.error = null;
      })

      .addCase(fetchActivities.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload ||
          "Failed to load activity logs";
      });
  },
});

export const { clearActivities } =
  activitySlice.actions;

export default activitySlice.reducer;