"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/store/provider";
import { Spinner } from "@/components/ui";

/** Client-side route guard. Redirects to sign-in when no session is present. */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { ready, profile } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (ready && !profile) router.replace("/sign-in");
  }, [ready, profile, router]);

  if (!ready) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner className="text-brand-600" />
      </div>
    );
  }
  if (!profile) return null;
  return <>{children}</>;
}
