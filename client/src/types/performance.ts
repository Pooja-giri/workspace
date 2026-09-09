export type PerformanceReviewStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "ACKNOWLEDGED";

export interface PerformanceReview {
  id: string;

  employeeId: string;
  reviewerId: string;

  periodStart: string;
  periodEnd: string;

  overallRating: number;
  technicalRating: number;
  communicationRating: number;
  teamworkRating: number;
  leadershipRating: number;

  strengths?: string | null;
  improvements?: string | null;
  comments?: string | null;

  status: PerformanceReviewStatus;

  employee?: {
    id: string;
    employeeCode: string;
    firstName: string;
    lastName: string;
    designation?: string | null;
    department?: {
      id: string;
      name: string;
    } | null;
  };

  reviewer?: {
    id: string;
    employeeCode: string;
    firstName: string;
    lastName: string;
    designation?: string | null;
  };

  createdAt: string;
  updatedAt: string;
}

export interface CreatePerformanceReviewPayload {
  employeeId: string;
  reviewerId: string;

  periodStart: string;
  periodEnd: string;

  overallRating: number;
  technicalRating: number;
  communicationRating: number;
  teamworkRating: number;
  leadershipRating: number;

  strengths?: string;
  improvements?: string;
  comments?: string;

  status?: PerformanceReviewStatus;
}

export interface UpdatePerformanceReviewPayload {
  overallRating?: number;
  technicalRating?: number;
  communicationRating?: number;
  teamworkRating?: number;
  leadershipRating?: number;

  strengths?: string;
  improvements?: string;
  comments?: string;

  status?: PerformanceReviewStatus;
}