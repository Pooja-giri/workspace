"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import Sidebar from "./Sidebar";
import Header from "./Header";

import {
  fetchCurrentUser,
  restoreToken,
} from "@/features/auth/authSlice";

import {
  useAppDispatch,
  useAppSelector,
} from "@/hooks/redux";

interface DashboardShellProps {
  children: React.ReactNode;
}

export default function DashboardShell({
  children,
}: DashboardShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();

  const [mobileOpen, setMobileOpen] =
    useState(false);

  const {
    user,
    loading,
  } = useAppSelector(
    (state) => state.auth
  );

  useEffect(() => {
    const token =
      localStorage.getItem("worksphere_token");

    if (!token) {
      router.replace("/login");
      return;
    }

    dispatch(restoreToken(token));

    if (!user) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch, router, user]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-950 font-bold text-white">
            W
          </div>

          <p className="text-sm text-slate-500">
            Loading WorkSphere...
          </p>

        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">

      <Sidebar
        key={pathname}
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">

        <Header
          onMenuClick={() =>
            setMobileOpen(true)
          }
        />

        <main className="flex-1 p-6 md:p-8 lg:p-10 w-full overflow-y-auto">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>

      </div>

    </div>
  );
}