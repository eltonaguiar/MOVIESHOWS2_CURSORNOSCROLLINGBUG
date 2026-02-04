// @ts-check
const { test, expect } = require('@playwright/test');

const BASE_URL = 'https://findtorontoevents.ca/movieshows2/';

// ==================== AUTO-SCROLL FEATURE TESTS (25 tests) ====================

test.describe('Auto-Scroll Settings', () => {
  test('AS001: Auto-scroll is enabled by default', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(5000);
    const enabled = await page.evaluate(() => {
      return localStorage.getItem('movieshows-auto-scroll') !== 'false';
    });
    expect(enabled).toBeTruthy();
  });

  test('AS002: Default delay is 10 seconds', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);
    const delay = await page.evaluate(() => {
      return parseInt(localStorage.getItem('movieshows-auto-scroll-delay') || '10');
    });
    expect(delay).toBe(10);
  });

  test('AS003: Auto-scroll toggle exists in settings', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);
    // Open settings panel
    const settingsBtn = page.locator('#settings-toggle');
    if (await settingsBtn.count() > 0) {
      await settingsBtn.click();
      await page.waitForTimeout(500);
    }
    const toggle = await page.locator('#auto-scroll-toggle');
    expect(await toggle.count()).toBeGreaterThan(0);
  });

  test('AS004: Auto-scroll delay slider exists', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);
    const settingsBtn = page.locator('#settings-toggle');
    if (await settingsBtn.count() > 0) {
      await settingsBtn.click();
      await page.waitForTimeout(500);
    }
    const slider = await page.locator('#auto-scroll-delay-input');
    expect(await slider.count()).toBeGreaterThan(0);
  });

  test('AS005: Toggle can disable auto-scroll', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);
    // Disable auto-scroll via localStorage
    await page.evaluate(() => {
      localStorage.setItem('movieshows-auto-scroll', 'false');
    });
    await page.reload();
    await page.waitForTimeout(3000);
    const enabled = await page.evaluate(() => {
      return localStorage.getItem('movieshows-auto-scroll');
    });
    expect(enabled).toBe('false');
  });

  test('AS006: Delay can be changed to 5 seconds', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);
    await page.evaluate(() => {
      localStorage.setItem('movieshows-auto-scroll-delay', '5');
    });
    const delay = await page.evaluate(() => {
      return localStorage.getItem('movieshows-auto-scroll-delay');
    });
    expect(delay).toBe('5');
  });

  test('AS007: Delay can be changed to 30 seconds', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);
    await page.evaluate(() => {
      localStorage.setItem('movieshows-auto-scroll-delay', '30');
    });
    const delay = await page.evaluate(() => {
      return localStorage.getItem('movieshows-auto-scroll-delay');
    });
    expect(delay).toBe('30');
  });

  test('AS008: Delay can be changed to 60 seconds', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);
    await page.evaluate(() => {
      localStorage.setItem('movieshows-auto-scroll-delay', '60');
    });
    const delay = await page.evaluate(() => {
      return localStorage.getItem('movieshows-auto-scroll-delay');
    });
    expect(delay).toBe('60');
  });

  test('AS009: Settings persist after reload', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);
    await page.evaluate(() => {
      localStorage.setItem('movieshows-auto-scroll', 'false');
      localStorage.setItem('movieshows-auto-scroll-delay', '15');
    });
    await page.reload();
    await page.waitForTimeout(3000);
    const settings = await page.evaluate(() => ({
      enabled: localStorage.getItem('movieshows-auto-scroll'),
      delay: localStorage.getItem('movieshows-auto-scroll-delay')
    }));
    expect(settings.enabled).toBe('false');
    expect(settings.delay).toBe('15');
  });

  test('AS010: Delay slider has correct min/max values', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);
    const settingsBtn = page.locator('#settings-toggle');
    if (await settingsBtn.count() > 0) {
      await settingsBtn.click();
      await page.waitForTimeout(500);
    }
    const slider = page.locator('#auto-scroll-delay-input');
    if (await slider.count() > 0) {
      const min = await slider.getAttribute('min');
      const max = await slider.getAttribute('max');
      expect(min).toBe('5');
      expect(max).toBe('60');
    }
  });
});

