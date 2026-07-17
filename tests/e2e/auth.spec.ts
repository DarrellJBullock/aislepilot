import { test, expect } from "@playwright/test";

test("visitor can sign up and land on the dashboard", async ({ page }) => {
  await page.goto("/sign-up");
  const email = `user${Date.now()}@example.com`;
  await page.getByLabel("Name").fill("Test User");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill("secret1");
  await page.getByRole("button", { name: "Create account" }).click();

  await expect(page).toHaveURL(/\/dashboard/);
  await expect(page.getByRole("heading", { name: /Hi, Test/ })).toBeVisible();
});

test("demo account can sign in", async ({ page }) => {
  await page.goto("/sign-in");
  await page.getByLabel("Email").fill("demo@aislepilot.app");
  await page.getByLabel("Password").fill("demo123");
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page).toHaveURL(/\/dashboard/);
  await expect(page.getByText("Weekly Groceries")).toBeVisible();
});

test("protected route redirects to sign-in", async ({ page }) => {
  await page.goto("/settings");
  await expect(page).toHaveURL(/\/sign-in/);
});
