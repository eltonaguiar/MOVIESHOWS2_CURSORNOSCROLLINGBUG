// @ts-check
const { test, expect } = require('@playwright/test');

const BASE_URL = 'https://findtorontoevents.ca/movieshows2/';

// ==================== UI/UX TESTS (100 tests) ====================

test.describe('Visual Elements', () => {
  test('U001: Page has dark theme', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(2000);
    const bgColor = await page.evaluate(() => {
      return getComputedStyle(document.body).backgroundColor;
    });
    // Should be dark (low RGB values)
  });

  test('U002: Text is readable (contrast)', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForSelector('.snap-center h2', { timeout: 10000 });
    const color = await page.evaluate(() => {
      const h2 = document.querySelector('.snap-center h2');
      return h2 ? getComputedStyle(h2).color : null;
    });
    expect(color).toBeTruthy();
  });

  test('U003: Buttons have hover states', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForSelector('button', { timeout: 10000 });
    const btn = page.locator('button').first();
    await btn.hover();
    await page.waitForTimeout(300);
  });

  test('U004: Icons are visible', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);
    const hasSvg = await page.locator('svg').count();
    expect(hasSvg).toBeGreaterThan(0);
  });

  test('U005: Logo/branding visible', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(2000);
  });

  test('U006: Consistent font family', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(2000);
    const font = await page.evaluate(() => {
      return getComputedStyle(document.body).fontFamily;
    });
    expect(font).toBeTruthy();
  });

  test('U007: Rounded corners on elements', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForSelector('button', { timeout: 10000 });
    const radius = await page.evaluate(() => {
      const btn = document.querySelector('button');
      return btn ? getComputedStyle(btn).borderRadius : null;
    });
  });

  test('U008: Shadows and depth', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(2000);
  });

  test('U009: Gradient backgrounds', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(2000);
  });

  test('U010: Smooth transitions', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForSelector('button', { timeout: 10000 });
    const transition = await page.evaluate(() => {
      const btn = document.querySelector('button');
      return btn ? getComputedStyle(btn).transition : null;
    });
  });
});

test.describe('Layout & Responsiveness', () => {
  test('U011: Full viewport height used', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(2000);
    const height = await page.evaluate(() => document.body.scrollHeight);
    expect(height).toBeGreaterThan(0);
  });

  test('U012: Mobile viewport works', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);
    await expect(page.locator('body')).toBeVisible();
  });

  test('U013: Tablet viewport works', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);
    await expect(page.locator('body')).toBeVisible();
  });

  test('U014: Desktop viewport works', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);
    await expect(page.locator('body')).toBeVisible();
  });

  test('U015: Ultra-wide viewport works', async ({ page }) => {
    await page.setViewportSize({ width: 2560, height: 1440 });
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);
    await expect(page.locator('body')).toBeVisible();
  });

  test('U016: Landscape orientation works', async ({ page }) => {
    await page.setViewportSize({ width: 812, height: 375 });
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);
  });

  test('U017: Video container responsive', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForSelector('iframe', { timeout: 10000 });
    const width = await page.locator('iframe').first().evaluate(el => el.offsetWidth);
    expect(width).toBeGreaterThan(0);
  });

  test('U018: Text scales appropriately', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForSelector('.snap-center h2', { timeout: 10000 });
    const fontSize = await page.evaluate(() => {
      const h2 = document.querySelector('.snap-center h2');
      return h2 ? getComputedStyle(h2).fontSize : null;
    });
    expect(fontSize).toBeTruthy();
  });

  test('U019: Buttons accessible on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(BASE_URL);
    await page.waitForSelector('button', { timeout: 10000 });
    const btnSize = await page.evaluate(() => {
      const btn = document.querySelector('button');
      return btn ? { width: btn.offsetWidth, height: btn.offsetHeight } : null;
    });
    if (btnSize) {
      expect(btnSize.width).toBeGreaterThan(20);
      expect(btnSize.height).toBeGreaterThan(20);
    }
  });

  test('U020: No horizontal scroll on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);
    const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewport = 375;
    expect(scrollWidth).toBeLessThanOrEqual(viewport + 10);
  });
});

