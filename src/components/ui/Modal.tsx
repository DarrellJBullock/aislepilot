"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export function Modal({
  open,
  onClose,
  title,
  children,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div
        className={cn(
          "relative z-10 max-h-[88vh] w-full overflow-y-auto rounded-t-3xl bg-white p-5 shadow-xl",
          "animate-slide-up sm:max-w-lg sm:rounded-3xl",
          className,
        )}
      >
        <div className="mb-3 flex items-center justify-between">
          {title ? (
            <h2 className="text-lg font-semibold text-ink">{title}</h2>
          ) : (
            <span />
          )}
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-1.5 text-ink-muted hover:bg-black/5"
          >
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
