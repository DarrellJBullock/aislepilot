// Minimal typings for the native BarcodeDetector API (Chromium/Android).
// https://developer.mozilla.org/en-US/docs/Web/API/BarcodeDetector
interface DetectedBarcode {
  rawValue: string;
  format: string;
  boundingBox: DOMRectReadOnly;
  cornerPoints: ReadonlyArray<{ x: number; y: number }>;
}

interface BarcodeDetectorOptions {
  formats: string[];
}

declare class BarcodeDetector {
  constructor(options?: BarcodeDetectorOptions);
  static getSupportedFormats(): Promise<string[]>;
  detect(source: CanvasImageSource): Promise<DetectedBarcode[]>;
}

interface Window {
  BarcodeDetector?: typeof BarcodeDetector;
}
