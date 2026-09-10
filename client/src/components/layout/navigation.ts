import {
  LayoutDashboard,
  Users,
  Building2,
  CalendarCheck,
  CalendarDays,
  ClipboardCheck,
  Target,
  FileText,
  BarChart3,
  Settings2,
  ActivityIcon,
  Settings,
} from "lucide-react";

export const navigation = [
  {
    label: "Overview",
    items: [
      {
        name: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
      },
      {
        name: "Analytics",
        href: "/analytics",
        icon: BarChart3,
      },
      {
        name: "Activity",
        href: "/activity",
        icon: ActivityIcon,
      },
    ],
  },

  {
    label: "People",
    items: [
      {
        name: "Employees",
        href: "/employees",
        icon: Users,
      },
      {
        name: "Departments",
        href: "/departments",
        icon: Building2,
      },
    ],
  },

  {
    label: "Workforce",
    items: [
      {
        name: "Attendance",
        href: "/attendance",
        icon: CalendarCheck,
      },
      {
        name: "Leave",
        href: "/leave",
        icon: CalendarDays,
      },
      {
        name: "Leave Types",
        href: "/leave-types",
        icon: Settings2,
      },
    ],
  },

  {
    label: "Performance",
    items: [
      {
        name: "Performance",
        href: "/performance",
        icon: ClipboardCheck,
      },
      {
        name: "Goals",
        href: "/goals",
        icon: Target,
      },
    ],
  },

  {
    label: "Resources",
    items: [
      {
        name: "Documents",
        href: "/documents",
        icon: FileText,
      },
      {
        name: "Reports",
        href: "/reports",
        icon: Settings2,
      },
    ],
  },

  {
    label: "System",
    items: [
      {
        name: "Settings",
        href: "/settings",
        icon: Settings,
      },
    ],
  },
];