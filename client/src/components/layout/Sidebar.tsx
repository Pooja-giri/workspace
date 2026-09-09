"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";

import { navigation } from "./navigation";

interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({
  mobileOpen,
  onClose,
}: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {mobileOpen && (
        <button
          aria-label="Close navigation"
          className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex w-64 flex-col
          border-r border-slate-200 bg-white
          transition-transform duration-200
          lg:static lg:translate-x-0
          ${
            mobileOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-5">
          <Link
            href="/dashboard"
            className="flex items-center gap-3"
            onClick={onClose}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 text-sm font-bold text-white">
              W
            </div>

            <div>
              <p className="font-bold text-slate-950">
                WorkSphere
              </p>

              <p className="text-[10px] uppercase tracking-wider text-slate-400">
                HR Platform
              </p>
            </div>
          </Link>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
          >
            <X size={19} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-5">
          {navigation.map((section) => (
            <div
              key={section.label}
              className="mb-6"
            >
              <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                {section.label}
              </p>

              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;

                  const active =
                    pathname === item.href ||
                    pathname.startsWith(
                      `${item.href}/`
                    );

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className={`
                        flex items-center gap-3 rounded-xl px-3 py-2.5
                        text-sm font-medium transition
                        ${
                          active
                            ? "bg-slate-950 text-white"
                            : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                        }
                      `}
                    >
                      <Icon size={18} />

                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom */}
        <div className="border-t border-slate-200 p-4">
          <div className="rounded-xl bg-slate-50 p-3">
            <p className="text-xs font-semibold text-slate-900">
              WorkSphere
            </p>

            <p className="mt-1 text-[11px] text-slate-500">
              Enterprise HR Management
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}