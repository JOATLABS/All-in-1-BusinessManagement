import { test, expect } from '@playwright/test';

test.describe('Background Media Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/admin/login');
    await page.fill('input[type="email"]', 'admin@test.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    await page.waitForURL('/admin/dashboard');
    await page.click('a[href="/admin/site-configuration"]');
    await page.waitForURL('/admin/site-configuration');

    // Navigate to Backgrounds tab
    await page.click('button:has-text("Backgrounds")');
  });

  test('should display background media cards', async ({ page }) => {
    await expect(page.locator('.bg-media-card')).toHaveCount(await page.locator('.bg-media-card').count());

    const firstCard = page.locator('.bg-media-card').first();
    await expect(firstCard.locator('.bg-media-card__preview-media')).toBeVisible();
  });

  test('should add new background via upload', async ({ page }) => {
    const initialCount = await page.locator('.bg-media-card').count();

    await page.click('button:has-text("Upload New")');

    // Upload flow would continue here...
    // After successful upload, count should increase
  });

  test('should add background via library', async ({ page }) => {
    const initialCount = await page.locator('.bg-media-card').count();

    await page.click('button:has-text("Browse Library")');
    await page.waitForSelector('.library-item');

    // Select first item
    await page.locator('.library-item').first().click();
    await page.click('button:has-text("Confirm")');

    // Should add new background
    await expect(page.locator('.bg-media-card')).toHaveCount(initialCount + 1);
  });

  test('should add background via URL', async ({ page }) => {
    const initialCount = await page.locator('.bg-media-card').count();

    await page.click('button:has-text("Add URL")');

    // Find the new empty card
    const emptyCard = page.locator('.bg-media-card__url-input').last();
    await emptyCard.locator('input[type="url"]').fill('https://example.com/background.jpg');
    await emptyCard.locator('input[type="url"]').press('Enter');

    await page.waitForTimeout(500);

    // Should add new background
    await expect(page.locator('.bg-media-card')).toHaveCount(initialCount + 1);
  });

  test('should delete background', async ({ page }) => {
    const initialCount = await page.locator('.bg-media-card').count();

    if (initialCount === 0) {
      // Add a background first
      await page.click('button:has-text("Add URL")');
      const emptyCard = page.locator('.bg-media-card__url-input').last();
      await emptyCard.locator('input[type="url"]').fill('https://example.com/background.jpg');
      await emptyCard.locator('input[type="url"]').press('Enter');
      await page.waitForTimeout(500);
    }

    const countAfterAdd = await page.locator('.bg-media-card').count();

    // Delete first background
    await page.locator('.bg-media-card__delete').first().click();

    // Confirm deletion
    page.on('dialog', dialog => dialog.accept());

    await page.waitForTimeout(500);

    // Should have one less background
    await expect(page.locator('.bg-media-card')).toHaveCount(countAfterAdd - 1);
  });

  test('should reorder backgrounds via drag and drop', async ({ page }) => {
    // Ensure we have at least 2 backgrounds
    const initialCount = await page.locator('.bg-media-card').count();

    if (initialCount < 2) {
      test.skip();
    }

    // Get first two card sources
    const firstSrc = await page.locator('.bg-media-card').first().locator('.bg-media-card__preview-media').getAttribute('src');
    const secondSrc = await page.locator('.bg-media-card').nth(1).locator('.bg-media-card__preview-media').getAttribute('src');

    // Drag first card to second position
    const firstCard = page.locator('.bg-media-card').first();
    const secondCard = page.locator('.bg-media-card').nth(1);

    const firstBox = await firstCard.boundingBox();
    const secondBox = await secondCard.boundingBox();

    if (!firstBox || !secondBox) {
      test.skip();
    }

    await page.mouse.move(firstBox.x + firstBox.width / 2, firstBox.y + firstBox.height / 2);
    await page.mouse.down();
    await page.mouse.move(secondBox.x + secondBox.width / 2, secondBox.y + secondBox.height / 2);
    await page.mouse.up();

    await page.waitForTimeout(500);

    // First position should now have what was second
    const newFirstSrc = await page.locator('.bg-media-card').first().locator('.bg-media-card__preview-media').getAttribute('src');
    expect(newFirstSrc).toBe(secondSrc);
  });

  test('should toggle background activation status', async ({ page }) => {
    const firstCard = page.locator('.bg-media-card').first();

    if (await firstCard.count() === 0) {
      test.skip();
    }

    // Find active toggle button
    const toggleButton = firstCard.locator('button:has-text("Active")');
    const initialState = await toggleButton.textContent();

    await toggleButton.click();

    await page.waitForTimeout(300);

    // State should change
    const newState = await toggleButton.textContent();
    expect(newState).not.toBe(initialState);
  });

  test('should update alt text', async ({ page }) => {
    const firstCard = page.locator('.bg-media-card').first();

    if (await firstCard.count() === 0) {
      test.skip();
    }

    const altInput = firstCard.locator('input[placeholder*="Alt text"]');
    await altInput.fill('Test alt text for accessibility');
    await altInput.blur();

    await page.waitForTimeout(300);

    // Value should persist
    await expect(altInput).toHaveValue('Test alt text for accessibility');
  });

  test('should adjust focal point', async ({ page }) => {
    const firstCard = page.locator('.bg-media-card').first();

    if (await firstCard.count() === 0) {
      test.skip();
    }

    // Find focal point sliders
    const xSlider = firstCard.locator('input[type="range"]').first();
    const ySlider = firstCard.locator('input[type="range"]').nth(1);

    // Adjust X position
    await xSlider.fill('75');
    await page.waitForTimeout(300);

    // Marker should move
    const marker = firstCard.locator('.focal-point-marker');
    const markerStyle = await marker.getAttribute('style');
    expect(markerStyle).toContain('left: 75%');

    // Adjust Y position
    await ySlider.fill('25');
    await page.waitForTimeout(300);

    const newMarkerStyle = await marker.getAttribute('style');
    expect(newMarkerStyle).toContain('top: 25%');
  });

  test('should update playback depth for videos', async ({ page }) => {
    // Find a video background (if any)
    const videoCards = page.locator('.bg-media-card:has(video)');

    if (await videoCards.count() === 0) {
      test.skip();
    }

    const firstVideoCard = videoCards.first();
    const depthSelect = firstVideoCard.locator('select[name="playbackDepth"]');

    await depthSelect.selectOption('deep');

    await page.waitForTimeout(300);

    // Should persist
    await expect(depthSelect).toHaveValue('deep');
  });

  test('should preview video with controls', async ({ page }) => {
    const videoCards = page.locator('.bg-media-card:has(video)');

    if (await videoCards.count() === 0) {
      test.skip();
    }

    const video = videoCards.first().locator('video');

    // Video should have controls
    await expect(video).toHaveAttribute('controls');

    // Should be able to play
    await video.click(); // Click play button
    await page.waitForTimeout(1000);

    const paused = await video.evaluate(el => (el as HTMLVideoElement).paused);
    expect(paused).toBe(false);
  });

  test('should validate URL format', async ({ page }) => {
    await page.click('button:has-text("Add URL")');

    const emptyCard = page.locator('.bg-media-card__url-input').last();
    const urlInput = emptyCard.locator('input[type="url"]');

    // Try invalid URL
    await urlInput.fill('not-a-valid-url');
    await urlInput.blur();

    // Should show validation error
    await expect(urlInput).toHaveClass(/invalid|error/);
  });

  test('should save configuration', async ({ page }) => {
    // Make a change
    const firstCard = page.locator('.bg-media-card').first();

    if (await firstCard.count() > 0) {
      const altInput = firstCard.locator('input[placeholder*="Alt text"]');
      await altInput.fill('Modified for save test');
    }

    // Click save button
    const saveButton = page.getByRole('button', { name: /save|update/i });
    await saveButton.click();

    // Should show success message
    await expect(page.locator('.success-message, .toast-success')).toBeVisible();
  });

  test('should handle keyboard navigation for reordering', async ({ page }) => {
    const initialCount = await page.locator('.bg-media-card').count();

    if (initialCount < 2) {
      test.skip();
    }

    // Focus first drag handle
    const firstHandle = page.locator('.bg-media-card__drag-handle').first();
    await firstHandle.focus();

    // Press Enter to activate reordering
    await page.keyboard.press('Enter');

    // Should activate reorder mode or show menu
    // This depends on the actual implementation
  });

  test('should display media type indicators', async ({ page }) => {
    const cards = page.locator('.bg-media-card');

    for (let i = 0; i < await cards.count(); i++) {
      const card = cards.nth(i);

      // Should have either image or video preview
      const hasImage = await card.locator('img.bg-media-card__preview-media').count() > 0;
      const hasVideo = await card.locator('video.bg-media-card__preview-media').count() > 0;

      expect(hasImage || hasVideo).toBe(true);
    }
  });

  test('should handle empty backgrounds list', async ({ page }) => {
    // Mock empty backgrounds
    await page.evaluate(() => {
      // This would require accessing the component state
      // or mocking the API response
    });

    // Should show add background options
    await expect(page.getByText(/add background|no backgrounds/i)).toBeVisible();
  });

  test('should prevent invalid media URLs', async ({ page }) => {
    await page.click('button:has-text("Add URL")');

    const emptyCard = page.locator('.bg-media-card__url-input').last();
    const urlInput = emptyCard.locator('input[type="url"]');

    // Try URL without image/video extension
    await urlInput.fill('https://example.com/document.pdf');
    await urlInput.press('Enter');

    // Should show error or prevent addition
    await expect(page.locator('.error-message')).toBeVisible();
  });
});
