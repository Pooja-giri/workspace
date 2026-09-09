import {
  createAsyncThunk,
  createSlice,
  PayloadAction,
} from "@reduxjs/toolkit";
import api from "@/lib/api";
import {
  CreateLeaveRequestPayload,
  LeaveRequest,
  LeaveRequestStatus,
  LeaveType,
} from "@/types/leave";
import { isAxiosError } from "axios";

interface LeaveState {
  requests: LeaveRequest[];
  leaveTypes: LeaveType[];
  selectedRequest: LeaveRequest | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
}

const initialState: LeaveState = {
  requests: [],
  leaveTypes: [],
  selectedRequest: null,
  loading: false,
  saving: false,
  error: null,
};

export const fetchLeaveRequests = createAsyncThunk(
  "leave/fetchRequests",
  async (params: Record<string, string | number> | undefined, thunkAPI) => {
    try {
      const response = await api.get("/leave", {
        params,
      });

      return response.data.data as LeaveRequest[];
    } catch (error: unknown) {
      return thunkAPI.rejectWithValue(
        (isAxiosError(error) && error.response?.data?.message) ||
          "Failed to fetch leave requests"
      );
    }
  }
);

export const fetchLeaveTypes = createAsyncThunk(
  "leave/fetchTypes",
  async (_, thunkAPI) => {
    try {
      const response = await api.get("/leave-types");

      return response.data.data as LeaveType[];
    } catch (error: unknown) {
      return thunkAPI.rejectWithValue(
        (isAxiosError(error) && error.response?.data?.message) ||
          "Failed to fetch leave types"
      );
    }
  }
);

export const createLeaveRequest = createAsyncThunk(
  "leave/createRequest",
  async (
    payload: CreateLeaveRequestPayload,
    thunkAPI
  ) => {
    try {
      const response = await api.post(
        "/leave",
        payload
      );

      return response.data.data as LeaveRequest;
    } catch (error: unknown) {
      return thunkAPI.rejectWithValue(
        (isAxiosError(error) && error.response?.data?.message) ||
          "Failed to submit leave request"
      );
    }
  }
);

export const updateLeaveRequestStatus =
  createAsyncThunk(
    "leave/updateStatus",
    async (
      {
        id,
        status,
      }: {
        id: string;
        status: Exclude<
          LeaveRequestStatus,
          "PENDING"
        >;
      },
      thunkAPI
    ) => {
      try {
        const response = await api.patch(
          `/leave/${id}/status`,
          {
            status,
          }
        );

        return response.data.data as LeaveRequest;
      } catch (error: unknown) {
        return thunkAPI.rejectWithValue(
          (isAxiosError(error) && error.response?.data?.message) ||
            "Failed to update leave request"
        );
      }
    }
  );

const leaveSlice = createSlice({
  name: "leave",
  initialState,
  reducers: {
    clearLeaveError(state) {
      state.error = null;
    },

    clearSelectedLeaveRequest(state) {
      state.selectedRequest = null;
    },
  },

  extraReducers: (builder) => {
    builder

      .addCase(fetchLeaveRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(
        fetchLeaveRequests.fulfilled,
        (state, action: PayloadAction<LeaveRequest[]>) => {
          state.loading = false;
          state.requests = action.payload;
        }
      )

      .addCase(fetchLeaveRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(fetchLeaveTypes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(
        fetchLeaveTypes.fulfilled,
        (state, action: PayloadAction<LeaveType[]>) => {
          state.loading = false;
          state.leaveTypes = action.payload;
        }
      )

      .addCase(fetchLeaveTypes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(createLeaveRequest.pending, (state) => {
        state.saving = true;
        state.error = null;
      })

      .addCase(
        createLeaveRequest.fulfilled,
        (state, action: PayloadAction<LeaveRequest>) => {
          state.saving = false;
          state.requests.unshift(action.payload);
        }
      )

      .addCase(createLeaveRequest.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload as string;
      })

      .addCase(
        updateLeaveRequestStatus.pending,
        (state) => {
          state.saving = true;
          state.error = null;
        }
      )

      .addCase(
        updateLeaveRequestStatus.fulfilled,
        (
          state,
          action: PayloadAction<LeaveRequest>
        ) => {
          state.saving = false;

          const index = state.requests.findIndex(
            (request) =>
              request.id === action.payload.id
          );

          if (index !== -1) {
            state.requests[index] = action.payload;
          }
        }
      )

      .addCase(
        updateLeaveRequestStatus.rejected,
        (state, action) => {
          state.saving = false;
          state.error = action.payload as string;
        }
      );
  },
});

export const {
  clearLeaveError,
  clearSelectedLeaveRequest,
} = leaveSlice.actions;

export default leaveSlice.reducer;