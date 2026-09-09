import {
  createAsyncThunk,
  createSlice,
} from "@reduxjs/toolkit";
import { isAxiosError } from "axios";

import api from "@/lib/api";

import type {
  CreateDepartmentPayload,
  Department,
  UpdateDepartmentPayload,
} from "@/types/department";

interface DepartmentState {
  departments: Department[];
  selectedDepartment: Department | null;

  loading: boolean;
  detailsLoading: boolean;

  error: string | null;
}

const initialState: DepartmentState = {
  departments: [],
  selectedDepartment: null,

  loading: false,
  detailsLoading: false,

  error: null,
};

export const fetchDepartments = createAsyncThunk<
  Department[],
  string | undefined,
  { rejectValue: string }
>(
  "departments/fetchDepartments",
  async (search, { rejectWithValue }) => {
    try {
      const response = await api.get("/departments", {
        params: search
          ? {
              search,
            }
          : undefined,
      });

      return response.data.data;
    } catch (error: unknown) {
      return rejectWithValue(
        (isAxiosError(error) && error.response?.data?.message) ||
          "Failed to fetch departments"
      );
    }
  }
);

export const fetchDepartment = createAsyncThunk<
  Department,
  string,
  { rejectValue: string }
>(
  "departments/fetchDepartment",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/departments/${id}`
      );

      return response.data.data;
    } catch (error: unknown) {
      return rejectWithValue(
        (isAxiosError(error) && error.response?.data?.message) ||
          "Failed to fetch department"
      );
    }
  }
);

export const createDepartment = createAsyncThunk<
  Department,
  CreateDepartmentPayload,
  { rejectValue: string }
>(
  "departments/createDepartment",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await api.post(
        "/departments",
        payload
      );

      return response.data.data;
    } catch (error: unknown) {
      return rejectWithValue(
        (isAxiosError(error) && error.response?.data?.message) ||
          "Failed to create department"
      );
    }
  }
);

export const updateDepartment = createAsyncThunk<
  Department,
  {
    id: string;
    data: UpdateDepartmentPayload;
  },
  { rejectValue: string }
>(
  "departments/updateDepartment",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(
        `/departments/${id}`,
        data
      );

      return response.data.data;
    } catch (error: unknown) {
      return rejectWithValue(
        (isAxiosError(error) && error.response?.data?.message) ||
          "Failed to update department"
      );
    }
  }
);

export const deleteDepartment = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>(
  "departments/deleteDepartment",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/departments/${id}`);

      return id;
    } catch (error: unknown) {
      return rejectWithValue(
        (isAxiosError(error) && error.response?.data?.message) ||
          "Failed to delete department"
      );
    }
  }
);

const departmentSlice = createSlice({
  name: "departments",
  initialState,

  reducers: {
    clearSelectedDepartment: (state) => {
      state.selectedDepartment = null;
    },

    clearDepartmentError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder

      // FETCH DEPARTMENTS
      .addCase(
        fetchDepartments.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )

      .addCase(
        fetchDepartments.fulfilled,
        (state, action) => {
          state.loading = false;
          state.departments = action.payload;
        }
      )

      .addCase(
        fetchDepartments.rejected,
        (state, action) => {
          state.loading = false;
          state.error =
            action.payload ||
            "Failed to fetch departments";
        }
      )

      // FETCH DEPARTMENT
      .addCase(
        fetchDepartment.pending,
        (state) => {
          state.detailsLoading = true;
          state.error = null;
        }
      )

      .addCase(
        fetchDepartment.fulfilled,
        (state, action) => {
          state.detailsLoading = false;
          state.selectedDepartment =
            action.payload;
        }
      )

      .addCase(
        fetchDepartment.rejected,
        (state, action) => {
          state.detailsLoading = false;
          state.error =
            action.payload ||
            "Failed to fetch department";
        }
      )

      // CREATE
      .addCase(
        createDepartment.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )

      .addCase(
        createDepartment.fulfilled,
        (state, action) => {
          state.loading = false;

          state.departments.push(
            action.payload
          );

          state.departments.sort((a, b) =>
            a.name.localeCompare(b.name)
          );
        }
      )

      .addCase(
        createDepartment.rejected,
        (state, action) => {
          state.loading = false;
          state.error =
            action.payload ||
            "Failed to create department";
        }
      )

      // UPDATE
      .addCase(
        updateDepartment.fulfilled,
        (state, action) => {
          const index =
            state.departments.findIndex(
              (department) =>
                department.id === action.payload.id
            );

          if (index !== -1) {
            state.departments[index] =
              action.payload;
          }

          state.selectedDepartment =
            action.payload;
        }
      )

      .addCase(
        updateDepartment.rejected,
        (state, action) => {
          state.error =
            action.payload ||
            "Failed to update department";
        }
      )

      // DELETE
      .addCase(
        deleteDepartment.fulfilled,
        (state, action) => {
          state.departments =
            state.departments.filter(
              (department) =>
                department.id !== action.payload
            );

          if (
            state.selectedDepartment?.id ===
            action.payload
          ) {
            state.selectedDepartment = null;
          }
        }
      )

      .addCase(
        deleteDepartment.rejected,
        (state, action) => {
          state.error =
            action.payload ||
            "Failed to delete department";
        }
      );
  },
});

export const {
  clearSelectedDepartment,
  clearDepartmentError,
} = departmentSlice.actions;

export default departmentSlice.reducer;