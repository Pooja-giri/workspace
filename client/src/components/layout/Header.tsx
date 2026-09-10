"use client";

import {
  Menu,
  Search,
  ChevronDown,
  LogOut,
  User,
  Settings,
} from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  logout,
} from "@/features/auth/authSlice";

import {
  useAppDispatch,
  useAppSelector,
} from "@/hooks/redux";

import NotificationBell from "@/components/notifications/NotificationBell";

import CommandPalette from "@/components/layout/CommandPalette";

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({
  onMenuClick,
}: HeaderProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [profileOpen, setProfileOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);

  const {
    user,
    organization,
    role,
  } = useAppSelector(
    (state) => state.auth
  );

  const handleLogout = () => {
    dispatch(logout());
    router.push("/login");
  };

  return (
    <>
      <CommandPalette
        isOpen={commandOpen}
        onClose={() => setCommandOpen(false)}
      />

      <header className="sticky top-0 z-30 h-16 border-b border-slate-200 bg-white">
        <div className="flex h-full items-center justify-between px-6 md:px-8 lg:px-10">

          {/* Left */}
          <div className="flex items-center gap-3">

            <button
              onClick={onMenuClick}
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
            >
              <Menu size={21} />
            </button>

            {/* Search */}
            <button
              onClick={() => setCommandOpen(true)}
              className="hidden items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-left text-slate-400 transition hover:border-slate-300 hover:bg-slate-100/70 md:flex md:w-72 lg:w-96"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Search size={16} className="text-slate-400 shrink-0" />
                <span className="truncate text-xs text-slate-500">
                  Search WorkSphere (Ctrl + K)...
                </span>
              </div>

              <kbd className="hidden rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 lg:inline-block">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Right */}
          <div className="flex items-center gap-2">

            {/* Mobile search */}
            <button
              onClick={() => setCommandOpen(true)}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 md:hidden"
            >
              <Search size={19} />
            </button>

          {/* Notifications */}
          <NotificationBell />
          <div className="mx-1 hidden h-7 w-px bg-slate-200 sm:block" />

          {/* Profile */}
          <div className="relative">

            <button
              onClick={() =>
                setProfileOpen(!profileOpen)
              }
              className="flex items-center gap-2 rounded-xl px-2 py-1.5 transition hover:bg-slate-50"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-50 border border-teal-200 text-sm font-bold text-[#0F766E]">
                {user?.name
                  ?.charAt(0)
                  .toUpperCase()}
              </div>

              <div className="hidden text-left sm:block">
                <p className="max-w-32 truncate text-sm font-semibold text-slate-900">
                  {user?.name}
                </p>

                <p className="max-w-32 truncate text-[11px] text-slate-500">
                  {role?.name}
                </p>
              </div>

              <ChevronDown
                size={15}
                className="hidden text-slate-400 sm:block"
              />
            </button>

            {profileOpen && (
              <>

                <button
                  className="fixed inset-0 z-40 cursor-default"
                  onClick={() =>
                    setProfileOpen(false)
                  }
                  aria-label="Close profile menu"
                />

                <div className="absolute right-0 top-12 z-50 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">

                  <div className="border-b border-slate-100 p-4">
                    <p className="font-semibold text-slate-900">
                      {user?.name}
                    </p>

                    <p className="mt-1 truncate text-xs text-slate-500">
                      {user?.email}
                    </p>

                    <p className="mt-2 text-xs text-slate-400">
                      {organization?.name}
                    </p>
                  </div>

                  <div className="p-2">

                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        router.push("/profile");
                      }}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50"
                    >
                      <User size={17} />
                      My Profile
                    </button>

                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        router.push("/settings");
                      }}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50"
                    >
                      <Settings size={17} />
                      Settings
                    </button>

                    <div className="my-1 border-t border-slate-100" />

                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut size={17} />
                      Sign out
                    </button>

                  </div>

                </div>
              </>
            )}

          </div>

        </div>

      </div>
    </header>
    </>
  );
}