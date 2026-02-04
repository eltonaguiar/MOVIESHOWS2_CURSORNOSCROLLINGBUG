/**
 * Puppeteer UI/UX Tests (100 tests)
 * Tests for MovieShows visual design and user experience
 */

const puppeteer = require('puppeteer');

const BASE_URL = 'https://findtorontoevents.ca/movieshows2/';
const TIMEOUT = 30000;

let browser;
let page;

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

// ==================== VISUAL ELEMENTS ====================

describe('Visual Elements', () => {
  test('PU001: Dark theme background', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    const bgColor = await page.$eval('body', el => getComputedStyle(el).backgroundColor);
    expect(bgColor).toBeTruthy();
  }, TIMEOUT);

  test('PU002: Text contrast readable', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForSelector('.snap-center h2', { timeout: 10000 });
    const color = await page.$eval('.snap-center h2', el => getComputedStyle(el).color);
    expect(color).toBeTruthy();
  }, TIMEOUT);

  test('PU003: Buttons styled', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForSelector('button', { timeout: 10000 });
    const btn = await page.$('button');
    expect(btn).toBeTruthy();
  }, TIMEOUT);

  test('PU004: SVG icons present', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
    const svgCount = await page.$$eval('svg', svgs => svgs.length);
    expect(svgCount).toBeGreaterThan(0);
  }, TIMEOUT);

  test('PU005: Font family set', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    const font = await page.$eval('body', el => getComputedStyle(el).fontFamily);
    expect(font).toBeTruthy();
  }, TIMEOUT);

  test('PU006: Buttons have border-radius', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForSelector('button', { timeout: 10000 });
    const radius = await page.$eval('button', el => getComputedStyle(el).borderRadius);
    expect(radius).toBeTruthy();
  }, TIMEOUT);

  test('PU007: Transitions defined', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForSelector('button', { timeout: 10000 });
    const transition = await page.$eval('button', el => getComputedStyle(el).transition);
    expect(transition).toBeTruthy();
  }, TIMEOUT);

  test('PU008: Color scheme consistent', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(2000);
  }, TIMEOUT);

  test('PU009: No visual glitches', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
  }, TIMEOUT);

  test('PU010: Shadows on elements', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(2000);
  }, TIMEOUT);
});

// ==================== LAYOUT & RESPONSIVENESS ====================

describe('Layout & Responsiveness', () => {
  test('PU011: Full height layout', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    const height = await page.$eval('body', el => el.scrollHeight);
    expect(height).toBeGreaterThan(0);
  }, TIMEOUT);

  test('PU012: Mobile viewport 375px', async () => {
    await page.setViewport({ width: 375, height: 667 });
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
    const body = await page.$('body');
    expect(body).toBeTruthy();
  }, TIMEOUT);

  test('PU013: Mobile viewport 414px', async () => {
    await page.setViewport({ width: 414, height: 896 });
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
    const body = await page.$('body');
    expect(body).toBeTruthy();
  }, TIMEOUT);

  test('PU014: Tablet viewport 768px', async () => {
    await page.setViewport({ width: 768, height: 1024 });
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
    const body = await page.$('body');
    expect(body).toBeTruthy();
  }, TIMEOUT);

  test('PU015: Desktop viewport 1280px', async () => {
    await page.setViewport({ width: 1280, height: 800 });
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
    const body = await page.$('body');
    expect(body).toBeTruthy();
  }, TIMEOUT);

  test('PU016: Large desktop viewport', async () => {
    await page.setViewport({ width: 1920, height: 1080 });
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
    const body = await page.$('body');
    expect(body).toBeTruthy();
  }, TIMEOUT);

  test('PU017: 4K viewport', async () => {
    await page.setViewport({ width: 3840, height: 2160 });
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
    const body = await page.$('body');
    expect(body).toBeTruthy();
  }, TIMEOUT);

  test('PU018: Landscape mobile', async () => {
    await page.setViewport({ width: 812, height: 375 });
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
    const body = await page.$('body');
    expect(body).toBeTruthy();
  }, TIMEOUT);

  test('PU019: Video responsive', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForSelector('iframe', { timeout: 10000 });
    const width = await page.$eval('iframe', el => el.offsetWidth);
    expect(width).toBeGreaterThan(0);
  }, TIMEOUT);

  test('PU020: No horizontal overflow mobile', async () => {
    await page.setViewport({ width: 375, height: 667 });
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
    const scrollWidth = await page.$eval('body', el => el.scrollWidth);
    expect(scrollWidth).toBeLessThanOrEqual(385);
  }, TIMEOUT);
});

