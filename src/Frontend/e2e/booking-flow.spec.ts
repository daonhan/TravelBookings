import { test, expect } from '@playwright/test';

test.describe('Booking Creation Flow', () => {
  test('should navigate to bookings page and see the search listing', async ({ page }) => {
    await page.goto('/bookings');

    // Verify page header
    await expect(page.getByRole('heading', { name: 'Bookings' })).toBeVisible();

    // Verify the "Create Booking" button is visible
    await expect(page.getByRole('button', { name: /Create Booking/i })).toBeVisible();
  });

  test('should navigate to the create booking form', async ({ page }) => {
    await page.goto('/bookings');

    // Click the Create Booking button
    await page.getByRole('button', { name: /Create Booking/i }).click();

    // Should navigate to /bookings/new
    await expect(page).toHaveURL(/\/bookings\/new/);

    // Verify the multi-step form page header
    await expect(page.getByRole('heading', { name: 'Create Booking' })).toBeVisible();
  });

  test('should display the multi-step form with step indicator', async ({ page }) => {
    await page.goto('/bookings/new');

    // Verify the step indicator navigation is visible
    await expect(page.getByRole('navigation', { name: 'Form steps' })).toBeVisible();

    // Verify step labels are shown
    await expect(page.getByText('Itineraries')).toBeVisible();
    await expect(page.getByText('Passengers')).toBeVisible();
    await expect(page.getByText('Review & Confirm')).toBeVisible();
  });

  test('should complete the full booking creation flow', async ({ page }) => {
    await page.goto('/bookings/new');

    // ---- Step 1: Itineraries ----
    // Verify we are on step 1 by seeing the itinerary form fields
    await expect(page.getByText('Leg 1')).toBeVisible();

    // Fill in origin
    await page.getByLabel('Origin').fill('SYD');

    // Fill in destination
    await page.getByLabel('Destination').fill('LAX');

    // The Travel Class select defaults to "Economy" so we leave it as-is

    // Fill departure date using the DatePicker trigger
    // The DatePicker is a popover triggered by a button labeled "Departure Date"
    await page.getByLabel('Departure Date').click();
    // Select a day from the calendar grid - pick the 15th if visible
    const dayButton = page.getByRole('gridcell', { name: /15/ }).first();
    if (await dayButton.isVisible()) {
      await dayButton.click();
    } else {
      // Fallback: click any available day
      await page.getByRole('gridcell').first().click();
    }

    // Click Next to go to Step 2
    await page.getByRole('button', { name: /Next/i }).click();

    // ---- Step 2: Passengers ----
    // Wait for passenger form to appear
    await expect(page.getByText('Passenger 1')).toBeVisible();

    // Fill first name
    await page.getByLabel('First Name').fill('Jane');

    // Fill last name
    await page.getByLabel('Last Name').fill('Doe');

    // Fill passport number
    await page.getByLabel('Passport Number').fill('AB1234567');

    // Fill date of birth using the DatePicker
    await page.getByLabel('Date of Birth').click();
    // Navigate to a past month for DOB - just pick a visible day
    const dobDay = page.getByRole('gridcell', { name: /10/ }).first();
    if (await dobDay.isVisible()) {
      await dobDay.click();
    } else {
      await page.getByRole('gridcell').first().click();
    }

    // Click Next to go to Step 3
    await page.getByRole('button', { name: /Next/i }).click();

    // ---- Step 3: Review & Confirm ----
    // Verify review section headings
    await expect(page.getByRole('heading', { name: 'Itineraries' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Passengers' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Pricing' })).toBeVisible();

    // Verify the entered data is shown in the review summary
    await expect(page.getByText('SYD')).toBeVisible();
    await expect(page.getByText('LAX')).toBeVisible();
    await expect(page.getByText('Jane')).toBeVisible();
    await expect(page.getByText('Doe')).toBeVisible();
    await expect(page.getByText('AB1234567')).toBeVisible();

    // Fill total amount in the pricing section
    await page.getByLabel('Total Amount').fill('1250.00');

    // Verify submit button is present
    await expect(page.getByRole('button', { name: /Submit Booking/i })).toBeVisible();

    // Click submit
    await page.getByRole('button', { name: /Submit Booking/i }).click();
  });

  test('should allow navigating back between steps', async ({ page }) => {
    await page.goto('/bookings/new');

    // Fill required fields in step 1 so we can advance
    await page.getByLabel('Origin').fill('MEL');
    await page.getByLabel('Destination').fill('NRT');

    // Open departure date picker and select a day
    await page.getByLabel('Departure Date').click();
    await page.getByRole('gridcell', { name: /20/ }).first().click();

    // Go to step 2
    await page.getByRole('button', { name: /Next/i }).click();
    await expect(page.getByText('Passenger 1')).toBeVisible();

    // Go back to step 1
    await page.getByRole('button', { name: /Back/i }).click();
    await expect(page.getByText('Leg 1')).toBeVisible();

    // Verify the previously entered data is preserved
    await expect(page.getByLabel('Origin')).toHaveValue('MEL');
    await expect(page.getByLabel('Destination')).toHaveValue('NRT');
  });
});
