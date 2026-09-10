import Link from "next/link";
import {
  Users,
  CalendarCheck,
  ShieldCheck,
  Target,
  Award,
  BarChart3,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Building2,
  FileSpreadsheet,
} from "lucide-react";

export default function HomePage() {
  const features = [
    {
      icon: <Users className="h-6 w-6 text-[#0F766E]" />,
      title: "Employee Directory & Profiles",
      description:
        "Comprehensive workforce profiles, department mapping, job titles, and secure document vault.",
      badge: "Core HR",
    },
    {
      icon: <CalendarCheck className="h-6 w-6 text-[#0F766E]" />,
      title: "Attendance Tracking & Matrix",
      description:
        "Real-time clock-in/out, multi-status logging, monthly attendance matrix, and auto-computed summary metrics.",
      badge: "Workforce",
    },
    {
      icon: <ShieldCheck className="h-6 w-6 text-[#0F766E]" />,
      title: "Leave Management & Approvals",
      description:
        "Policy-driven leave balances, manager approval queues, and company-wide absence calendar.",
      badge: "Workflow",
    },
    {
      icon: <Target className="h-6 w-6 text-[#0F766E]" />,
      title: "Goals & OKR Progress Sliders",
      description:
        "Align corporate quarterly objectives, individual targets, and interactive real-time completion sliders.",
      badge: "Strategy",
    },
    {
      icon: <Award className="h-6 w-6 text-[#0F766E]" />,
      title: "360° Performance Reviews",
      description:
        "Structured multi-criteria evaluations across Technical, Leadership, and Communication competencies.",
      badge: "Talent",
    },
    {
      icon: <BarChart3 className="h-6 w-6 text-[#2563EB]" />,
      title: "Workforce Analytics & Reporting",
      description:
        "Live department headcount distributions, attendance trends, and instant one-click CSV and PDF exports.",
      badge: "Intelligence",
    },
  ];

  return (
    <main className="min-h-screen bg-[#0F172A] text-slate-100 selection:bg-teal-500/30 selection:text-teal-200">
      {/* Glow Effect */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-gradient-to-tr from-[#0F766E]/20 via-[#2563EB]/15 to-transparent blur-[120px]" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 border-b border-slate-800/80 bg-[#0F172A]/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0F766E] font-bold text-white shadow-md shadow-teal-950">
              W
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              WorkSphere
            </span>
          </div>

          <div className="hidden items-center gap-8 md:flex text-sm font-medium text-slate-400">
            <a href="#features" className="transition hover:text-white">
              Features
            </a>
            <a href="#architecture" className="transition hover:text-white">
              Architecture
            </a>
            <span className="inline-flex items-center gap-1.5 text-xs text-teal-400 bg-teal-950/60 border border-teal-500/30 px-3 py-1 rounded-full font-semibold">
              <Sparkles className="h-3 w-3" /> Enterprise Ready
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-300 transition hover:text-white hover:bg-slate-800/50"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#0F766E] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#115E59]"
            >
              Get started
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 pt-16 pb-24 lg:pt-24 lg:pb-32">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-950/60 px-4 py-1.5 text-xs font-semibold text-teal-300 shadow-inner">
            <span className="h-2 w-2 rounded-full bg-[#0F766E] animate-pulse" />
            Enterprise HR & Workforce Management Platform
          </div>

          <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-6xl lg:text-7xl text-white">
            Manage your workforce{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-teal-200 to-blue-400">
              with confidence.
            </span>
          </h1>

          <p className="mt-6 text-base leading-relaxed text-slate-400 sm:text-lg lg:text-xl">
            WorkSphere brings employee directories, real-time attendance matrix,
            leave approval workflows, 360° performance reviews, OKRs, and workforce analytics
            into one unified platform.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0F766E] px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-teal-900/40 transition hover:bg-[#115E59] hover:shadow-teal-900/60"
            >
              Create Workspace
              <ArrowRight className="h-5 w-5" />
            </Link>

            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800/60 px-8 py-3.5 text-base font-semibold text-slate-200 backdrop-blur-sm transition hover:bg-slate-800 hover:text-white"
            >
              Explore Dashboard Demo
            </Link>
          </div>

          {/* Quick Metrics / Badges */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs font-medium text-slate-400">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-teal-400" /> Multi-Tenant Architecture
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-teal-400" /> Role-Based Access Control
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-teal-400" /> Exportable Analytics
            </span>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="relative z-10 border-t border-slate-800/80 bg-slate-950/60 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
              Everything in One Place
            </span>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Enterprise Workflows, Simplified
            </h2>
            <p className="mt-3 text-sm text-slate-400 leading-relaxed">
              Designed for scalability, data fidelity, and seamless HR operations.
            </p>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feat) => (
              <div
                key={feat.title}
                className="group relative rounded-2xl border border-slate-800 bg-[#0F172A]/70 p-7 transition hover:border-teal-500/40 hover:bg-[#0F172A] shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-950/60 border border-teal-500/20 group-hover:border-teal-500/40 transition">
                    {feat.icon}
                  </div>
                  <span className="rounded-full bg-slate-800/80 border border-slate-700/60 px-2.5 py-0.5 text-[11px] font-semibold text-slate-300">
                    {feat.badge}
                  </span>
                </div>

                <h3 className="mt-5 text-lg font-bold text-white group-hover:text-teal-300 transition">
                  {feat.title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-400">
                  {feat.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Architecture & CTA Section */}
      <section id="architecture" className="relative z-10 border-t border-slate-800/80 py-20 bg-[#0F172A]">
        <div className="mx-auto max-w-5xl px-6">
          <div className="rounded-3xl border border-teal-500/30 bg-gradient-to-b from-teal-950/40 to-slate-900 p-8 sm:p-12 text-center relative overflow-hidden shadow-2xl">
            <div className="relative z-10 max-w-2xl mx-auto">
              <span className="rounded-full bg-teal-900/60 border border-teal-400/30 px-3 py-1 text-xs font-bold text-teal-300">
                Ready to elevate your HR operations?
              </span>
              <h2 className="mt-4 text-3xl font-bold text-white sm:text-4xl">
                Get started with WorkSphere today
              </h2>
              <p className="mt-3 text-sm text-slate-300 leading-relaxed">
                Join organizations streamlining their employee directory, attendance tracking, and workforce performance.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <Link
                  href="/register"
                  className="rounded-xl bg-[#0F766E] px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-teal-950 transition hover:bg-[#115E59]"
                >
                  Create Your Organization
                </Link>
                <Link
                  href="/login"
                  className="rounded-xl border border-slate-700 bg-slate-800/80 px-8 py-3.5 text-sm font-semibold text-slate-200 transition hover:bg-slate-800 hover:text-white"
                >
                  Sign In to Workspace
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800/80 bg-slate-950 py-10 text-center text-xs text-slate-500">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0F766E] text-xs font-bold text-white">
              W
            </div>
            <span className="font-bold text-slate-300">WorkSphere</span>
            <span className="text-slate-600">&bull; Enterprise HR & Workforce Platform</span>
          </div>
          <p>&copy; {new Date().getFullYear()} WorkSphere Inc. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}