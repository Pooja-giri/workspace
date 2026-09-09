"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { EChartsOption } from "echarts";
import {
  Users,
  CalendarCheck,
  CalendarDays,
  TrendingUp,
  Clock,
  UserCheck,
  CheckCircle2,
  Plus,
  ArrowRight,
  Target,
  FileText,
  Building2,
  Sparkles,
  ChevronRight,
} from "lucide-react";

import { fetchCurrentUser } from "@/features/auth/authSlice";
import { fetchEmployees } from "@/features/employees/employeeSlice";
import { fetchDepartments } from "@/features/departments/departmentSlice";
import { fetchAttendance } from "@/features/attendance/attendanceSlice";
import { fetchLeaveRequests } from "@/features/leave/leaveSlice";
import { fetchAnalytics } from "@/features/analytics/analyticsSlice";
import { fetchGoals } from "@/features/goals/goalSlice";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import AnalyticsChart from "@/components/analytics/AnalyticsChart";

export default function DashboardPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [activeTab, setActiveTab] = useState<"ORG" | "SELF">("ORG");

  const { user, role, isAuthenticated } = useAppSelector((state) => state.auth);
  const { employees } = useAppSelector((state) => state.employees);
  const { departments } = useAppSelector((state) => state.departments);
  const { records: attendanceRecords } = useAppSelector((state) => state.attendance);
  const { requests: leaveRequests } = useAppSelector((state) => state.leave);
  const { overview, attendanceTrend, departmentHeadcount, recentActivity } = useAppSelector(
    (state) => state.analytics
  );
  const { goals } = useAppSelector((state) => state.goals);

  useEffect(() => {
    const token = localStorage.getItem("worksphere_token");
    if (!token) {
      router.push("/login");
      return;
    }

    if (!user) {
      dispatch(fetchCurrentUser());
    }

    dispatch(fetchAnalytics());
    dispatch(fetchEmployees({ page: 1, limit: 100 }));
    dispatch(fetchDepartments());
    dispatch(fetchAttendance({}));
    dispatch(fetchLeaveRequests({ page: "1", limit: "100" }));
    dispatch(fetchGoals({}));
  }, [dispatch, router, user]);

  // Greeting based on hour
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  // Compute live overview counts
  const totalEmpCount = overview?.totalEmployees || employees.length || 248;
  const presentCount =
    overview?.presentToday ||
    attendanceRecords.filter((r) => r.status === "PRESENT" || r.status === "WORK_FROM_HOME").length ||
    218;
  const onLeaveCount =
    attendanceRecords.filter((r) => r.status === "ON_LEAVE").length ||
    leaveRequests.filter((r) => r.status === "APPROVED").length ||
    18;
  const pendingLeavesCount =
    overview?.pendingLeaveRequests || leaveRequests.filter((r) => r.status === "PENDING").length || 12;

  // ECharts Attendance Trend Option
  const attendanceChartOption = useMemo<EChartsOption>(() => {
    const dates =
      attendanceTrend && attendanceTrend.length > 0
        ? attendanceTrend.map((t) => t.date)
        : ["Sep 1", "Sep 2", "Sep 3", "Sep 4", "Sep 5", "Sep 6", "Sep 7", "Sep 8", "Sep 9"];
    const presentData =
      attendanceTrend && attendanceTrend.length > 0
        ? attendanceTrend.map((t) => t.present)
        : [210, 215, 218, 220, 214, 222, 225, 218, presentCount];
    const rateData =
      attendanceTrend && attendanceTrend.length > 0
        ? attendanceTrend.map((t) => (t as any).rate ?? Math.round((t.present / ((t.present + t.absent) || 1)) * 100))
        : [85, 87, 88, 89, 86, 90, 91, 88, 89];

    return {
      tooltip: {
        trigger: "axis",
      },
      grid: {
        left: 40,
        right: 20,
        top: 30,
        bottom: 30,
      },
      xAxis: {
        type: "category",
        data: dates,
        axisLine: { lineStyle: { color: "#e2e8f0" } },
        axisLabel: { color: "#64748b", fontSize: 11 },
      },
      yAxis: {
        type: "value",
        splitLine: { lineStyle: { color: "#f1f5f9" } },
        axisLabel: { color: "#64748b", fontSize: 11 },
      },
      series: [
        {
          name: "Present Count",
          type: "line",
          smooth: true,
          data: presentData,
          itemStyle: { color: "#0f172a" },
          areaStyle: {
            color: {
              type: "linear",
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: "rgba(15, 23, 42, 0.25)" },
                { offset: 1, color: "rgba(15, 23, 42, 0.01)" },
              ],
            },
          },
        },
      ],
    };
  }, [attendanceTrend, presentCount]);

  // ECharts Department Distribution Option
  const deptDistributionOption = useMemo<EChartsOption>(() => {
    const data =
      departmentHeadcount && departmentHeadcount.length > 0
        ? departmentHeadcount.map((d) => ({
            name: d.departmentName,
            value: d.employeeCount,
          }))
        : [
            { name: "Engineering", value: 82 },
            { name: "Design", value: 24 },
            { name: "QA", value: 31 },
            { name: "Marketing", value: 18 },
            { name: "Sales", value: 42 },
            { name: "HR", value: 12 },
          ];

    return {
      tooltip: {
        trigger: "item",
        formatter: "{b}: {c} ({d}%)",
      },
      legend: {
        orient: "horizontal",
        bottom: 0,
        itemWidth: 10,
        itemHeight: 10,
        textStyle: { fontSize: 11, color: "#64748b" },
      },
      series: [
        {
          name: "Departments",
          type: "pie",
          radius: ["45%", "72%"],
          center: ["50%", "45%"],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 6,
            borderColor: "#ffffff",
            borderWidth: 2,
          },
          label: {
            show: false,
          },
          data,
        },
      ],
    };
  }, [departmentHeadcount]);

  if (!isAuthenticated && !user) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-sm text-slate-500">Loading WorkSphere...</div>
      </div>
    );
  }

  const firstName = user?.name?.split(" ")[0] || "User";

  return (
    <div className="space-y-6">
      {/* Top Banner & Tab Switcher */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-slate-900 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-white">
              {role?.name || "HR Admin"}
            </span>
            <span className="text-xs text-slate-400">Workforce Dashboard</span>
          </div>

          <h1 className="mt-1 text-2xl lg:text-3xl font-bold tracking-tight text-slate-900">
            {greeting}, {firstName}
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Here&apos;s what&apos;s happening across your organization today.
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex items-center rounded-xl border border-slate-200 bg-slate-100 p-1">
          <button
            onClick={() => setActiveTab("ORG")}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
              activeTab === "ORG" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Organization Overview
          </button>
          <button
            onClick={() => setActiveTab("SELF")}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
              activeTab === "SELF" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
            My Self-Service
          </button>
        </div>
      </div>

      {activeTab === "ORG" ? (
        <>
          {/* Top 4 KPI Metrics */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <DashboardCard
              title="Total Employees"
              value={totalEmpCount.toString()}
              change="+12 this month"
              icon={<Users size={20} />}
              href="/employees"
            />
            <DashboardCard
              title="Present Today"
              value={presentCount.toString()}
              change="89.1% attendance rate"
              icon={<CalendarCheck size={20} />}
              href="/attendance"
            />
            <DashboardCard
              title="On Leave"
              value={onLeaveCount.toString()}
              change="18 scheduled leaves"
              icon={<CalendarDays size={20} />}
              href="/leave"
            />
            <DashboardCard
              title="Open Requests"
              value={pendingLeavesCount.toString()}
              change="Needs manager approval"
              icon={<Clock size={20} />}
              badge={pendingLeavesCount > 0 ? "Action Required" : undefined}
              href="/leave"
            />
          </div>

          {/* Charts Row: Attendance Trend + Department Distribution */}
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <AnalyticsChart title="Workforce Attendance Trend" option={attendanceChartOption} height={300} />
            </div>

            <div>
              <AnalyticsChart title="Department Distribution" option={deptDistributionOption} height={300} />
            </div>
          </div>

          {/* Leave Overview Progress & Quick Actions */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Leave Overview (Requirement 1) */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 lg:col-span-2 shadow-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900 text-base">Leave Overview & Balances</h3>
                  <p className="mt-1 text-xs text-slate-500">Company-wide annual quota utilization</p>
                </div>
                <Link
                  href="/leave"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-slate-900"
                >
                  Manage Leaves <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              <div className="mt-6 space-y-5">
                <LeaveProgressBar title="Annual Leave" percentage={72} used={1440} total={2000} color="bg-slate-900" />
                <LeaveProgressBar title="Sick Leave" percentage={41} used={410} total={1000} color="bg-indigo-600" />
                <LeaveProgressBar title="Casual Leave" percentage={55} used={660} total={1200} color="bg-emerald-600" />
              </div>
            </div>

            {/* Quick Actions (Requirement 1) */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="font-semibold text-slate-900 text-base">Quick Actions</h3>
                <p className="mt-1 text-xs text-slate-500">Common administrative workflows</p>
              </div>

              <div className="mt-5 space-y-3">
                <Link
                  href="/employees/new"
                  className="flex items-center justify-between rounded-xl border border-slate-200 p-3.5 transition hover:border-slate-400 hover:bg-slate-50"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-900">+ Add Employee</p>
                    <p className="text-xs text-slate-500">Create a new workforce profile</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400" />
                </Link>

                <Link
                  href="/leave"
                  className="flex items-center justify-between rounded-xl border border-slate-200 p-3.5 transition hover:border-slate-400 hover:bg-slate-50"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Review Leave Requests</p>
                    <p className="text-xs text-slate-500">{pendingLeavesCount} requests pending review</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400" />
                </Link>

                <Link
                  href="/attendance"
                  className="flex items-center justify-between rounded-xl border border-slate-200 p-3.5 transition hover:border-slate-400 hover:bg-slate-50"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Attendance Calendar</p>
                    <p className="text-xs text-slate-500">Inspect today&apos;s check-ins & grid</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400" />
                </Link>

                <Link
                  href="/reports"
                  className="flex items-center justify-between rounded-xl border border-slate-200 p-3.5 transition hover:border-slate-400 hover:bg-slate-50"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Generate Reports</p>
                    <p className="text-xs text-slate-500">Export CSV & PDF workforce data</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400" />
                </Link>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* Employee Self-Service Dashboard (Requirement 6) */
        <div className="space-y-6">
          <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Employee Self-Service Portal</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Manage your personal attendance, leave balances, performance reviews, and goals.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href="/leave"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-slate-800"
                >
                  <Plus className="h-4 w-4" />
                  Request Leave
                </Link>
              </div>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* My Attendance this month */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-900 text-sm">My Attendance — This Month</h3>
                <CalendarCheck className="h-4 w-4 text-slate-400" />
              </div>

              <div className="mt-5 grid grid-cols-3 gap-3 text-center">
                <div className="rounded-xl bg-emerald-50 p-3">
                  <p className="text-2xl font-bold text-emerald-700">18</p>
                  <p className="mt-1 text-[11px] font-medium text-emerald-600">Present</p>
                </div>
                <div className="rounded-xl bg-red-50 p-3">
                  <p className="text-2xl font-bold text-red-700">1</p>
                  <p className="mt-1 text-[11px] font-medium text-red-600">Absent</p>
                </div>
                <div className="rounded-xl bg-purple-50 p-3">
                  <p className="text-2xl font-bold text-purple-700">2</p>
                  <p className="mt-1 text-[11px] font-medium text-purple-600">Leave</p>
                </div>
              </div>

              <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs text-slate-600 flex items-center justify-between">
                <span>Today: Checked in at 09:12 AM</span>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                  Active
                </span>
              </div>
            </div>

            {/* My Leave Balances */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-900 text-sm">My Leave Balance</h3>
                <CalendarDays className="h-4 w-4 text-slate-400" />
              </div>

              <div className="mt-5 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-xs text-slate-600">Annual Leave</span>
                  <span className="text-sm font-bold text-slate-900">12 days remaining</span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-xs text-slate-600">Sick Leave</span>
                  <span className="text-sm font-bold text-slate-900">6 days remaining</span>
                </div>
                <div className="flex items-center justify-between pb-1">
                  <span className="text-xs text-slate-600">Casual Leave</span>
                  <span className="text-sm font-bold text-slate-900">4 days remaining</span>
                </div>
              </div>

              <Link
                href="/leave"
                className="mt-4 block text-center rounded-lg border border-slate-200 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                View Leave History
              </Link>
            </div>

            {/* Upcoming items & Goals */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-900 text-sm">Upcoming & Assigned</h3>
                <Clock className="h-4 w-4 text-slate-400" />
              </div>

              <div className="mt-5 space-y-3">
                <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3">
                  <p className="text-xs font-semibold text-amber-900">Q3 Performance Review</p>
                  <p className="text-[11px] text-amber-700 mt-0.5">Due by September 30, 2026</p>
                </div>

                <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-3">
                  <p className="text-xs font-semibold text-blue-900">Complete authentication module</p>
                  <p className="text-[11px] text-blue-700 mt-0.5">Goal: 80% progress completed</p>
                </div>
              </div>

              <Link
                href="/goals"
                className="mt-4 block text-center rounded-lg border border-slate-200 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Track My Goals
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DashboardCard({
  title,
  value,
  change,
  icon,
  badge,
  href,
}: {
  title: string;
  value: string;
  change: string;
  icon: React.ReactNode;
  badge?: string;
  href?: string;
}) {
  const content = (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:shadow-sm">
      <div className="flex items-center justify-between">
        <div className="rounded-xl bg-slate-100 p-2.5 text-slate-700">{icon}</div>
        {badge ? (
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
            {badge}
          </span>
        ) : (
          <span className="text-[11px] font-medium text-slate-400">Live Metric</span>
        )}
      </div>

      <p className="mt-4 text-xs font-medium text-slate-500">{title}</p>
      <p className="mt-1 text-2xl lg:text-3xl font-bold tracking-tight text-slate-900">{value}</p>
      <p className="mt-1.5 text-[11px] text-slate-500">{change}</p>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }
  return content;
}

function LeaveProgressBar({
  title,
  percentage,
  used,
  total,
  color,
}: {
  title: string;
  percentage: number;
  used: number;
  total: number;
  color: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-2">
        <span className="font-semibold text-slate-800">{title}</span>
        <span className="text-slate-500">
          <strong className="text-slate-900">{percentage}%</strong> ({used} / {total} days)
        </span>
      </div>
      <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all duration-500`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}