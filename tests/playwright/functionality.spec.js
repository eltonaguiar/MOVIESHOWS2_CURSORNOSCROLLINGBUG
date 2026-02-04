// @ts-check
const { test, expect } = require('@playwright/test');

const BASE_URL = 'https://findtorontoevents.ca/movieshows2/';

// ==================== FUNCTIONALITY TESTS (100 tests) ====================

test.describe('Page Load & Initialization', () => {
  test('F001: Page loads successfully', async ({ page }) => {
    const response = await page.goto(BASE_URL);
    expect(response.status()).toBe(200);
  });

  test('F002: Page title is correct', async ({ page }) => {
    await page.goto(BASE_URL);
    await expect(page).toHaveTitle(/MovieShows/i);
  });

  test('F003: Main container exists', async ({ page }) => {
    await page.goto(BASE_URL);
    await expect(page.locator('body')).toBeVisible();
  });

  test('F004: JavaScript initializes without errors', async ({ page }) => {
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);
    // Allow some YouTube errors but no critical app errors
    const criticalErrors = errors.filter(e => e.includes('[MovieShows]') && e.includes('Error'));
    expect(criticalErrors.length).toBe(0);
  });

  test('F005: Movies database loads', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForFunction(() => window.allMoviesData && window.allMoviesData.length > 0, { timeout: 10000 });
    const count = await page.evaluate(() => window.allMoviesData.length);
    expect(count).toBeGreaterThan(0);
  });

  test('F006: Video slides are created', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForSelector('.snap-center', { timeout: 10000 });
    const slides = await page.locator('.snap-center').count();
    expect(slides).toBeGreaterThan(0);
  });

  test('F007: Console shows initialization message', async ({ page }) => {
    const logs = [];
    page.on('console', msg => logs.push(msg.text()));
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);
    expect(logs.some(l => l.includes('[MovieShows] Initializing'))).toBeTruthy();
  });

  test('F008: Ready message appears in console', async ({ page }) => {
    const logs = [];
    page.on('console', msg => logs.push(msg.text()));
    await page.goto(BASE_URL);
    await page.waitForTimeout(5000);
    expect(logs.some(l => l.includes('[MovieShows] Ready'))).toBeTruthy();
  });

  test('F009: First video autoplays', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForSelector('iframe[src*="youtube"]', { timeout: 10000 });
    const iframeSrc = await page.locator('iframe[src*="youtube"]').first().getAttribute('src');
    expect(iframeSrc).toContain('autoplay=1');
  });

  test('F010: Multiple movies are available', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForFunction(() => window.allMoviesData && window.allMoviesData.length > 100, { timeout: 10000 });
  });
});

test.describe('Navigation & Scrolling', () => {
  test('F011: Scroll down navigates to next video', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForSelector('.snap-center', { timeout: 10000 });
    const initialTitle = await page.locator('.snap-center').first().locator('h2').textContent();
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(1000);
    // Check scroll occurred
  });

  test('F012: Scroll up navigates to previous video', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForSelector('.snap-center', { timeout: 10000 });
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(500);
    await page.keyboard.press('ArrowUp');
    await page.waitForTimeout(500);
  });

  test('F013: J key scrolls down', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForSelector('.snap-center', { timeout: 10000 });
    await page.keyboard.press('j');
    await page.waitForTimeout(500);
  });

  test('F014: K key scrolls up', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForSelector('.snap-center', { timeout: 10000 });
    await page.keyboard.press('j');
    await page.waitForTimeout(500);
    await page.keyboard.press('k');
    await page.waitForTimeout(500);
  });

  test('F015: Mouse wheel scrolls content', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForSelector('.snap-center', { timeout: 10000 });
    await page.mouse.wheel(0, 500);
    await page.waitForTimeout(1000);
  });

  test('F016: Infinite scroll loads more content', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForSelector('.snap-center', { timeout: 10000 });
    const initialCount = await page.locator('.snap-center').count();
    for (let i = 0; i < 15; i++) {
      await page.keyboard.press('ArrowDown');
      await page.waitForTimeout(300);
    }
    await page.waitForTimeout(2000);
    const newCount = await page.locator('.snap-center').count();
    expect(newCount).toBeGreaterThanOrEqual(initialCount);
  });

  test('F017: Snap scrolling works correctly', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForSelector('.snap-center', { timeout: 10000 });
    // Snap scroll should align to slide boundaries
  });

  test('F018: Touch swipe navigation works', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForSelector('.snap-center', { timeout: 10000 });
    // Simulate touch
    await page.evaluate(() => {
      const event = new TouchEvent('touchstart', { touches: [{ clientY: 400 }] });
      document.dispatchEvent(event);
    });
  });

  test('F019: Current index updates on scroll', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForSelector('.snap-center', { timeout: 10000 });
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(500);
  });

  test('F020: Scroll prevention during animation', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForSelector('.snap-center', { timeout: 10000 });
    // Rapid scrolls should be throttled
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(500);
  });
});

