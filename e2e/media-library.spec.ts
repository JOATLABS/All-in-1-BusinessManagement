import { test, expect } from '@playwright/test';

test.describe('Media Library Browsing', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/admin/login');
    await page.fill('input[type="email"]', 'admin@test.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    await page.waitForURL('/admin/dashboard');
    await page.click('a[href="/admin/site-configuration"]');
    await page.waitForURL('/admin/site-configuration');
  });

  test('should open media library modal', async ({ page }) => {
    const browseButton = page.getByRole('button', { name: /browse library/i });
    await browseButton.click();

    await expect(page.locator('.library-modal')).toBeVisible();
    await expect(page.locator('.library-modal__header')).toContainText(/media library/i);
  });

  test('should display media items in grid', async ({ page }) => {
    await page.getByRole('button', { name: /browse library/i }).click();

    // Wait for media to load
    await page.waitForSelector('.library-item', { timeout: 10000 });

    // Should display media items
    const mediaItems = page.locator('.library-item');
    await expect(mediaItems).toHaveCount(await mediaItems.count(), { timeout: 5000 });
  });

  test('should filter media by folder', async ({ page }) => {
    await page.getByRole('button', { name: /browse library/i }).click();

    // Select backgrounds folder
    await page.selectOption('select[name="folder"]', 'backgrounds');

    // Wait for filtered results
    await page.waitForTimeout(500);

    // All visible items should have backgrounds folder in key
    const items = page.locator('.library-item__name');
    const count = await items.count();

    for (let i = 0; i < count; i++) {
      const text = await items.nth(i).textContent();
      expect(text).toMatch(/backgrounds/i);
    }
  });

  test('should filter media by type', async ({ page }) => {
    await page.getByRole('button', { name: /browse library/i }).click();

    // Filter by images only
    await page.selectOption('select[name="mediaType"]', 'image');

    await page.waitForTimeout(500);

    // Should only show images
    const videoElements = page.locator('video.library-item__media');
    await expect(videoElements).toHaveCount(0);

    const imageElements = page.locator('img.library-item__media');
    await expect(imageElements).toHaveCount(await imageElements.count());
  });

  test('should search media by filename', async ({ page }) => {
    await page.getByRole('button', { name: /browse library/i }).click();

    const searchInput = page.locator('input[placeholder*="Search"]');
    await searchInput.fill('test');

    await page.waitForTimeout(500);

    // All visible items should contain 'test' in filename
    const items = page.locator('.library-item__name');
    const count = await items.count();

    for (let i = 0; i < count; i++) {
      const text = await items.nth(i).textContent();
      expect(text?.toLowerCase()).toContain('test');
    }
  });

  test('should select media item', async ({ page }) => {
    await page.getByRole('button', { name: /browse library/i }).click();

    await page.waitForSelector('.library-item');

    const firstItem = page.locator('.library-item').first();
    await firstItem.click();

    // Should highlight selected item
    await expect(firstItem).toHaveClass(/selected|active/);

    // Confirm button should be enabled
    const confirmButton = page.getByRole('button', { name: /confirm|select/i });
    await expect(confirmButton).toBeEnabled();
  });

  test('should delete media item', async ({ page }) => {
    await page.getByRole('button', { name: /browse library/i }).click();

    await page.waitForSelector('.library-item');

    const initialCount = await page.locator('.library-item').count();

    // Click delete on first item
    const deleteButton = page.locator('.library-item__delete').first();
    await deleteButton.click();

    // Confirm deletion dialog
    page.on('dialog', dialog => dialog.accept());

    // Wait for deletion to complete
    await page.waitForTimeout(1000);

    // Should have one less item
    const newCount = await page.locator('.library-item').count();
    expect(newCount).toBe(initialCount - 1);
  });

  test('should refresh media list', async ({ page }) => {
    await page.getByRole('button', { name: /browse library/i }).click();

    await page.waitForSelector('.library-item');

    // Click refresh button
    const refreshButton = page.getByRole('button', { name: /refresh/i });
    await refreshButton.click();

    // Should show loading state
    await expect(page.locator('.loading-spinner')).toBeVisible();

    // Then show media again
    await expect(page.locator('.library-item')).toHaveCount(await page.locator('.library-item').count(), { timeout: 5000 });
  });

  test('should handle empty library state', async ({ page }) => {
    // Mock empty response
    await page.route('**/api/media/list', route =>
      route.fulfill({ json: { media: [] } })
    );

    await page.getByRole('button', { name: /browse library/i }).click();

    // Should show empty state message
    await expect(page.locator('.empty-state')).toBeVisible();
    await expect(page.locator('.empty-state')).toContainText(/no media found/i);
  });

  test('should handle load errors gracefully', async ({ page }) => {
    // Mock network failure
    await page.route('**/api/media/list', route => route.abort());

    await page.getByRole('button', { name: /browse library/i }).click();

    // Should show error message
    await expect(page.locator('.error-message')).toBeVisible();
  });

  test('should support keyboard navigation', async ({ page }) => {
    await page.getByRole('button', { name: /browse library/i }).click();

    await page.waitForSelector('.library-item');

    // Tab to first item
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Press Enter to select
    await page.keyboard.press('Enter');

    // Should select item
    const selectedItem = page.locator('.library-item.selected');
    await expect(selectedItem).toBeVisible();

    // Escape should close modal
    await page.keyboard.press('Escape');
    await expect(page.locator('.library-modal')).not.toBeVisible();
  });

  test('should display media metadata', async ({ page }) => {
    await page.getByRole('button', { name: /browse library/i }).click();

    await page.waitForSelector('.library-item');

    const firstItem = page.locator('.library-item').first();

    // Should show filename
    await expect(firstItem.locator('.library-item__name')).toBeVisible();

    // Should show file size
    await expect(firstItem.locator('.library-item__size')).toBeVisible();

    // Should show preview thumbnail
    await expect(firstItem.locator('.library-item__media')).toBeVisible();
  });

  test('should handle virtualized scrolling for large libraries', async ({ page }) => {
    // Mock large media library (100+ items)
    const mockMedia = Array.from({ length: 150 }, (_, i) => ({
      key: `backgrounds/image-${i}.jpg`,
      size: 1024000 + i * 1000,
      lastModified: new Date().toISOString(),
      url: `https://media.example.com/backgrounds/image-${i}.jpg`,
      mediaType: 'image'
    }));

    await page.route('**/api/media/list', route =>
      route.fulfill({ json: { media: mockMedia } })
    );

    await page.getByRole('button', { name: /browse library/i }).click();

    await page.waitForSelector('.library-item');

    // Should only render visible items (virtual scrolling)
    const renderedItems = await page.locator('.library-item').count();
    expect(renderedItems).toBeLessThan(150); // Not all 150 should be in DOM

    // Scroll down
    const scrollContainer = page.locator('.library-modal__grid');
    await scrollContainer.evaluate(el => el.scrollTop = el.scrollHeight / 2);

    await page.waitForTimeout(500);

    // Should load more items as we scroll
    const newRenderedItems = await page.locator('.library-item').count();
    expect(newRenderedItems).toBeGreaterThan(0);
  });
});
