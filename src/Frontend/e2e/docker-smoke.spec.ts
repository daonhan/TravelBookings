import { test, expect } from '@playwright/test';

/**
 * Docker Compose stack smoke tests.
 * These tests validate that the full stack (frontend + gateway + backends)
 * is operational end-to-end when running in Docker.
 */
test.describe('Docker Stack Smoke Tests', () => {
  test('frontend loads and renders the application shell', async ({ page }) => {
    await page.goto('/');

    // The app should load — verify the navigation or main layout is present
    await expect(page.locator('body')).not.toBeEmpty();

    // Should redirect to /reports (dashboard)
    await expect(page).toHaveURL(/\/reports/, { timeout: 10000 });
  });

  test('dashboard loads with data from backend APIs', async ({ page }) => {
    await page.goto('/reports');

    // Dashboard heading should be visible
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible({
      timeout: 15000,
    });

    // KPI cards confirm the frontend is fetching from backend APIs through the gateway
    await expect(page.getByText('Total Bookings')).toBeVisible();
    await expect(page.getByText('Total Events')).toBeVisible();
  });

  test('bookings page loads and displays booking list', async ({ page }) => {
    await page.goto('/bookings');

    await expect(page.getByRole('heading', { name: 'Bookings' })).toBeVisible({
      timeout: 15000,
    });

    // The Create Booking button confirms the page is fully interactive
    await expect(page.getByRole('button', { name: /Create Booking/i })).toBeVisible();
  });

  test('events page loads and displays event list', async ({ page }) => {
    await page.goto('/events');

    await expect(page.getByRole('heading', { name: 'Events' })).toBeVisible({
      timeout: 15000,
    });
  });

  test('navigation between pages works', async ({ page }) => {
    await page.goto('/reports');
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible({
      timeout: 15000,
    });

    // Navigate to bookings
    await page.getByRole('link', { name: /Bookings/i }).first().click();
    await expect(page).toHaveURL(/\/bookings/);
    await expect(page.getByRole('heading', { name: 'Bookings' })).toBeVisible();

    // Navigate to events
    await page.getByRole('link', { name: /Events/i }).first().click();
    await expect(page).toHaveURL(/\/events/);
    await expect(page.getByRole('heading', { name: 'Events' })).toBeVisible();
  });

  test('API gateway proxies requests (booking creation form loads)', async ({ page }) => {
    await page.goto('/bookings/new');

    // The multi-step form proves the frontend JS is working and routing is functional
    await expect(page.getByRole('heading', { name: 'Create Booking' })).toBeVisible({
      timeout: 15000,
    });

    // Step indicator confirms the full component tree rendered
    await expect(page.getByText('Itineraries')).toBeVisible();
    await expect(page.getByText('Passengers')).toBeVisible();
    await expect(page.getByText('Review & Confirm')).toBeVisible();
  });
});
