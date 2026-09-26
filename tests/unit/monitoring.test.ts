import { describe, it, expect } from "vitest";
import { sentryOptions, stripQuery } from "@/lib/monitoring";
import type { ErrorEvent } from "@sentry/nextjs";

describe("monitoring", () => {
  it("is disabled without a DSN, so dev/tests never send anything", () => {
    expect(sentryOptions.enabled).toBe(false);
  });

  it("strips query strings, which can hold search terms and ZIP codes", () => {
    expect(stripQuery("/api/retailers/stores?zip=19103&q=milk")).toBe("/api/retailers/stores");
    expect(stripQuery("/dashboard")).toBe("/dashboard");
  });

  it("scrubs URLs from breadcrumbs and PII from events", () => {
    const crumb = sentryOptions.beforeBreadcrumb({
      category: "fetch",
      data: { url: "https://aisle-pilot.app/api/retailers/stores?zip=19103", method: "GET" },
    });
    expect(crumb?.data?.url).toBe("https://aisle-pilot.app/api/retailers/stores");

    const event = sentryOptions.beforeSend({
      type: undefined,
      user: { email: "me@x.com" },
      request: { url: "https://aisle-pilot.app/lists?name=secret", query_string: "name=secret", cookies: { a: "b" } },
    } as ErrorEvent);
    expect(event.user).toBeUndefined();
    expect(event.request?.url).toBe("https://aisle-pilot.app/lists");
    expect(event.request?.query_string).toBeUndefined();
    expect(event.request?.cookies).toBeUndefined();
  });
});
