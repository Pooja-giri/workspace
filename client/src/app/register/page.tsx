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

        <div className="flex items-center justify-center bg-white px-6 py-12">
          <div className="w-full max-w-md">

            <div className="mb-8">
              <div className="mb-6 flex items-center gap-3 lg:hidden">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-950 font-bold text-white">
                  W
                </div>

                <span className="text-2xl font-bold">
                  WorkSphere
                </span>
              </div>

              <h1 className="text-3xl font-bold text-slate-950">
                Create your workspace
              </h1>

              <p className="mt-2 text-slate-500">
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
                className="mt-2 w-full rounded-xl bg-slate-950 px-4 py-3.5 font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
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
                className="font-semibold text-slate-950 hover:underline"
              >
                Sign in
              </Link>
            </p>

          </div>
        </div>

        <div className="hidden items-center justify-center bg-slate-900 p-12 text-white lg:flex">
          <div className="max-w-lg">

            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-xl font-bold text-slate-950">
                W
              </div>

              <span className="text-2xl font-bold">
                WorkSphere
              </span>
            </div>

            <h2 className="text-5xl font-bold leading-tight">
              Everything your
              <br />
              HR team needs.
            </h2>

            <div className="mt-8 space-y-4 text-slate-400">
              <p>✓ Employee management</p>
              <p>✓ Attendance tracking</p>
              <p>✓ Leave management</p>
              <p>✓ Performance reviews</p>
              <p>✓ Workforce analytics</p>
            </div>

          </div>
        </div>

      </div>
    </main>
  );
}