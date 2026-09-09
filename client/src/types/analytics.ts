export interface AnalyticsOverview {
  totalEmployees: number;
  activeEmployees: number;
  presentToday: number;
  absentToday: number;
  pendingLeaveRequests: number;
  averagePerformance: number;
  goalCompletionRate: number;
  documentComplianceRate: number;
}

export interface DepartmentHeadcount {
  departmentId: string;
  departmentName: string;
  employeeCount: number;
}

export interface EmployeeGrowth {
  month: string;
  employees: number;
  hires: number;
  exits: number;
}

export interface AttendanceTrend {
  date: string;
  present: number;
  absent: number;
  late: number;
  halfDay: number;
}

export interface LeaveAnalytics {
  leaveType: string;
  requested: number;
  approved: number;
  rejected: number;
  days: number;
}

export interface PerformanceAnalytics {
  rating: number;
  count: number;
}

export interface DepartmentPerformance {
  departmentName: string;
  averageRating: number;
  reviewCount: number;
}

export interface RecentActivity {
  id: string;
  type: string;
  message: string;
  createdAt: string;
  employeeName?: string;
}