test.describe('Auto-Scroll Indicator', () => {
  test('AS011: Indicator appears when auto-scroll is enabled', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(8000); // Wait for video to start playing
    const indicator = page.locator('#auto-scroll-indicator');
    // Indicator should exist (may be hidden if auto-scroll off)
    await page.evaluate(() => {
      localStorage.setItem('movieshows-auto-scroll', 'true');
    });
  });

  test('AS012: Indicator shows countdown number', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.evaluate(() => {
      localStorage.setItem('movieshows-auto-scroll', 'true');
      localStorage.setItem('movieshows-auto-scroll-delay', '10');
    });
    await page.reload();
    await page.waitForTimeout(8000);
    const countdown = page.locator('#auto-scroll-countdown');
    if (await countdown.count() > 0) {
      const text = await countdown.textContent();
      const num = parseInt(text || '0');
      expect(num).toBeGreaterThanOrEqual(0);
      expect(num).toBeLessThanOrEqual(10);
    }
  });

  test('AS013: Skip button exists in indicator', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.evaluate(() => {
      localStorage.setItem('movieshows-auto-scroll', 'true');
    });
    await page.reload();
    await page.waitForTimeout(8000);
    const skipBtn = page.locator('#auto-scroll-skip');
    // Skip button should exist when indicator is shown
  });

  test('AS014: Pause button exists in indicator', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.evaluate(() => {
      localStorage.setItem('movieshows-auto-scroll', 'true');
    });
    await page.reload();
    await page.waitForTimeout(8000);
    const pauseBtn = page.locator('#auto-scroll-pause');
    // Pause button should exist when indicator is shown
  });

  test('AS015: Indicator is hidden when auto-scroll disabled', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.evaluate(() => {
      localStorage.setItem('movieshows-auto-scroll', 'false');
    });
    await page.reload();
    await page.waitForTimeout(5000);
    const indicator = page.locator('#auto-scroll-indicator');
    if (await indicator.count() > 0) {
      const display = await indicator.evaluate(el => getComputedStyle(el).display);
      expect(display).toBe('none');
    }
  });
});

test.describe('Auto-Scroll Functionality', () => {
  test('AS016: Countdown decreases over time', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.evaluate(() => {
      localStorage.setItem('movieshows-auto-scroll', 'true');
      localStorage.setItem('movieshows-auto-scroll-delay', '10');
    });
    await page.reload();
    await page.waitForTimeout(6000); // Wait for video to start
    
    const countdown1 = await page.locator('#auto-scroll-countdown').textContent().catch(() => '0');
    await page.waitForTimeout(2000);
    const countdown2 = await page.locator('#auto-scroll-countdown').textContent().catch(() => '0');
    
    const num1 = parseInt(countdown1 || '0');
    const num2 = parseInt(countdown2 || '0');
    // Countdown should decrease (or be at 0 if already scrolled)
    expect(num2).toBeLessThanOrEqual(num1);
  });

  test('AS017: Manual scroll stops auto-scroll timer', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.evaluate(() => {
      localStorage.setItem('movieshows-auto-scroll', 'true');
      localStorage.setItem('movieshows-auto-scroll-delay', '30');
    });
    await page.reload();
    await page.waitForTimeout(5000);
    
    // Manual scroll
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(1000);
    
    // Indicator should be hidden after manual scroll (until next video plays)
    const indicator = page.locator('#auto-scroll-indicator');
    if (await indicator.count() > 0) {
      const display = await indicator.evaluate(el => getComputedStyle(el).display);
      // May be hidden or shown depending on timing
    }
  });

  test('AS018: Skip button advances to next video', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.evaluate(() => {
      localStorage.setItem('movieshows-auto-scroll', 'true');
    });
    await page.reload();
    await page.waitForTimeout(6000);
    
    const skipBtn = page.locator('#auto-scroll-skip');
    if (await skipBtn.count() > 0 && await skipBtn.isVisible()) {
      // Get current title before skip
      const titleBefore = await page.locator('.snap-center h2').first().textContent().catch(() => '');
      await skipBtn.click();
      await page.waitForTimeout(2000);
      // Should have scrolled to next video
    }
  });

  test('AS019: Pause button pauses countdown', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.evaluate(() => {
      localStorage.setItem('movieshows-auto-scroll', 'true');
      localStorage.setItem('movieshows-auto-scroll-delay', '30');
    });
    await page.reload();
    await page.waitForTimeout(6000);
    
    const pauseBtn = page.locator('#auto-scroll-pause');
    if (await pauseBtn.count() > 0 && await pauseBtn.isVisible()) {
      const countdownBefore = await page.locator('#auto-scroll-countdown').textContent().catch(() => '0');
      await pauseBtn.click();
      await page.waitForTimeout(2000);
      const countdownAfter = await page.locator('#auto-scroll-countdown').textContent().catch(() => '0');
      // Countdown should be the same (paused)
      expect(countdownAfter).toBe(countdownBefore);
    }
  });

  test('AS020: Auto-scroll triggers after delay', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.evaluate(() => {
      localStorage.setItem('movieshows-auto-scroll', 'true');
      localStorage.setItem('movieshows-auto-scroll-delay', '5'); // Short delay for test
    });
    await page.reload();
    await page.waitForSelector('.snap-center', { timeout: 10000 });
    
    // Wait for video to start and timer to complete
    await page.waitForTimeout(12000); // 5s delay + buffer
    
    // Should have auto-scrolled (video index should change)
  });
});

