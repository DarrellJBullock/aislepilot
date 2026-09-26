import * as Sentry from "@sentry/nextjs";
import { SENTRY_DSN, sentryOptions } from "@/lib/monitoring";

// Server-side error reporting (route handlers, server components). Inert
// without NEXT_PUBLIC_SENTRY_DSN.
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs" && SENTRY_DSN) {
    Sentry.init(sentryOptions);
  }
}

export const onRequestError = Sentry.captureRequestError;