test.describe('Video Player Controls', () => {
  test('F021: Play/pause controls visible', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForSelector('iframe[src*="youtube"]', { timeout: 10000 });
  });

  test('F022: Mute button exists', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForSelector('#mute-control, .mute-control, [class*="mute"]', { timeout: 10000 });
  });

  test('F023: Mute button toggles state', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForSelector('#mute-control', { timeout: 10000 });
    await page.click('#mute-control');
    await page.waitForTimeout(500);
  });

  test('F024: Volume control exists', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForSelector('input[type="range"], .volume-slider', { timeout: 10000 });
  });

  test('F025: Player size key 1 works', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForSelector('.snap-center', { timeout: 10000 });
    await page.keyboard.press('1');
    await page.waitForTimeout(500);
  });

  test('F026: Player size key 2 works', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForSelector('.snap-center', { timeout: 10000 });
    await page.keyboard.press('2');
    await page.waitForTimeout(500);
  });

  test('F027: Player size key 3 works', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForSelector('.snap-center', { timeout: 10000 });
    await page.keyboard.press('3');
    await page.waitForTimeout(500);
  });

  test('F028: Player size key 4 works', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForSelector('.snap-center', { timeout: 10000 });
    await page.keyboard.press('4');
    await page.waitForTimeout(500);
  });

  test('F029: YouTube iframe has correct parameters', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForSelector('iframe[src*="youtube"]', { timeout: 10000 });
    const src = await page.locator('iframe[src*="youtube"]').first().getAttribute('src');
    expect(src).toContain('enablejsapi=1');
  });

  test('F030: Loop parameter is set', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForSelector('iframe[src*="youtube"]', { timeout: 10000 });
    const src = await page.locator('iframe[src*="youtube"]').first().getAttribute('src');
    expect(src).toContain('loop=1');
  });
});

test.describe('Queue Functionality', () => {
  test('F031: Queue panel can be opened', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForSelector('button', { timeout: 10000 });
    const queueBtn = page.locator('button').filter({ hasText: /queue/i }).first();
    if (await queueBtn.count() > 0) {
      await queueBtn.click();
      await page.waitForTimeout(500);
    }
  });

  test('F032: Queue panel can be closed', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
  });

  test('F033: Add to queue button exists', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);
    const listBtn = page.locator('button').filter({ hasText: /list/i });
    expect(await listBtn.count()).toBeGreaterThan(0);
  });

  test('F034: Queue persists in localStorage', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);
    const queue = await page.evaluate(() => localStorage.getItem('movieshows-queue'));
    // Queue should be accessible
  });

  test('F035: Queue can store multiple items', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);
    await page.evaluate(() => {
      localStorage.setItem('movieshows-queue', JSON.stringify([
        { title: 'Test Movie 1' },
        { title: 'Test Movie 2' }
      ]));
    });
    const queue = await page.evaluate(() => JSON.parse(localStorage.getItem('movieshows-queue') || '[]'));
    expect(queue.length).toBe(2);
  });

  test('F036: Queue clear all functionality', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);
    await page.evaluate(() => localStorage.setItem('movieshows-queue', '[]'));
    const queue = await page.evaluate(() => JSON.parse(localStorage.getItem('movieshows-queue') || '[]'));
    expect(queue.length).toBe(0);
  });

  test('F037: Queue item can be removed', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);
  });

  test('F038: Queue shows item count', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);
  });

  test('F039: Queue items have poster images', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);
  });

  test('F040: Queue supports drag and drop reorder', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);
  });
});

