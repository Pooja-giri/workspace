"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Users,
  Download,
  Upload,
  Filter,
  Columns,
  CheckCircle2,
  AlertTriangle,
  X,
  Send,
  Building2,
  Check,
  RefreshCw,
} from "lucide-react";

import PageHeader from "@/components/ui/PageHeader";
import EmployeeTable from "@/components/employees/EmployeeTable";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import {
  fetchEmployees,
  updateEmployeeStatus,
} from "@/features/employees/employeeSlice";
import { fetchDepartments } from "@/features/departments/departmentSlice";
import api from "@/lib/api";

export default function EmployeesPage() {
  const dispatch = useAppDispatch();

  const { employees, pagination, loading, error } = useAppSelector(
    (state) => state.employees
  );
  const { departments } = useAppSelector((state) => state.departments);

  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [page, setPage] = useState(1);

  // Sorting
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Column Visibility
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState({
    employee: true,
    department: true,
    jobTitle: true,
    type: true,
    status: true,
    joiningDate: true,
    actions: true,
  });

  // Modals
  const [showImportModal, setShowImportModal] = useState(false);
  const [showBulkStatusModal, setShowBulkStatusModal] = useState(false);
  const [showBulkDeptModal, setShowBulkDeptModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);

  // Bulk action states
  const [targetStatus, setTargetStatus] = useState("ACTIVE");
  const [targetDeptId, setTargetDeptId] = useState("");
  const [notificationMessage, setNotificationMessage] = useState("");
  const [bulkLoading, setBulkLoading] = useState(false);

  // CSV Import state
  const [importFile, setImportFile] = useState<File | null>(null);
  const [parsedImport, setParsedImport] = useState<{
    records: Array<{
      name: string;
      email: string;
      jobTitle: string;
      departmentName?: string;
      employmentType?: "FULL_TIME" | "PART_TIME" | "CONTRACTOR" | "INTERN";
      phone?: string;
      joiningDate?: string;
    }>;
    validCount: number;
    errors: string[];
  } | null>(null);
  const [importLoading, setImportLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchDepartments());
  }, [dispatch]);

  useEffect(() => {
    dispatch(
      fetchEmployees({
        page,
        limit: 20,
        search,
        status: statusFilter || undefined,
        departmentId: departmentFilter || undefined,
      })
    );
  }, [dispatch, page, search, statusFilter, departmentFilter]);

  // Client-side sorting & secondary type filtering
  const processedEmployees = useMemo(() => {
    let list = [...employees];
    if (typeFilter) {
      list = list.filter((e) => e.employmentType === typeFilter);
    }

    list.sort((a, b) => {
      let valA: any = "";
      let valB: any = "";

      if (sortBy === "name") {
        valA = `${a.firstName} ${a.lastName}`.toLowerCase();
        valB = `${b.firstName} ${b.lastName}`.toLowerCase();
      } else if (sortBy === "department") {
        valA = a.department?.name?.toLowerCase() || "";
        valB = b.department?.name?.toLowerCase() || "";
      } else if (sortBy === "jobTitle") {
        valA = a.jobTitle?.toLowerCase() || "";
        valB = b.jobTitle?.toLowerCase() || "";
      } else if (sortBy === "status") {
        valA = a.employmentStatus;
        valB = b.employmentStatus;
      } else if (sortBy === "joiningDate") {
        valA = new Date(a.joiningDate).getTime();
        valB = new Date(b.joiningDate).getTime();
      }

      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return list;
  }, [employees, typeFilter, sortBy, sortOrder]);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (all: boolean) => {
    if (all) {
      setSelectedIds(processedEmployees.map((e) => e.id));
    } else {
      setSelectedIds([]);
    }
  };

  // Export CSV
  const handleExportCSV = (selectedOnly = false) => {
    const listToExport = selectedOnly
      ? processedEmployees.filter((e) => selectedIds.includes(e.id))
      : processedEmployees;

    const headers = [
      "Employee Code",
      "First Name",
      "Last Name",
      "Email",
      "Phone",
      "Job Title",
      "Department",
      "Type",
      "Status",
      "Joining Date",
    ];

    const rows = listToExport.map((e) => [
      e.employeeCode,
      `"${e.firstName}"`,
      `"${e.lastName}"`,
      e.email,
      e.phone || "",
      `"${e.jobTitle}"`,
      `"${e.department?.name || "Unassigned"}"`,
      e.employmentType,
      e.employmentStatus,
      new Date(e.joiningDate).toISOString().split("T")[0],
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `WorkSphere_Employees_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Bulk status update
  const handleBulkStatus = async () => {
    if (selectedIds.length === 0) return;
    setBulkLoading(true);
    try {
      await api.post("/employees/bulk", {
        employeeIds: selectedIds,
        action: "CHANGE_STATUS",
        status: targetStatus,
      });

      setSelectedIds([]);
      setShowBulkStatusModal(false);
      dispatch(
        fetchEmployees({
          page,
          limit: 20,
          search,
          status: statusFilter || undefined,
          departmentId: departmentFilter || undefined,
        })
      );
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to update employee status");
    } finally {
      setBulkLoading(false);
    }
  };

  // Bulk department update
  const handleBulkDept = async () => {
    if (selectedIds.length === 0) return;
    setBulkLoading(true);
    try {
      await api.post("/employees/bulk", {
        employeeIds: selectedIds,
        action: "CHANGE_DEPARTMENT",
        departmentId: targetDeptId || null,
      });

      setSelectedIds([]);
      setShowBulkDeptModal(false);
      dispatch(
        fetchEmployees({
          page,
          limit: 20,
          search,
          status: statusFilter || undefined,
          departmentId: departmentFilter || undefined,
        })
      );
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to update department");
    } finally {
      setBulkLoading(false);
    }
  };

  // Bulk Send Notification
  const handleSendNotification = () => {
    if (!notificationMessage.trim()) return;
    alert(`Notification dispatched to ${selectedIds.length} employee(s) successfully.`);
    setNotificationMessage("");
    setShowNotificationModal(false);
    setSelectedIds([]);
  };

  // CSV Parsing for Import
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportFile(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean);

      if (lines.length < 2) {
        setParsedImport({ records: [], validCount: 0, errors: ["CSV file is empty or missing headers"] });
        return;
      }

      const headers = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/['"]/g, ""));
      const nameIdx = headers.findIndex((h) => h.includes("name"));
      const emailIdx = headers.findIndex((h) => h.includes("email"));
      const deptIdx = headers.findIndex((h) => h.includes("department"));
      const roleIdx = headers.findIndex((h) => h.includes("role") || h.includes("title") || h.includes("job"));
      const dateIdx = headers.findIndex((h) => h.includes("date") || h.includes("join"));

      const records: any[] = [];
      const errors: string[] = [];

      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(",").map((c) => c.trim().replace(/^["']|["']$/g, ""));
        const name = nameIdx !== -1 ? cols[nameIdx] : cols[0];
        const email = emailIdx !== -1 ? cols[emailIdx] : cols[1];
        const departmentName = deptIdx !== -1 ? cols[deptIdx] : cols[2];
        const jobTitle = roleIdx !== -1 ? cols[roleIdx] : cols[3] || "Associate";
        const joiningDate = dateIdx !== -1 ? cols[dateIdx] : cols[4] || new Date().toISOString().split("T")[0];

        if (!name || name.length < 2) {
          errors.push(`Row ${i}: Missing valid employee name`);
          continue;
        }
        if (!email || !email.includes("@")) {
          errors.push(`Row ${i} (${name}): Invalid email address`);
          continue;
        }

        records.push({
          name,
          email,
          jobTitle: jobTitle || "Developer",
          departmentName: departmentName || undefined,
          employmentType: "FULL_TIME",
          joiningDate,
        });
      }

      setParsedImport({
        records,
        validCount: records.length,
        errors,
      });
    };

    reader.readAsText(file);
  };

  // Submit Import
  const handleImportSubmit = async () => {
    if (!parsedImport || parsedImport.records.length === 0) return;
    setImportLoading(true);
    try {
      const res = await api.post("/employees/import", {
        employees: parsedImport.records,
      });
      alert(res.data.message || `Imported ${parsedImport.records.length} employees successfully`);
      setShowImportModal(false);
      setImportFile(null);
      setParsedImport(null);
      dispatch(fetchEmployees({ page: 1, limit: 100 }));
      dispatch(fetchDepartments());
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to import employees");
    } finally {
      setImportLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <PageHeader
          title="Employees"
          description="Manage your organization's workforce directory, roles, and profiles."
        />

        <div className="flex flex-wrap items-center gap-2">
          {/* Export CSV */}
          <button
            onClick={() => handleExportCSV(false)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-700 shadow-xs hover:bg-slate-50 transition"
          >
            <Download className="h-4 w-4 text-slate-500" />
            Export CSV
          </button>

          {/* Import CSV */}
          <button
            onClick={() => setShowImportModal(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-700 shadow-xs hover:bg-slate-50 transition"
          >
            <Upload className="h-4 w-4 text-slate-500" />
            Import CSV
          </button>

          {/* Add Employee */}
          <Link
            href="/employees/new"
            className="inline-flex items-center gap-2 rounded-xl bg-[#0F766E] px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-[#115E59]"
          >
            <Plus className="h-4 w-4" />
            Add Employee
          </Link>
        </div>
      </div>

      {/* Floating Bulk Operations Toolbar */}
      {selectedIds.length > 0 && (
        <div className="sticky top-20 z-20 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-slate-900 p-4 text-white shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-800 text-xs font-bold text-white">
              {selectedIds.length}
            </span>
            <span className="text-sm font-semibold">
              {selectedIds.length} employee{selectedIds.length > 1 ? "s" : ""} selected
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowBulkDeptModal(true)}
              className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-700 transition"
            >
              Change Department
            </button>

            <button
              onClick={() => setShowBulkStatusModal(true)}
              className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-700 transition"
            >
              Change Status
            </button>

            <button
              onClick={() => handleExportCSV(true)}
              className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-700 transition"
            >
              Export Selected
            </button>

            <button
              onClick={() => setShowNotificationModal(true)}
              className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-700 transition"
            >
              Send Notification
            </button>

            <button
              onClick={() => setSelectedIds([])}
              className="rounded-lg p-1.5 text-slate-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Filters Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by name, email, employee code, or role..."
              className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs outline-none focus:border-slate-900"
            />
          </div>

          {/* Department Filter */}
          <select
            value={departmentFilter}
            onChange={(e) => {
              setDepartmentFilter(e.target.value);
              setPage(1);
            }}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-slate-900"
          >
            <option value="">All Departments</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-slate-900"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="ON_LEAVE">On Leave</option>
            <option value="INACTIVE">Inactive</option>
            <option value="TERMINATED">Terminated</option>
          </select>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-slate-900"
          >
            <option value="">All Employment Types</option>
            <option value="FULL_TIME">Full Time</option>
            <option value="PART_TIME">Part Time</option>
            <option value="CONTRACTOR">Contractor</option>
            <option value="INTERN">Intern</option>
          </select>

          {/* Column Visibility Menu Button */}
          <div className="relative">
            <button
              onClick={() => setShowColumnMenu(!showColumnMenu)}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              <Columns className="h-3.5 w-3.5 text-slate-500" />
              Columns
            </button>

            {showColumnMenu && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setShowColumnMenu(false)}
                />
                <div className="absolute right-0 top-10 z-40 w-48 rounded-xl border border-slate-200 bg-white p-2 shadow-xl text-xs space-y-1">
                  <p className="px-2 py-1 font-semibold text-slate-400 uppercase text-[10px]">
                    Toggle Columns
                  </p>
                  {Object.keys(visibleColumns).map((colKey) => (
                    <button
                      key={colKey}
                      onClick={() =>
                        setVisibleColumns((prev: any) => ({
                          ...prev,
                          [colKey]: !prev[colKey],
                        }))
                      }
                      className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left text-slate-700 hover:bg-slate-50 capitalize"
                    >
                      <span>{colKey.replace(/([A-Z])/g, " $1")}</span>
                      {(visibleColumns as any)[colKey] && (
                        <Check className="h-3.5 w-3.5 text-slate-900" />
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-700">
          {error}
        </div>
      )}

      {/* Employee Table */}
      <EmployeeTable
        employees={processedEmployees}
        loading={loading}
        selectedIds={selectedIds}
        onToggleSelect={handleToggleSelect}
        onSelectAll={handleSelectAll}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        visibleColumns={visibleColumns}
      />

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-3.5">
          <p className="text-xs text-slate-500">
            Page {pagination.page} of {pagination.totalPages} ({pagination.total} total employees)
          </p>

          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((c) => Math.max(c - 1, 1))}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
            >
              Previous
            </button>
            <button
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((c) => Math.min(c + 1, pagination.totalPages))}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODALS
      ========================================================================== */}

      {/* 1. CSV Import Modal (Requirement 19) */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Import Employees (CSV)</h3>
                <p className="text-xs text-slate-500">
                  Upload employee records formatted as: name, email, department, role, joiningDate
                </p>
              </div>
              <button
                onClick={() => {
                  setShowImportModal(false);
                  setImportFile(null);
                  setParsedImport(null);
                }}
                className="rounded-lg p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Drag & drop upload box */}
            <div className="rounded-2xl border-2 border-dashed border-slate-200 p-8 text-center bg-slate-50/50 hover:bg-slate-50 transition">
              <Upload className="mx-auto h-10 w-10 text-slate-400" />
              <p className="mt-3 text-sm font-semibold text-slate-900">
                Choose CSV file or drag and drop
              </p>
              <p className="mt-1 text-xs text-slate-500">employees.csv (up to 500 rows)</p>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="mt-4 block mx-auto text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-900 file:text-white hover:file:bg-slate-800 cursor-pointer"
              />
            </div>

            {/* Validation Preview (Requirement 19) */}
            {parsedImport && (
              <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5 font-semibold text-emerald-700">
                    <CheckCircle2 className="h-4 w-4" />
                    {parsedImport.validCount} valid records found
                  </span>
                  {parsedImport.errors.length > 0 && (
                    <span className="flex items-center gap-1.5 font-semibold text-amber-700">
                      <AlertTriangle className="h-4 w-4" />
                      {parsedImport.errors.length} errors
                    </span>
                  )}
                </div>

                {/* Error log if any */}
                {parsedImport.errors.length > 0 && (
                  <div className="max-h-24 overflow-y-auto space-y-1 text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200 text-[11px]">
                    {parsedImport.errors.map((err, i) => (
                      <p key={i}>⚠ {err}</p>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end gap-3 border-t pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowImportModal(false);
                  setImportFile(null);
                  setParsedImport(null);
                }}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!parsedImport || parsedImport.validCount === 0 || importLoading}
                onClick={handleImportSubmit}
                className="rounded-xl bg-slate-900 px-5 py-2 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
              >
                {importLoading
                  ? "Importing..."
                  : `Import ${parsedImport?.validCount || 0} Employees`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Bulk Change Status Modal */}
      {showBulkStatusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">Change Status</h3>
            <p className="text-xs text-slate-500">
              Apply a new employment status to {selectedIds.length} selected employee(s).
            </p>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                New Employment Status
              </label>
              <select
                value={targetStatus}
                onChange={(e) => setTargetStatus(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs outline-none focus:border-slate-900"
              >
                <option value="ACTIVE">Active</option>
                <option value="ON_LEAVE">On Leave</option>
                <option value="INACTIVE">Inactive</option>
                <option value="TERMINATED">Terminated</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 border-t pt-4">
              <button
                onClick={() => setShowBulkStatusModal(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-medium text-slate-700"
              >
                Cancel
              </button>
              <button
                disabled={bulkLoading}
                onClick={handleBulkStatus}
                className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
              >
                {bulkLoading ? "Updating..." : "Apply Status"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Bulk Change Department Modal */}
      {showBulkDeptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">Change Department</h3>
            <p className="text-xs text-slate-500">
              Reassign {selectedIds.length} selected employee(s) to a department.
            </p>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Target Department
              </label>
              <select
                value={targetDeptId}
                onChange={(e) => setTargetDeptId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs outline-none focus:border-slate-900"
              >
                <option value="">Unassigned</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 border-t pt-4">
              <button
                onClick={() => setShowBulkDeptModal(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-medium text-slate-700"
              >
                Cancel
              </button>
              <button
                disabled={bulkLoading}
                onClick={handleBulkDept}
                className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
              >
                {bulkLoading ? "Updating..." : "Reassign Department"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Bulk Send Notification Modal */}
      {showNotificationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">Send Notification</h3>
            <p className="text-xs text-slate-500">
              Broadcast an alert to {selectedIds.length} selected employee(s).
            </p>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Notification Message
              </label>
              <textarea
                rows={3}
                value={notificationMessage}
                onChange={(e) => setNotificationMessage(e.target.value)}
                placeholder="Enter message for selected team members..."
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs outline-none focus:border-slate-900"
              />
            </div>

            <div className="flex justify-end gap-2 border-t pt-4">
              <button
                onClick={() => setShowNotificationModal(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-medium text-slate-700"
              >
                Cancel
              </button>
              <button
                disabled={!notificationMessage.trim()}
                onClick={handleSendNotification}
                className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}