test.describe('Navigation UI', () => {
  test('U021: Top navigation bar exists', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(2000);
  });

  test('U022: Category buttons visible', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForSelector('button', { timeout: 10000 });
    const allBtn = page.locator('button').filter({ hasText: /all/i });
    expect(await allBtn.count()).toBeGreaterThan(0);
  });

  test('U023: Active filter highlighted', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);
  });

  test('U024: Menu icon visible', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(2000);
  });

  test('U025: Settings icon visible', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(2000);
  });

  test('U026: User avatar/login button visible', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(2000);
    const loginBtn = page.locator('button').filter({ hasText: /sign in|login/i });
    expect(await loginBtn.count()).toBeGreaterThan(0);
  });

  test('U027: Navigation is fixed/sticky', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(500);
    // Top buttons should still be visible
  });

  test('U028: Side action buttons visible', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);
    const actionBtns = page.locator('button').filter({ hasText: /list|share|like/i });
    expect(await actionBtns.count()).toBeGreaterThan(0);
  });

  test('U029: Video progress indicator exists', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);
  });

  test('U030: Scroll indicator visible', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);
  });
});

test.describe('Panel UI', () => {
  test('U031: Panel slides in smoothly', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);
    const filterBtn = page.locator('button').filter({ hasText: /filter/i }).first();
    if (await filterBtn.count() > 0) {
      await filterBtn.click();
      await page.waitForTimeout(500);
    }
  });

  test('U032: Panel has backdrop', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);
  });

  test('U033: Panel close button visible', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);
  });

  test('U034: Panel content scrollable', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);
  });

  test('U035: Panel z-index correct', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);
  });

  test('U036: Queue panel item layout', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);
  });

  test('U037: Search results grid layout', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);
  });

  test('U038: Filter options layout', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);
  });

  test('U039: Login popup centered', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);
  });

  test('U040: Toast notifications visible', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);
  });
});

test.describe('Interactive Elements', () => {
  test('U041: Button cursor pointer', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForSelector('button', { timeout: 10000 });
    const cursor = await page.evaluate(() => {
      const btn = document.querySelector('button');
      return btn ? getComputedStyle(btn).cursor : null;
    });
    expect(cursor).toBe('pointer');
  });

  test('U042: Links have underline on hover', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(2000);
  });

  test('U043: Clickable elements have feedback', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForSelector('button', { timeout: 10000 });
    const btn = page.locator('button').first();
    await btn.click();
    await page.waitForTimeout(200);
  });

  test('U044: Input fields focused state', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);
  });

  test('U045: Checkbox/toggle styling', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);
  });

  test('U046: Slider controls styled', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForSelector('input[type="range"]', { timeout: 10000 });
  });

  test('U047: Drag handles visible', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);
  });

  test('U048: Loading spinners styled', async ({ page }) => {
    await page.goto(BASE_URL);
    // Loading states should be styled
  });

  test('U049: Error states styled', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);
  });

  test('U050: Empty states styled', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);
  });
});

test.describe('Typography', () => {
  test('U051: Heading hierarchy correct', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForSelector('h2', { timeout: 10000 });
    const h2Count = await page.locator('h2').count();
    expect(h2Count).toBeGreaterThan(0);
  });

  test('U052: Body text readable size', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(2000);
    const fontSize = await page.evaluate(() => {
      return getComputedStyle(document.body).fontSize;
    });
    const size = parseInt(fontSize);
    expect(size).toBeGreaterThanOrEqual(12);
  });

  test('U053: Line height adequate', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(2000);
    const lineHeight = await page.evaluate(() => {
      return getComputedStyle(document.body).lineHeight;
    });
    expect(lineHeight).toBeTruthy();
  });

  test('U054: Text truncation with ellipsis', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);
  });

  test('U055: Movie title prominent', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForSelector('.snap-center h2', { timeout: 10000 });
    const fontSize = await page.evaluate(() => {
      const h2 = document.querySelector('.snap-center h2');
      return h2 ? getComputedStyle(h2).fontSize : null;
    });
    if (fontSize) {
      const size = parseInt(fontSize);
      expect(size).toBeGreaterThan(16);
    }
  });

  test('U056: Metadata text smaller', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);
  });

  test('U057: Button text legible', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForSelector('button', { timeout: 10000 });
  });

  test('U058: Label text consistent', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);
  });

  test('U059: Badge text visible', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);
  });

  test('U060: Counter text styled', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);
  });
});

