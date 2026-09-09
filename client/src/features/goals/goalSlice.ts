import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { isAxiosError } from "axios";

import api from "@/lib/api";

import {
  CreateGoalPayload,
  Goal,
  UpdateGoalPayload,
} from "@/types/goal";

const getErrorMessage = (
  error: unknown,
  fallback: string
): string => {
  if (isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message || fallback;
  }

  return fallback;
};

interface GoalState {
  goals: Goal[];
  selectedGoal: Goal | null;

  loading: boolean;
  error: string | null;

  total: number;
  page: number;
  limit: number;
}

const initialState: GoalState = {
  goals: [],
  selectedGoal: null,

  loading: false,
  error: null,

  total: 0,
  page: 1,
  limit: 20,
};

export const fetchGoals = createAsyncThunk(
  "goals/fetchGoals",
  async (
    params: {
      employeeId?: string;
      status?: string;
      priority?: string;
      category?: string;
      page?: number;
      limit?: number;
    } = {},
    { rejectWithValue }
  ) => {
    try {
      const response = await api.get("/goals", {
        params,
      });

      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to fetch goals")
      );
    }
  }
);

export const fetchGoalById = createAsyncThunk(
  "goals/fetchGoalById",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/goals/${id}`);

      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to fetch goal")
      );
    }
  }
);

export const createGoal = createAsyncThunk(
  "goals/createGoal",
  async (
    payload: CreateGoalPayload,
    { rejectWithValue }
  ) => {
    try {
      const response = await api.post("/goals", payload);

      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to create goal")
      );
    }
  }
);

export const updateGoal = createAsyncThunk(
  "goals/updateGoal",
  async (
    {
      id,
      data,
    }: {
      id: string;
      data: UpdateGoalPayload;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.patch(
        `/goals/${id}`,
        data
      );

      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to update goal")
      );
    }
  }
);

export const deleteGoal = createAsyncThunk(
  "goals/deleteGoal",
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/goals/${id}`);

      return id;
    } catch (error: unknown) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to delete goal")
      );
    }
  }
);

const goalSlice = createSlice({
  name: "goals",
  initialState,

  reducers: {
    clearSelectedGoal: (state) => {
      state.selectedGoal = null;
    },

    clearGoalError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder

      // FETCH
      .addCase(fetchGoals.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(
        fetchGoals.fulfilled,
        (
          state,
          action: PayloadAction<{
            success: boolean;
            data: Goal[];
            pagination?: {
              total: number;
              page: number;
              limit: number;
              totalPages: number;
            };
          }>
        ) => {
          state.loading = false;

          state.goals = action.payload.data || [];

          state.total =
            action.payload.pagination?.total || 0;

          state.page =
            action.payload.pagination?.page || 1;

          state.limit =
            action.payload.pagination?.limit || 20;
        }
      )

      .addCase(fetchGoals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // SINGLE
      .addCase(fetchGoalById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(
        fetchGoalById.fulfilled,
        (
          state,
          action: PayloadAction<{
            success: boolean;
            data: Goal;
          }>
        ) => {
          state.loading = false;
          state.selectedGoal = action.payload.data;
        }
      )

      .addCase(fetchGoalById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // CREATE
      .addCase(createGoal.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(
        createGoal.fulfilled,
        (
          state,
          action: PayloadAction<{
            success: boolean;
            data: Goal;
          }>
        ) => {
          state.loading = false;

          state.goals.unshift(
            action.payload.data
          );

          state.total += 1;
        }
      )

      .addCase(createGoal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // UPDATE
      .addCase(updateGoal.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(
        updateGoal.fulfilled,
        (
          state,
          action: PayloadAction<{
            success: boolean;
            data: Goal;
          }>
        ) => {
          state.loading = false;

          const updatedGoal =
            action.payload.data;

          const index = state.goals.findIndex(
            (goal) =>
              goal.id === updatedGoal.id
          );

          if (index !== -1) {
            state.goals[index] = updatedGoal;
          }

          if (
            state.selectedGoal?.id ===
            updatedGoal.id
          ) {
            state.selectedGoal = updatedGoal;
          }
        }
      )

      .addCase(updateGoal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // DELETE
      .addCase(deleteGoal.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(
        deleteGoal.fulfilled,
        (
          state,
          action: PayloadAction<string>
        ) => {
          state.loading = false;

          state.goals = state.goals.filter(
            (goal) =>
              goal.id !== action.payload
          );

          state.total = Math.max(
            state.total - 1,
            0
          );

          if (
            state.selectedGoal?.id ===
            action.payload
          ) {
            state.selectedGoal = null;
          }
        }
      )

      .addCase(deleteGoal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearSelectedGoal,
  clearGoalError,
} = goalSlice.actions;

export default goalSlice.reducer;