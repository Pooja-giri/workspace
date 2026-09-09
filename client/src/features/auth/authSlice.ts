import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { isAxiosError } from "axios";
import api from "@/lib/api";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  isActive?: boolean;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
}

export interface Role {
  id: string;
  name: string;
  key: string;
}

interface AuthState {
  user: AuthUser | null;
  organization: Organization | null;
  role: Role | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  organization: null,
  role: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  organizationName: string;
}

interface LoginPayload {
  email: string;
  password: string;
}

interface AuthResponse {
  accessToken: string;
  user: AuthUser;
  organization: Organization;
  role: Role;
}

interface CurrentUserResponse extends AuthUser {
  memberships?: Array<{
    organization: Organization;
    role: Role;
  }>;
}

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message || fallback;
  }

  return fallback;
};

export const registerUser = createAsyncThunk<
  AuthResponse,
  RegisterPayload,
  { rejectValue: string }
>("auth/register", async (payload, { rejectWithValue }) => {
  try {
    const response = await api.post("/auth/register", payload);

    return response.data.data;
  } catch (error: unknown) {
    return rejectWithValue(getErrorMessage(error, "Registration failed"));
  }
});

export const loginUser = createAsyncThunk<
  AuthResponse,
  LoginPayload,
  { rejectValue: string }
>("auth/login", async (payload, { rejectWithValue }) => {
  try {
    const response = await api.post("/auth/login", payload);

    return response.data.data;
  } catch (error: unknown) {
    return rejectWithValue(getErrorMessage(error, "Login failed"));
  }
});

export const fetchCurrentUser = createAsyncThunk<
  CurrentUserResponse,
  void,
  { rejectValue: string }
>("auth/me", async (_, { rejectWithValue }) => {
  try {
    const response = await api.get("/auth/me");

    return response.data.data;
  } catch (error: unknown) {
    return rejectWithValue(getErrorMessage(error, "Session expired"));
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,

  reducers: {
    logout: (state) => {
      state.user = null;
      state.organization = null;
      state.role = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;

      if (typeof window !== "undefined") {
        localStorage.removeItem("worksphere_token");
      }
    },

    restoreToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
      state.isAuthenticated = true;
    },

    clearAuthError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.organization = action.payload.organization;
        state.role = action.payload.role;
        state.token = action.payload.accessToken;
        state.isAuthenticated = true;

        if (typeof window !== "undefined") {
          localStorage.setItem(
            "worksphere_token",
            action.payload.accessToken
          );
        }
      })

      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Registration failed";
      })

      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.organization = action.payload.organization;
        state.role = action.payload.role;
        state.token = action.payload.accessToken;
        state.isAuthenticated = true;

        if (typeof window !== "undefined") {
          localStorage.setItem(
            "worksphere_token",
            action.payload.accessToken
          );
        }
      })

      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Login failed";
      })

      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload;

        if (action.payload?.memberships?.[0]) {
          const membership = action.payload.memberships[0];

          state.organization = membership.organization;
          state.role = membership.role;
        }

        state.isAuthenticated = true;
      })

      .addCase(fetchCurrentUser.rejected, (state) => {
        state.user = null;
        state.organization = null;
        state.role = null;
        state.token = null;
        state.isAuthenticated = false;

        if (typeof window !== "undefined") {
          localStorage.removeItem("worksphere_token");
        }
      });
  },
});

export const {
  logout,
  restoreToken,
  clearAuthError,
} = authSlice.actions;

export default authSlice.reducer;