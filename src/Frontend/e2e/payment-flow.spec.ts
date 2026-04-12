import { test, expect } from '@playwright/test';

test.describe('Payment Flow', () => {
  test('should display the payment history page', async ({ page }) => {
    await page.goto('/payments');

    // Verify the page header
    await expect(page.getByRole('heading', { name: 'Payments' })).toBeVisible();
  });

  test('should display payment table column headers', async ({ page }) => {
    await page.goto('/payments');

    // Verify all expected column headers are visible
    await expect(page.getByText('Payment ID')).toBeVisible();
    await expect(page.getByText('Booking')).toBeVisible();
    await expect(page.getByText('Amount')).toBeVisible();
    await expect(page.getByText('Method')).toBeVisible();
    await expect(page.getByText('Status')).toBeVisible();
    await expect(page.getByText('Gateway Txn ID')).toBeVisible();
    await expect(page.getByText('Created')).toBeVisible();
    await expect(page.getByText('Processed')).toBeVisible();
  });

  test('should display payment filters', async ({ page }) => {
    await page.goto('/payments');

    // Verify the status filter dropdown placeholder is present
    await expect(page.getByText(/All statuses/i)).toBeVisible();

    // Verify date range pickers are present
    await expect(page.getByPlaceholder(/From date/i)).toBeVisible();
    await expect(page.getByPlaceholder(/To date/i)).toBeVisible();
  });

  test('should display breadcrumb navigation', async ({ page }) => {
    await page.goto('/payments');

    // Verify breadcrumbs
    await expect(page.getByText('Home')).toBeVisible();
    await expect(page.getByText('Payments')).toBeVisible();
  });

  test('should show empty state or payment data', async ({ page }) => {
    await page.goto('/payments');

    // Wait for loading to finish - either data rows or empty message will appear
    const heading = page.getByRole('heading', { name: 'Payments' });
    await expect(heading).toBeVisible();

    // After loading, either the table has data rows or shows the empty message
    // We just verify the page renders without errors by checking the table structure exists
    const table = page.locator('table');
    const emptyMessage = page.getByText(/No payments found/i);

    // One of these should be visible
    await expect(table.or(emptyMessage)).toBeVisible();
  });
});
