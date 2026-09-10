"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import AuthInput from "@/components/auth/AuthInput";
import {
  registerUser,
} from "@/features/auth/authSlice";
import {
  useAppDispatch,
  useAppSelector,
} from "@/hooks/redux";

const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, "Name must contain at least 2 characters"),

    email: z
      .string()
      .email("Enter a valid email address"),

    organizationName: z
      .string()
      .min(
        2,
        "Organization name must contain at least 2 characters"
      ),

    password: z
      .string()
      .min(
        8,
        "Password must contain at least 8 characters"
      ),

    confirmPassword: z
      .string()
      .min(1, "Please confirm your password"),
  })
  .refine(
    (data) => data.password === data.confirmPassword,
    {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    }
  );

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { loading, error } = useAppSelector(
    (state) => state.auth
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    const result = await dispatch(
      registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
        organizationName: data.organizationName,
      })
    );

    if (registerUser.fulfilled.match(result)) {
      router.push("/dashboard");
    }
  };

  return (
    <main className="min-h-screen bg-slate-950">
      <div className="grid min-h-screen lg:grid-cols-2">

        <div className="flex items-center justify-center bg-[#F8FAFC] px-6 py-12">
          <div className="w-full max-w-md bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">

            <div className="mb-8">
              <div className="mb-6 flex items-center gap-3 lg:hidden">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0F766E] font-bold text-white shadow-sm">
                  W
                </div>

                <span className="text-xl font-bold text-slate-900">
                  WorkSphere
                </span>
              </div>

              <h1 className="text-2xl font-bold text-slate-900">
                Create your workspace
              </h1>

              <p className="mt-1.5 text-sm text-slate-500 font-medium">
                Start managing your workforce today.
              </p>
            </div>

            {error && (
              <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-4"
            >
              <AuthInput
                label="Full name"
                placeholder="John Doe"
                {...register("name")}
                error={errors.name?.message}
              />

              <AuthInput
                label="Work email"
                type="email"
                placeholder="john@company.com"
                {...register("email")}
                error={errors.email?.message}
              />

              <AuthInput
                label="Organization"
                placeholder="Acme Corporation"
                {...register("organizationName")}
                error={errors.organizationName?.message}
              />

              <AuthInput
                label="Password"
                type="password"
                placeholder="Minimum 8 characters"
                {...register("password")}
                error={errors.password?.message}
              />

              <AuthInput
                label="Confirm password"
                type="password"
                placeholder="Repeat your password"
                {...register("confirmPassword")}
                error={errors.confirmPassword?.message}
              />

              <button
                type="submit"
                disabled={loading}
                className="mt-2 w-full rounded-xl bg-[#0F766E] px-4 py-3.5 font-semibold text-white transition hover:bg-[#115E59] shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "Creating workspace..."
                  : "Create workspace"}
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-slate-500">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-semibold text-[#0F766E] hover:underline"
              >
                Sign in
              </Link>
            </p>

          </div>
        </div>

        <div className="hidden items-center justify-center bg-[#0F172A] p-12 text-white lg:flex border-l border-slate-800">
          <div className="max-w-lg">

            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0F766E] text-xl font-bold text-white shadow-md">
                W
              </div>

              <span className="text-2xl font-bold tracking-tight">
                WorkSphere
              </span>
            </div>

            <h2 className="text-5xl font-bold leading-tight tracking-tight">
              Everything your
              <br />
              <span className="text-teal-400">HR team needs.</span>
            </h2>

            <div className="mt-8 space-y-4 text-slate-300 font-medium">
              <p className="flex items-center gap-2.5"><span className="text-teal-400 font-bold">✓</span> Employee management & directory</p>
              <p className="flex items-center gap-2.5"><span className="text-teal-400 font-bold">✓</span> Attendance matrix & clocking</p>
              <p className="flex items-center gap-2.5"><span className="text-teal-400 font-bold">✓</span> Leave approvals & balances</p>
              <p className="flex items-center gap-2.5"><span className="text-teal-400 font-bold">✓</span> Goals & OKR sliders</p>
              <p className="flex items-center gap-2.5"><span className="text-teal-400 font-bold">✓</span> 360° Performance reviews</p>
              <p className="flex items-center gap-2.5"><span className="text-teal-400 font-bold">✓</span> Real-time workforce analytics</p>
            </div>

          </div>
        </div>

      </div>
    </main>
  );
}