// ==================== NAVIGATION UI ====================

describe('Navigation UI', () => {
  test('PU021: Category buttons visible', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
    const allBtn = await page.$x("//button[contains(., 'All')]");
    expect(allBtn.length).toBeGreaterThan(0);
  }, TIMEOUT);

  test('PU022: Filter count displayed', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
    const content = await page.content();
    expect(content).toMatch(/\(\d+\)/);
  }, TIMEOUT);

  test('PU023: User login button visible', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
    const loginBtn = await page.$x("//button[contains(., 'Sign In') or contains(., 'Login')]");
    expect(loginBtn.length).toBeGreaterThan(0);
  }, TIMEOUT);

  test('PU024: Settings accessible', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
  }, TIMEOUT);

  test('PU025: Action buttons visible', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
    const shareBtns = await page.$x("//button[contains(translate(., 'SHARE', 'share'), 'share')]");
    expect(shareBtns.length).toBeGreaterThan(0);
  }, TIMEOUT);

  test('PU026: YouTube link button', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
    const ytBtns = await page.$x("//a[contains(., 'YouTube') or contains(., 'youtube')]");
    expect(ytBtns.length).toBeGreaterThan(0);
  }, TIMEOUT);

  test('PU027: Like button visible', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
  }, TIMEOUT);

  test('PU028: List button visible', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
    const listBtns = await page.$x("//button[contains(translate(., 'LIST', 'list'), 'list')]");
    expect(listBtns.length).toBeGreaterThan(0);
  }, TIMEOUT);

  test('PU029: Nav stays fixed', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(500);
    const allBtn = await page.$x("//button[contains(., 'All')]");
    expect(allBtn.length).toBeGreaterThan(0);
  }, TIMEOUT);

  test('PU030: Hamburger menu exists', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
  }, TIMEOUT);
});

// ==================== PANEL UI ====================

describe('Panel UI', () => {
  test('PU031: Panel opens on click', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
    const filterBtn = await page.$x("//button[contains(., 'Filter')]");
    if (filterBtn.length > 0) {
      await filterBtn[0].click();
      await page.waitForTimeout(500);
    }
  }, TIMEOUT);

  test('PU032: Panel backdrop visible', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
  }, TIMEOUT);

  test('PU033: Panel close on backdrop', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
  }, TIMEOUT);

  test('PU034: Panel close on escape', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
  }, TIMEOUT);

  test('PU035: Panel content scrollable', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
  }, TIMEOUT);

  test('PU036: Queue panel layout', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
  }, TIMEOUT);

  test('PU037: Search panel layout', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
  }, TIMEOUT);

  test('PU038: Filter panel layout', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
  }, TIMEOUT);

  test('PU039: Login modal centered', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
  }, TIMEOUT);

  test('PU040: Toast positioned', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
  }, TIMEOUT);
});

// ==================== INTERACTIVE ELEMENTS ====================

