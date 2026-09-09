export type AttendanceStatus =
  | "PRESENT"
  | "ABSENT"
  | "HALF_DAY"
  | "WORK_FROM_HOME"
  | "ON_LEAVE";

export interface AttendanceEmployee {
  id: string;
  employeeCode?: string;
  firstName: string;
  lastName: string;
  department?: {
    id: string;
    name: string;
  } | null;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string;
  status: AttendanceStatus;
  checkIn?: string | null;
  checkOut?: string | null;
  notes?: string | null;
  employee: AttendanceEmployee;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateAttendancePayload {
  employeeId: string;
  date: string;
  status: AttendanceStatus;
  checkIn?: string;
  checkOut?: string;
  notes?: string;
}

export interface UpdateAttendancePayload {
  status?: AttendanceStatus;
  checkIn?: string;
  checkOut?: string;
  notes?: string;
}