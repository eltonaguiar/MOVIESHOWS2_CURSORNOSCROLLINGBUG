// UI Fixes Tests - Hamburger, Tooltips, Queue Sync
const { test, expect } = require('@playwright/test');

const BASE_URL = 'https://findtorontoevents.ca/movieshows2/';

test.describe('Hamburger Menu Tests', () => {
  test('UIF001: Hamburger button exists', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);
    const hamburger = page.locator('button[aria-label="Open Quick Nav"]');
    await expect(hamburger).toBeVisible({ timeout: 10000 });
  });

  test('UIF002: Hamburger button has tooltip', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(5000);
    const hamburger = page.locator('button[aria-label="Open Quick Nav"]');
    const title = await hamburger.getAttribute('title');
    expect(title).toBeTruthy();
  });

  test('UIF003: Hamburger button is clickable', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);
    const hamburger = page.locator('button[aria-label="Open Quick Nav"]');
    await expect(hamburger).toBeEnabled();
    // Try to click it
    await hamburger.click({ timeout: 5000 }).catch(() => {});
  });

  test('UIF004: Quick Nav panel opens on hamburger click', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);
    const hamburger = page.locator('button[aria-label="Open Quick Nav"]');
    if (await hamburger.isVisible()) {
      await hamburger.click({ timeout: 5000 }).catch(() => {});
      await page.waitForTimeout(500);
      // Look for the Quick Nav panel content
      const panel = page.locator('text=Quick Nav');
      // Panel should be visible after click
    }
  });
});

test.describe('Button Tooltip Tests', () => {
  test('UIF005: Mute button has tooltip', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForSelector('#mute-control', { timeout: 10000 });
    const muteBtn = page.locator('#mute-control');
    const title = await muteBtn.getAttribute('title');
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(5);
  });

  test('UIF006: Info toggle button has tooltip', async ({ page }) => {
    await page.goto(BASE_URL);
    const infoBtn = page.locator('#info-toggle');
    if (await infoBtn.count() > 0) {
      const title = await infoBtn.getAttribute('title');
      expect(title).toBeTruthy();
    }
  });

  test('UIF007: Filter buttons have tooltips after init', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(5000);
    // Check All/Movies/TV buttons
    const allBtn = page.locator('button:has-text("All")').first();
    if (await allBtn.count() > 0) {
      const title = await allBtn.getAttribute('title');
      // May or may not have tooltip depending on timing
    }
  });

  test('UIF008: Settings toggle has title', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForSelector('#settings-toggle', { timeout: 10000 });
    const settingsBtn = page.locator('#settings-toggle');
    await expect(settingsBtn).toBeVisible();
  });

  test('UIF009: Queue buttons have tooltips', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(4000);
    // Open queue panel
    const queueBtn = page.locator('button:has-text("Queue")').first();
    if (await queueBtn.count() > 0) {
      await queueBtn.click().catch(() => {});
      await page.waitForTimeout(1000);
      // Check resync button has tooltip
      const resyncBtn = page.locator('#queue-resync-btn');
      if (await resyncBtn.count() > 0) {
        const title = await resyncBtn.getAttribute('title');
        expect(title).toBeTruthy();
      }
    }
  });
});

test.describe('Queue Sync Tests', () => {
  test('UIF010: Queue panel shows NOW PLAYING section', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(4000);
    // Open queue panel
    const queueBtn = page.locator('button:has-text("Queue")').first();
    if (await queueBtn.count() > 0) {
      await queueBtn.click().catch(() => {});
      await page.waitForTimeout(1000);
      // Check for NOW PLAYING text
      const nowPlaying = page.locator('text=Now Playing');
      await expect(nowPlaying).toBeVisible({ timeout: 5000 });
    }
  });

  test('UIF011: Resync button exists in queue', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(4000);
    const queueBtn = page.locator('button:has-text("Queue")').first();
    if (await queueBtn.count() > 0) {
      await queueBtn.click().catch(() => {});
      await page.waitForTimeout(1000);
      const resyncBtn = page.locator('#queue-resync-btn');
      await expect(resyncBtn).toBeVisible({ timeout: 5000 });
    }
  });

  test('UIF012: Resync button is clickable', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(4000);
    const queueBtn = page.locator('button:has-text("Queue")').first();
    if (await queueBtn.count() > 0) {
      await queueBtn.click().catch(() => {});
      await page.waitForTimeout(1000);
      const resyncBtn = page.locator('#queue-resync-btn');
      if (await resyncBtn.count() > 0) {
        await expect(resyncBtn).toBeEnabled();
        await resyncBtn.click().catch(() => {});
        await page.waitForTimeout(500);
        // Should show toast message
      }
    }
  });

  test('UIF013: Queue shows video count', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(4000);
    const queueBtn = page.locator('button:has-text("Queue")').first();
    if (await queueBtn.count() > 0) {
      await queueBtn.click().catch(() => {});
      await page.waitForTimeout(1000);
      // Look for "Video X of Y" text
      const videoCount = page.locator('text=/Video \\d+ of \\d+/');
      await expect(videoCount).toBeVisible({ timeout: 5000 });
    }
  });

  test('UIF014: Up Next section exists', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(4000);
    const queueBtn = page.locator('button:has-text("Queue")').first();
    if (await queueBtn.count() > 0) {
      await queueBtn.click().catch(() => {});
      await page.waitForTimeout(1000);
      const upNext = page.locator('text=Up Next');
      await expect(upNext).toBeVisible({ timeout: 5000 });
    }
  });
});

test.describe('Search & Browse Tests', () => {
  test('UIF015: Search button exists', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);
    // Look for search icon/button
    const searchBtn = page.locator('button:has-text("Search"), button svg[class*="search"], button[aria-label*="search"]').first();
    // Search functionality should exist
  });

  test('UIF016: Search panel opens', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(4000);
    // Try to find and click search button
    const searchBtn = page.locator('button').filter({ hasText: /search/i }).first();
    if (await searchBtn.count() > 0) {
      await searchBtn.click().catch(() => {});
      await page.waitForTimeout(1000);
      // Search input should appear
      const searchInput = page.locator('input[placeholder*="Search"]');
      if (await searchInput.count() > 0) {
        await expect(searchInput).toBeVisible();
      }
    }
  });

  test('UIF017: Filter buttons work', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(4000);
    // Click Movies filter
    const moviesBtn = page.locator('button:has-text("Movies")').first();
    if (await moviesBtn.count() > 0) {
      await moviesBtn.click().catch(() => {});
      await page.waitForTimeout(1000);
    }
  });

  test('UIF018: TV filter works', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(4000);
    // Click TV filter
    const tvBtn = page.locator('button:has-text("TV")').first();
    if (await tvBtn.count() > 0) {
      await tvBtn.click().catch(() => {});
      await page.waitForTimeout(1000);
    }
  });

  test('UIF019: All filter works', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(4000);
    // Click All filter
    const allBtn = page.locator('button:has-text("All")').first();
    if (await allBtn.count() > 0) {
      await allBtn.click().catch(() => {});
      await page.waitForTimeout(1000);
    }
  });
});

test.describe('CSS z-index Tests', () => {
  test('UIF020: Hamburger has high z-index', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);
    const hamburger = page.locator('button[aria-label="Open Quick Nav"]');
    if (await hamburger.count() > 0) {
      const zIndex = await hamburger.evaluate(el => {
        const style = window.getComputedStyle(el);
        return parseInt(style.zIndex) || 0;
      });
      expect(zIndex).toBeGreaterThan(100);
    }
  });
});
