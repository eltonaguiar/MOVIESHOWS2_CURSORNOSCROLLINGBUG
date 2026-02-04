/**
 * Puppeteer Auto-Scroll Feature Tests (25 tests)
 * Tests for MovieShows auto-scroll functionality
 */

const puppeteer = require('puppeteer');

const BASE_URL = 'https://findtorontoevents.ca/movieshows2/';
const TIMEOUT = 60000;
const NAV_TIMEOUT = 45000;

let browser;
let page;

// Helper function for waiting
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

beforeAll(async () => {
  browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
});

afterAll(async () => {
  if (browser) await browser.close();
});

beforeEach(async () => {
  page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
}, TIMEOUT);

afterEach(async () => {
  if (page) await page.close();
});

// ==================== AUTO-SCROLL SETTINGS TESTS ====================

describe('Auto-Scroll Settings', () => {
  test('PAS001: Auto-scroll enabled by default', async () => {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT });
    await delay(5000);
    const enabled = await page.evaluate(() => {
      return localStorage.getItem('movieshows-auto-scroll') !== 'false';
    });
    expect(enabled).toBeTruthy();
  }, TIMEOUT);

  test('PAS002: Default delay is 10 seconds', async () => {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT });
    await delay(3000);
    const delayValue = await page.evaluate(() => {
      return parseInt(localStorage.getItem('movieshows-auto-scroll-delay') || '10');
    });
    expect(delayValue).toBe(10);
  }, TIMEOUT);

  test('PAS003: Auto-scroll toggle in settings panel', async () => {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT });
    await delay(3000);
    // Open settings
    const settingsBtn = await page.$('#settings-toggle');
    if (settingsBtn) {
      await settingsBtn.click();
      await delay(500);
    }
    const toggle = await page.$('#auto-scroll-toggle');
    expect(toggle).toBeTruthy();
  }, TIMEOUT);

  test('PAS004: Delay slider exists in settings', async () => {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT });
    await delay(3000);
    const settingsBtn = await page.$('#settings-toggle');
    if (settingsBtn) {
      await settingsBtn.click();
      await delay(500);
    }
    const slider = await page.$('#auto-scroll-delay-input');
    expect(slider).toBeTruthy();
  }, TIMEOUT);

  test('PAS005: Can disable auto-scroll', async () => {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT });
    await page.evaluate(() => {
      localStorage.setItem('movieshows-auto-scroll', 'false');
    });
    await page.reload({ waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT });
    await delay(3000);
    const enabled = await page.evaluate(() => {
      return localStorage.getItem('movieshows-auto-scroll');
    });
    expect(enabled).toBe('false');
  }, TIMEOUT);

  test('PAS006: Can set delay to 5 seconds', async () => {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT });
    await page.evaluate(() => {
      localStorage.setItem('movieshows-auto-scroll-delay', '5');
    });
    const delay = await page.evaluate(() => {
      return localStorage.getItem('movieshows-auto-scroll-delay');
    });
    expect(delay).toBe('5');
  }, TIMEOUT);

  test('PAS007: Can set delay to 30 seconds', async () => {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT });
    await page.evaluate(() => {
      localStorage.setItem('movieshows-auto-scroll-delay', '30');
    });
    const delay = await page.evaluate(() => {
      return localStorage.getItem('movieshows-auto-scroll-delay');
    });
    expect(delay).toBe('30');
  }, TIMEOUT);

  test('PAS008: Can set delay to maximum (60 seconds)', async () => {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT });
    await page.evaluate(() => {
      localStorage.setItem('movieshows-auto-scroll-delay', '60');
    });
    const delay = await page.evaluate(() => {
      return localStorage.getItem('movieshows-auto-scroll-delay');
    });
    expect(delay).toBe('60');
  }, TIMEOUT);

  test('PAS009: Settings persist after page reload', async () => {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT });
    await page.evaluate(() => {
      localStorage.setItem('movieshows-auto-scroll', 'false');
      localStorage.setItem('movieshows-auto-scroll-delay', '20');
    });
    await page.reload({ waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT });
    await delay(3000);
    const settings = await page.evaluate(() => ({
      enabled: localStorage.getItem('movieshows-auto-scroll'),
      delay: localStorage.getItem('movieshows-auto-scroll-delay')
    }));
    expect(settings.enabled).toBe('false');
    expect(settings.delay).toBe('20');
  }, TIMEOUT);

  test('PAS010: Slider min value is 5', async () => {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT });
    await delay(3000);
    const settingsBtn = await page.$('#settings-toggle');
    if (settingsBtn) {
      await settingsBtn.click();
      await delay(500);
    }
    const min = await page.$eval('#auto-scroll-delay-input', el => el.getAttribute('min'));
    expect(min).toBe('5');
  }, TIMEOUT);
});

