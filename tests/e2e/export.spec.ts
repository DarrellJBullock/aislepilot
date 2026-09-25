import { readFile } from "node:fs/promises";
import { test, expect } from "@playwright/test";

test("download my data as JSON and CSV from Settings", async ({ page }) => {
  await page.goto("/sign-in");
  await page.getByLabel("Email").fill("demo@aislepilot.app");
  await page.getByLabel("Password").fill("demo123");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/dashboard/);

  await page.goto("/settings");
  await expect(page.getByRole("heading", { name: /Your data/ })).toBeVisible();

  const [json] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: /Download JSON/ }).click(),
  ]);
  expect(json.suggestedFilename()).toMatch(/^aislepilot-export-\d{4}-\d{2}-\d{2}\.json$/);
  const data = JSON.parse(await readFile((await json.path())!, "utf8"));
  expect(data.format).toBe("aislepilot-export");
  expect(data.account.email).toBe("demo@aislepilot.app");
  expect(data.lists.map((l: { name: string }) => l.name)).toContain("Weekly Groceries");

  const [csv] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: /Download CSV/ }).click(),
  ]);
  const text = await readFile((await csv.path())!, "utf8");
  expect(text.startsWith("List,Item,Quantity,Status,Product,Brand,Size,Price,Notes")).toBe(true);
  expect(text).toContain("Weekly Groceries");
});