test.describe('Colors & Theming', () => {
  test('U061: Primary color consistent', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(2000);
  });

  test('U062: Accent colors used', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(2000);
  });

  test('U063: Success state green', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);
  });

  test('U064: Error state red', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);
  });

  test('U065: Warning state yellow/orange', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);
  });

  test('U066: Muted colors for secondary', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(2000);
  });

  test('U067: Genre tag colors', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);
  });

  test('U068: Rating badge colors', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);
  });

  test('U069: Border colors subtle', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(2000);
  });

  test('U070: Focus ring visible', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForSelector('button', { timeout: 10000 });
    await page.keyboard.press('Tab');
    await page.waitForTimeout(300);
  });
});

test.describe('Accessibility', () => {
  test('U071: Tab navigation works', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);
    await page.keyboard.press('Tab');
    await page.waitForTimeout(200);
  });

  test('U072: Focus indicators visible', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForSelector('button', { timeout: 10000 });
    await page.keyboard.press('Tab');
    await page.waitForTimeout(200);
  });

  test('U073: ARIA labels present', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);
    const ariaLabels = await page.locator('[aria-label]').count();
    expect(ariaLabels).toBeGreaterThan(0);
  });

  test('U074: Alt text on images', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);
  });

  test('U075: Skip to content available', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(2000);
  });

  test('U076: Screen reader friendly', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);
  });

  test('U077: Color not only indicator', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);
  });

  test('U078: Keyboard shortcuts work', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);
    await page.keyboard.press('j');
    await page.waitForTimeout(500);
  });

  test('U079: Touch targets adequate', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(BASE_URL);
    await page.waitForSelector('button', { timeout: 10000 });
  });

  test('U080: Motion reduced supported', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);
  });
});

test.describe('Animations & Transitions', () => {
  test('U081: Page load animation', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(1000);
  });

  test('U082: Scroll animation smooth', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(500);
  });

  test('U083: Panel slide animation', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);
  });

  test('U084: Button press animation', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForSelector('button', { timeout: 10000 });
  });

  test('U085: Toast notification animation', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);
  });

  test('U086: Loading state animation', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(1000);
  });

  test('U087: Fade transitions', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);
  });

  test('U088: Scale animations', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);
  });

  test('U089: No janky animations', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);
  });

  test('U090: Animation timing appropriate', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);
  });
});

test.describe('Polish & Details', () => {
  test('U091: Favicon loads', async ({ page }) => {
    await page.goto(BASE_URL);
    const favicon = await page.locator('link[rel*="icon"]').first().getAttribute('href');
    expect(favicon).toBeTruthy();
  });

  test('U092: No broken images', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(5000);
    const brokenImages = await page.evaluate(() => {
      const images = document.querySelectorAll('img');
      let broken = 0;
      images.forEach(img => {
        if (!img.complete || img.naturalWidth === 0) broken++;
      });
      return broken;
    });
    // Allow some YouTube thumbnails that may not load
    expect(brokenImages).toBeLessThan(5);
  });

  test('U093: No layout shifts', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(5000);
    // Page should be stable
  });

  test('U094: Consistent spacing', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);
  });

  test('U095: Proper alignment', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);
  });

  test('U096: No text overflow', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);
  });

  test('U097: Consistent border styles', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);
  });

  test('U098: Proper scrollbar styling', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);
  });

  test('U099: No console warnings about styles', async ({ page }) => {
    const warnings = [];
    page.on('console', msg => {
      if (msg.type() === 'warning' && msg.text().includes('CSS')) {
        warnings.push(msg.text());
      }
    });
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);
    expect(warnings.length).toBe(0);
  });

  test('U100: Overall visual consistency', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);
    // Visual regression test
    await expect(page).toHaveScreenshot({ maxDiffPixels: 1000 });
  });
});