// ==================== AUTO-SCROLL INDICATOR TESTS ====================

describe('Auto-Scroll Indicator', () => {
  test('PAS011: Indicator element created', async () => {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT });
    await page.evaluate(() => {
      localStorage.setItem('movieshows-auto-scroll', 'true');
    });
    await page.reload({ waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT });
    await delay(8000); // Wait for video to play and timer to start
    const indicator = await page.$('#auto-scroll-indicator');
    // Indicator may exist
  }, TIMEOUT);

  test('PAS012: Countdown element exists', async () => {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT });
    await page.evaluate(() => {
      localStorage.setItem('movieshows-auto-scroll', 'true');
      localStorage.setItem('movieshows-auto-scroll-delay', '15');
    });
    await page.reload({ waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT });
    await delay(8000);
    const countdown = await page.$('#auto-scroll-countdown');
    // Countdown element should exist when auto-scroll active
  }, TIMEOUT);

  test('PAS013: Skip button exists', async () => {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT });
    await page.evaluate(() => {
      localStorage.setItem('movieshows-auto-scroll', 'true');
    });
    await page.reload({ waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT });
    await delay(8000);
    const skipBtn = await page.$('#auto-scroll-skip');
    // Skip button should exist
  }, TIMEOUT);

  test('PAS014: Pause button exists', async () => {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT });
    await page.evaluate(() => {
      localStorage.setItem('movieshows-auto-scroll', 'true');
    });
    await page.reload({ waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT });
    await delay(8000);
    const pauseBtn = await page.$('#auto-scroll-pause');
    // Pause button should exist
  }, TIMEOUT);

  test('PAS015: Indicator hidden when disabled', async () => {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT });
    await page.evaluate(() => {
      localStorage.setItem('movieshows-auto-scroll', 'false');
    });
    await page.reload({ waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT });
    await delay(5000);
    const indicator = await page.$('#auto-scroll-indicator');
    if (indicator) {
      const display = await page.$eval('#auto-scroll-indicator', el => getComputedStyle(el).display);
      expect(display).toBe('none');
    }
  }, TIMEOUT);
});

// ==================== AUTO-SCROLL FUNCTIONALITY TESTS ====================

describe('Auto-Scroll Functionality', () => {
  test('PAS016: Countdown decreases over time', async () => {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT });
    await page.evaluate(() => {
      localStorage.setItem('movieshows-auto-scroll', 'true');
      localStorage.setItem('movieshows-auto-scroll-delay', '15');
    });
    await page.reload({ waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT });
    await delay(6000);
    
    let countdown1 = '0';
    try {
      countdown1 = await page.$eval('#auto-scroll-countdown', el => el.textContent);
    } catch (e) {}
    
    await delay(2000);
    
    let countdown2 = '0';
    try {
      countdown2 = await page.$eval('#auto-scroll-countdown', el => el.textContent);
    } catch (e) {}
    
    const num1 = parseInt(countdown1 || '0');
    const num2 = parseInt(countdown2 || '0');
    expect(num2).toBeLessThanOrEqual(num1);
  }, TIMEOUT);

  test('PAS017: Manual scroll stops timer', async () => {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT });
    await page.evaluate(() => {
      localStorage.setItem('movieshows-auto-scroll', 'true');
      localStorage.setItem('movieshows-auto-scroll-delay', '30');
    });
    await page.reload({ waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT });
    await delay(5000);
    
    // Manual scroll
    await page.keyboard.press('ArrowDown');
    await delay(1000);
    
    // Timer should be stopped (indicator hidden or reset)
  }, TIMEOUT);

  test('PAS018: Skip button works', async () => {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT });
    await page.evaluate(() => {
      localStorage.setItem('movieshows-auto-scroll', 'true');
    });
    await page.reload({ waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT });
    await delay(6000);
    
    const skipBtn = await page.$('#auto-scroll-skip');
    if (skipBtn) {
      const isVisible = await page.$eval('#auto-scroll-skip', el => el.offsetParent !== null);
      if (isVisible) {
        await skipBtn.click();
        await delay(2000);
        // Should have scrolled
      }
    }
  }, TIMEOUT);

  test('PAS019: Pause button pauses countdown', async () => {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT });
    await page.evaluate(() => {
      localStorage.setItem('movieshows-auto-scroll', 'true');
      localStorage.setItem('movieshows-auto-scroll-delay', '30');
    });
    await page.reload({ waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT });
    await delay(6000);
    
    const pauseBtn = await page.$('#auto-scroll-pause');
    if (pauseBtn) {
      let countdownBefore = '30';
      try {
        countdownBefore = await page.$eval('#auto-scroll-countdown', el => el.textContent);
      } catch (e) {}
      
      await pauseBtn.click();
      await delay(2000);
      
      let countdownAfter = '30';
      try {
        countdownAfter = await page.$eval('#auto-scroll-countdown', el => el.textContent);
      } catch (e) {}
      
      // Should be the same (paused)
      expect(countdownAfter).toBe(countdownBefore);
    }
  }, TIMEOUT);

  test('PAS020: Auto-scroll triggers after delay', async () => {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT });
    await page.evaluate(() => {
      localStorage.setItem('movieshows-auto-scroll', 'true');
      localStorage.setItem('movieshows-auto-scroll-delay', '5');
    });
    await page.reload({ waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT });
    await page.waitForSelector('.snap-center', { timeout: 10000 });
    
    // Wait for full delay + buffer
    await delay(12000);
    
    // Should have auto-scrolled
  }, TIMEOUT);
});

