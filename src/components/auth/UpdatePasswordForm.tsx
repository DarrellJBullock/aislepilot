"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useApp } from "@/lib/store/provider";
import { Logo } from "@/components/app/Logo";
import { Button, Input, Label, FieldError, Card, CardBody } from "@/components/ui";

interface FormValues {
  password: string;
}

export function UpdatePasswordForm() {
  const { updatePassword } = useApp();
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ defaultValues: { password: "" } });

  const onSubmit = async (values: FormValues) => {
    setFormError(null);
    const err = await Promise.resolve(updatePassword(values.password));
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
          <h1 className="text-2xl font-bold text-ink">Set a new password</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Choose a new password for your account.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
            <div>
              <Label htmlFor="password">New password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
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
              Update password
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
