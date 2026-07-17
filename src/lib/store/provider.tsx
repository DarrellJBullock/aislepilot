"use client";

import type { ReactNode } from "react";
import { SUPABASE_CONFIGURED } from "@/lib/supabase/config";
import { LocalAppProvider } from "./local-provider";
import { SupabaseAppProvider } from "./supabase-provider";

export { useApp } from "./context";
export type { AppContextValue } from "./context";

/**
 * Selects the store backend: Supabase (real auth + Postgres) when configured,
 * otherwise the localStorage mock store. Both expose the identical `useApp()`
 * interface, so no component changes between modes.
 */
export function AppProvider({ children }: { children: ReactNode }) {
  if (SUPABASE_CONFIGURED) {
    return <SupabaseAppProvider>{children}</SupabaseAppProvider>;
  }
  return <LocalAppProvider>{children}</LocalAppProvider>;
}
