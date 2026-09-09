export type NotificationType =
  | "LEAVE_REQUEST"
  | "LEAVE_APPROVED"
  | "LEAVE_REJECTED"
  | "PERFORMANCE_REVIEW"
  | "GOAL_ASSIGNED"
  | "SYSTEM";

export interface Notification {
  id: string;
  organizationId: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  actionUrl?: string | null;
  readAt?: string | null;
  createdAt: string;
}

export interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
}