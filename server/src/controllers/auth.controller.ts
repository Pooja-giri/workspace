import { Request, Response } from "express";
import { z } from "zod";
import {
  loginUser,
  registerUser,
} from "../services/auth.service";
import { AuthenticatedRequest } from "../types/auth";
import { prisma } from "../config/prisma";

const registerSchema = z.object({
  name: z.string().min(2, "Name must contain at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must contain at least 8 characters"),
  organizationName: z
    .string()
    .min(2, "Organization name must contain at least 2 characters"),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export async function register(
  req: Request,
  res: Response
) {
  try {
    const result = registerSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error.issues[0]?.message ?? "Invalid request",
      });
    }

    const data = await registerUser(result.data);

    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      data,
    });
  } catch (error) {
    console.error("Register error:", error);

    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Registration failed",
    });
  }
}

export async function login(
  req: Request,
  res: Response
) {
  try {
    const result = loginSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error.issues[0]?.message ?? "Invalid request",
      });
    }

    const data = await loginUser(result.data);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data,
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(401).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Login failed",
    });
  }
}

export async function getMe(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: req.user.userId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        isActive: true,
        memberships: {
          where: {
            id: req.user.membershipId,
          },
          include: {
            organization: true,
            role: true,
          },
        },
        employee: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Get me error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch user",
    });
  }
}