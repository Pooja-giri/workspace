export type GoalStatus =
  | "NOT_STARTED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "AT_RISK"
  | "ON_HOLD";

export type GoalPriority =
  | "LOW"
  | "MEDIUM"
  | "HIGH"
  | "CRITICAL";

export interface GoalEmployee {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  jobTitle?: string | null;
  designation?: string | null;

  department?: {
    id: string;
    name: string;
  } | null;
}

export interface Goal {
  id: string;

  organizationId: string;
  employeeId: string;

  title: string;
  description?: string | null;
  category?: string | null;

  startDate?: string;
  dueDate?: string | null;

  progress?: number;
  targetValue?: number;
  currentValue?: number;

  status: GoalStatus;
  priority?: GoalPriority;

  employee?: GoalEmployee;

  createdAt: string;
  updatedAt: string;
}

export interface CreateGoalPayload {
  employeeId: string;

  title: string;
  description?: string;
  category?: string;

  startDate?: string;
  dueDate?: string;

  progress?: number;
  targetValue?: number;
  currentValue?: number;

  status?: GoalStatus;
  priority?: GoalPriority;
}

export interface UpdateGoalPayload {
  title?: string;
  description?: string;
  category?: string;

  startDate?: string;
  dueDate?: string;

  progress?: number;
  targetValue?: number;
  currentValue?: number;

  status?: GoalStatus;
  priority?: GoalPriority;
}