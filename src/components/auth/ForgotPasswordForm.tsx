"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { useApp } from "@/lib/store/provider";
import { Logo } from "@/components/app/Logo";
import { Button, Input, Label, FieldError, Card, CardBody } from "@/components/ui";

interface FormValues {
  email: string;
  newPassword: string;
}

export function ForgotPasswordForm() {
  const { resetPassword, backend } = useApp();
  const [formError, setFormError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ defaultValues: { email: "", newPassword: "" } });

  const isLocal = backend === "local";

  const onSubmit = async (values: FormValues) => {
    setFormError(null);
    const err = await Promise.resolve(
      resetPassword(values.email, isLocal ? values.newPassword : undefined),
    );
    if (err) {
      setFormError(err);
      return;
    }
    setDone(true);
  };

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4 py-10">
      <Link href="/" className="mb-8 flex justify-center">
        <Logo />
      </Link>
      <Card>
        <CardBody className="sm:p-6">
          <h1 className="text-2xl font-bold text-ink">Reset your password</h1>
          <p className="mt-1 text-sm text-ink-muted">
            {isLocal
              ? "Enter your account email and a new password."
              : "We'll email you a link to set a new password."}
          </p>

          {done ? (
            <p className="mt-6 rounded-lg bg-brand-50 px-3 py-2.5 text-sm text-brand-800">
              {isLocal
                ? "Password updated. You can sign in now."
                : "Check your email for a reset link."}
            </p>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
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

              {isLocal && (
                <div>
                  <Label htmlFor="newPassword">New password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    autoComplete="new-password"
                    placeholder="••••••••"
                    aria-invalid={!!errors.newPassword}
                    {...register("newPassword", {
                      required: "New password is required.",
                      minLength: { value: 6, message: "At least 6 characters." },
                    })}
                  />
                  <FieldError>{errors.newPassword?.message}</FieldError>
                </div>
              )}

              {formError && (
                <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                  {formError}
                </p>
              )}

              <Button type="submit" fullWidth size="lg" disabled={isSubmitting}>
                {isLocal ? "Update password" : "Send reset link"}
              </Button>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-ink-muted">
            Remembered it?{" "}
            <Link href="/sign-in" className="font-semibold text-brand-700 hover:underline">
              Sign in
            </Link>
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
