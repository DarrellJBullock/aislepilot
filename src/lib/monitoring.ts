import * as Sentry from "@sentry/nextjs";

// Error monitoring is inert until NEXT_PUBLIC_SENTRY_DSN is set, so local
// dev, tests and mock mode never send anything.

export const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

/** Drops the query string — it can hold search terms and ZIP codes. */
export function stripQuery(url: string): string {
  const i = url.indexOf("?");
  return i === -1 ? url : url.slice(0, i);
}

export const sentryOptions = {
  dsn: SENTRY_DSN,
  enabled: !!SENTRY_DSN,
  environment: process.env.NEXT_PUBLIC_VERCEL_ENV ?? process.env.VERCEL_ENV ?? "development",
  // Errors only: no performance tracing, no session replay, no PII.
  tracesSampleRate: 0,
  sendDefaultPii: false,
  maxBreadcrumbs: 20,
  beforeBreadcrumb(breadcrumb: Sentry.Breadcrumb): Sentry.Breadcrumb | null {
    const url = breadcrumb.data?.url;
    if ((breadcrumb.category === "fetch" || breadcrumb.category === "xhr") && typeof url === "string") {
      return { ...breadcrumb, data: { ...breadcrumb.data, url: stripQuery(url) } };
    }
    return breadcrumb;
  },
  beforeSend(event: Sentry.ErrorEvent): Sentry.ErrorEvent {
    if (event.request?.url) event.request.url = stripQuery(event.request.url);
    delete event.request?.query_string;
    delete event.request?.cookies;
    delete event.user;
    return event;
  },
};

/** Report a caught error (no-op when monitoring isn't configured). */
export function reportError(error: unknown) {
  console.error(error);
  Sentry.captureException(error);
}