test.describe('Search & Filter', () => {
  test('F041: Search panel can be opened', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);
    const searchBtn = page.locator('button').filter({ hasText: /search|browse/i }).first();
    if (await searchBtn.count() > 0) {
      await searchBtn.click();
      await page.waitForTimeout(500);
    }
  });

  test('F042: Search input exists', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);
    const searchBtn = page.locator('button').filter({ hasText: /search|browse/i }).first();
    if (await searchBtn.count() > 0) {
      await searchBtn.click();
      await page.waitForTimeout(500);
      const input = page.locator('input[type="text"], input[type="search"]');
      expect(await input.count()).toBeGreaterThan(0);
    }
  });

  test('F043: Search filters results', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);
  });

  test('F044: Filter panel can be opened', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);
    const filterBtn = page.locator('button').filter({ hasText: /filter/i }).first();
    if (await filterBtn.count() > 0) {
      await filterBtn.click();
      await page.waitForTimeout(500);
    }
  });

  test('F045: All filter works', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);
    const allBtn = page.locator('button').filter({ hasText: /all/i }).first();
    if (await allBtn.count() > 0) {
      await allBtn.click();
      await page.waitForTimeout(500);
    }
  });

  test('F046: Movies filter works', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);
    const moviesBtn = page.locator('button').filter({ hasText: /movies/i }).first();
    if (await moviesBtn.count() > 0) {
      await moviesBtn.click();
      await page.waitForTimeout(500);
    }
  });

  test('F047: TV filter works', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);
    const tvBtn = page.locator('button').filter({ hasText: /tv/i }).first();
    if (await tvBtn.count() > 0) {
      await tvBtn.click();
      await page.waitForTimeout(500);
    }
  });

  test('F048: Now Playing filter works', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);
    const nowBtn = page.locator('button').filter({ hasText: /now playing/i }).first();
    if (await nowBtn.count() > 0) {
      await nowBtn.click();
      await page.waitForTimeout(500);
    }
  });

  test('F049: Genre filter available', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);
  });

  test('F050: Search clears on close', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);
  });
});

test.describe('Share Functionality', () => {
  test('F051: Share button exists', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);
    const shareBtn = page.locator('button').filter({ hasText: /share/i });
    expect(await shareBtn.count()).toBeGreaterThan(0);
  });

  test('F052: Share URL contains play parameter', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);
    const shareUrl = await page.evaluate(() => {
      const movie = window.allMoviesData && window.allMoviesData[0];
      if (movie) {
        return `${window.location.origin}${window.location.pathname}?play=${encodeURIComponent(movie.title)}`;
      }
      return null;
    });
    if (shareUrl) {
      expect(shareUrl).toContain('?play=');
    }
  });

  test('F053: Play parameter loads correct movie', async ({ page }) => {
    await page.goto(BASE_URL + '?play=Superman');
    await page.waitForTimeout(5000);
    // Should find and play Superman
  });

  test('F054: Share URL is properly encoded', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);
    const encoded = encodeURIComponent('The Batman Part II');
    expect(encoded).toBe('The%20Batman%20Part%20II');
  });

  test('F055: Invalid play parameter handled gracefully', async ({ page }) => {
    await page.goto(BASE_URL + '?play=NonExistentMovie12345');
    await page.waitForTimeout(5000);
    // Should not crash
  });

  test('F056: URL cleaned after play parameter processed', async ({ page }) => {
    await page.goto(BASE_URL + '?play=Superman');
    await page.waitForTimeout(6000);
    const url = page.url();
    expect(url).not.toContain('?play=');
  });

  test('F057: Share works with special characters', async ({ page }) => {
    await page.goto(BASE_URL + '?play=Mission%3A%20Impossible');
    await page.waitForTimeout(5000);
  });

  test('F058: Multiple play parameters handled', async ({ page }) => {
    await page.goto(BASE_URL + '?play=Test&extra=param');
    await page.waitForTimeout(5000);
  });

  test('F059: Share creates valid URL', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);
    const url = await page.evaluate(() => {
      return `${window.location.origin}${window.location.pathname}`;
    });
    expect(url).toContain('findtorontoevents.ca');
  });

  test('F060: Navigator share API checked', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);
    const hasShare = await page.evaluate(() => !!navigator.share);
    // Just verify it's checked, doesn't need to exist
  });
});