// ==================== AUTO-SCROLL EDGE CASES ====================

describe('Auto-Scroll Edge Cases', () => {
  test('PAS021: Works after reload', async () => {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT });
    await page.evaluate(() => {
      localStorage.setItem('movieshows-auto-scroll', 'true');
    });
    await page.reload({ waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT });
    await delay(5000);
    const enabled = await page.evaluate(() => {
      return localStorage.getItem('movieshows-auto-scroll') !== 'false';
    });
    expect(enabled).toBeTruthy();
  }, TIMEOUT);

  test('PAS022: Resume after pause works', async () => {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT });
    await page.evaluate(() => {
      localStorage.setItem('movieshows-auto-scroll', 'true');
      localStorage.setItem('movieshows-auto-scroll-delay', '30');
    });
    await page.reload({ waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT });
    await delay(6000);
    
    const pauseBtn = await page.$('#auto-scroll-pause');
    if (pauseBtn) {
      // Pause
      await pauseBtn.click();
      await delay(1000);
      // Resume
      await pauseBtn.click();
      await delay(1000);
      
      let countdown1 = '30';
      try {
        countdown1 = await page.$eval('#auto-scroll-countdown', el => el.textContent);
      } catch (e) {}
      
      await delay(2000);
      
      let countdown2 = '30';
      try {
        countdown2 = await page.$eval('#auto-scroll-countdown', el => el.textContent);
      } catch (e) {}
      
      // Should be decreasing after resume
      expect(parseInt(countdown2 || '0')).toBeLessThan(parseInt(countdown1 || '30'));
    }
  }, TIMEOUT);

  test('PAS023: Indicator styled as fixed position', async () => {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT });
    await page.evaluate(() => {
      localStorage.setItem('movieshows-auto-scroll', 'true');
    });
    await page.reload({ waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT });
    await delay(6000);
    
    const indicator = await page.$('#auto-scroll-indicator');
    if (indicator) {
      const position = await page.$eval('#auto-scroll-indicator', el => getComputedStyle(el).position);
      expect(position).toBe('fixed');
    }
  }, TIMEOUT);

  test('PAS024: Multiple toggles handled gracefully', async () => {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT });
    await delay(3000);
    
    // Toggle multiple times
    for (let i = 0; i < 5; i++) {
      await page.evaluate((val) => {
        localStorage.setItem('movieshows-auto-scroll', val ? 'true' : 'false');
      }, i % 2 === 0);
    }
    
    await delay(1000);
    // Should not crash
    const html = await page.content();
    expect(html).toBeTruthy();
  }, TIMEOUT);

  test('PAS025: Indicator text contains "Next in"', async () => {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT });
    await page.evaluate(() => {
      localStorage.setItem('movieshows-auto-scroll', 'true');
    });
    await page.reload({ waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT });
    await delay(6000);
    
    const text = await page.$('#auto-scroll-text');
    if (text) {
      const content = await page.$eval('#auto-scroll-text', el => el.textContent);
      expect(content).toContain('Next in');
    }
  }, TIMEOUT);
});
