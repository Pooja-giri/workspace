export interface ActivityUser {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
}

export interface ActivityLog {
  id: string;
  organizationId: string;
  userId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
  user?: ActivityUser | null;
}

export interface ActivityState {
  activities: ActivityLog[];
  loading: boolean;
  error: string | null;
}

export interface ActivityResponse {
  success: boolean;
  data: ActivityLog[];
  message?: string;
}