import {
  createAsyncThunk,
  createSlice,
  PayloadAction,
} from "@reduxjs/toolkit";

import api from "@/lib/api";

import {
  CreateDocumentPayload,
  EmployeeDocument,
  UpdateDocumentPayload,
} from "@/types/document";

interface DocumentState {
  documents: EmployeeDocument[];

  selectedDocument:
    | EmployeeDocument
    | null;

  loading: boolean;
  error: string | null;

  total: number;
  page: number;
  limit: number;
}

const initialState: DocumentState = {
  documents: [],

  selectedDocument: null,

  loading: false,
  error: null,

  total: 0,
  page: 1,
  limit: 20,
};

const getErrorMessage = (
  error: unknown,
  fallback: string
): string => {
  if (typeof error === "object" && error !== null) {
    const response = (error as {
      response?: { data?: { message?: unknown } };
    }).response;

    if (typeof response?.data?.message === "string") {
      return response.data.message;
    }
  }

  return fallback;
};

export const fetchDocuments =
  createAsyncThunk(
    "documents/fetchDocuments",
    async (
      params: {
        employeeId?: string;
        category?: string;
        status?: string;
        search?: string;
        page?: number;
        limit?: number;
      } = {},
      { rejectWithValue }
    ) => {
      try {
        const response =
          await api.get(
            "/documents",
            {
              params,
            }
          );

        return response.data;
      } catch (error: unknown) {
        return rejectWithValue(
          getErrorMessage(error, "Failed to fetch documents")
        );
      }
    }
  );

export const fetchDocumentById =
  createAsyncThunk(
    "documents/fetchDocumentById",
    async (
      id: string,
      { rejectWithValue }
    ) => {
      try {
        const response =
          await api.get(
            `/documents/${id}`
          );

        return response.data;
      } catch (error: unknown) {
        return rejectWithValue(
          getErrorMessage(error, "Failed to fetch document")
        );
      }
    }
  );

export const createDocument =
  createAsyncThunk(
    "documents/createDocument",
    async (
      payload: CreateDocumentPayload,
      { rejectWithValue }
    ) => {
      try {
        const response =
          await api.post(
            "/documents",
            payload
          );

        return response.data;
      } catch (error: unknown) {
        return rejectWithValue(
          getErrorMessage(error, "Failed to create document")
        );
      }
    }
  );

export const updateDocument =
  createAsyncThunk(
    "documents/updateDocument",
    async (
      {
        id,
        data,
      }: {
        id: string;
        data: UpdateDocumentPayload;
      },
      { rejectWithValue }
    ) => {
      try {
        const response =
          await api.patch(
            `/documents/${id}`,
            data
          );

        return response.data;
      } catch (error: unknown) {
        return rejectWithValue(
          getErrorMessage(error, "Failed to update document")
        );
      }
    }
  );

export const deleteDocument =
  createAsyncThunk(
    "documents/deleteDocument",
    async (
      id: string,
      { rejectWithValue }
    ) => {
      try {
        await api.delete(
          `/documents/${id}`
        );

        return id;
      } catch (error: unknown) {
        return rejectWithValue(
          getErrorMessage(error, "Failed to delete document")
        );
      }
    }
  );

const documentSlice =
  createSlice({
    name: "documents",

    initialState,

    reducers: {
      clearSelectedDocument: (
        state
      ) => {
        state.selectedDocument =
          null;
      },

      clearDocumentError: (
        state
      ) => {
        state.error = null;
      },
    },

    extraReducers: (builder) => {
      builder

        // FETCH
        .addCase(
          fetchDocuments.pending,
          (state) => {
            state.loading = true;
            state.error = null;
          }
        )

        .addCase(
          fetchDocuments.fulfilled,
          (
            state,
            action: PayloadAction<{
              success: boolean;
              data: EmployeeDocument[];
              pagination?: {
                total: number;
                page: number;
                limit: number;
                totalPages: number;
              };
            }>
          ) => {
            state.loading = false;

            state.documents =
              action.payload.data ||
              [];

            state.total =
              action.payload
                .pagination?.total ||
              0;

            state.page =
              action.payload
                .pagination?.page ||
              1;

            state.limit =
              action.payload
                .pagination?.limit ||
              20;
          }
        )

        .addCase(
          fetchDocuments.rejected,
          (
            state,
            action
          ) => {
            state.loading = false;

            state.error =
              action.payload as string;
          }
        )

        // SINGLE
        .addCase(
          fetchDocumentById.pending,
          (state) => {
            state.loading = true;
            state.error = null;
          }
        )

        .addCase(
          fetchDocumentById.fulfilled,
          (
            state,
            action: PayloadAction<{
              success: boolean;
              data: EmployeeDocument;
            }>
          ) => {
            state.loading = false;

            state.selectedDocument =
              action.payload.data;
          }
        )

        .addCase(
          fetchDocumentById.rejected,
          (
            state,
            action
          ) => {
            state.loading = false;

            state.error =
              action.payload as string;
          }
        )

        // CREATE
        .addCase(
          createDocument.pending,
          (state) => {
            state.loading = true;
            state.error = null;
          }
        )

        .addCase(
          createDocument.fulfilled,
          (
            state,
            action: PayloadAction<{
              success: boolean;
              data: EmployeeDocument;
            }>
          ) => {
            state.loading = false;

            state.documents.unshift(
              action.payload.data
            );

            state.total += 1;
          }
        )

        .addCase(
          createDocument.rejected,
          (
            state,
            action
          ) => {
            state.loading = false;

            state.error =
              action.payload as string;
          }
        )

        // UPDATE
        .addCase(
          updateDocument.pending,
          (state) => {
            state.loading = true;
            state.error = null;
          }
        )

        .addCase(
          updateDocument.fulfilled,
          (
            state,
            action: PayloadAction<{
              success: boolean;
              data: EmployeeDocument;
            }>
          ) => {
            state.loading = false;

            const updated =
              action.payload.data;

            const index =
              state.documents.findIndex(
                (document) =>
                  document.id ===
                  updated.id
              );

            if (index !== -1) {
              state.documents[index] =
                updated;
            }

            if (
              state.selectedDocument
                ?.id === updated.id
            ) {
              state.selectedDocument =
                updated;
            }
          }
        )

        .addCase(
          updateDocument.rejected,
          (
            state,
            action
          ) => {
            state.loading = false;

            state.error =
              action.payload as string;
          }
        )

        // DELETE
        .addCase(
          deleteDocument.pending,
          (state) => {
            state.loading = true;
            state.error = null;
          }
        )

        .addCase(
          deleteDocument.fulfilled,
          (
            state,
            action: PayloadAction<string>
          ) => {
            state.loading = false;

            state.documents =
              state.documents.filter(
                (document) =>
                  document.id !==
                  action.payload
              );

            state.total = Math.max(
              state.total - 1,
              0
            );

            if (
              state.selectedDocument
                ?.id === action.payload
            ) {
              state.selectedDocument =
                null;
            }
          }
        )

        .addCase(
          deleteDocument.rejected,
          (
            state,
            action
          ) => {
            state.loading = false;

            state.error =
              action.payload as string;
          }
        );
    },
  });

export const {
  clearSelectedDocument,
  clearDocumentError,
} = documentSlice.actions;

export default documentSlice.reducer;