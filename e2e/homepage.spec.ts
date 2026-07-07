import { test, expect } from "@playwright/test";

test.describe("BharatOS Homepage", () => {
  test("renders the landing page with heading", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: /what do you need to do/i })
    ).toBeVisible();
  });

  test("shows the search input", async ({ page }) => {
    await page.goto("/");
    const input = page.getByPlaceholder(/start a dairy business/i);
    await expect(input).toBeVisible();
  });

  test("shows category sections", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Starting something")).toBeVisible();
    await expect(page.getByText("Need a document")).toBeVisible();
    await expect(page.getByText("Report an issue")).toBeVisible();
    await expect(page.getByText("Life events")).toBeVisible();
  });

  test("shows action buttons in categories", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Open a shop")).toBeVisible();
    await expect(page.getByText("Passport")).toBeVisible();
    await expect(page.getByText("Road damage")).toBeVisible();
    await expect(page.getByText("Getting married")).toBeVisible();
  });

  test("clicking a card starts conversation mode", async ({ page }) => {
    await page.goto("/");
    await page.getByText("Open a shop").click();
    await expect(page.getByPlaceholder("Ask anything...")).toBeVisible();
  });

  test("typing and pressing enter starts conversation", async ({ page }) => {
    await page.goto("/");
    const input = page.getByPlaceholder(/start a dairy business/i);
    await input.fill("I want to start a farm");
    await page.keyboard.press("Enter");
    await expect(page.getByPlaceholder("Ask anything...")).toBeVisible();
  });

  test("navigation bar links are visible", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: /dashboard/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /documents/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /cases/i })).toBeVisible();
  });

  test("dashboard page loads", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(
      page.getByRole("heading", { name: /dashboard/i })
    ).toBeVisible();
  });

  test("documents page loads", async ({ page }) => {
    await page.goto("/documents");
    await expect(
      page.getByRole("heading", { name: /documents/i })
    ).toBeVisible();
  });

  test("cases page loads", async ({ page }) => {
    await page.goto("/cases");
    await expect(
      page.getByRole("heading", { name: /civic cases/i })
    ).toBeVisible();
  });
});
