import { test, expect } from '@playwright/test';

test.describe('Notification Flow', () => {
  test('should display the notification center page', async ({ page }) => {
    await page.goto('/notifications');

    // Verify the page header
    await expect(page.getByRole('heading', { name: 'Notifications' })).toBeVisible();

    // Verify the description text
    await expect(
      page.getByText(/View and manage all your notifications/i),
    ).toBeVisible();
  });

  test('should display the mark all read button', async ({ page }) => {
    await page.goto('/notifications');

    await expect(
      page.getByRole('button', { name: /Mark all read/i }),
    ).toBeVisible();
  });

  test('should display notification filters', async ({ page }) => {
    await page.goto('/notifications');

    // Verify the Type filter label is present
    await expect(page.getByText('Type')).toBeVisible();

    // Verify the Status filter label is present
    await expect(page.getByText('Status')).toBeVisible();
  });

  test('should display notification table columns', async ({ page }) => {
    await page.goto('/notifications');

    // Verify table column headers are rendered
    await expect(page.getByText('Subject')).toBeVisible();
    await expect(page.getByText('Channel')).toBeVisible();
    await expect(page.getByText('Created')).toBeVisible();
    await expect(page.getByText('Sent')).toBeVisible();
  });

  test('should navigate to notification preferences page', async ({ page }) => {
    await page.goto('/notifications/preferences');

    // Verify the preferences page header
    await expect(
      page.getByRole('heading', { name: 'Notification Preferences' }),
    ).toBeVisible();

    // Verify the description
    await expect(
      page.getByText(/Choose how and when you receive notifications/i),
    ).toBeVisible();
  });

  test('should display preferences form sections', async ({ page }) => {
    await page.goto('/notifications/preferences');

    // Verify the form section headings are present
    await expect(
      page.getByRole('heading', { name: 'Preferred Channel' }),
    ).toBeVisible();

    await expect(
      page.getByRole('heading', { name: 'Email Notifications' }),
    ).toBeVisible();

    await expect(
      page.getByRole('heading', { name: 'SMS Notifications' }),
    ).toBeVisible();

    await expect(
      page.getByRole('heading', { name: 'Push Notifications' }),
    ).toBeVisible();
  });

  test('should display the save preferences button', async ({ page }) => {
    await page.goto('/notifications/preferences');

    // The Save Preferences button should be present
    await expect(
      page.getByRole('button', { name: /Save Preferences/i }),
    ).toBeVisible();
  });

  test('should display notification channel toggles', async ({ page }) => {
    await page.goto('/notifications/preferences');

    // Verify the channel toggle switches are rendered
    await expect(page.getByText(/Enable email notifications/i)).toBeVisible();
    await expect(page.getByText(/Enable SMS notifications/i)).toBeVisible();
    await expect(page.getByText(/Enable push notifications/i)).toBeVisible();
  });
});
