import { test, expect, type Page } from "@playwright/test";

async function signInDemo(page: Page) {
  await page.goto("/sign-in");
  await page.getByLabel("Email").fill("demo@aislepilot.app");
  await page.getByLabel("Password").fill("demo123");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/dashboard/);
}

test("create a list, pick a store, add items and match a product", async ({ page }) => {
  await signInDemo(page);
  await page.getByRole("link", { name: /New list/ }).click();
  await expect(page).toHaveURL(/\/lists\/new/);

  await page.getByLabel("List name").fill("E2E Trip");
  await page.getByLabel(/Budget/).fill("50");
  // pick the first store
  await page.getByRole("button", { name: /Riverside Commons/ }).click();
  await page.getByRole("button", { name: "Create list" }).click();

  await expect(page.getByRole("heading", { name: "E2E Trip" })).toBeVisible();

  // Quick add
  await page.getByPlaceholder("Add an item, e.g. Milk").fill("Milk");
  await page.getByRole("button", { name: "Add item" }).click();
  await expect(page.getByText("“Milk”").or(page.getByText("Milk"))).toBeVisible();

  // Bulk add
  await page.getByRole("button", { name: /Paste list/ }).click();
  await page.getByLabel("Bulk items").fill("Eggs\nBread");
  await page.getByRole("button", { name: "Add all" }).click();

  // Match a product for the first unmatched item
  await page.getByRole("button", { name: "Match product" }).first().click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("button", { name: "Select" }).first().click();
  await expect(page.getByRole("dialog")).toBeHidden();
});

test("start shopping mode and collect an item, totals update", async ({ page }) => {
  await signInDemo(page);
  await page.getByText("Weekly Groceries").click();
  await expect(page.getByRole("heading", { name: "Weekly Groceries" })).toBeVisible();

  await page.getByRole("link", { name: /Start Shopping Mode/ }).click();
  await expect(page).toHaveURL(/\/shopping/);

  // Header shows "X/Y collected · Z left" — unique to shopping mode.
  const progressText = page.getByText(/collected ·/);
  const before = await progressText.innerText();

  await page.getByRole("button", { name: "Collected" }).first().click();

  await expect(async () => {
    const after = await progressText.innerText();
    expect(after).not.toBe(before);
  }).toPass();
});

test("invite a member to a shared list", async ({ page }) => {
  await signInDemo(page);
  await page.getByText("Weekly Groceries").click();
  await page.getByRole("button", { name: /Share/ }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByLabel("Invite email").fill("friend@example.com");
  await page.getByRole("button", { name: "Invite" }).click();
  await expect(page.getByText("friend@example.com")).toBeVisible();
});
