// Generate PWA icons by rendering the AislePilot logo with headless Chromium
// (already installed for Playwright). Run: node scripts/generate-icons.mjs
import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const outDir = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "icons");

// Rounded cart-with-checkmark mark on a brand-green field.
function svg({ size, padding, radius }) {
  const inner = size - padding * 2;
  return `
  <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <rect width="${size}" height="${size}" rx="${radius}" fill="#0c9152"/>
    <g transform="translate(${padding} ${padding})">
      <svg width="${inner}" height="${inner}" viewBox="0 0 24 24" fill="none"
           stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 5h2l2.4 11.2a1 1 0 0 0 1 .8h8.2a1 1 0 0 0 1-.78L21 8H6" />
        <path d="m11 12 2 2 4-4" />
      </svg>
    </g>
  </svg>`;
}

const icons = [
  { file: "icon-192.png", size: 192, padding: 42, radius: 40 },
  { file: "icon-512.png", size: 512, padding: 112, radius: 108 },
  // maskable: full-bleed background, extra safe-zone padding
  { file: "icon-maskable-512.png", size: 512, padding: 140, radius: 0 },
  { file: "apple-icon-180.png", size: 180, padding: 34, radius: 0 },
];

const browser = await chromium.launch();
const page = await browser.newPage();
await mkdir(outDir, { recursive: true });

for (const icon of icons) {
  const markup = svg(icon);
  await page.setViewportSize({ width: icon.size, height: icon.size });
  await page.setContent(
    `<!doctype html><html><body style="margin:0">${markup}</body></html>`,
  );
  await page.locator("svg").first().screenshot({ path: join(outDir, icon.file) });
  console.log("wrote", icon.file);
}

await browser.close();
