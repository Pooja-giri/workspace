import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import api from "@/lib/api";
import {
  CreatePerformanceReviewPayload,
  PerformanceReview,
  UpdatePerformanceReviewPayload,
} from "@/types/performance";

interface PerformanceState {
  reviews: PerformanceReview[];
  selectedReview: PerformanceReview | null;
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  limit: number;
}

const initialState: PerformanceState = {
  reviews: [],
  selectedReview: null,
  loading: false,
  error: null,
  total: 0,
  page: 1,
  limit: 20,
};

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = error.response;

    if (
      typeof response === "object" &&
      response !== null &&
      "data" in response
    ) {
      const data = response.data;

      if (
        typeof data === "object" &&
        data !== null &&
        "message" in data &&
        typeof data.message === "string"
      ) {
        return data.message;
      }
    }
  }

  return fallback;
};

export const fetchPerformanceReviews = createAsyncThunk(
  "performance/fetchPerformanceReviews",
  async (
    params: {
      employeeId?: string;
      reviewerId?: string;
      status?: string;
      page?: number;
      limit?: number;
    } = {},
    { rejectWithValue }
  ) => {
    try {
      const response = await api.get("/performance-reviews", {
        params,
      });

      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to fetch performance reviews")
      );
    }
  }
);

export const fetchPerformanceReviewById = createAsyncThunk(
  "performance/fetchPerformanceReviewById",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/performance-reviews/${id}`);

      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to fetch performance review")
      );
    }
  }
);

export const createPerformanceReview = createAsyncThunk(
  "performance/createPerformanceReview",
  async (payload: CreatePerformanceReviewPayload, { rejectWithValue }) => {
    try {
      const response = await api.post("/performance-reviews", payload);

      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to create performance review")
      );
    }
  }
);

export const updatePerformanceReview = createAsyncThunk(
  "performance/updatePerformanceReview",
  async (
    {
      id,
      data,
    }: {
      id: string;
      data: UpdatePerformanceReviewPayload;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.patch(`/performance-reviews/${id}`, data);

      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to update performance review")
      );
    }
  }
);

export const deletePerformanceReview = createAsyncThunk(
  "performance/deletePerformanceReview",
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/performance-reviews/${id}`);

      return id;
    } catch (error: unknown) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to delete performance review")
      );
    }
  }
);

const performanceSlice = createSlice({
  name: "performance",
  initialState,
  reducers: {
    clearSelectedReview: (state) => {
      state.selectedReview = null;
    },

    clearPerformanceError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder

      // Fetch reviews
      .addCase(fetchPerformanceReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(
        fetchPerformanceReviews.fulfilled,
        (
          state,
          action: PayloadAction<{
            success: boolean;
            data: PerformanceReview[];
            total?: number;
            page?: number;
            limit?: number;
          }>
        ) => {
          state.loading = false;
          state.reviews = action.payload.data || [];
          state.total = action.payload.total || 0;
          state.page = action.payload.page || 1;
          state.limit = action.payload.limit || 20;
        }
      )

      .addCase(fetchPerformanceReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch single review
      .addCase(fetchPerformanceReviewById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(
        fetchPerformanceReviewById.fulfilled,
        (
          state,
          action: PayloadAction<{
            success: boolean;
            data: PerformanceReview;
          }>
        ) => {
          state.loading = false;
          state.selectedReview = action.payload.data;
        }
      )

      .addCase(fetchPerformanceReviewById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Create
      .addCase(createPerformanceReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(
        createPerformanceReview.fulfilled,
        (
          state,
          action: PayloadAction<{
            success: boolean;
            data: PerformanceReview;
          }>
        ) => {
          state.loading = false;
          state.reviews.unshift(action.payload.data);
        }
      )

      .addCase(createPerformanceReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Update
      .addCase(updatePerformanceReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(
        updatePerformanceReview.fulfilled,
        (
          state,
          action: PayloadAction<{
            success: boolean;
            data: PerformanceReview;
          }>
        ) => {
          state.loading = false;

          const updated = action.payload.data;

          const index = state.reviews.findIndex(
            (review) => review.id === updated.id
          );

          if (index !== -1) {
            state.reviews[index] = updated;
          }

          if (state.selectedReview?.id === updated.id) {
            state.selectedReview = updated;
          }
        }
      )

      .addCase(updatePerformanceReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Delete
      .addCase(deletePerformanceReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(
        deletePerformanceReview.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.loading = false;

          state.reviews = state.reviews.filter(
            (review) => review.id !== action.payload
          );

          if (state.selectedReview?.id === action.payload) {
            state.selectedReview = null;
          }
        }
      )

      .addCase(deletePerformanceReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearSelectedReview,
  clearPerformanceError,
} = performanceSlice.actions;

export default performanceSlice.reducer;