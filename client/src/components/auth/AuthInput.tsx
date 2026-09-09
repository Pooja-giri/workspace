"use client";

import { InputHTMLAttributes } from "react";

interface AuthInputProps
  extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export default function AuthInput({
  label,
  error,
  ...props
}: AuthInputProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-700">
        {label}
      </label>

      <input
        {...props}
        className={`w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none transition
          placeholder:text-slate-400
          focus:border-slate-900 focus:ring-2 focus:ring-slate-200
          ${
            error
              ? "border-red-400"
              : "border-slate-200"
          }`}
      />

      {error && (
        <p className="text-xs text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}