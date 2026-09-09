export interface DepartmentManager {
  id: string;
  firstName: string;
  lastName: string;
  employeeCode: string;
  jobTitle?: string;
  email?: string;
}

export interface DepartmentEmployee {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  jobTitle: string;
  employmentStatus: string;
  employmentType: string;
  joiningDate: string;
}

export interface Department {
  id: string;
  name: string;
  description?: string | null;
  managerId?: string | null;
  manager?: DepartmentManager | null;

  _count?: {
    employees: number;
  };

  employees?: DepartmentEmployee[];

  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDepartmentPayload {
  name: string;
  description?: string;
  managerId?: string | null;
}

export interface UpdateDepartmentPayload {
  name?: string;
  description?: string | null;
  managerId?: string | null;
}