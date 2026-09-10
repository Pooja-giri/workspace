"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import AuthInput from "@/components/auth/AuthInput";
import { loginUser } from "@/features/auth/authSlice";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";

const loginSchema = z.object({
  email: z
    .string()
    .email("Enter a valid email address"),

  password: z
    .string()
    .min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { loading, error } = useAppSelector(
    (state) => state.auth
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    const result = await dispatch(loginUser(data));

    if (loginUser.fulfilled.match(result)) {
      router.push("/dashboard");
    }
  };

  return (
    <main className="min-h-screen bg-slate-950">
      <div className="grid min-h-screen lg:grid-cols-2">

        {/* Left */}
        <div className="hidden items-center justify-center bg-[#0F172A] p-12 lg:flex border-r border-slate-800">
          <div className="max-w-lg text-white">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0F766E] font-bold text-white shadow-md">
                W
              </div>

              <span className="text-2xl font-bold tracking-tight">
                WorkSphere
              </span>
            </div>

            <h1 className="text-5xl font-bold leading-tight tracking-tight">
              Your workforce.
              <br />
              <span className="text-teal-400">One powerful platform.</span>
            </h1>

            <p className="mt-6 text-lg leading-8 text-slate-400">
              Manage employees, attendance, leave,
              performance, and workforce analytics
              from one enterprise platform.
            </p>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center justify-center bg-[#F8FAFC] px-6 py-12">
          <div className="w-full max-w-md bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">

            <div className="mb-8">
              <div className="mb-6 flex items-center gap-3 lg:hidden">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0F766E] font-bold text-white">
                  W
                </div>
                <span className="text-xl font-bold text-slate-900">WorkSphere</span>
              </div>

              <h2 className="text-2xl font-bold text-slate-900">
                Welcome back
              </h2>

              <p className="mt-1.5 text-sm text-slate-500 font-medium">
                Sign in to your WorkSphere account.
              </p>
            </div>

            {error && (
              <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-5"
            >
              <AuthInput
                label="Email"
                type="email"
                placeholder="you@company.com"
                {...register("email")}
                error={errors.email?.message}
              />

              <AuthInput
                label="Password"
                type="password"
                placeholder="••••••••"
                {...register("password")}
                error={errors.password?.message}
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-[#0F766E] px-4 py-3.5 font-semibold text-white transition hover:bg-[#115E59] shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-slate-500">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="font-semibold text-[#0F766E] hover:underline"
              >
                Create one
              </Link>
            </p>

          </div>
        </div>

      </div>
    </main>
  );
}