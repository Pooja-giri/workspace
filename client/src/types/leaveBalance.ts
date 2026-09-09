export interface LeaveBalance {
  id: string;
  year: number;
  totalDays: number;
  usedDays: number;
  carriedForward: number;
  availableDays: number;

  leaveType: {
    id: string;
    name: string;
    code: string;
    description?: string | null;
    daysPerYear: number;
    isPaid: boolean;
    carryForward: boolean;
  };
}