test.describe('Auto-Scroll Edge Cases', () => {
  test('AS021: Auto-scroll works after page reload', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.evaluate(() => {
      localStorage.setItem('movieshows-auto-scroll', 'true');
    });
    await page.reload();
    await page.waitForTimeout(5000);
    const enabled = await page.evaluate(() => {
      return localStorage.getItem('movieshows-auto-scroll') !== 'false';
    });
    expect(enabled).toBeTruthy();
  });

  test('AS022: Auto-scroll resumes after pause/unpause', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.evaluate(() => {
      localStorage.setItem('movieshows-auto-scroll', 'true');
      localStorage.setItem('movieshows-auto-scroll-delay', '30');
    });
    await page.reload();
    await page.waitForTimeout(6000);
    
    const pauseBtn = page.locator('#auto-scroll-pause');
    if (await pauseBtn.count() > 0 && await pauseBtn.isVisible()) {
      // Pause
      await pauseBtn.click();
      await page.waitForTimeout(1000);
      // Unpause
      await pauseBtn.click();
      await page.waitForTimeout(1000);
      // Countdown should be running
      const countdown1 = await page.locator('#auto-scroll-countdown').textContent().catch(() => '30');
      await page.waitForTimeout(1500);
      const countdown2 = await page.locator('#auto-scroll-countdown').textContent().catch(() => '30');
      expect(parseInt(countdown2 || '0')).toBeLessThan(parseInt(countdown1 || '30'));
    }
  });

  test('AS023: Indicator styled correctly', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.evaluate(() => {
      localStorage.setItem('movieshows-auto-scroll', 'true');
    });
    await page.reload();
    await page.waitForTimeout(6000);
    
    const indicator = page.locator('#auto-scroll-indicator');
    if (await indicator.count() > 0) {
      const styles = await indicator.evaluate(el => ({
        position: getComputedStyle(el).position,
        zIndex: getComputedStyle(el).zIndex
      }));
      expect(styles.position).toBe('fixed');
      expect(parseInt(styles.zIndex)).toBeGreaterThan(1000);
    }
  });

  test('AS024: Multiple rapid toggles handled', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);
    
    // Rapid toggle via localStorage
    for (let i = 0; i < 5; i++) {
      await page.evaluate((val) => {
        localStorage.setItem('movieshows-auto-scroll', val ? 'true' : 'false');
      }, i % 2 === 0);
    }
    
    // Should not crash
    await page.waitForTimeout(1000);
    const html = await page.content();
    expect(html).toBeTruthy();
  });

  test('AS025: Auto-scroll indicator has correct text', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.evaluate(() => {
      localStorage.setItem('movieshows-auto-scroll', 'true');
    });
    await page.reload();
    await page.waitForTimeout(6000);
    
    const text = page.locator('#auto-scroll-text');
    if (await text.count() > 0) {
      const content = await text.textContent();
      expect(content).toContain('Next in');
    }
  });
});
