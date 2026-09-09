import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">

      <nav className="border-b border-slate-800">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white font-bold text-slate-950">
              W
            </div>

            <span className="text-xl font-bold">
              WorkSphere
            </span>
          </div>

          <Link
            href="/login"
            className="rounded-lg border border-slate-700 px-5 py-2.5 text-sm font-medium transition hover:bg-slate-900"
          >
            Sign in
          </Link>

        </div>
      </nav>

      <section className="mx-auto flex min-h-[calc(100vh-81px)] max-w-7xl items-center px-6 py-20">

        <div className="max-w-4xl">

          <div className="mb-6 inline-flex rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-300">
            Enterprise HR & Workforce Management
          </div>

          <h1 className="text-5xl font-bold leading-tight tracking-tight md:text-7xl">
            Manage your workforce
            <span className="text-slate-400">
              {" "}with confidence.
            </span>
          </h1>

          <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-400">
            WorkSphere brings employee management, attendance,
            leave, performance, goals, and workforce analytics
            into one powerful enterprise platform.
          </p>

          <div className="mt-9 flex flex-wrap gap-4">

            <Link
              href="/register"
              className="rounded-xl bg-white px-7 py-3.5 font-semibold text-slate-950 transition hover:bg-slate-200"
            >
              Get started
            </Link>

            <Link
              href="/login"
              className="rounded-xl border border-slate-700 px-7 py-3.5 font-semibold transition hover:bg-slate-900"
            >
              Sign in
            </Link>

          </div>

        </div>

      </section>

    </main>
  );
}