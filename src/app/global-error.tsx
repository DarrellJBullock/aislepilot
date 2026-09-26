"use client";

import { useEffect } from "react";
import { reportError } from "@/lib/monitoring";

// Catches errors thrown by the root layout itself — error.tsx can't cover
// those since it renders inside the layout. Must render its own <html>/<body>
// since it replaces the whole page when triggered, so it can't reuse the
// app's usual UI components/layout.
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
    <html lang="en">
      <body style={{ background: "#f7f8fa" }}>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
            fontFamily: "system-ui, sans-serif",
            textAlign: "center",
          }}
        >
          <h1 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#111826" }}>
            Something went wrong
          </h1>
          <p style={{ marginTop: "0.5rem", fontSize: "0.9rem", color: "#6b7688", maxWidth: 360 }}>
            That&apos;s on us, not you. Try reloading the page.
          </p>
          <button
            onClick={() => reset()}
            style={{
              marginTop: "1.25rem",
              padding: "0.625rem 1.25rem",
              borderRadius: "9999px",
              border: "none",
              background: "#0c9152",
              color: "white",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