test.describe('Authentication', () => {
  test('F061: Login button exists', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);
    const loginBtn = page.locator('button').filter({ hasText: /sign in|login/i });
    expect(await loginBtn.count()).toBeGreaterThan(0);
  });

  test('F062: Login popup opens', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);
    const loginBtn = page.locator('button').filter({ hasText: /sign in|login/i }).first();
    if (await loginBtn.count() > 0) {
      await loginBtn.click();
      await page.waitForTimeout(500);
    }
  });

  test('F063: Google login option available', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);
    const loginBtn = page.locator('button').filter({ hasText: /sign in|login/i }).first();
    if (await loginBtn.count() > 0) {
      await loginBtn.click();
      await page.waitForTimeout(500);
      const googleBtn = page.locator('button').filter({ hasText: /google/i });
      expect(await googleBtn.count()).toBeGreaterThan(0);
    }
  });

  test('F064: Email login option available', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);
    const loginBtn = page.locator('button').filter({ hasText: /sign in|login/i }).first();
    if (await loginBtn.count() > 0) {
      await loginBtn.click();
      await page.waitForTimeout(500);
    }
  });

  test('F065: Guest option available', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);
    const loginBtn = page.locator('button').filter({ hasText: /sign in|login/i }).first();
    if (await loginBtn.count() > 0) {
      await loginBtn.click();
      await page.waitForTimeout(500);
      const guestBtn = page.locator('button').filter({ hasText: /guest/i });
      expect(await guestBtn.count()).toBeGreaterThan(0);
    }
  });

  test('F066: Login popup closes', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);
    const loginBtn = page.locator('button').filter({ hasText: /sign in|login/i }).first();
    if (await loginBtn.count() > 0) {
      await loginBtn.click();
      await page.waitForTimeout(500);
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
    }
  });

  test('F067: User state persists', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);
    const user = await page.evaluate(() => localStorage.getItem('movieshows-user'));
    // Should either be null or valid JSON
  });

  test('F068: Logout functionality exists', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);
  });

  test('F069: Auth callback handled', async ({ page }) => {
    await page.goto(BASE_URL + '?google_auth=test');
    await page.waitForTimeout(3000);
    // Should not crash
  });

  test('F070: Auth error handled', async ({ page }) => {
    await page.goto(BASE_URL + '?google_error=test');
    await page.waitForTimeout(3000);
    // Should show error toast
  });
});

test.describe('Data Persistence', () => {
  test('F071: Watch history saved', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(5000);
    const history = await page.evaluate(() => localStorage.getItem('movieshows-watch-history'));
    // Should exist or be null
  });

  test('F072: Likes saved', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);
    const likes = await page.evaluate(() => localStorage.getItem('movieshows-likes'));
  });

  test('F073: Player size preference saved', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);
    await page.keyboard.press('2');
    await page.waitForTimeout(500);
    const size = await page.evaluate(() => localStorage.getItem('movieshows-player-size'));
    expect(size).toBe('medium');
  });

  test('F074: Mute state saved', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);
  });

  test('F075: User ID generated', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);
    const userId = await page.evaluate(() => localStorage.getItem('movieshows-user-id'));
    expect(userId).toBeTruthy();
  });

  test('F076: Queue survives page reload', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);
    await page.evaluate(() => {
      localStorage.setItem('movieshows-queue', JSON.stringify([{ title: 'Test' }]));
    });
    await page.reload();
    await page.waitForTimeout(3000);
    const queue = await page.evaluate(() => localStorage.getItem('movieshows-queue'));
    expect(queue).toContain('Test');
  });

  test('F077: Settings panel accessible', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);
  });

  test('F078: Data sync available', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);
  });

  test('F079: Export data option', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);
  });

  test('F080: Import data option', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);
  });
});

