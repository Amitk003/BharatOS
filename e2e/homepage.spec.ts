import { test, expect } from "@playwright/test";

test.describe("BharatOS Homepage", () => {
  test("renders the landing page with correct title", async ({ page }) => {
    await page.goto("/");

    const heading = page.getByRole("heading", {
      name: /your ai civic companion/i,
    });
    await expect(heading).toBeVisible();
  });

  test("shows quick action cards", async ({ page }) => {
    await page.goto("/");

    const businessCard = page.getByText("Start a Business");
    const passportCard = page.getByText("Apply for Passport");
    const schemesCard = page.getByText("Find Government Schemes");
    const reportCard = page.getByText("Report an Issue");

    await expect(businessCard).toBeVisible();
    await expect(passportCard).toBeVisible();
    await expect(schemesCard).toBeVisible();
    await expect(reportCard).toBeVisible();
  });

  test("shows chat input bar", async ({ page }) => {
    await page.goto("/");

    const input = page.getByPlaceholder(
      /what do you want to achieve/i
    );
    await expect(input).toBeVisible();
  });

  test("shows navigation bar with all links", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("link", { name: /home/i })).toBeVisible();
    await expect(
      page.getByRole("link", { name: /dashboard/i })
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /journeys/i })
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /documents/i })
    ).toBeVisible();
    await expect(page.getByRole("link", { name: /cases/i })).toBeVisible();
  });

  test("navigates to dashboard when clicking a quick action", async ({
    page,
  }) => {
    await page.goto("/");

    await page.getByText("Start a Business").click();
    await page.waitForURL("**/dashboard");
    await expect(page.getByRole("heading", { name: /dashboard/i })).toBeVisible();
  });

  test("dashboard page loads with all sections", async ({ page }) => {
    await page.goto("/dashboard");

    await expect(
      page.getByRole("heading", { name: /dashboard/i })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /your journeys/i })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /available benefits/i })
    ).toBeVisible();
  });

  test("documents page loads with upload form", async ({ page }) => {
    await page.goto("/documents");

    await expect(
      page.getByRole("heading", { name: /documents/i })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /upload document/i })
    ).toBeVisible();
  });

  test("cases page loads and shows report issue button", async ({
    page,
  }) => {
    await page.goto("/cases");

    await expect(
      page.getByRole("heading", { name: /civic cases/i })
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /report issue/i })
    ).toBeVisible();
  });
});
