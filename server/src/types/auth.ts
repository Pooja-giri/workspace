import { Request } from "express";

export interface AuthenticatedUser {
  userId: string;
  organizationId: string;
  membershipId: string;
  roleId: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}