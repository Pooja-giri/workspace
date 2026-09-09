export type EmploymentType =
  | "FULL_TIME"
  | "PART_TIME"
  | "CONTRACTOR"
  | "INTERN";

export type EmploymentStatus =
  | "ACTIVE"
  | "INACTIVE"
  | "ON_LEAVE"
  | "TERMINATED";

export interface Department {
  id: string;
  name: string;
}

export interface EmployeeManager {
  id: string;
  firstName: string;
  lastName: string;
  employeeCode: string;
  jobTitle?: string;
}

export interface Employee {
  id: string;
  employeeCode: string;

  firstName: string;
  lastName: string;

  email: string;
  phone?: string | null;

  jobTitle: string;

  employmentType: EmploymentType;
  employmentStatus: EmploymentStatus;

  joiningDate: string;

  department?: Department | null;

  manager?: EmployeeManager | null;

  userId: string;

  createdAt: string;
  updatedAt: string;
}

export interface EmployeePagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}