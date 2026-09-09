"use client";

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "@/lib/api";
import { LeaveBalance } from "@/types/leaveBalance";

interface LeaveBalanceState {
  balances: LeaveBalance[];
  loading: boolean;
  error: string | null;
}

const initialState: LeaveBalanceState = {
  balances: [],
  loading: false,
  error: null,
};

export const fetchEmployeeLeaveBalances = createAsyncThunk(
  "leaveBalance/fetchEmployeeLeaveBalances",
  async (employeeId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/leave-balances/employee/${employeeId}`
      );

      return response.data.data as LeaveBalance[];
    } catch (error: unknown) {
      const message =
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        typeof error.response === "object" &&
        error.response !== null &&
        "data" in error.response &&
        typeof error.response.data === "object" &&
        error.response.data !== null &&
        "message" in error.response.data &&
        typeof error.response.data.message === "string"
          ? error.response.data.message
          : undefined;

      return rejectWithValue(
        message || "Failed to fetch leave balances"
      );
    }
  }
);

const leaveBalanceSlice = createSlice({
  name: "leaveBalance",
  initialState,
  reducers: {
    clearLeaveBalances: (state) => {
      state.balances = [];
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(
        fetchEmployeeLeaveBalances.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )

      .addCase(
        fetchEmployeeLeaveBalances.fulfilled,
        (state, action) => {
          state.loading = false;
          state.balances = action.payload;
        }
      )

      .addCase(
        fetchEmployeeLeaveBalances.rejected,
        (state, action) => {
          state.loading = false;
          state.error =
            (action.payload as string) ||
            "Failed to fetch leave balances";
        }
      );
  },
});

export const { clearLeaveBalances } =
  leaveBalanceSlice.actions;

export default leaveBalanceSlice.reducer;