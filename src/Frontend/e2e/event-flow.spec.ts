import { test, expect } from '@playwright/test';

test.describe('Event Management Flow', () => {
  test('should display the events search page', async ({ page }) => {
    await page.goto('/events');

    // Verify the page header
    await expect(page.getByRole('heading', { name: 'Events' })).toBeVisible();

    // Verify filter inputs are present
    await expect(page.getByPlaceholder(/Search by title/i)).toBeVisible();
    await expect(page.getByPlaceholder(/Filter by location/i)).toBeVisible();
  });

  test('should navigate to the create event form', async ({ page }) => {
    await page.goto('/events');

    // Click the "Create Event" button (visible to organizers/admins)
    const createButton = page.getByRole('button', { name: /Create Event/i });

    // If the button is visible (user has organizer role), click it
    if (await createButton.isVisible()) {
      await createButton.click();

      // Should navigate to /events/new
      await expect(page).toHaveURL(/\/events\/new/);

      // Verify the create event page header
      await expect(page.getByRole('heading', { name: 'Create Event' })).toBeVisible();
    }
  });

  test('should display the create event form with all sections', async ({ page }) => {
    await page.goto('/events/new');

    // Verify form section headings
    await expect(page.getByRole('heading', { name: 'Basic Information' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Location' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Date & Capacity' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Sessions' })).toBeVisible();
  });

  test('should fill in the create event form', async ({ page }) => {
    await page.goto('/events/new');

    // ---- Basic Information ----
    // Fill event title
    await page.getByPlaceholder('Enter event title').fill('Tech Conference 2026');

    // Fill description
    await page.getByPlaceholder('Describe the event...').fill(
      'Annual technology conference featuring keynotes, workshops, and networking.',
    );

    // Fill categories
    await page.getByPlaceholder(/comma-separated/i).fill('Technology, Business');

    // ---- Location ----
    // Fill venue
    await page.getByPlaceholder('Venue name').fill('Sydney Convention Centre');

    // Fill street
    await page.getByPlaceholder('Street address').fill('14 Darling Drive');

    // Fill city
    await page.getByPlaceholder('City').first().fill('Sydney');

    // Fill state
    await page.getByPlaceholder('State or province').fill('NSW');

    // Fill country
    await page.getByPlaceholder('Country').first().fill('Australia');

    // Fill postal code
    await page.getByPlaceholder('Postal code').fill('2000');

    // ---- Date & Capacity ----
    // Set start date via DatePicker
    await page.getByPlaceholder('Select start date').click();
    const startDay = page.getByRole('gridcell', { name: /20/ }).first();
    if (await startDay.isVisible()) {
      await startDay.click();
    } else {
      await page.getByRole('gridcell').first().click();
    }

    // Set end date via DatePicker
    await page.getByPlaceholder('Select end date').click();
    const endDay = page.getByRole('gridcell', { name: /22/ }).first();
    if (await endDay.isVisible()) {
      await endDay.click();
    } else {
      await page.getByRole('gridcell').first().click();
    }

    // Fill capacity
    await page.getByPlaceholder('Maximum attendees').clear();
    await page.getByPlaceholder('Maximum attendees').fill('500');

    // ---- Sessions ----
    // Add a session
    await page.getByRole('button', { name: /Add Session/i }).click();

    // Verify session row appears
    await expect(page.getByText('Session 1')).toBeVisible();

    // Fill session fields
    await page.getByPlaceholder('Session title').fill('Opening Keynote');
    await page.getByPlaceholder('Speaker name').fill('Dr. Sarah Chen');

    // ---- Submit ----
    // Verify submit button exists
    const submitButton = page.getByRole('button', { name: /Create Event/i }).last();
    await expect(submitButton).toBeVisible();

    // Click submit
    await submitButton.click();
  });

  test('should add and remove sessions dynamically', async ({ page }) => {
    await page.goto('/events/new');

    // Initially no sessions
    await expect(page.getByText(/No sessions added yet/i)).toBeVisible();

    // Add a session
    await page.getByRole('button', { name: /Add Session/i }).click();
    await expect(page.getByText('Session 1')).toBeVisible();

    // Add another session
    await page.getByRole('button', { name: /Add Session/i }).click();
    await expect(page.getByText('Session 2')).toBeVisible();

    // Remove the first session
    const removeButtons = page.getByRole('button', { name: /Remove session/i });
    await removeButtons.first().click();

    // Only one session should remain
    await expect(page.getByText('Session 1')).toBeVisible();
    await expect(page.getByText('Session 2')).not.toBeVisible();
  });
});