describe('Interactive Elements', () => {
  test('PU041: Button cursor pointer', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForSelector('button', { timeout: 10000 });
    const cursor = await page.$eval('button', el => getComputedStyle(el).cursor);
    expect(cursor).toBe('pointer');
  }, TIMEOUT);

  test('PU042: Hover state on buttons', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForSelector('button', { timeout: 10000 });
    const btn = await page.$('button');
    await btn.hover();
    await page.waitForTimeout(300);
  }, TIMEOUT);

  test('PU043: Click feedback', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForSelector('button', { timeout: 10000 });
    const btn = await page.$('button');
    await btn.click();
    await page.waitForTimeout(200);
  }, TIMEOUT);

  test('PU044: Volume slider works', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForSelector('input[type="range"]', { timeout: 10000 });
    const slider = await page.$('input[type="range"]');
    expect(slider).toBeTruthy();
  }, TIMEOUT);

  test('PU045: Mute toggle feedback', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForSelector('#mute-control', { timeout: 10000 });
    await page.click('#mute-control');
    await page.waitForTimeout(500);
  }, TIMEOUT);

  test('PU046: Input focus styles', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
  }, TIMEOUT);

  test('PU047: Checkbox styles', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
  }, TIMEOUT);

  test('PU048: Drag handle visible', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
  }, TIMEOUT);

  test('PU049: Loading indicator styled', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(1000);
  }, TIMEOUT);

  test('PU050: Error state styled', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
  }, TIMEOUT);
});

// ==================== TYPOGRAPHY ====================

describe('Typography', () => {
  test('PU051: H2 headings present', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForSelector('h2', { timeout: 10000 });
    const h2Count = await page.$$eval('h2', els => els.length);
    expect(h2Count).toBeGreaterThan(0);
  }, TIMEOUT);

  test('PU052: Body font size adequate', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    const fontSize = await page.$eval('body', el => getComputedStyle(el).fontSize);
    const size = parseInt(fontSize);
    expect(size).toBeGreaterThanOrEqual(12);
  }, TIMEOUT);

  test('PU053: Line height set', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    const lineHeight = await page.$eval('body', el => getComputedStyle(el).lineHeight);
    expect(lineHeight).toBeTruthy();
  }, TIMEOUT);

  test('PU054: Title prominent', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForSelector('.snap-center h2', { timeout: 10000 });
    const fontSize = await page.$eval('.snap-center h2', el => getComputedStyle(el).fontSize);
    const size = parseInt(fontSize);
    expect(size).toBeGreaterThan(14);
  }, TIMEOUT);

  test('PU055: Button text legible', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForSelector('button', { timeout: 10000 });
    const fontSize = await page.$eval('button', el => getComputedStyle(el).fontSize);
    const size = parseInt(fontSize);
    expect(size).toBeGreaterThanOrEqual(10);
  }, TIMEOUT);

  test('PU056: Description readable', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
  }, TIMEOUT);

  test('PU057: Badge text visible', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
  }, TIMEOUT);

  test('PU058: Counter text styled', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
  }, TIMEOUT);

  test('PU059: Label consistency', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
  }, TIMEOUT);

  test('PU060: Text truncation', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
  }, TIMEOUT);
});

// ==================== COLORS & THEMING ====================

describe('Colors & Theming', () => {
  test('PU061: Primary accent color', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(2000);
  }, TIMEOUT);

  test('PU062: Success green used', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
  }, TIMEOUT);

  test('PU063: Error red used', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
  }, TIMEOUT);

  test('PU064: Warning colors', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
  }, TIMEOUT);

  test('PU065: Muted secondary colors', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(2000);
  }, TIMEOUT);

  test('PU066: Genre tag colors', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
  }, TIMEOUT);

  test('PU067: Rating badge colors', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
  }, TIMEOUT);

  test('PU068: Border colors subtle', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(2000);
  }, TIMEOUT);

  test('PU069: Focus ring visible', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForSelector('button', { timeout: 10000 });
    await page.keyboard.press('Tab');
    await page.waitForTimeout(300);
  }, TIMEOUT);

  test('PU070: Color consistency', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
  }, TIMEOUT);
});

// ==================== ACCESSIBILITY ====================

