import {
  createAsyncThunk,
  createSlice,
} from "@reduxjs/toolkit";

import api from "@/lib/api";

import type {
  Employee,
  EmployeePagination,
} from "@/types/employee";

interface EmployeeState {
  employees: Employee[];
  pagination: EmployeePagination | null;

  selectedEmployee: Employee | null;

  loading: boolean;
  error: string | null;
}

const initialState: EmployeeState = {
  employees: [],
  pagination: null,
  selectedEmployee: null,
  loading: false,
  error: null,
};

interface FetchEmployeesParams {
  page?: number;
  limit?: number;
  search?: string;
  departmentId?: string;
  status?: string;
}

const getErrorMessage = (
  error: unknown,
  fallback: string
): string => {
  if (typeof error === "object" && error !== null) {
    const response = (error as {
      response?: {
        data?: { message?: unknown };
      };
    }).response;

    if (typeof response?.data?.message === "string") {
      return response.data.message;
    }
  }

  return fallback;
};

export const fetchEmployees = createAsyncThunk(
  "employees/fetchEmployees",

  async (
    params: FetchEmployeesParams = {},
    { rejectWithValue }
  ) => {
    try {
      const response = await api.get("/employees", {
        params,
      });

      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to fetch employees")
      );
    }
  }
);

export const fetchEmployee = createAsyncThunk(
  "employees/fetchEmployee",

  async (
    employeeId: string,
    { rejectWithValue }
  ) => {
    try {
      const response = await api.get(
        `/employees/${employeeId}`
      );

      return response.data.data;
    } catch (error: unknown) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to fetch employee")
      );
    }
  }
);

export const createEmployee = createAsyncThunk(
  "employees/createEmployee",

  async (
    payload: Record<string, unknown>,
    { rejectWithValue }
  ) => {
    try {
      const response = await api.post(
        "/employees",
        payload
      );

      return response.data.data;
    } catch (error: unknown) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to create employee")
      );
    }
  }
);

export const updateEmployee = createAsyncThunk(
  "employees/updateEmployee",

  async (
    {
      id,
      data,
    }: {
      id: string;
      data: Record<string, unknown>;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.put(
        `/employees/${id}`,
        data
      );

      return response.data.data;
    } catch (error: unknown) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to update employee")
      );
    }
  }
);

export const updateEmployeeStatus =
  createAsyncThunk(
    "employees/updateEmployeeStatus",

    async (
      {
        id,
        status,
      }: {
        id: string;
        status: string;
      },
      { rejectWithValue }
    ) => {
      try {
        const response = await api.patch(
          `/employees/${id}/status`,
          {
            status,
          }
        );

        return response.data.data;
      } catch (error: unknown) {
        return rejectWithValue(
          getErrorMessage(error, "Failed to update status")
        );
      }
    }
  );

const employeeSlice = createSlice({
  name: "employees",

  initialState,

  reducers: {
    clearSelectedEmployee: (state) => {
      state.selectedEmployee = null;
    },

    clearEmployeeError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder

      .addCase(
        fetchEmployees.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )

      .addCase(
        fetchEmployees.fulfilled,
        (state, action) => {
          state.loading = false;

          state.employees =
            action.payload.data;

          state.pagination =
            action.payload.pagination;
        }
      )

      .addCase(
        fetchEmployees.rejected,
        (state, action) => {
          state.loading = false;

          state.error =
            action.payload as string;
        }
      )

      .addCase(
        fetchEmployee.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )

      .addCase(
        fetchEmployee.fulfilled,
        (state, action) => {
          state.loading = false;

          state.selectedEmployee =
            action.payload;
        }
      )

      .addCase(
        fetchEmployee.rejected,
        (state, action) => {
          state.loading = false;

          state.error =
            action.payload as string;
        }
      )

      .addCase(
        createEmployee.fulfilled,
        (state, action) => {
          state.employees.unshift(
            action.payload
          );
        }
      )

      .addCase(
        updateEmployee.fulfilled,
        (state, action) => {
          const index =
            state.employees.findIndex(
              (employee) =>
                employee.id ===
                action.payload.id
            );

          if (index !== -1) {
            state.employees[index] =
              action.payload;
          }

          state.selectedEmployee =
            action.payload;
        }
      )

      .addCase(
        updateEmployeeStatus.fulfilled,
        (state, action) => {
          const index =
            state.employees.findIndex(
              (employee) =>
                employee.id ===
                action.payload.id
            );

          if (index !== -1) {
            state.employees[index] =
              {
                ...state.employees[index],
                ...action.payload,
              };
          }

          if (
            state.selectedEmployee?.id ===
            action.payload.id
          ) {
            state.selectedEmployee = {
              ...state.selectedEmployee,
              ...action.payload,
            };
          }
        }
      );
  },
});

export const {
  clearSelectedEmployee,
  clearEmployeeError,
} = employeeSlice.actions;

export default employeeSlice.reducer;