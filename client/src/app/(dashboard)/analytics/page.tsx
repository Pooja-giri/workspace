"use client";

import { useEffect, useMemo } from "react";
import type { EChartsOption } from "echarts";

import {
  Users,
  UserCheck,
  CalendarClock,
  Star,
  Target,
  FileCheck2,
  RefreshCw,
} from "lucide-react";

import { useAppDispatch, useAppSelector } from "@/hooks/redux";

import { fetchAnalytics } from "@/features/analytics/analyticsSlice";

import MetricCard from "@/components/analytics/MetricCard";
import AnalyticsChart from "@/components/analytics/AnalyticsChart";

export default function AnalyticsPage() {
  const dispatch = useAppDispatch();

  const {
    overview,
    departmentHeadcount,
    employeeGrowth,
    leaveAnalytics,
    performanceAnalytics,
    departmentPerformance,
    loading,
    error,
  } = useAppSelector((state) => state.analytics);

  useEffect(() => {
    dispatch(fetchAnalytics());
  }, [dispatch]);

  const departmentChart = useMemo<EChartsOption>(() => {
    return {
      tooltip: {
        trigger: "axis",
      },

      grid: {
        left: 40,
        right: 20,
        bottom: 40,
        top: 20,
      },

      xAxis: {
        type: "category",

        data: departmentHeadcount.map(
          (item) => item.departmentName
        ),

        axisLabel: {
          interval: 0,
          rotate:
            departmentHeadcount.length > 5 ? 25 : 0,
        },
      },

      yAxis: {
        type: "value",
      },

      series: [
        {
          name: "Employees",
          type: "bar",

          data: departmentHeadcount.map(
            (item) => item.employeeCount
          ),

          barMaxWidth: 45,
        },
      ],
    };
  }, [departmentHeadcount]);

  const employeeGrowthChart = useMemo<EChartsOption>(() => {
    return {
      tooltip: {
        trigger: "axis",
      },

      legend: {
        data: ["Employees", "Hires"],
      },

      grid: {
        left: 40,
        right: 20,
        bottom: 40,
        top: 50,
      },

      xAxis: {
        type: "category",
        data: employeeGrowth.map(
          (item) => item.month
        ),
      },

      yAxis: {
        type: "value",
      },

      series: [
        {
          name: "Employees",
          type: "line",
          smooth: true,
          data: employeeGrowth.map(
            (item) => item.employees
          ),
        },

        {
          name: "Hires",
          type: "bar",
          data: employeeGrowth.map(
            (item) => item.hires
          ),
        },
      ],
    };
  }, [employeeGrowth]);

  const leaveChart = useMemo<EChartsOption>(() => {
    return {
      tooltip: {
        trigger: "axis",
      },

      legend: {
        data: ["Requested", "Approved", "Rejected"],
      },

      grid: {
        left: 40,
        right: 20,
        bottom: 40,
        top: 50,
      },

      xAxis: {
        type: "category",

        data: leaveAnalytics.map(
          (item) => item.leaveType
        ),
      },

      yAxis: {
        type: "value",
      },

      series: [
        {
          name: "Requested",
          type: "bar",

          data: leaveAnalytics.map(
            (item) => item.requested
          ),
        },

        {
          name: "Approved",
          type: "bar",

          data: leaveAnalytics.map(
            (item) => item.approved
          ),
        },

        {
          name: "Rejected",
          type: "bar",

          data: leaveAnalytics.map(
            (item) => item.rejected
          ),
        },
      ],
    };
  }, [leaveAnalytics]);

  const performanceChart = useMemo<EChartsOption>(() => {
    return {
      tooltip: {
        trigger: "item",
      },

      xAxis: {
        type: "category",

        data: performanceAnalytics.map(
          (item) => `${item.rating} Star`
        ),
      },

      yAxis: {
        type: "value",
      },

      series: [
        {
          type: "bar",

          data: performanceAnalytics.map(
            (item) => item.count
          ),

          barMaxWidth: 50,
        },
      ],
    };
  }, [performanceAnalytics]);

  const departmentPerformanceChart = useMemo<EChartsOption>(() => {
    return {
      tooltip: {
        trigger: "axis",
      },

      grid: {
        left: 45,
        right: 20,
        bottom: 50,
        top: 20,
      },

      xAxis: {
        type: "category",

        data: departmentPerformance.map(
          (item) => item.departmentName
        ),

        axisLabel: {
          interval: 0,
          rotate:
            departmentPerformance.length > 5
              ? 25
              : 0,
        },
      },

      yAxis: {
        type: "value",
        min: 0,
        max: 5,
      },

      series: [
        {
          name: "Average Rating",
          type: "bar",

          data: departmentPerformance.map(
            (item) => item.averageRating
          ),

          barMaxWidth: 45,
        },
      ],
    };
  }, [departmentPerformance]);

  if (loading && !overview) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <RefreshCw className="h-4 w-4 animate-spin" />
          Loading analytics...
        </div>
      </div>
    );
  }

  if (error && !overview) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
        <h2 className="font-semibold text-red-800">
          Unable to load analytics
        </h2>

        <p className="mt-1 text-sm text-red-600">
          {error}
        </p>

        <button
          onClick={() => dispatch(fetchAnalytics())}
          className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Header */}

      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            HR Analytics
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Workforce insights and organizational performance
          </p>
        </div>

        <button
          onClick={() => dispatch(fetchAnalytics())}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw
            className={`h-4 w-4 ${
              loading ? "animate-spin" : ""
            }`}
          />

          Refresh
        </button>
      </div>

      {/* KPI Cards */}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

        <MetricCard
          title="Total Employees"
          value={overview?.totalEmployees ?? 0}
          subtitle={`${overview?.activeEmployees ?? 0} active employees`}
          icon={Users}
        />

        <MetricCard
          title="Present Today"
          value={overview?.presentToday ?? 0}
          subtitle={`${overview?.absentToday ?? 0} absent`}
          icon={UserCheck}
        />

        <MetricCard
          title="Pending Leave"
          value={overview?.pendingLeaveRequests ?? 0}
          subtitle="Requests awaiting review"
          icon={CalendarClock}
        />

        <MetricCard
          title="Average Performance"
          value={`${overview?.averagePerformance ?? 0}/5`}
          subtitle="Across completed reviews"
          icon={Star}
        />
      </div>

      {/* Secondary KPIs */}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

        <MetricCard
          title="Goal Completion"
          value={`${overview?.goalCompletionRate ?? 0}%`}
          subtitle="Completed organizational goals"
          icon={Target}
        />

        <MetricCard
          title="Document Compliance"
          value={`${overview?.documentComplianceRate ?? 0}%`}
          subtitle="Verified employee documents"
          icon={FileCheck2}
        />

        <MetricCard
          title="Active Workforce"
          value={overview?.activeEmployees ?? 0}
          subtitle="Currently active employees"
          icon={UserCheck}
        />
      </div>

      {/* Workforce */}

      <div className="grid gap-6 xl:grid-cols-2">

        <AnalyticsChart
          title="Headcount by Department"
          option={departmentChart}
        />

        <AnalyticsChart
          title="Employee Growth"
          option={employeeGrowthChart}
        />
      </div>

      {/* Leave + Performance */}

      <div className="grid gap-6 xl:grid-cols-2">

        <AnalyticsChart
          title="Leave Requests"
          option={leaveChart}
        />

        <AnalyticsChart
          title="Performance Rating Distribution"
          option={performanceChart}
        />
      </div>

      {/* Department Performance */}

      <AnalyticsChart
        title="Department Performance"
        option={departmentPerformanceChart}
      />

      {/* Bottom insight cards */}

      <div className="grid gap-6 md:grid-cols-3">

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Workforce Health
          </p>

          <p className="mt-2 text-lg font-semibold text-slate-900">
            {overview &&
            overview.totalEmployees > 0 &&
            overview.presentToday /
              overview.totalEmployees >=
              0.9
              ? "Excellent"
              : "Needs Attention"}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Based on today&apos;s attendance
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Goal Health
          </p>

          <p className="mt-2 text-lg font-semibold text-slate-900">
            {(overview?.goalCompletionRate ?? 0) >= 75
              ? "On Track"
              : "Needs Attention"}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Based on completed goals
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Documentation
          </p>

          <p className="mt-2 text-lg font-semibold text-slate-900">
            {(overview?.documentComplianceRate ?? 0) >= 90
              ? "Compliant"
              : "Review Required"}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Based on verified employee documents
          </p>
        </div>

      </div>
    </div>
  );
}