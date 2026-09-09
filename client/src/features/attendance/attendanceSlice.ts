import {
  createAsyncThunk,
  createSlice,
} from "@reduxjs/toolkit";

import api from "@/lib/api";

import type {
  AttendanceRecord,
  CreateAttendancePayload,
  UpdateAttendancePayload,
  AttendanceStatus,
} from "@/types/attendance";

interface AttendanceState {
  records: AttendanceRecord[];
  selectedRecord: AttendanceRecord | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
}

const initialState: AttendanceState = {
  records: [],
  selectedRecord: null,
  loading: false,
  saving: false,
  error: null,
};

interface FetchAttendanceParams {
  employeeId?: string;
  status?: AttendanceStatus;
  date?: string;
  from?: string;
  to?: string;
}

const getErrorMessage = (
  error: unknown,
  fallback: string
): string => {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = (
      error as {
        response?: { data?: { message?: unknown } };
      }
    ).response;

    if (typeof response?.data?.message === "string") {
      return response.data.message;
    }
  }

  return error instanceof Error ? error.message : fallback;
};

export const fetchAttendance = createAsyncThunk(
  "attendance/fetchAttendance",

  async (
    params: FetchAttendanceParams = {},
    { rejectWithValue }
  ) => {
    try {
      const response = await api.get(
        "/attendance",
        {
          params,
        }
      );

      return response.data.data as AttendanceRecord[];
    } catch (error: unknown) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to fetch attendance")
      );
    }
  }
);

export const fetchAttendanceById =
  createAsyncThunk(
    "attendance/fetchAttendanceById",

    async (
      id: string,
      { rejectWithValue }
    ) => {
      try {
        const response = await api.get(
          `/attendance/${id}`
        );

        return response.data.data as AttendanceRecord;
      } catch (error: unknown) {
        return rejectWithValue(
          getErrorMessage(
            error,
            "Failed to fetch attendance record"
          )
        );
      }
    }
  );

export const createAttendance =
  createAsyncThunk(
    "attendance/createAttendance",

    async (
      payload: CreateAttendancePayload,
      { rejectWithValue }
    ) => {
      try {
        const response = await api.post(
          "/attendance",
          payload
        );

        return response.data.data as AttendanceRecord;
      } catch (error: unknown) {
        return rejectWithValue(
          getErrorMessage(error, "Failed to mark attendance")
        );
      }
    }
  );

export const updateAttendance =
  createAsyncThunk(
    "attendance/updateAttendance",

    async (
      {
        id,
        data,
      }: {
        id: string;
        data: UpdateAttendancePayload;
      },
      { rejectWithValue }
    ) => {
      try {
        const response = await api.put(
          `/attendance/${id}`,
          data
        );

        return response.data.data as AttendanceRecord;
      } catch (error: unknown) {
        return rejectWithValue(
          getErrorMessage(error, "Failed to update attendance")
        );
      }
    }
  );

export const deleteAttendance =
  createAsyncThunk(
    "attendance/deleteAttendance",

    async (
      id: string,
      { rejectWithValue }
    ) => {
      try {
        await api.delete(
          `/attendance/${id}`
        );

        return id;
      } catch (error: unknown) {
        return rejectWithValue(
          getErrorMessage(error, "Failed to delete attendance")
        );
      }
    }
  );

const attendanceSlice = createSlice({
  name: "attendance",

  initialState,

  reducers: {
    clearAttendanceError: (state) => {
      state.error = null;
    },

    clearSelectedAttendance: (state) => {
      state.selectedRecord = null;
    },
  },

  extraReducers: (builder) => {
    builder

      .addCase(
        fetchAttendance.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )

      .addCase(
        fetchAttendance.fulfilled,
        (state, action) => {
          state.loading = false;
          state.records = action.payload;
        }
      )

      .addCase(
        fetchAttendance.rejected,
        (state, action) => {
          state.loading = false;
          state.error =
            action.payload as string;
        }
      )

      .addCase(
        fetchAttendanceById.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )

      .addCase(
        fetchAttendanceById.fulfilled,
        (state, action) => {
          state.loading = false;
          state.selectedRecord =
            action.payload;
        }
      )

      .addCase(
        fetchAttendanceById.rejected,
        (state, action) => {
          state.loading = false;
          state.error =
            action.payload as string;
        }
      )

      .addCase(
        createAttendance.pending,
        (state) => {
          state.saving = true;
          state.error = null;
        }
      )

      .addCase(
        createAttendance.fulfilled,
        (state, action) => {
          state.saving = false;

          state.records.unshift(
            action.payload
          );
        }
      )

      .addCase(
        createAttendance.rejected,
        (state, action) => {
          state.saving = false;
          state.error =
            action.payload as string;
        }
      )

      .addCase(
        updateAttendance.pending,
        (state) => {
          state.saving = true;
          state.error = null;
        }
      )

      .addCase(
        updateAttendance.fulfilled,
        (state, action) => {
          state.saving = false;

          const index =
            state.records.findIndex(
              (record) =>
                record.id ===
                action.payload.id
            );

          if (index !== -1) {
            state.records[index] =
              action.payload;
          }

          if (
            state.selectedRecord?.id ===
            action.payload.id
          ) {
            state.selectedRecord =
              action.payload;
          }
        }
      )

      .addCase(
        updateAttendance.rejected,
        (state, action) => {
          state.saving = false;
          state.error =
            action.payload as string;
        }
      )

      .addCase(
        deleteAttendance.fulfilled,
        (state, action) => {
          state.records =
            state.records.filter(
              (record) =>
                record.id !== action.payload
            );

          if (
            state.selectedRecord?.id ===
            action.payload
          ) {
            state.selectedRecord = null;
          }
        }
      )

      .addCase(
        deleteAttendance.rejected,
        (state, action) => {
          state.error =
            action.payload as string;
        }
      );
  },
});

export const {
  clearAttendanceError,
  clearSelectedAttendance,
} = attendanceSlice.actions;

export default attendanceSlice.reducer;