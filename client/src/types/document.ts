export type DocumentStatus =
  | "PENDING"
  | "VERIFIED"
  | "EXPIRED"
  | "REJECTED";

export interface DocumentEmployee {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  designation?: string | null;

  department?: {
    id: string;
    name: string;
  } | null;
}

export interface EmployeeDocument {
  id: string;

  organizationId: string;
  employeeId: string;

  name: string;
  category: string;

  description?: string | null;

  fileUrl: string;

  issueDate?: string | null;
  expiryDate?: string | null;

  status: DocumentStatus;

  employee?: DocumentEmployee;

  createdAt: string;
  updatedAt: string;
}

export interface CreateDocumentPayload {
  employeeId: string;

  name: string;
  category: string;

  description?: string;

  fileUrl: string;

  issueDate?: string;
  expiryDate?: string;

  status?: DocumentStatus;
}

export interface UpdateDocumentPayload {
  name?: string;
  category?: string;
  description?: string;

  fileUrl?: string;

  issueDate?: string;
  expiryDate?: string;

  status?: DocumentStatus;
}