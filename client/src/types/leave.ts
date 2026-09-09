export type LeaveRequestStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "CANCELLED";

export interface LeaveType {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  daysPerYear: number;
  isPaid: boolean;
  carryForward: boolean;
}

export interface LeaveEmployee {
  id: string;
  employeeCode?: string;
  firstName: string;
  lastName: string;
  department?: {
    id: string;
    name: string;
  } | null;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  leaveTypeId: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: LeaveRequestStatus;
  employee: LeaveEmployee;
  leaveType: LeaveType;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLeaveRequestPayload {
  employeeId: string;
  leaveTypeId: string;
  startDate: string;
  endDate: string;
  reason: string;
}