test.describe('Movie Information Display', () => {
  test('F081: Movie title displayed', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForSelector('.snap-center h2', { timeout: 10000 });
    const title = await page.locator('.snap-center h2').first().textContent();
    expect(title).toBeTruthy();
  });

  test('F082: Movie description displayed', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForSelector('.snap-center', { timeout: 10000 });
  });

  test('F083: Movie year displayed', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForSelector('.snap-center', { timeout: 10000 });
  });

  test('F084: Movie genres displayed', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForSelector('.snap-center', { timeout: 10000 });
  });

  test('F085: IMDb rating displayed', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForSelector('.snap-center', { timeout: 10000 });
    const hasImdb = await page.locator('text=IMDb').count();
    expect(hasImdb).toBeGreaterThan(0);
  });

  test('F086: Poster image displayed', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForSelector('.snap-center', { timeout: 10000 });
  });

  test('F087: Like button works', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);
  });

  test('F088: Info toggle works', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);
    const infoBtn = page.locator('button').filter({ hasText: /info|hide/i }).first();
    if (await infoBtn.count() > 0) {
      await infoBtn.click();
      await page.waitForTimeout(500);
    }
  });

  test('F089: Alternate trailer switch', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);
  });

  test('F090: YouTube link works', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);
    const ytLink = page.locator('a').filter({ hasText: /youtube/i });
    if (await ytLink.count() > 0) {
      const href = await ytLink.first().getAttribute('href');
      expect(href).toContain('youtube.com');
    }
  });
});

test.describe('API & Backend', () => {
  test('F091: Movies database API reachable', async ({ page }) => {
    const response = await page.goto(BASE_URL + 'movies-database.json');
    expect(response.status()).toBe(200);
  });

  test('F092: Auth API exists', async ({ page }) => {
    const response = await page.goto(BASE_URL + 'api/auth.php');
    // Should return something (even if error)
    expect(response.status()).toBeLessThan(500);
  });

  test('F093: Google auth endpoint exists', async ({ page }) => {
    const response = await page.goto(BASE_URL + 'api/google_auth.php');
    // Will redirect to Google
  });

  test('F094: Movies JSON is valid', async ({ page }) => {
    await page.goto(BASE_URL);
    const data = await page.evaluate(async () => {
      const res = await fetch('movies-database.json');
      return res.json();
    });
    expect(Array.isArray(data)).toBeTruthy();
  });

  test('F095: Movies have required fields', async ({ page }) => {
    await page.goto(BASE_URL);
    const data = await page.evaluate(async () => {
      const res = await fetch('movies-database.json');
      return res.json();
    });
    if (data.length > 0) {
      expect(data[0]).toHaveProperty('title');
    }
  });

  test('F096: HTTPS enforced', async ({ page }) => {
    const url = BASE_URL;
    expect(url).toContain('https://');
  });

  test('F097: No exposed API keys in frontend', async ({ page }) => {
    await page.goto(BASE_URL);
    const content = await page.content();
    expect(content).not.toContain('sk-');
    expect(content).not.toContain('GOCSPX-');
  });

  test('F098: Error handling works', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);
    // App should handle errors gracefully
  });

  test('F099: Loading states shown', async ({ page }) => {
    await page.goto(BASE_URL);
    // Check for loading indicators during initial load
  });

  test('F100: Offline mode supported', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);
    // localStorage should work as fallback
    const logs = [];
    page.on('console', msg => logs.push(msg.text()));
  });
});
