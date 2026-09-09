"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Users,
  Building2,
  CalendarDays,
  Target,
  FileText,
  BarChart3,
  Activity,
  Bell,
  Settings2,
  LayoutDashboard,
  ClipboardCheck,
  ArrowRight,
  X,
} from "lucide-react";
import { useAppSelector } from "@/hooks/redux";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const { employees } = useAppSelector((state) => state.employees);
  const { departments } = useAppSelector((state) => state.departments);
  const { requests } = useAppSelector((state) => state.leave);
  const { goals } = useAppSelector((state) => state.goals);
  const { reviews } = useAppSelector((state) => state.performance);
  const { documents } = useAppSelector((state) => state.documents);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (isOpen) {
          onClose();
        }
      }
      if (e.key === "Escape" && isOpen) {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Static navigation pages
  const navItems = [
    { label: "Dashboard", href: "/dashboard", category: "Navigation", icon: LayoutDashboard, desc: "Main workforce overview" },
    { label: "Employees", href: "/employees", category: "Navigation", icon: Users, desc: "Employee directory & management" },
    { label: "Departments", href: "/departments", category: "Navigation", icon: Building2, desc: "Organizational departments" },
    { label: "Attendance", href: "/attendance", category: "Navigation", icon: CalendarDays, desc: "Attendance records & calendar" },
    { label: "Leave", href: "/leave", category: "Navigation", icon: CalendarDays, desc: "Leave management & approvals" },
    { label: "Leave Types", href: "/leave-types", category: "Navigation", icon: Settings2, desc: "Manage leave policies" },
    { label: "Performance", href: "/performance", category: "Navigation", icon: ClipboardCheck, desc: "Employee performance reviews" },
    { label: "Goals & OKRs", href: "/goals", category: "Navigation", icon: Target, desc: "Objectives & tracking" },
    { label: "Analytics", href: "/analytics", category: "Navigation", icon: BarChart3, desc: "Workforce & HR analytics" },
    { label: "Documents", href: "/documents", category: "Navigation", icon: FileText, desc: "HR and employee documents" },
    { label: "Reports", href: "/reports", category: "Navigation", icon: Settings2, desc: "Generate CSV and PDF reports" },
    { label: "Activity", href: "/activity", category: "Navigation", icon: Activity, desc: "Audit logs & organization activity" },
    { label: "Notifications", href: "/notifications", category: "Navigation", icon: Bell, desc: "System updates & alerts" },
  ];

  const filteredResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    const results: Array<{
      id: string;
      title: string;
      subtitle: string;
      category: string;
      href: string;
      icon: any;
    }> = [];

    if (!q) {
      // Show default pages
      navItems.slice(0, 6).forEach((item) => {
        results.push({
          id: `nav-${item.href}`,
          title: item.label,
          subtitle: item.desc,
          category: "Quick Navigation",
          href: item.href,
          icon: item.icon,
        });
      });
      return results;
    }

    // 1. Filter Navigation items
    navItems.forEach((item) => {
      if (item.label.toLowerCase().includes(q) || item.desc.toLowerCase().includes(q)) {
        results.push({
          id: `nav-${item.href}`,
          title: item.label,
          subtitle: item.desc,
          category: "Navigation",
          href: item.href,
          icon: item.icon,
        });
      }
    });

    // 2. Filter Employees
    employees.forEach((emp) => {
      const name = `${emp.firstName} ${emp.lastName}`.toLowerCase();
      if (
        name.includes(q) ||
        emp.email.toLowerCase().includes(q) ||
        emp.jobTitle.toLowerCase().includes(q) ||
        emp.employeeCode.toLowerCase().includes(q)
      ) {
        results.push({
          id: `emp-${emp.id}`,
          title: `${emp.firstName} ${emp.lastName}`,
          subtitle: `${emp.jobTitle} • ${emp.department?.name || "Unassigned"} (${emp.employeeCode})`,
          category: "Employees",
          href: `/employees/${emp.id}`,
          icon: Users,
        });
      }
    });

    // 3. Filter Departments
    departments.forEach((dept) => {
      if (dept.name.toLowerCase().includes(q) || (dept.description && dept.description.toLowerCase().includes(q))) {
        results.push({
          id: `dept-${dept.id}`,
          title: dept.name,
          subtitle: `Department • ${dept.employees?.length ?? dept._count?.employees ?? 0} employees`,
          category: "Departments",
          href: `/departments/${dept.id}`,
          icon: Building2,
        });
      }
    });

    // 4. Filter Leave Requests
    requests.forEach((req) => {
      const empName = req.employee ? `${req.employee.firstName} ${req.employee.lastName}` : "";
      if (
        empName.toLowerCase().includes(q) ||
        (req.leaveType?.name && req.leaveType.name.toLowerCase().includes(q)) ||
        (req.reason && req.reason.toLowerCase().includes(q))
      ) {
        results.push({
          id: `leave-${req.id}`,
          title: `${empName || "Employee"} - ${req.leaveType?.name || "Leave"}`,
          subtitle: `Leave Request • ${req.totalDays} day(s) • Status: ${req.status}`,
          category: "Leave Requests",
          href: "/leave",
          icon: CalendarDays,
        });
      }
    });

    // 5. Filter Goals
    goals.forEach((goal) => {
      if (goal.title.toLowerCase().includes(q) || (goal.description && goal.description.toLowerCase().includes(q))) {
        results.push({
          id: `goal-${goal.id}`,
          title: goal.title,
          subtitle: `Goal • ${goal.progress ?? 0}% progress • Status: ${goal.status}`,
          category: "Goals & OKRs",
          href: "/goals",
          icon: Target,
        });
      }
    });

    // 6. Filter Performance Reviews
    reviews.forEach((review) => {
      const empName = review.employee ? `${review.employee.firstName} ${review.employee.lastName}` : "";
      const cycleStr = (review as any).cycle || `${new Date(review.periodStart).toLocaleDateString()} - ${new Date(review.periodEnd).toLocaleDateString()}`;
      if (empName.toLowerCase().includes(q) || cycleStr.toLowerCase().includes(q)) {
        results.push({
          id: `rev-${review.id}`,
          title: `${empName || "Review"} - ${cycleStr}`,
          subtitle: `Performance Review • Rating: ${review.overallRating ?? (review as any).overallScore ?? "—"}/5 • ${review.status}`,
          category: "Performance Reviews",
          href: "/performance",
          icon: ClipboardCheck,
        });
      }
    });

    // 7. Filter Documents
    documents.forEach((doc) => {
      if (doc.name.toLowerCase().includes(q) || doc.category.toLowerCase().includes(q)) {
        results.push({
          id: `doc-${doc.id}`,
          title: doc.name,
          subtitle: `Document • ${doc.category} • ${doc.status}`,
          category: "Documents",
          href: "/documents",
          icon: FileText,
        });
      }
    });

    return results.slice(0, 15);
  }, [query, navItems, employees, departments, requests, goals, reviews, documents]);

  const handleSelect = (href: string) => {
    onClose();
    router.push(href);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < filteredResults.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filteredResults.length - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredResults[selectedIndex]) {
        handleSelect(filteredResults[selectedIndex].href);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/40 p-4 pt-16 sm:pt-24 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="relative flex items-center border-b border-slate-200 px-4 py-3.5">
          <Search className="h-5 w-5 text-slate-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search employees, departments, leave requests, reviews, pages..."
            className="w-full bg-transparent px-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <kbd className="hidden rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-semibold text-slate-500 sm:inline-block">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2">
          {filteredResults.length === 0 ? (
            <div className="py-12 text-center">
              <Search className="mx-auto h-8 w-8 text-slate-300" />
              <p className="mt-3 text-sm font-medium text-slate-700">No results found for &ldquo;{query}&rdquo;</p>
              <p className="mt-1 text-xs text-slate-400">Try searching for an employee name, job title, department, or action.</p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredResults.map((item, index) => {
                const Icon = item.icon;
                const isSelected = index === selectedIndex;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item.href)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`flex w-full items-center justify-between gap-3 rounded-xl px-3.5 py-2.5 text-left text-sm transition ${
                      isSelected ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                          isSelected ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={`truncate font-medium ${isSelected ? "text-white" : "text-slate-900"}`}>
                          {item.title}
                        </p>
                        <p
                          className={`truncate text-xs ${
                            isSelected ? "text-slate-300" : "text-slate-500"
                          }`}
                        >
                          {item.subtitle}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                          isSelected ? "bg-slate-800 text-slate-300" : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {item.category}
                      </span>
                      {isSelected && <ArrowRight className="h-4 w-4 text-slate-300" />}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-4 py-2 text-[11px] text-slate-500">
          <div className="flex items-center gap-3">
            <span><kbd className="rounded border bg-white px-1.5 py-0.5 font-sans">↑</kbd> <kbd className="rounded border bg-white px-1.5 py-0.5 font-sans">↓</kbd> to navigate</span>
            <span><kbd className="rounded border bg-white px-1.5 py-0.5 font-sans">↵</kbd> to select</span>
          </div>
          <span>WorkSphere Global Search</span>
        </div>
      </div>
    </div>
  );
}
