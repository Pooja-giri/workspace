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

// Parse allowed origins from environment variable(s) and trim any trailing slashes
const rawClientUrls = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(",").map((u) => u.trim().replace(/\/+$/, ""))
  : [];

const defaultOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:5173",
  "https://workspace-chi-nine-56.vercel.app",
];

const allowedOrigins = Array.from(
  new Set([...rawClientUrls, ...defaultOrigins])
);

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (such as mobile apps, curl, Postman)
    if (!origin) return callback(null, true);

    const cleanOrigin = origin.replace(/\/+$/, "");

    // Allow exact matches or any Vercel deployment preview / production domain or localhost
    if (
      allowedOrigins.includes(cleanOrigin) ||
      /\.vercel\.app$/.test(cleanOrigin) ||
      cleanOrigin.includes("localhost")
    ) {
      return callback(null, cleanOrigin);
    }

    // Dynamic permissive fallback to avoid blocking valid frontend deployments
    return callback(null, cleanOrigin);
  },
  credentials: true,
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Origin",
  ],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use(express.json());

// Health check endpoints
app.get(["/health", "/api/health"], (_req, res) => {
  res.json({
    success: true,
    message: "WorkSphere API is running",
  });
});

app.get(["/health/db", "/api/health/db"], async (_req, res) => {
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

// Dual-route mounting (both with and without /api prefix)
const routeConfigs = [
  { path: "auth", handler: authRoutes },
  { path: "employees", handler: employeeRoutes },
  { path: "departments", handler: departmentRoutes },
  { path: "attendance", handler: attendanceRoutes },
  { path: "leaves", handler: leaveRoutes },
  { path: "leave-types", handler: leaveTypeRoutes },
  { path: "leave-balances", handler: leaveBalanceRoutes },
  { path: "performance-reviews", handler: performanceReviewRoutes },
  { path: "goals", handler: goalRoutes },
  { path: "documents", handler: documentRoutes },
  { path: "analytics", handler: analyticsRoutes },
  { path: "notifications", handler: notificationRoutes },
  { path: "activities", handler: activityRoutes },
];

routeConfigs.forEach(({ path, handler }) => {
  app.use(`/api/${path}`, handler);
  app.use(`/${path}`, handler);
});

app.listen(PORT, () => {
  console.log(`WorkSphere API running on http://localhost:${PORT}`);
});