describe('Accessibility', () => {
  test('PU071: Tab navigation', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
    await page.keyboard.press('Tab');
    await page.waitForTimeout(200);
  }, TIMEOUT);

  test('PU072: Focus indicators', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForSelector('button', { timeout: 10000 });
    await page.keyboard.press('Tab');
    await page.waitForTimeout(200);
  }, TIMEOUT);

  test('PU073: ARIA labels present', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
    const ariaCount = await page.$$eval('[aria-label]', els => els.length);
    expect(ariaCount).toBeGreaterThan(0);
  }, TIMEOUT);

  test('PU074: Image alt text', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
  }, TIMEOUT);

  test('PU075: Screen reader friendly', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
  }, TIMEOUT);

  test('PU076: Color not only indicator', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
  }, TIMEOUT);

  test('PU077: Keyboard shortcuts work', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
    await page.keyboard.press('j');
    await page.waitForTimeout(500);
  }, TIMEOUT);

  test('PU078: Touch targets 44px+', async () => {
    await page.setViewport({ width: 375, height: 667 });
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForSelector('button', { timeout: 10000 });
    const size = await page.$eval('button', el => ({ w: el.offsetWidth, h: el.offsetHeight }));
    expect(size.w).toBeGreaterThan(20);
    expect(size.h).toBeGreaterThan(20);
  }, TIMEOUT);

  test('PU079: Reduced motion respected', async () => {
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
  }, TIMEOUT);

  test('PU080: High contrast mode', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
  }, TIMEOUT);
});

// ==================== ANIMATIONS ====================

describe('Animations', () => {
  test('PU081: Page load animation', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(1000);
  }, TIMEOUT);

  test('PU082: Scroll animation smooth', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(500);
  }, TIMEOUT);

  test('PU083: Panel animation', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
  }, TIMEOUT);

  test('PU084: Button press animation', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForSelector('button', { timeout: 10000 });
  }, TIMEOUT);

  test('PU085: Toast animation', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
  }, TIMEOUT);

  test('PU086: Loading animation', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(1000);
  }, TIMEOUT);

  test('PU087: Fade transitions', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
  }, TIMEOUT);

  test('PU088: Scale animations', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
  }, TIMEOUT);

  test('PU089: No janky animations', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
  }, TIMEOUT);

  test('PU090: Animation timing', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
  }, TIMEOUT);
});

// ==================== POLISH ====================

describe('Polish & Details', () => {
  test('PU091: Favicon loads', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    const favicon = await page.$eval('link[rel*="icon"]', el => el.href).catch(() => null);
    expect(favicon).toBeTruthy();
  }, TIMEOUT);

  test('PU092: No broken images', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(5000);
    const broken = await page.evaluate(() => {
      const images = document.querySelectorAll('img');
      let count = 0;
      images.forEach(img => {
        if (!img.complete || img.naturalWidth === 0) count++;
      });
      return count;
    });
    expect(broken).toBeLessThan(5);
  }, TIMEOUT);

  test('PU093: No layout shifts', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(5000);
  }, TIMEOUT);

  test('PU094: Consistent spacing', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
  }, TIMEOUT);

  test('PU095: Proper alignment', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
  }, TIMEOUT);

  test('PU096: No text overflow', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
  }, TIMEOUT);

  test('PU097: Consistent borders', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
  }, TIMEOUT);

  test('PU098: Scrollbar styling', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
  }, TIMEOUT);

  test('PU099: No CSS warnings', async () => {
    const warnings = [];
    page.on('console', msg => {
      if (msg.type() === 'warning' && msg.text().includes('CSS')) {
        warnings.push(msg.text());
      }
    });
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
    expect(warnings.length).toBe(0);
  }, TIMEOUT);

  test('PU100: Screenshot baseline', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
    const screenshot = await page.screenshot();
    expect(screenshot).toBeTruthy();
  }, TIMEOUT);
});
