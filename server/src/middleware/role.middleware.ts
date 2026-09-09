import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../types/auth";
import { prisma } from "../config/prisma";

export function requireRoles(...allowedRoles: string[]) {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const role = await prisma.role.findUnique({
        where: {
          id: req.user.roleId,
        },
      });

      if (!role) {
        return res.status(403).json({
          success: false,
          message: "Role not found",
        });
      }

      if (!allowedRoles.includes(role.key)) {
        return res.status(403).json({
          success: false,
          message: "You do not have permission to perform this action",
        });
      }

      next();
    } catch (error) {
      console.error("Role authorization error:", error);

      return res.status(500).json({
        success: false,
        message: "Authorization failed",
      });
    }
  };
}