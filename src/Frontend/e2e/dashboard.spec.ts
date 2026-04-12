import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test('should redirect from / to /reports and display dashboard', async ({ page }) => {
    await page.goto('/');

    // The router redirects / -> /reports which renders the DashboardPage
    await expect(page).toHaveURL(/\/reports/);
  });

  test('should display the Dashboard page title', async ({ page }) => {
    await page.goto('/reports');

    // The PageHeader renders an h1 with "Dashboard"
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  });

  test('should display KPI cards', async ({ page }) => {
    await page.goto('/reports');

    // Wait for dashboard content to load (skeleton disappears)
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();

    // Verify KPI cards are rendered with expected titles
    await expect(page.getByText('Total Bookings')).toBeVisible();
    await expect(page.getByText('Total Events')).toBeVisible();
    await expect(page.getByText('Total Revenue')).toBeVisible();
    await expect(page.getByText('Recent Activity')).toBeVisible();
  });

  test('should display data tables for recent bookings and upcoming events', async ({ page }) => {
    await page.goto('/reports');

    // Wait for content to load
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();

    // Verify the section headings for the two data tables
    await expect(page.getByRole('heading', { name: 'Recent Bookings' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Upcoming Events' })).toBeVisible();

    // Verify table column headers are rendered
    await expect(page.getByText('Destination')).toBeVisible();
    await expect(page.getByText('Status')).toBeVisible();
  });
});
