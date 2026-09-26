"use client";

import * as Sentry from "@sentry/nextjs";
import { SENTRY_DSN, sentryOptions } from "@/lib/monitoring";

// Runs once in the browser at module load; does nothing without a DSN.
if (typeof window !== "undefined" && SENTRY_DSN && !Sentry.getClient()) {
  Sentry.init(sentryOptions);
}

export function ErrorMonitoring() {
  return null;
}
