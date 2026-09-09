import "dotenv/config";
import express from "express";
import cors from "cors";
import { prisma } from "./config/prisma";
import authRoutes from "./routes/auth.routes";
import employeeRoutes from "./routes/employee.routes";
import departmentRoutes from "./routes/department.routes";
import attendanceRoutes from "./routes/attendance.routes";
import leaveRoutes from "./routes/leave.routes";
import leaveTypeRoutes from "./routes/leaveType.routes";
import leaveBalanceRoutes from "./routes/leaveBalance.routes";
import performanceReviewRoutes from "./routes/performanceReview.routes";
import goalRoutes from "./routes/goal.routes";
import documentRoutes from "./routes/document.routes";
import analyticsRoutes from "./routes/analytics.routes";
import notificationRoutes from "./routes/notification.routes";
import activityRoutes from "./routes/activity.routes";

const app = express();

const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    message: "WorkSphere API is running",
  });
});

app.get("/api/health/db", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    res.json({
      success: true,
      message: "Database connection is healthy",
    });
  } catch (error) {
    console.error("Database health check failed:", error);

    res.status(500).json({
      success: false,
      message: "Database connection failed",
    });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/leave-types", leaveTypeRoutes);
app.use("/api/leave-balances", leaveBalanceRoutes);
app.use("/api/performance-reviews", performanceReviewRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/activities", activityRoutes);
app.listen(PORT, () => {
  console.log(
    `WorkSphere API running on http://localhost:${PORT}`
  );
});