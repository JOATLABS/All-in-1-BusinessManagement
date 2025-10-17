import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Media Upload Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/admin/login');
    await page.fill('input[type="email"]', 'admin@test.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Wait for redirect to admin dashboard
    await page.waitForURL('/admin/dashboard');

    // Navigate to site configuration
    await page.click('a[href="/admin/site-configuration"]');
    await page.waitForURL('/admin/site-configuration');
  });

  test('should open upload modal and display file input', async ({ page }) => {
    // Find and click upload button
    const uploadButton = page.getByRole('button', { name: /upload new/i });
    await uploadButton.click();

    // Verify modal opened
    await expect(page.locator('.upload-modal-mobile')).toBeVisible();

    // Verify drag-drop zone visible
    await expect(page.locator('.upload-modal-mobile__dropzone')).toBeVisible();
  });

  test('should upload an image successfully', async ({ page }) => {
    // Open upload modal
    await page.getByRole('button', { name: /upload new/i }).click();

    // Create a test image file
    const filePath = path.join(__dirname, 'fixtures', 'test-image.jpg');

    // Upload file via file input
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(filePath);

    // Select folder
    await page.selectOption('select[name="folder"]', 'backgrounds');

    // Confirm upload
    await page.click('button:has-text("Confirm")');

    // Wait for success message or modal close
    await expect(page.locator('.upload-modal-mobile')).not.toBeVisible({ timeout: 10000 });

    // Verify image appears in background list
    await expect(page.locator('.bg-media-card__preview-media')).toHaveCount(1, { timeout: 5000 });
  });

  test('should validate file type', async ({ page }) => {
    await page.getByRole('button', { name: /upload new/i }).click();

    // Try uploading invalid file type (e.g., .txt)
    const filePath = path.join(__dirname, 'fixtures', 'test-file.txt');
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(filePath);

    // Should show error message
    await expect(page.locator('.upload-modal-mobile__error')).toBeVisible();
    await expect(page.locator('.upload-modal-mobile__error')).toContainText(/invalid file type/i);
  });

  test('should handle upload errors gracefully', async ({ page }) => {
    // Mock network failure
    await page.route('**/api/media/upload', route => route.abort());

    await page.getByRole('button', { name: /upload new/i }).click();

    const filePath = path.join(__dirname, 'fixtures', 'test-image.jpg');
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(filePath);

    await page.selectOption('select[name="folder"]', 'backgrounds');
    await page.click('button:has-text("Confirm")');

    // Should display error message
    await expect(page.locator('.upload-modal-mobile__error')).toBeVisible();
  });

  test('should support drag and drop upload', async ({ page }) => {
    await page.getByRole('button', { name: /upload new/i }).click();

    const dropzone = page.locator('.upload-modal-mobile__dropzone');

    // Read file as buffer
    const filePath = path.join(__dirname, 'fixtures', 'test-image.jpg');
    const buffer = require('fs').readFileSync(filePath);

    // Create DataTransfer and File
    const dataTransfer = await page.evaluateHandle((data) => {
      const dt = new DataTransfer();
      const file = new File([new Uint8Array(data)], 'test-image.jpg', { type: 'image/jpeg' });
      dt.items.add(file);
      return dt;
    }, Array.from(buffer));

    // Dispatch drop event
    await dropzone.dispatchEvent('drop', { dataTransfer });

    // Verify file was added
    await expect(page.locator('.upload-modal-mobile__preview')).toBeVisible();
  });

  test('should show upload progress', async ({ page }) => {
    await page.getByRole('button', { name: /upload new/i }).click();

    const filePath = path.join(__dirname, 'fixtures', 'test-image.jpg');
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(filePath);

    await page.selectOption('select[name="folder"]', 'backgrounds');

    // Slow down network to see progress
    await page.route('**/api/media/upload', route => {
      setTimeout(() => route.continue(), 2000);
    });

    await page.click('button:has-text("Confirm")');

    // Should show progress bar
    await expect(page.locator('.upload-modal-mobile__progress')).toBeVisible();
  });
});
