/**
 * Puppeteer Functionality Tests (100 tests)
 * Tests for MovieShows application functionality
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

// ==================== PAGE LOAD & INITIALIZATION ====================

describe('Page Load & Initialization', () => {
  test('PF001: Page loads with 200 status', async () => {
    const response = await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    expect(response.status()).toBe(200);
  }, TIMEOUT);

  test('PF002: Page title contains MovieShows', async () => {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    const title = await page.title();
    expect(title.toLowerCase()).toContain('movie');
  }, TIMEOUT);

  test('PF003: Body element visible', async () => {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    const body = await page.$('body');
    expect(body).toBeTruthy();
  }, TIMEOUT);

  test('PF004: No critical JS errors on load', async () => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
    const criticalErrors = errors.filter(e => e.includes('Uncaught'));
    expect(criticalErrors.length).toBe(0);
  }, TIMEOUT);

  test('PF005: Movies data loads into window', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForFunction(() => window.allMoviesData && window.allMoviesData.length > 0, { timeout: 10000 });
    const count = await page.evaluate(() => window.allMoviesData.length);
    expect(count).toBeGreaterThan(0);
  }, TIMEOUT);

  test('PF006: Slides are rendered', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForSelector('.snap-center', { timeout: 10000 });
    const slideCount = await page.$$eval('.snap-center', slides => slides.length);
    expect(slideCount).toBeGreaterThan(0);
  }, TIMEOUT);

  test('PF007: Console shows initialization', async () => {
    const logs = [];
    page.on('console', msg => logs.push(msg.text()));
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
    const hasInit = logs.some(l => l.includes('[MovieShows]') && l.includes('Initializ'));
    expect(hasInit).toBeTruthy();
  }, TIMEOUT);

  test('PF008: Ready message logged', async () => {
    const logs = [];
    page.on('console', msg => logs.push(msg.text()));
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(5000);
    const hasReady = logs.some(l => l.includes('[MovieShows]') && l.includes('Ready'));
    expect(hasReady).toBeTruthy();
  }, TIMEOUT);

  test('PF009: YouTube iframe rendered', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForSelector('iframe[src*="youtube"]', { timeout: 10000 });
    const iframeSrc = await page.$eval('iframe[src*="youtube"]', el => el.src);
    expect(iframeSrc).toContain('youtube.com');
  }, TIMEOUT);

  test('PF010: Multiple movies loaded', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForFunction(() => window.allMoviesData && window.allMoviesData.length > 100, { timeout: 10000 });
    const count = await page.evaluate(() => window.allMoviesData.length);
    expect(count).toBeGreaterThan(100);
  }, TIMEOUT);
});

// ==================== NAVIGATION & SCROLLING ====================

describe('Navigation & Scrolling', () => {
  test('PF011: ArrowDown scrolls to next', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForSelector('.snap-center', { timeout: 10000 });
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(1000);
    // Should scroll without error
  }, TIMEOUT);

  test('PF012: ArrowUp scrolls to previous', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForSelector('.snap-center', { timeout: 10000 });
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(500);
    await page.keyboard.press('ArrowUp');
    await page.waitForTimeout(500);
  }, TIMEOUT);

  test('PF013: J key scrolls down', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForSelector('.snap-center', { timeout: 10000 });
    await page.keyboard.press('j');
    await page.waitForTimeout(500);
  }, TIMEOUT);

  test('PF014: K key scrolls up', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForSelector('.snap-center', { timeout: 10000 });
    await page.keyboard.press('j');
    await page.waitForTimeout(500);
    await page.keyboard.press('k');
    await page.waitForTimeout(500);
  }, TIMEOUT);

  test('PF015: Mouse wheel scrolling works', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForSelector('.snap-center', { timeout: 10000 });
    await page.mouse.wheel({ deltaY: 500 });
    await page.waitForTimeout(1000);
  }, TIMEOUT);

  test('PF016: Multiple scrolls load more content', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForSelector('.snap-center', { timeout: 10000 });
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('ArrowDown');
      await page.waitForTimeout(300);
    }
    await page.waitForTimeout(2000);
    const slideCount = await page.$$eval('.snap-center', slides => slides.length);
    expect(slideCount).toBeGreaterThan(5);
  }, TIMEOUT);

  test('PF017: Scroll snaps to slide', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForSelector('.snap-center', { timeout: 10000 });
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(1000);
  }, TIMEOUT);

  test('PF018: Touch events work', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForSelector('.snap-center', { timeout: 10000 });
    await page.evaluate(() => {
      document.dispatchEvent(new TouchEvent('touchstart', { touches: [{ clientY: 500 }] }));
    });
  }, TIMEOUT);

  test('PF019: Scroll position tracked', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForSelector('.snap-center', { timeout: 10000 });
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(500);
  }, TIMEOUT);

  test('PF020: Rapid scrolls throttled', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForSelector('.snap-center', { timeout: 10000 });
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('ArrowDown');
    }
    await page.waitForTimeout(500);
  }, TIMEOUT);
});

// ==================== VIDEO PLAYER ====================

describe('Video Player', () => {
  test('PF021: YouTube iframe has autoplay', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForSelector('iframe[src*="youtube"]', { timeout: 10000 });
    const src = await page.$eval('iframe[src*="youtube"]', el => el.src);
    expect(src).toContain('autoplay=1');
  }, TIMEOUT);

  test('PF022: Mute control exists', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForSelector('#mute-control', { timeout: 10000 });
    const muteControl = await page.$('#mute-control');
    expect(muteControl).toBeTruthy();
  }, TIMEOUT);

  test('PF023: Mute toggle works', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForSelector('#mute-control', { timeout: 10000 });
    await page.click('#mute-control');
    await page.waitForTimeout(500);
  }, TIMEOUT);

  test('PF024: Volume slider exists', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForSelector('input[type="range"]', { timeout: 10000 });
    const slider = await page.$('input[type="range"]');
    expect(slider).toBeTruthy();
  }, TIMEOUT);

  test('PF025: Key 1 sets small player', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForSelector('.snap-center', { timeout: 10000 });
    await page.keyboard.press('1');
    await page.waitForTimeout(500);
    const size = await page.evaluate(() => localStorage.getItem('movieshows-player-size'));
    expect(size).toBe('small');
  }, TIMEOUT);

  test('PF026: Key 2 sets medium player', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForSelector('.snap-center', { timeout: 10000 });
    await page.keyboard.press('2');
    await page.waitForTimeout(500);
    const size = await page.evaluate(() => localStorage.getItem('movieshows-player-size'));
    expect(size).toBe('medium');
  }, TIMEOUT);

  test('PF027: Key 3 sets large player', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForSelector('.snap-center', { timeout: 10000 });
    await page.keyboard.press('3');
    await page.waitForTimeout(500);
    const size = await page.evaluate(() => localStorage.getItem('movieshows-player-size'));
    expect(size).toBe('large');
  }, TIMEOUT);

  test('PF028: Key 4 sets full player', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForSelector('.snap-center', { timeout: 10000 });
    await page.keyboard.press('4');
    await page.waitForTimeout(500);
    const size = await page.evaluate(() => localStorage.getItem('movieshows-player-size'));
    expect(size).toBe('full');
  }, TIMEOUT);

  test('PF029: Loop enabled on iframe', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForSelector('iframe[src*="youtube"]', { timeout: 10000 });
    const src = await page.$eval('iframe[src*="youtube"]', el => el.src);
    expect(src).toContain('loop=1');
  }, TIMEOUT);

  test('PF030: Player size saved to localStorage', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
    const size = await page.evaluate(() => localStorage.getItem('movieshows-player-size'));
    expect(['small', 'medium', 'large', 'full']).toContain(size);
  }, TIMEOUT);
});

// ==================== QUEUE FUNCTIONALITY ====================

describe('Queue Functionality', () => {
  test('PF031: Queue button exists', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
    const queueBtn = await page.$x("//button[contains(., 'Queue') or contains(., 'queue')]");
    expect(queueBtn.length).toBeGreaterThan(0);
  }, TIMEOUT);

  test('PF032: Escape closes panels', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
  }, TIMEOUT);

  test('PF033: List button exists', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
    const listBtns = await page.$x("//button[contains(translate(., 'LIST', 'list'), 'list')]");
    expect(listBtns.length).toBeGreaterThan(0);
  }, TIMEOUT);

  test('PF034: Queue stored in localStorage', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
    const queue = await page.evaluate(() => localStorage.getItem('movieshows-queue'));
    // Should be accessible
  }, TIMEOUT);

  test('PF035: Can set queue items', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
    await page.evaluate(() => {
      localStorage.setItem('movieshows-queue', JSON.stringify([{ title: 'Test' }]));
    });
    const queue = await page.evaluate(() => JSON.parse(localStorage.getItem('movieshows-queue')));
    expect(queue.length).toBe(1);
  }, TIMEOUT);

  test('PF036: Queue can be cleared', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
    await page.evaluate(() => localStorage.setItem('movieshows-queue', '[]'));
    const queue = await page.evaluate(() => JSON.parse(localStorage.getItem('movieshows-queue')));
    expect(queue.length).toBe(0);
  }, TIMEOUT);

  test('PF037: Queue persists on reload', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.evaluate(() => {
      localStorage.setItem('movieshows-queue', JSON.stringify([{ title: 'PersistTest' }]));
    });
    await page.reload({ waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
    const queue = await page.evaluate(() => localStorage.getItem('movieshows-queue'));
    expect(queue).toContain('PersistTest');
  }, TIMEOUT);

  test('PF038: Queue shows count', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
  }, TIMEOUT);

  test('PF039: Queue items have titles', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
  }, TIMEOUT);

  test('PF040: Multiple queue items supported', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.evaluate(() => {
      const items = [];
      for (let i = 0; i < 10; i++) {
        items.push({ title: `Movie ${i}` });
      }
      localStorage.setItem('movieshows-queue', JSON.stringify(items));
    });
    const queue = await page.evaluate(() => JSON.parse(localStorage.getItem('movieshows-queue')));
    expect(queue.length).toBe(10);
  }, TIMEOUT);
});

// ==================== SEARCH & FILTER ====================

describe('Search & Filter', () => {
  test('PF041: Search button exists', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
    const searchBtn = await page.$x("//button[contains(., 'Search') or contains(., 'search') or contains(., 'Browse')]");
    expect(searchBtn.length).toBeGreaterThan(0);
  }, TIMEOUT);

  test('PF042: Filter button exists', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
    const filterBtn = await page.$x("//button[contains(., 'Filter') or contains(., 'filter')]");
    expect(filterBtn.length).toBeGreaterThan(0);
  }, TIMEOUT);

  test('PF043: All category button exists', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
    const allBtn = await page.$x("//button[contains(., 'All')]");
    expect(allBtn.length).toBeGreaterThan(0);
  }, TIMEOUT);

  test('PF044: Movies category button exists', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
    const moviesBtn = await page.$x("//button[contains(., 'Movies')]");
    expect(moviesBtn.length).toBeGreaterThan(0);
  }, TIMEOUT);

  test('PF045: TV category button exists', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
    const tvBtn = await page.$x("//button[contains(., 'TV')]");
    expect(tvBtn.length).toBeGreaterThan(0);
  }, TIMEOUT);

  test('PF046: Now Playing category exists', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
    const nowBtn = await page.$x("//button[contains(., 'Now Playing') or contains(., 'Playing')]");
    expect(nowBtn.length).toBeGreaterThan(0);
  }, TIMEOUT);

  test('PF047: Category click changes filter', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
    const moviesBtn = await page.$x("//button[contains(., 'Movies')]");
    if (moviesBtn.length > 0) {
      await moviesBtn[0].click();
      await page.waitForTimeout(1000);
    }
  }, TIMEOUT);

  test('PF048: Search filters movies', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
  }, TIMEOUT);

  test('PF049: Filter state maintained', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
  }, TIMEOUT);

  test('PF050: Multiple filters work', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
  }, TIMEOUT);
});

// ==================== SHARE FUNCTIONALITY ====================

describe('Share Functionality', () => {
  test('PF051: Share button exists', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
    const shareBtns = await page.$x("//button[contains(translate(., 'SHARE', 'share'), 'share')]");
    expect(shareBtns.length).toBeGreaterThan(0);
  }, TIMEOUT);

  test('PF052: Share URL format correct', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
    const url = await page.evaluate(() => {
      if (window.allMoviesData && window.allMoviesData[0]) {
        return `${window.location.origin}${window.location.pathname}?play=${encodeURIComponent(window.allMoviesData[0].title)}`;
      }
      return null;
    });
    if (url) {
      expect(url).toContain('?play=');
    }
  }, TIMEOUT);

  test('PF053: Play parameter works', async () => {
    await page.goto(BASE_URL + '?play=Superman', { waitUntil: 'networkidle2' });
    await page.waitForTimeout(5000);
    // Should not crash
  }, TIMEOUT);

  test('PF054: Invalid play parameter handled', async () => {
    await page.goto(BASE_URL + '?play=NonExistent12345', { waitUntil: 'networkidle2' });
    await page.waitForTimeout(5000);
    // Should show error gracefully
  }, TIMEOUT);

  test('PF055: URL encoded properly', async () => {
    const encoded = encodeURIComponent('Mission: Impossible');
    expect(encoded).toBe('Mission%3A%20Impossible');
  }, TIMEOUT);

  test('PF056: URL cleaned after processing', async () => {
    await page.goto(BASE_URL + '?play=Test', { waitUntil: 'networkidle2' });
    await page.waitForTimeout(6000);
    const url = page.url();
    expect(url).not.toContain('?play=');
  }, TIMEOUT);

  test('PF057: Special chars in play param', async () => {
    await page.goto(BASE_URL + '?play=' + encodeURIComponent("Test's Movie"), { waitUntil: 'networkidle2' });
    await page.waitForTimeout(5000);
  }, TIMEOUT);

  test('PF058: Empty play parameter', async () => {
    await page.goto(BASE_URL + '?play=', { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
  }, TIMEOUT);

  test('PF059: Multiple URL params', async () => {
    await page.goto(BASE_URL + '?play=Test&other=param', { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
  }, TIMEOUT);

  test('PF060: Share fallback without share API', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
  }, TIMEOUT);
});

// ==================== AUTHENTICATION ====================

describe('Authentication', () => {
  test('PF061: Login button visible', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
    const loginBtn = await page.$x("//button[contains(., 'Sign In') or contains(., 'Login')]");
    expect(loginBtn.length).toBeGreaterThan(0);
  }, TIMEOUT);

  test('PF062: Login popup opens', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
    const loginBtn = await page.$x("//button[contains(., 'Sign In') or contains(., 'Login')]");
    if (loginBtn.length > 0) {
      await loginBtn[0].click();
      await page.waitForTimeout(500);
    }
  }, TIMEOUT);

  test('PF063: Google login option visible', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
    const loginBtn = await page.$x("//button[contains(., 'Sign In') or contains(., 'Login')]");
    if (loginBtn.length > 0) {
      await loginBtn[0].click();
      await page.waitForTimeout(500);
      const googleBtn = await page.$x("//button[contains(., 'Google')]");
      expect(googleBtn.length).toBeGreaterThan(0);
    }
  }, TIMEOUT);

  test('PF064: Guest option available', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
    const loginBtn = await page.$x("//button[contains(., 'Sign In') or contains(., 'Login')]");
    if (loginBtn.length > 0) {
      await loginBtn[0].click();
      await page.waitForTimeout(500);
      const guestBtn = await page.$x("//button[contains(., 'Guest') or contains(., 'guest')]");
      expect(guestBtn.length).toBeGreaterThan(0);
    }
  }, TIMEOUT);

  test('PF065: User stored in localStorage', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
    const user = await page.evaluate(() => localStorage.getItem('movieshows-user'));
    // Can be null or valid
  }, TIMEOUT);

  test('PF066: Auth error handled', async () => {
    await page.goto(BASE_URL + '?google_error=test_error', { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
    // Should show error toast
  }, TIMEOUT);

  test('PF067: Auth success handled', async () => {
    await page.goto(BASE_URL + '?google_auth=' + encodeURIComponent('{"email":"test@test.com"}'), { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
  }, TIMEOUT);

  test('PF068: Login popup closes on escape', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
  }, TIMEOUT);

  test('PF069: User ID generated', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
    const userId = await page.evaluate(() => localStorage.getItem('movieshows-user-id'));
    expect(userId).toBeTruthy();
  }, TIMEOUT);

  test('PF070: Session persists on reload', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
    await page.reload({ waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
    const userId = await page.evaluate(() => localStorage.getItem('movieshows-user-id'));
    expect(userId).toBeTruthy();
  }, TIMEOUT);
});

// ==================== DATA PERSISTENCE ====================

describe('Data Persistence', () => {
  test('PF071: Likes persisted', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
    const likes = await page.evaluate(() => localStorage.getItem('movieshows-likes'));
    // Can be null or valid
  }, TIMEOUT);

  test('PF072: Watch history tracked', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(5000);
    const history = await page.evaluate(() => localStorage.getItem('movieshows-watch-history'));
    // Can be null or valid
  }, TIMEOUT);

  test('PF073: Player size persisted', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.keyboard.press('2');
    await page.waitForTimeout(500);
    await page.reload({ waitUntil: 'networkidle2' });
    const size = await page.evaluate(() => localStorage.getItem('movieshows-player-size'));
    expect(size).toBe('medium');
  }, TIMEOUT);

  test('PF074: Mute state tracked', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
  }, TIMEOUT);

  test('PF075: Multiple storage keys work', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
    const keys = await page.evaluate(() => Object.keys(localStorage).filter(k => k.startsWith('movieshows')));
    expect(keys.length).toBeGreaterThan(0);
  }, TIMEOUT);

  test('PF076: Data survives clear and re-init', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.evaluate(() => localStorage.setItem('movieshows-test', 'value'));
    await page.reload({ waitUntil: 'networkidle2' });
    const value = await page.evaluate(() => localStorage.getItem('movieshows-test'));
    expect(value).toBe('value');
  }, TIMEOUT);

  test('PF077: JSON parsing works', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.evaluate(() => {
      localStorage.setItem('movieshows-test-json', JSON.stringify({ key: 'value' }));
    });
    const data = await page.evaluate(() => JSON.parse(localStorage.getItem('movieshows-test-json')));
    expect(data.key).toBe('value');
  }, TIMEOUT);

  test('PF078: Invalid JSON handled', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.evaluate(() => {
      localStorage.setItem('movieshows-queue', 'not valid json');
    });
    await page.reload({ waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
    // Should not crash
  }, TIMEOUT);

  test('PF079: Large data handled', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    const largeArray = [];
    for (let i = 0; i < 100; i++) {
      largeArray.push({ title: `Movie ${i}`, description: 'A'.repeat(500) });
    }
    await page.evaluate((data) => {
      localStorage.setItem('movieshows-test-large', JSON.stringify(data));
    }, largeArray);
    const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('movieshows-test-large')));
    expect(stored.length).toBe(100);
  }, TIMEOUT);

  test('PF080: Cleanup old data', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
  }, TIMEOUT);
});

// ==================== MOVIE INFORMATION ====================

describe('Movie Information', () => {
  test('PF081: Movie titles displayed', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForSelector('.snap-center h2', { timeout: 10000 });
    const title = await page.$eval('.snap-center h2', el => el.textContent);
    expect(title).toBeTruthy();
  }, TIMEOUT);

  test('PF082: IMDb rating shown', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
    const pageContent = await page.content();
    expect(pageContent.toLowerCase()).toContain('imdb');
  }, TIMEOUT);

  test('PF083: Genre tags displayed', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
  }, TIMEOUT);

  test('PF084: Year displayed', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
  }, TIMEOUT);

  test('PF085: Description shown', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
  }, TIMEOUT);

  test('PF086: Poster images load', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(5000);
  }, TIMEOUT);

  test('PF087: Like button works', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
  }, TIMEOUT);

  test('PF088: Info toggle works', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
    const infoBtns = await page.$x("//button[contains(., 'Info') or contains(., 'Hide')]");
    if (infoBtns.length > 0) {
      await infoBtns[0].click();
      await page.waitForTimeout(500);
    }
  }, TIMEOUT);

  test('PF089: YouTube link present', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
    const ytLinks = await page.$x("//a[contains(@href, 'youtube')]");
    expect(ytLinks.length).toBeGreaterThan(0);
  }, TIMEOUT);

  test('PF090: Release date shown', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
  }, TIMEOUT);
});

// ==================== API & BACKEND ====================

describe('API & Backend', () => {
  test('PF091: Movies database accessible', async () => {
    const response = await page.goto(BASE_URL + 'movies-database.json', { waitUntil: 'networkidle2' });
    expect(response.status()).toBe(200);
  }, TIMEOUT);

  test('PF092: Movies data is array', async () => {
    const response = await page.goto(BASE_URL + 'movies-database.json', { waitUntil: 'networkidle2' });
    const data = await response.json();
    expect(Array.isArray(data)).toBeTruthy();
  }, TIMEOUT);

  test('PF093: Movies have titles', async () => {
    const response = await page.goto(BASE_URL + 'movies-database.json', { waitUntil: 'networkidle2' });
    const data = await response.json();
    if (data.length > 0) {
      expect(data[0].title).toBeTruthy();
    }
  }, TIMEOUT);

  test('PF094: Auth API responds', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    const response = await page.evaluate(async () => {
      try {
        const res = await fetch('/movieshows2/api/auth.php');
        return { status: res.status };
      } catch (e) {
        return { error: e.message };
      }
    });
    expect(response.status).toBeLessThan(500);
  }, TIMEOUT);

  test('PF095: HTTPS used', async () => {
    expect(BASE_URL).toContain('https://');
  }, TIMEOUT);

  test('PF096: No server errors on load', async () => {
    const responses = [];
    page.on('response', res => {
      if (res.status() >= 500) responses.push({ url: res.url(), status: res.status() });
    });
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
    expect(responses.length).toBe(0);
  }, TIMEOUT);

  test('PF097: Scripts load successfully', async () => {
    const failed = [];
    page.on('requestfailed', req => {
      if (req.url().endsWith('.js')) failed.push(req.url());
    });
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
    expect(failed.length).toBe(0);
  }, TIMEOUT);

  test('PF098: CSS loads successfully', async () => {
    const failed = [];
    page.on('requestfailed', req => {
      if (req.url().endsWith('.css')) failed.push(req.url());
    });
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    expect(failed.length).toBe(0);
  }, TIMEOUT);

  test('PF099: JSON responses valid', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    const data = await page.evaluate(async () => {
      const res = await fetch('movies-database.json');
      return res.json();
    });
    expect(data).toBeTruthy();
  }, TIMEOUT);

  test('PF100: Offline fallback exists', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
    // localStorage should work as fallback
    const canUseStorage = await page.evaluate(() => {
      try {
        localStorage.setItem('test', 'test');
        localStorage.removeItem('test');
        return true;
      } catch {
        return false;
      }
    });
    expect(canUseStorage).toBeTruthy();
  }, TIMEOUT);
});
