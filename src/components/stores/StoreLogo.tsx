"use client";

import { useState } from "react";
import { MapPin } from "lucide-react";
import type { Store } from "@aislepilot/domain/types";
import { getBannerLogoUrl } from "@aislepilot/domain/branding";

export function StoreLogo({
  store,
  size = 40,
}: {
  store?: Pick<Store, "banner" | "demo">;
  size?: number;
}) {
  const [failed, setFailed] = useState(false);
  const url = store && !store.demo ? getBannerLogoUrl(store.banner) : undefined;

  if (!url || failed) {
    return (
      <span
        className="flex shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-700"
        style={{ width: size, height: size }}
      >
        <MapPin size={Math.round(size * 0.45)} />
      </span>
    );
  }

  return (
    <span
      className="flex shrink-0 items-center justify-center overflow-hidden rounded-xl border border-black/5 bg-white"
      style={{ width: size, height: size }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- hotlinked external brand logo, not a local/optimizable asset */}
      <img
        src={url}
        alt={`${store!.banner} logo`}
        width={size}
        height={size}
        className="h-full w-full object-contain p-1"
        onError={() => setFailed(true)}
        referrerPolicy="no-referrer"
      />
    </span>
  );
}
