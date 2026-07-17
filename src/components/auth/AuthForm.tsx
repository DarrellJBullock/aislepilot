"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useApp } from "@/lib/store/provider";
import { Logo } from "@/components/app/Logo";
import { Button, Input, Label, FieldError, Card, CardBody } from "@/components/ui";

interface FormValues {
  email: string;
  password: string;
  displayName?: string;
}

export function AuthForm({ mode }: { mode: "sign-in" | "sign-up" }) {
  const { signIn, signUp } = useApp();
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ defaultValues: { email: "", password: "" } });

  const isSignUp = mode === "sign-up";

  const onSubmit = (values: FormValues) => {
    setFormError(null);
    const err = isSignUp
      ? signUp(values.email, values.password, values.displayName)
      : signIn(values.email, values.password);
    if (err) {
      setFormError(err);
      return;
    }
    router.push("/dashboard");
  };

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4 py-10">
      <Link href="/" className="mb-8 flex justify-center">
        <Logo />
      </Link>
      <Card>
        <CardBody className="sm:p-6">
          <h1 className="text-2xl font-bold text-ink">
            {isSignUp ? "Create your account" : "Welcome back"}
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            {isSignUp
              ? "Start building smarter shopping lists."
              : "Sign in to pick up where you left off."}
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
            {isSignUp && (
              <div>
                <Label htmlFor="displayName">Name</Label>
                <Input
                  id="displayName"
                  autoComplete="name"
                  placeholder="Alex Shopper"
                  {...register("displayName")}
                />
              </div>
            )}
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                aria-invalid={!!errors.email}
                {...register("email", { required: "Email is required." })}
              />
              <FieldError>{errors.email?.message}</FieldError>
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete={isSignUp ? "new-password" : "current-password"}
                placeholder="••••••••"
                aria-invalid={!!errors.password}
                {...register("password", {
                  required: "Password is required.",
                  minLength: { value: 6, message: "At least 6 characters." },
                })}
              />
              <FieldError>{errors.password?.message}</FieldError>
            </div>

            {formError && (
              <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                {formError}
              </p>
            )}

            <Button type="submit" fullWidth size="lg" disabled={isSubmitting}>
              {isSignUp ? "Create account" : "Sign in"}
            </Button>
          </form>

          {!isSignUp && (
            <div className="mt-4 rounded-xl bg-brand-50 px-3 py-2.5 text-sm text-brand-800">
              <strong>Demo login:</strong> demo@aislepilot.app · demo123
            </div>
          )}

          <p className="mt-6 text-center text-sm text-ink-muted">
            {isSignUp ? "Already have an account? " : "New to AislePilot? "}
            <Link
              href={isSignUp ? "/sign-in" : "/sign-up"}
              className="font-semibold text-brand-700 hover:underline"
            >
              {isSignUp ? "Sign in" : "Create one"}
            </Link>
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
