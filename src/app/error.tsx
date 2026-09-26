"use client";

import { useEffect } from "react";
import { reportError } from "@/lib/monitoring";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Logo } from "@/components/app/Logo";
import { Button, Card, CardBody } from "@/components/ui";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    reportError(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4 py-10">
      <Link href="/" className="mb-8 flex justify-center">
        <Logo />
      </Link>
      <Card>
        <CardBody className="flex flex-col items-center text-center sm:p-6">
          <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
            <AlertTriangle size={22} />
          </span>
          <h1 className="text-xl font-bold text-ink">Something went wrong</h1>
          <p className="mt-1 text-sm text-ink-muted">
            That&apos;s on us, not you. Try again, and if it keeps happening, let us know what you
            were doing when it broke.
          </p>
          <Button className="mt-5" onClick={() => reset()}>
            Try again
          </Button>
        </CardBody>
      </Card>
    </div>
  );
}
