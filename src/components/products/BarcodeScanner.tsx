"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, Keyboard, ScanBarcode } from "lucide-react";
import { Modal, Button, Input, Label } from "@/components/ui";

const FORMATS = ["upc_a", "upc_e", "ean_13", "ean_8", "code_128"];

type Mode = "camera" | "manual";

export function BarcodeScanner({
  open,
  onClose,
  onDetected,
}: {
  open: boolean;
  onClose: () => void;
  onDetected: (upc: string) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const [mode, setMode] = useState<Mode>("camera");
  const [error, setError] = useState<string | null>(null);
  const [manual, setManual] = useState("");
  const supported =
    typeof window !== "undefined" && typeof window.BarcodeDetector !== "undefined";

  // Always call the latest handler without restarting the camera on re-render.
  const onDetectedRef = useRef(onDetected);
  onDetectedRef.current = onDetected;

  // Start/stop the camera + detection loop with the modal.
  useEffect(() => {
    if (!open) return;
    if (!supported) {
      setMode("manual");
      return;
    }
    setMode("camera");
    setError(null);

    let cancelled = false;
    const detector = new BarcodeDetector({ formats: FORMATS });

    const start = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        const video = videoRef.current;
        if (!video) return;
        video.srcObject = stream;
        await video.play();
        scan(detector);
      } catch {
        setError(
          "Couldn't access the camera. Grant permission, or enter the barcode number.",
        );
        setMode("manual");
      }
    };

    const scan = async (det: BarcodeDetector) => {
      const video = videoRef.current;
      if (!video || cancelled) return;
      try {
        if (video.readyState >= 2) {
          const codes = await det.detect(video);
          const value = codes.find((c) => /^\d{6,}$/.test(c.rawValue))?.rawValue;
          if (value) {
            onDetectedRef.current(value);
            return; // stop the loop; parent closes/handles
          }
        }
      } catch {
        /* transient detect errors are ignored */
      }
      rafRef.current = requestAnimationFrame(() => scan(det));
    };

    start();

    return () => {
      cancelled = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, [open, supported]);

  const submitManual = () => {
    const clean = manual.replace(/\D/g, "");
    if (clean.length >= 6) {
      onDetected(clean);
      setManual("");
    } else {
      setError("Enter at least 6 digits.");
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Scan a barcode">
      {mode === "camera" && supported ? (
        <div>
          <div className="relative overflow-hidden rounded-2xl bg-black">
            <video
              ref={videoRef}
              muted
              playsInline
              className="aspect-[3/4] w-full object-cover"
              aria-label="Camera preview"
            />
            {/* Viewfinder overlay */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="h-28 w-56 rounded-xl border-2 border-white/90 shadow-[0_0_0_100vmax_rgba(0,0,0,0.35)]" />
            </div>
            <p className="absolute inset-x-0 bottom-3 text-center text-sm font-medium text-white/90">
              Point at a product barcode
            </p>
          </div>
          <button
            onClick={() => setMode("manual")}
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-brand-700 hover:underline"
          >
            <Keyboard size={15} /> Enter the number instead
          </button>
        </div>
      ) : (
        <div>
          {!supported && (
            <p className="mb-3 flex items-start gap-2 rounded-xl bg-amber-50 px-3 py-2.5 text-sm text-amber-800">
              <ScanBarcode size={16} className="mt-0.5 shrink-0" />
              Camera scanning isn’t supported in this browser. Type the barcode number
              printed below the bars.
            </p>
          )}
          <Label htmlFor="upc">Barcode number (UPC/EAN)</Label>
          <div className="flex gap-2">
            <Input
              id="upc"
              inputMode="numeric"
              autoComplete="off"
              placeholder="e.g. 001111041002"
              value={manual}
              onChange={(e) => {
                setManual(e.target.value);
                setError(null);
              }}
              onKeyDown={(e) => e.key === "Enter" && submitManual()}
              autoFocus
            />
            <Button onClick={submitManual}>Look up</Button>
          </div>
          {supported && (
            <button
              onClick={() => {
                setError(null);
                setMode("camera");
              }}
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-brand-700 hover:underline"
            >
              <Camera size={15} /> Use the camera
            </button>
          )}
        </div>
      )}

      {error && (
        <p role="alert" className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
    </Modal>
  );
}
