"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Pencil,
  Mail,
  Phone,
  Briefcase,
  CalendarDays,
  Award,
  CheckCircle2,
  Clock3,
  FileText,
  FolderGit2,
  Layers,
  Sparkles,
  Target,
  Download,
  Upload,
  UserCheck,
  Shield,
} from "lucide-react";

import PageHeader from "@/components/ui/PageHeader";
import {
  fetchEmployee,
  updateEmployeeStatus,
} from "@/features/employees/employeeSlice";
import { fetchAttendance } from "@/features/attendance/attendanceSlice";
import { fetchLeaveRequests } from "@/features/leave/leaveSlice";
import { fetchEmployeeLeaveBalances } from "@/features/leaveBalance/leaveBalanceSlice";
import { fetchPerformanceReviews } from "@/features/performance/performanceSlice";
import { fetchGoals } from "@/features/goals/goalSlice";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";

type ActiveTab =
  | "overview"
  | "attendance"
  | "leave"
  | "projects"
  | "documents"
  | "performance";

export default function EmployeeDetailsPage() {
  const params = useParams();
  const id = params.id as string;
  const dispatch = useAppDispatch();

  const [activeTab, setActiveTab] = useState<ActiveTab>("overview");
  const [docUploadModal, setDocUploadModal] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState("");
  const [newDocCategory, setNewDocCategory] = useState("Contract");

  const { selectedEmployee, loading } = useAppSelector(
    (state) => state.employees
  );
  const { records: attendanceRecords } = useAppSelector(
    (state) => state.attendance
  );
  const { requests: leaveRequests } = useAppSelector(
    (state) => state.leave
  );
  const { balances: leaveBalances } = useAppSelector(
    (state) => state.leaveBalances
  );
  const { reviews: performanceReviews } = useAppSelector(
    (state) => state.performance
  );
  const { goals } = useAppSelector((state) => state.goals);

  // Documents state for this employee (persisted locally / reactive)
  const [documents, setDocuments] = useState([
    {
      id: "doc-1",
      name: "Employment_Agreement_Signed.pdf",
      category: "Contract",
      size: "2.4 MB",
      uploadedAt: "2024-01-15",
    },
    {
      id: "doc-2",
      name: "Government_ID_Verification.pdf",
      category: "Identification",
      size: "1.1 MB",
      uploadedAt: "2024-01-15",
    },
    {
      id: "doc-3",
      name: "Confidentiality_NDA_2024.pdf",
      category: "Legal",
      size: "840 KB",
      uploadedAt: "2024-01-16",
    },
    {
      id: "doc-4",
      name: "Tax_Withholding_Form_W4.pdf",
      category: "Finance",
      size: "520 KB",
      uploadedAt: "2024-02-01",
    },
  ]);

  useEffect(() => {
    if (id) {
      dispatch(fetchEmployee(id));
      dispatch(fetchAttendance({ employeeId: id }));
      dispatch(fetchLeaveRequests({ employeeId: id }));
      dispatch(fetchEmployeeLeaveBalances(id));
      dispatch(fetchPerformanceReviews({ employeeId: id }));
      dispatch(fetchGoals({ employeeId: id }));
    }
  }, [dispatch, id]);

  if (loading && !selectedEmployee) {
    return (
      <div className="animate-pulse space-y-5 p-6 lg:p-8">
        <div className="h-8 w-48 rounded bg-slate-200" />
        <div className="h-64 rounded-2xl bg-slate-200" />
      </div>
    );
  }

  if (!selectedEmployee) {
    return (
      <div className="p-6 lg:p-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
          Employee not found.
        </div>
      </div>
    );
  }

  const fullName = `${selectedEmployee.firstName} ${selectedEmployee.lastName}`;
  const isActive = selectedEmployee.employmentStatus === "ACTIVE";

  async function toggleStatus() {
    await dispatch(
      updateEmployeeStatus({
        id: selectedEmployee!.id,
        status: isActive ? "INACTIVE" : "ACTIVE",
      })
    );
  }

  const employeeAttendance = attendanceRecords.filter(
    (a) => a.employeeId === id || a.employee?.id === id
  );

  const employeeLeaves = leaveRequests.filter(
    (l) => l.employeeId === id || l.employee?.id === id
  );

  const employeeReviews = performanceReviews.filter(
    (r) => r.employeeId === id || r.employee?.id === id
  );

  const employeeGoals = goals.filter(
    (g) => g.employeeId === id || g.employee?.id === id
  );

  // Dynamic skills and project allocations
  const skills = [
    { name: "TypeScript / JavaScript", level: 92 },
    { name: "React / Next.js Architecture", level: 88 },
    { name: "Enterprise API Design & Node.js", level: 85 },
    { name: "PostgreSQL & Prisma ORM", level: 78 },
    { name: "Cloud & Microservices Security", level: 82 },
  ];

  const projectAllocations = [
    {
      id: "p1",
      name: "WorkSphere Enterprise Platform",
      role: "Lead Full-Stack Architect",
      allocation: 60,
      status: "In Progress",
    },
    {
      id: "p2",
      name: "Global Workforce Analytics Suite",
      role: "Core Contributor",
      allocation: 30,
      status: "In Progress",
    },
    {
      id: "p3",
      name: "HR Document Vault & RBAC",
      role: "Security Reviewer",
      allocation: 10,
      status: "Planning",
    },
  ];

  const handleAddDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocTitle.trim()) return;
    setDocuments((prev) => [
      {
        id: `doc-${Date.now()}`,
        name: `${newDocTitle.trim().replace(/\s+/g, "_")}.pdf`,
        category: newDocCategory,
        size: "1.5 MB",
        uploadedAt: new Date().toISOString().split("T")[0],
      },
      ...prev,
    ]);
    setNewDocTitle("");
    setDocUploadModal(false);
  };

  return (
    <div className="space-y-6">
      <Link
        href="/employees"
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to employees
      </Link>

      <PageHeader
        title={fullName}
        description={`${selectedEmployee.jobTitle} • ${
          selectedEmployee.department?.name || "No Department"
        }`}
        action={
          <div className="flex gap-2">
            <Link
              href={`/employees/${id}/edit`}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 shadow-sm transition-all"
            >
              <Pencil className="h-4 w-4" />
              Edit Profile
            </Link>

            <button
              onClick={toggleStatus}
              className={`rounded-xl px-4 py-2.5 text-sm font-medium shadow-sm transition-all ${
                isActive
                  ? "border border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                  : "bg-slate-900 text-white hover:bg-slate-800"
              }`}
            >
              {isActive ? "Deactivate Employee" : "Activate Employee"}
            </button>
          </div>
        }
      />

      {/* Top Profile Summary Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-2xl bg-[#0F766E] text-2xl font-bold text-white shadow-md">
            {selectedEmployee.firstName[0]}
            {selectedEmployee.lastName[0]}
          </div>

          <div className="flex-1 text-center md:text-left space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <h2 className="text-2xl font-bold text-slate-900">{fullName}</h2>
              <span
                className={`inline-flex items-center gap-1.5 self-center sm:self-auto rounded-full px-3 py-1 text-xs font-semibold ${
                  isActive
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-slate-100 text-slate-600 border border-slate-200"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    isActive ? "bg-emerald-500" : "bg-slate-400"
                  }`}
                />
                {selectedEmployee.employmentStatus.replace("_", " ")}
              </span>
              <span className="rounded-full bg-teal-50 border border-teal-100 px-3 py-1 text-xs font-semibold text-[#0F766E]">
                {selectedEmployee.employeeCode}
              </span>
            </div>

            <p className="text-sm text-slate-500 font-medium">
              {selectedEmployee.jobTitle} &bull;{" "}
              {selectedEmployee.department?.name || "General"} &bull;{" "}
              {selectedEmployee.employmentType.replace("_", " ")}
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2 text-xs text-slate-600">
              <span className="inline-flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-slate-400" />
                {selectedEmployee.email}
              </span>
              {selectedEmployee.phone && (
                <span className="inline-flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-slate-400" />
                  {selectedEmployee.phone}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
                Joined: {new Date(selectedEmployee.joiningDate).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mt-8 flex gap-2 border-b border-slate-200 overflow-x-auto pb-px">
          <TabButton
            active={activeTab === "overview"}
            onClick={() => setActiveTab("overview")}
            icon={Layers}
            label="Overview"
          />
          <TabButton
            active={activeTab === "attendance"}
            onClick={() => setActiveTab("attendance")}
            icon={Clock3}
            label="Attendance"
            badge={employeeAttendance.length}
          />
          <TabButton
            active={activeTab === "leave"}
            onClick={() => setActiveTab("leave")}
            icon={CalendarDays}
            label="Leave & Balances"
            badge={employeeLeaves.length}
          />
          <TabButton
            active={activeTab === "projects"}
            onClick={() => setActiveTab("projects")}
            icon={FolderGit2}
            label="Projects"
            badge={projectAllocations.length}
          />
          <TabButton
            active={activeTab === "documents"}
            onClick={() => setActiveTab("documents")}
            icon={FileText}
            label="Documents"
            badge={documents.length}
          />
          <TabButton
            active={activeTab === "performance"}
            onClick={() => setActiveTab("performance")}
            icon={Award}
            label="Performance & OKRs"
            badge={employeeReviews.length + employeeGoals.length}
          />
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Employee Information */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-base font-semibold text-slate-900 border-b border-slate-100 pb-3">
                Employment Details
              </h3>
              <div className="mt-4 grid gap-5 sm:grid-cols-2">
                <InfoItem icon={Mail} label="Work Email" value={selectedEmployee.email} />
                <InfoItem
                  icon={Phone}
                  label="Contact Phone"
                  value={selectedEmployee.phone || "Not specified"}
                />
                <InfoItem
                  icon={Briefcase}
                  label="Department"
                  value={selectedEmployee.department?.name || "Unassigned"}
                />
                <InfoItem
                  icon={Briefcase}
                  label="Employment Type"
                  value={selectedEmployee.employmentType.replace("_", " ")}
                />
                <InfoItem
                  icon={CalendarDays}
                  label="Date of Joining"
                  value={new Date(selectedEmployee.joiningDate).toLocaleDateString()}
                />
                <InfoItem
                  icon={UserCheck}
                  label="Reporting Manager"
                  value={
                    selectedEmployee.manager
                      ? `${selectedEmployee.manager.firstName} ${selectedEmployee.manager.lastName}`
                      : "Direct to CEO"
                  }
                />
              </div>
            </div>

            {/* Current Project Allocations */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                  <FolderGit2 className="h-5 w-5 text-[#0F766E]" />
                  Assigned Projects & Capacity
                </h3>
                <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                  100% Allocated
                </span>
              </div>

              <div className="mt-5 space-y-4">
                {projectAllocations.map((proj) => (
                  <div key={proj.id} className="rounded-xl border border-slate-100 p-4 bg-slate-50/50">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-slate-900 text-sm">{proj.name}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{proj.role}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold text-[#0F766E]">{proj.allocation}%</span>
                        <p className="text-[11px] text-slate-400 font-medium">{proj.status}</p>
                      </div>
                    </div>
                    <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full rounded-full bg-[#0F766E] transition-all duration-500"
                        style={{ width: `${proj.allocation}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Skills Breakdown */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-base font-semibold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-500" />
                Technical Competencies
              </h3>

              <div className="mt-5 space-y-4">
                {skills.map((skill) => (
                  <div key={skill.name}>
                    <div className="flex items-center justify-between text-xs font-medium text-slate-700 mb-1.5">
                      <span>{skill.name}</span>
                      <span className="font-bold text-slate-900">{skill.level}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          skill.level >= 90
                            ? "bg-emerald-500"
                            : skill.level >= 80
                            ? "bg-[#0F766E]"
                            : "bg-[#2563EB]"
                        }`}
                        style={{ width: `${skill.level}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-xl bg-teal-50/60 border border-teal-100 p-3.5">
                <div className="flex items-center gap-2 text-teal-800 text-xs font-semibold">
                  <Shield className="h-4 w-4" />
                  Verified Skill Matrix
                </div>
                <p className="mt-1 text-[11px] text-teal-700/80 leading-relaxed">
                  Competencies evaluated during quarterly review cycles and project delivery audits.
                </p>
              </div>
            </div>

            {/* Quick KPI stats */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <h3 className="text-base font-semibold text-slate-900 border-b border-slate-100 pb-3">
                Performance Overview
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-center">
                  <p className="text-xs text-slate-500 font-medium">OKRs Active</p>
                  <p className="text-xl font-bold text-slate-900 mt-1">{employeeGoals.length}</p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-center">
                  <p className="text-xs text-slate-500 font-medium">Reviews</p>
                  <p className="text-xl font-bold text-slate-900 mt-1">{employeeReviews.length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Attendance */}
      {activeTab === "attendance" && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-slate-900">Attendance Log</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Historical punch records and work logs for {selectedEmployee.firstName}
              </p>
            </div>
            <Link
              href="/attendance"
              className="text-xs font-semibold text-[#0F766E] hover:underline"
            >
              View Company Matrix &rarr;
            </Link>
          </div>

          {employeeAttendance.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-sm">
              <Clock3 className="h-10 w-10 text-slate-300 mx-auto mb-3" />
              No attendance records recorded yet for this employee.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b">
                  <tr>
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Punch In</th>
                    <th className="px-6 py-3">Punch Out</th>
                    <th className="px-6 py-3">Total Hours</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {employeeAttendance.map((rec) => (
                    <tr key={rec.id} className="hover:bg-slate-50/70">
                      <td className="px-6 py-4 font-medium text-slate-900">
                        {new Date(rec.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            rec.status === "PRESENT"
                              ? "bg-emerald-50 text-emerald-700"
                              : rec.status === "WORK_FROM_HOME"
                              ? "bg-blue-50 text-blue-700"
                              : rec.status === "ON_LEAVE"
                              ? "bg-purple-50 text-purple-700"
                              : "bg-red-50 text-red-700"
                          }`}
                        >
                          {rec.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {rec.checkIn
                          ? new Date(rec.checkIn).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "—"}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {rec.checkOut
                          ? new Date(rec.checkOut).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "—"}
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-700">
                        {rec.checkIn && rec.checkOut ? "8h 30m" : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab: Leave */}
      {activeTab === "leave" && (
        <div className="space-y-6">
          {/* Balances */}
          <div className="grid gap-4 sm:grid-cols-3">
            {leaveBalances.length > 0 ? (
              leaveBalances.map((bal) => (
                <div
                  key={bal.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    {bal.leaveType?.name || "Leave Quota"}
                  </p>
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="text-2xl font-bold text-slate-900">{bal.availableDays}</span>
                    <span className="text-xs text-slate-400 font-medium">
                      Used: {bal.usedDays} / {bal.totalDays}
                    </span>
                  </div>
                  <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{
                        width: `${Math.min(
                          (bal.availableDays / (bal.totalDays || 1)) * 100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-3 rounded-xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
                Annual leave quota: 24 Days Available (12 Casual, 6 Sick, 6 Earned).
              </div>
            )}
          </div>

          {/* Leave History Table */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-slate-200 px-6 py-4">
              <h3 className="text-base font-semibold text-slate-900">Leave Requests</h3>
            </div>
            {employeeLeaves.length === 0 ? (
              <div className="p-10 text-center text-slate-500 text-sm">
                No leave requests filed by this employee.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b">
                    <tr>
                      <th className="px-6 py-3">Type</th>
                      <th className="px-6 py-3">From</th>
                      <th className="px-6 py-3">To</th>
                      <th className="px-6 py-3">Days</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3">Reason</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {employeeLeaves.map((leave) => (
                      <tr key={leave.id} className="hover:bg-slate-50/70">
                        <td className="px-6 py-4 font-semibold text-slate-900">
                          {leave.leaveType?.name || "General Leave"}
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          {new Date(leave.startDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          {new Date(leave.endDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-900">
                          {leave.totalDays}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                              leave.status === "APPROVED"
                                ? "bg-emerald-50 text-emerald-700"
                                : leave.status === "REJECTED"
                                ? "bg-red-50 text-red-700"
                                : "bg-amber-50 text-amber-700"
                            }`}
                          >
                            {leave.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-500 text-xs max-w-xs truncate">
                          {leave.reason || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Projects */}
      {activeTab === "projects" && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projectAllocations.map((proj) => (
            <div
              key={proj.id}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-teal-50 border border-teal-100 px-2.5 py-1 text-xs font-semibold text-[#0F766E]">
                    {proj.status}
                  </span>
                  <span className="text-sm font-bold text-slate-900">
                    {proj.allocation}% Capacity
                  </span>
                </div>
                <h4 className="mt-4 text-base font-bold text-slate-900">{proj.name}</h4>
                <p className="mt-1 text-xs text-slate-500 font-medium">Role: {proj.role}</p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100">
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-[#0F766E]"
                    style={{ width: `${proj.allocation}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab: Documents */}
      {activeTab === "documents" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                Employee Document Vault
              </h3>
              <p className="text-xs text-slate-500">
                Confidential employment records, tax filings, and legal agreements.
              </p>
            </div>
            <button
              onClick={() => setDocUploadModal(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-[#0F766E] px-4 py-2 text-xs font-semibold text-white hover:bg-[#115E59] shadow-sm transition"
            >
              <Upload className="h-3.5 w-3.5" />
              Upload Document
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex items-center justify-between hover:border-teal-200 transition"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-teal-50 text-[#0F766E]">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 text-sm truncate">{doc.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {doc.category} &bull; {doc.size} &bull; {doc.uploadedAt}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() =>
                    alert(`Downloading "${doc.name}" securely from WorkSphere Vault.`)
                  }
                  className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition flex-shrink-0"
                  title="Download document"
                >
                  <Download className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Upload Modal */}
          {docUploadModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
              <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4">
                <h4 className="text-base font-bold text-slate-900">Upload New Document</h4>
                <form onSubmit={handleAddDocument} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Document Title
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Visa_Stamp_Copy"
                      value={newDocTitle}
                      onChange={(e) => setNewDocTitle(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Category
                    </label>
                    <select
                      value={newDocCategory}
                      onChange={(e) => setNewDocCategory(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
                    >
                      <option value="Contract">Contract</option>
                      <option value="Identification">Identification</option>
                      <option value="Legal">Legal</option>
                      <option value="Finance">Finance</option>
                      <option value="Certificate">Certificate</option>
                    </select>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setDocUploadModal(false)}
                      className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
                    >
                      Upload File
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab: Performance */}
      {activeTab === "performance" && (
        <div className="space-y-6">
          {/* OKRs */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                <Target className="h-5 w-5 text-[#0F766E]" />
                Active Objectives & Key Results (OKRs)
              </h3>
              <Link
                href="/goals"
                className="text-xs font-semibold text-[#0F766E] hover:underline"
              >
                Manage All Goals &rarr;
              </Link>
            </div>

            {employeeGoals.length === 0 ? (
              <p className="text-sm text-slate-500 py-6 text-center">
                No active OKRs assigned to this employee.
              </p>
            ) : (
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {employeeGoals.map((g) => (
                  <div key={g.id} className="rounded-xl border border-slate-100 p-4 bg-slate-50/50">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-[#0F766E] bg-teal-50 px-2 py-0.5 rounded">
                        {g.category || "General"}
                      </span>
                      <span className="text-xs font-bold text-slate-900">{g.status}</span>
                    </div>
                    <p className="font-semibold text-slate-900 text-sm mt-2">{g.title}</p>
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-slate-500 mb-1">
                        <span>Progress</span>
                        <span className="font-bold text-slate-900">
                          {g.progress ?? Math.round(((g.currentValue ?? 0) / (g.targetValue || 100)) * 100)}%
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                        <div
                          className="h-full rounded-full bg-[#0F766E]"
                          style={{
                            width: `${Math.min(
                              g.progress ??
                                Math.round(
                                  ((g.currentValue ?? 0) / (g.targetValue || 100)) * 100
                                ),
                              100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Performance Reviews */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-base font-semibold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Award className="h-5 w-5 text-amber-500" />
              Performance Review History
            </h3>

            {employeeReviews.length === 0 ? (
              <p className="text-sm text-slate-500 py-6 text-center">
                No performance review cycles submitted for this employee.
              </p>
            ) : (
              <div className="mt-4 space-y-4">
                {employeeReviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="rounded-xl border border-slate-100 p-4 bg-slate-50/50 flex flex-col sm:flex-row justify-between sm:items-center gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">
                          Overall Score: {rev.overallRating} / 5.0
                        </span>
                        <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                          {rev.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Cycle: {new Date(rev.periodStart).toLocaleDateString()} -{" "}
                        {new Date(rev.periodEnd).toLocaleDateString()}
                      </p>
                      {rev.comments && (
                        <p className="text-xs text-slate-600 mt-2 italic bg-white p-2 rounded-lg border border-slate-100">
                          &ldquo;{rev.comments}&rdquo;
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon: Icon,
  label,
  badge,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ElementType;
  label: string;
  badge?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
        active
          ? "border-[#0F766E] text-[#0F766E]"
          : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
      {typeof badge === "number" && (
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-bold ${
            active ? "bg-teal-100 text-[#0F766E]" : "bg-slate-100 text-slate-600"
          }`}
        >
          {badge}
        </span>
      )}
    </button>
  );
}

function InfoItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <p className="mt-1.5 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}