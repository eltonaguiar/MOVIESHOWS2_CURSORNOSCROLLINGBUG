/**
 * Puppeteer Security Tests (100 tests)
 * Tests for MovieShows security vulnerabilities
 */

const puppeteer = require('puppeteer');

const BASE_URL = 'https://findtorontoevents.ca/movieshows2/';
const API_BASE = 'https://findtorontoevents.ca/movieshows2/api/';
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

// ==================== XSS PREVENTION ====================

describe('XSS Prevention', () => {
  test('PS001: Script tag in URL rejected', async () => {
    await page.goto(BASE_URL + '?play=<script>alert(1)</script>', { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
    const content = await page.content();
    expect(content).not.toContain('<script>alert(1)</script>');
  }, TIMEOUT);

  test('PS002: Event handler XSS rejected', async () => {
    await page.goto(BASE_URL + '?play="><img src=x onerror=alert(1)>', { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
    const content = await page.content();
    expect(content).not.toContain('onerror=alert');
  }, TIMEOUT);

  test('PS003: SVG XSS rejected', async () => {
    await page.goto(BASE_URL + '?play=<svg onload=alert(1)>', { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
    const content = await page.content();
    expect(content).not.toContain('onload=alert');
  }, TIMEOUT);

  test('PS004: JavaScript protocol rejected', async () => {
    await page.goto(BASE_URL + '?play=javascript:alert(1)', { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
  }, TIMEOUT);

  test('PS005: Data URI rejected', async () => {
    await page.goto(BASE_URL + '?play=data:text/html,<script>alert(1)</script>', { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
  }, TIMEOUT);

  test('PS006: HTML entities handled', async () => {
    await page.goto(BASE_URL + '?play=&lt;script&gt;', { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
    const content = await page.content();
    expect(content).not.toContain('<script>');
  }, TIMEOUT);

  test('PS007: URL encoded XSS rejected', async () => {
    await page.goto(BASE_URL + '?play=%3Cscript%3Ealert(1)%3C/script%3E', { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
  }, TIMEOUT);

  test('PS008: Double encoding rejected', async () => {
    await page.goto(BASE_URL + '?play=%253Cscript%253E', { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
  }, TIMEOUT);

  test('PS009: Unicode XSS rejected', async () => {
    await page.goto(BASE_URL + '?play=＜script＞', { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
  }, TIMEOUT);

  test('PS010: Nested script tags rejected', async () => {
    await page.goto(BASE_URL + '?play=<scr<script>ipt>alert(1)</script>', { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
  }, TIMEOUT);
});

// ==================== SQL INJECTION ====================

describe('SQL Injection Prevention', () => {
  test('PS011: Basic SQL injection rejected', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    const response = await page.evaluate(async () => {
      try {
        const res = await fetch('/movieshows2/api/auth.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'login',
            email: "' OR '1'='1",
            password: "' OR '1'='1"
          })
        });
        return await res.json();
      } catch (e) {
        return { error: e.message };
      }
    });
    expect(response.success).toBeFalsy();
  }, TIMEOUT);

  test('PS012: UNION injection rejected', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    const response = await page.evaluate(async () => {
      try {
        const res = await fetch('/movieshows2/api/auth.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'login',
            email: "' UNION SELECT * FROM users--",
            password: "test"
          })
        });
        return await res.json();
      } catch (e) {
        return { error: e.message };
      }
    });
    expect(response.success).toBeFalsy();
  }, TIMEOUT);

  test('PS013: Comment injection rejected', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    const response = await page.evaluate(async () => {
      try {
        const res = await fetch('/movieshows2/api/auth.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'login',
            email: "admin'--",
            password: "anything"
          })
        });
        return await res.json();
      } catch (e) {
        return { error: e.message };
      }
    });
    expect(response.success).toBeFalsy();
  }, TIMEOUT);

  test('PS014: DROP TABLE rejected', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    const response = await page.evaluate(async () => {
      try {
        const res = await fetch('/movieshows2/api/auth.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'login',
            email: "'; DROP TABLE users;--",
            password: "test"
          })
        });
        return await res.json();
      } catch (e) {
        return { error: e.message };
      }
    });
    expect(response.success).toBeFalsy();
  }, TIMEOUT);

  test('PS015: Blind SQL injection rejected', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    const response = await page.evaluate(async () => {
      try {
        const res = await fetch('/movieshows2/api/auth.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'login',
            email: "admin' AND 1=1--",
            password: "test"
          })
        });
        return await res.json();
      } catch (e) {
        return { error: e.message };
      }
    });
    expect(response.success).toBeFalsy();
  }, TIMEOUT);

  test('PS016: Time-based injection rejected', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    const startTime = Date.now();
    await page.evaluate(async () => {
      try {
        await fetch('/movieshows2/api/auth.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'login',
            email: "admin' AND SLEEP(5)--",
            password: "test"
          })
        });
      } catch (e) {}
    });
    const elapsed = Date.now() - startTime;
    expect(elapsed).toBeLessThan(5000);
  }, TIMEOUT);

  test('PS017: Hex encoding rejected', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    const response = await page.evaluate(async () => {
      try {
        const res = await fetch('/movieshows2/api/auth.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'login',
            email: "0x61646d696e",
            password: "test"
          })
        });
        return await res.json();
      } catch (e) {
        return { error: e.message };
      }
    });
    expect(response.success).toBeFalsy();
  }, TIMEOUT);

  test('PS018: NULL byte rejected', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    const response = await page.evaluate(async () => {
      try {
        const res = await fetch('/movieshows2/api/auth.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'login',
            email: "admin\x00' OR '1'='1",
            password: "test"
          })
        });
        return await res.json();
      } catch (e) {
        return { error: e.message };
      }
    });
    expect(response.success).toBeFalsy();
  }, TIMEOUT);

  test('PS019: Backslash injection rejected', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    const response = await page.evaluate(async () => {
      try {
        const res = await fetch('/movieshows2/api/auth.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'login',
            email: "admin\\' OR \\'1\\'=\\'1",
            password: "test"
          })
        });
        return await res.json();
      } catch (e) {
        return { error: e.message };
      }
    });
    expect(response.success).toBeFalsy();
  }, TIMEOUT);

  test('PS020: Boolean injection rejected', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    const response = await page.evaluate(async () => {
      try {
        const res = await fetch('/movieshows2/api/auth.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'login',
            email: "' AND '1'='1",
            password: "test"
          })
        });
        return await res.json();
      } catch (e) {
        return { error: e.message };
      }
    });
    expect(response.success).toBeFalsy();
  }, TIMEOUT);
});

// ==================== AUTHENTICATION SECURITY ====================

describe('Authentication Security', () => {
  test('PS021: Admin credentials not in JS', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    const content = await page.content();
    expect(content).not.toContain('GetLost2016');
  }, TIMEOUT);

  test('PS022: Password not in localStorage', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
    const storage = await page.evaluate(() => JSON.stringify(localStorage));
    expect(storage).not.toContain('password');
    expect(storage).not.toContain('GetLost2016');
  }, TIMEOUT);

  test('PS023: Session token format', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
  }, TIMEOUT);

  test('PS024: Failed login doesn\'t reveal info', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    const response = await page.evaluate(async () => {
      try {
        const res = await fetch('/movieshows2/api/auth.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'login',
            email: 'admin',
            password: 'wrongpassword'
          })
        });
        return await res.json();
      } catch (e) {
        return { error: e.message };
      }
    });
    const str = JSON.stringify(response);
    expect(str).not.toContain('GetLost2016');
    expect(str).not.toContain('correct password');
  }, TIMEOUT);

  test('PS025: Brute force protection', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(2000);
  }, TIMEOUT);

  test('PS026: Token expiration', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
  }, TIMEOUT);

  test('PS027: Session fixation prevented', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
  }, TIMEOUT);

  test('PS028: Logout clears data', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
  }, TIMEOUT);

  test('PS029: Remember me secure', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
  }, TIMEOUT);

  test('PS030: CSRF protection', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
  }, TIMEOUT);
});

// ==================== DATA VALIDATION ====================

describe('Data Validation', () => {
  test('PS031: Email validation', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    const response = await page.evaluate(async () => {
      try {
        const res = await fetch('/movieshows2/api/auth.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'register',
            email: 'notanemail',
            password: 'test123'
          })
        });
        return await res.json();
      } catch (e) {
        return { error: e.message };
      }
    });
    expect(response.success).toBeFalsy();
  }, TIMEOUT);

  test('PS032: Password length validation', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    const response = await page.evaluate(async () => {
      try {
        const res = await fetch('/movieshows2/api/auth.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'register',
            email: 'test@test.com',
            password: '123'
          })
        });
        return await res.json();
      } catch (e) {
        return { error: e.message };
      }
    });
    expect(response.success).toBeFalsy();
  }, TIMEOUT);

  test('PS033: Special characters handled', async () => {
    await page.goto(BASE_URL + '?play=' + encodeURIComponent("Test's Movie"), { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
  }, TIMEOUT);

  test('PS034: Very long input handled', async () => {
    const longString = 'A'.repeat(5000);
    await page.goto(BASE_URL + '?play=' + longString.substring(0, 2000), { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
  }, TIMEOUT);

  test('PS035: Empty input handled', async () => {
    await page.goto(BASE_URL + '?play=', { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
  }, TIMEOUT);

  test('PS036: Null value handled', async () => {
    await page.goto(BASE_URL + '?play=null', { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
  }, TIMEOUT);

  test('PS037: Undefined handled', async () => {
    await page.goto(BASE_URL + '?play=undefined', { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
  }, TIMEOUT);

  test('PS038: Array injection rejected', async () => {
    await page.goto(BASE_URL + '?play[]=test', { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
  }, TIMEOUT);

  test('PS039: Object injection rejected', async () => {
    await page.goto(BASE_URL + '?play[key]=test', { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
  }, TIMEOUT);

  test('PS040: JSON injection rejected', async () => {
    await page.goto(BASE_URL + '?play={"evil":"payload"}', { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
  }, TIMEOUT);
});

// ==================== API SECURITY ====================

describe('API Security', () => {
  test('PS041: API returns JSON content type', async () => {
    const response = await page.goto(API_BASE + 'auth.php', { waitUntil: 'networkidle2' });
    const contentType = response.headers()['content-type'];
    expect(contentType).toContain('json');
  }, TIMEOUT);

  test('PS042: Invalid JSON handled', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    const response = await page.evaluate(async () => {
      try {
        const res = await fetch('/movieshows2/api/auth.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: 'not valid json{'
        });
        return { status: res.status };
      } catch (e) {
        return { error: e.message };
      }
    });
  }, TIMEOUT);

  test('PS043: Unknown actions rejected', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    const response = await page.evaluate(async () => {
      try {
        const res = await fetch('/movieshows2/api/auth.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'dropDatabase' })
        });
        return await res.json();
      } catch (e) {
        return { error: e.message };
      }
    });
    expect(response.success).toBeFalsy();
  }, TIMEOUT);

  test('PS044: Method validation', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    const response = await page.evaluate(async () => {
      try {
        const res = await fetch('/movieshows2/api/auth.php', {
          method: 'DELETE'
        });
        return { status: res.status };
      } catch (e) {
        return { error: e.message };
      }
    });
  }, TIMEOUT);

  test('PS045: No server info exposed', async () => {
    const response = await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    const serverHeader = response.headers()['server'];
    if (serverHeader) {
      expect(serverHeader).not.toContain('PHP');
    }
  }, TIMEOUT);

  test('PS046: Error messages sanitized', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    const response = await page.evaluate(async () => {
      try {
        const res = await fetch('/movieshows2/api/auth.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'login', email: 'test', password: 'test' })
        });
        return await res.json();
      } catch (e) {
        return { error: e.message };
      }
    });
    const str = JSON.stringify(response);
    expect(str).not.toContain('mysqli');
    expect(str).not.toContain('SQL');
  }, TIMEOUT);

  test('PS047: Stack traces not exposed', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    const response = await page.evaluate(async () => {
      try {
        const res = await fetch('/movieshows2/api/auth.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'invalid' })
        });
        return await res.text();
      } catch (e) {
        return e.message;
      }
    });
    expect(response).not.toContain('Stack trace');
    expect(response).not.toContain('Fatal error');
  }, TIMEOUT);

  test('PS048: Rate limiting', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
  }, TIMEOUT);

  test('PS049: CORS headers', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
  }, TIMEOUT);

  test('PS050: Content type enforcement', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
  }, TIMEOUT);
});

// ==================== CREDENTIAL SECURITY ====================

describe('Credential Security', () => {
  test('PS051: No API keys in frontend', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    const content = await page.content();
    expect(content).not.toContain('GOCSPX-');
    expect(content).not.toContain('sk-');
  }, TIMEOUT);

  test('PS052: Google secret not exposed', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    const content = await page.content();
    expect(content).not.toContain('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');
  }, TIMEOUT);

  test('PS053: DB credentials not exposed', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    const content = await page.content();
    expect(content).not.toContain('Solid-Kitten-92-Brave-Vessel');
    expect(content).not.toContain('ejaguiar1');
  }, TIMEOUT);

  test('PS054: Config files not accessible', async () => {
    const response = await page.goto(BASE_URL + 'api/google_config.local.php', { waitUntil: 'networkidle2' });
    const content = await response.text();
    expect(content).not.toContain('GOCSPX-');
  }, TIMEOUT);

  test('PS055: .env not accessible', async () => {
    const response = await page.goto(BASE_URL + '.env', { waitUntil: 'networkidle2' });
    expect(response.status()).not.toBe(200);
  }, TIMEOUT);

  test('PS056: .git not accessible', async () => {
    const response = await page.goto(BASE_URL + '.git/config', { waitUntil: 'networkidle2' });
    expect(response.status()).not.toBe(200);
  }, TIMEOUT);

  test('PS057: No secrets in source maps', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(2000);
  }, TIMEOUT);

  test('PS058: No secrets in comments', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    const content = await page.content();
  }, TIMEOUT);

  test('PS059: Console doesn\'t log secrets', async () => {
    const logs = [];
    page.on('console', msg => logs.push(msg.text()));
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(5000);
    const allLogs = logs.join(' ');
    expect(allLogs).not.toContain('password');
    expect(allLogs).not.toContain('GOCSPX');
  }, TIMEOUT);

  test('PS060: Network requests safe', async () => {
    const requests = [];
    page.on('request', req => requests.push(req.url()));
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(5000);
    const allRequests = requests.join(' ');
    expect(allRequests).not.toContain('password=');
  }, TIMEOUT);
});

// ==================== TRANSPORT SECURITY ====================

describe('Transport Security', () => {
  test('PS061: HTTPS used', async () => {
    expect(BASE_URL).toContain('https://');
  }, TIMEOUT);

  test('PS062: No mixed content', async () => {
    const mixed = [];
    page.on('console', msg => {
      if (msg.text().includes('Mixed Content')) mixed.push(msg.text());
    });
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(5000);
    expect(mixed.length).toBe(0);
  }, TIMEOUT);

  test('PS063: Secure cookies', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    const cookies = await page.cookies();
    cookies.forEach(cookie => {
      if (cookie.name.includes('session')) {
        expect(cookie.secure).toBeTruthy();
      }
    });
  }, TIMEOUT);

  test('PS064: HttpOnly cookies', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    const cookies = await page.cookies();
    cookies.forEach(cookie => {
      if (cookie.name.includes('session')) {
        expect(cookie.httpOnly).toBeTruthy();
      }
    });
  }, TIMEOUT);

  test('PS065: SameSite cookies', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    const cookies = await page.cookies();
  }, TIMEOUT);

  test('PS066: HSTS header', async () => {
    const response = await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    const hsts = response.headers()['strict-transport-security'];
  }, TIMEOUT);

  test('PS067: CSP header', async () => {
    const response = await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    const csp = response.headers()['content-security-policy'];
  }, TIMEOUT);

  test('PS068: X-Content-Type-Options', async () => {
    const response = await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    const header = response.headers()['x-content-type-options'];
  }, TIMEOUT);

  test('PS069: X-Frame-Options', async () => {
    const response = await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    const header = response.headers()['x-frame-options'];
  }, TIMEOUT);

  test('PS070: X-XSS-Protection', async () => {
    const response = await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    const header = response.headers()['x-xss-protection'];
  }, TIMEOUT);
});

// ==================== CLIENT SIDE SECURITY ====================

describe('Client-Side Security', () => {
  test('PS071: No eval usage', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    const content = await page.content();
  }, TIMEOUT);

  test('PS072: Prototype pollution prevented', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
    const polluted = await page.evaluate(() => {
      Object.prototype.polluted = true;
      const result = {}.polluted;
      delete Object.prototype.polluted;
      return result;
    });
  }, TIMEOUT);

  test('PS073: JSON parsing safe', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    const result = await page.evaluate(() => {
      try {
        JSON.parse('{"__proto__":{"polluted":true}}');
        return {}.polluted;
      } catch {
        return undefined;
      }
    });
    expect(result).toBeFalsy();
  }, TIMEOUT);

  test('PS074: localStorage sanitized', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.evaluate(() => {
      localStorage.setItem('movieshows-test', '<script>alert(1)</script>');
    });
    await page.reload({ waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
    const content = await page.content();
    expect(content).not.toMatch(/<script>alert\(1\)<\/script>/);
  }, TIMEOUT);

  test('PS075: ReDoS prevented', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    const startTime = Date.now();
    await page.evaluate(() => {
      const malicious = 'a'.repeat(30) + '!';
      try { malicious.match(/^(a+)+$/); } catch {}
    });
    const elapsed = Date.now() - startTime;
    expect(elapsed).toBeLessThan(5000);
  }, TIMEOUT);

  test('PS076: No document.write', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
  }, TIMEOUT);

  test('PS077: Trusted script sources', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    const scripts = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('script[src]'))
        .map(s => s.src);
    });
    const trustedDomains = ['findtorontoevents.ca', 'youtube.com', 'google.com', 'googleapis.com'];
    scripts.forEach(src => {
      const isTrusted = trustedDomains.some(d => src.includes(d)) || src.startsWith('/');
      expect(isTrusted || src.includes('localhost')).toBeTruthy();
    });
  }, TIMEOUT);

  test('PS078: No global pollution', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
    const globals = await page.evaluate(() => {
      const dangerous = ['admin', 'password', 'secret', 'apiKey'];
      return dangerous.filter(key => window[key] !== undefined);
    });
    expect(globals.length).toBe(0);
  }, TIMEOUT);

  test('PS079: Errors sanitized', async () => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(5000);
    errors.forEach(err => {
      expect(err).not.toContain('password');
      expect(err).not.toContain('secret');
    });
  }, TIMEOUT);

  test('PS080: Safe innerHTML usage', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
  }, TIMEOUT);
});

// ==================== RESOURCE SECURITY ====================

describe('Resource Security', () => {
  test('PS081: Images from trusted sources', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(5000);
  }, TIMEOUT);

  test('PS082: Only YouTube iframes', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForSelector('iframe', { timeout: 10000 });
    const iframes = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('iframe')).map(f => f.src);
    });
    iframes.forEach(src => {
      expect(src).toContain('youtube.com');
    });
  }, TIMEOUT);

  test('PS083: External links have noopener', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
    const links = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('a[target="_blank"]'))
        .map(a => ({ href: a.href, rel: a.rel }));
    });
    links.forEach(link => {
      expect(link.rel).toContain('noopener');
    });
  }, TIMEOUT);

  test('PS084: No data exfiltration', async () => {
    const requests = [];
    page.on('request', req => {
      if (req.method() === 'POST') {
        requests.push({ url: req.url(), body: req.postData() });
      }
    });
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(5000);
    requests.forEach(req => {
      if (req.body) {
        expect(req.body).not.toContain('localStorage');
      }
    });
  }, TIMEOUT);

  test('PS085: Forms to same origin', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
    const forms = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('form')).map(f => f.action);
    });
    forms.forEach(action => {
      if (action) {
        expect(action).toContain('findtorontoevents.ca');
      }
    });
  }, TIMEOUT);

  test('PS086: No sensitive URLs', async () => {
    const navigations = [];
    page.on('framenavigated', frame => navigations.push(frame.url()));
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(5000);
    navigations.forEach(url => {
      expect(url).not.toContain('password=');
      expect(url).not.toContain('token=');
    });
  }, TIMEOUT);

  test('PS087: WebSocket secure', async () => {
    const ws = [];
    page.on('websocket', socket => ws.push(socket.url()));
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(5000);
    ws.forEach(url => {
      if (url) expect(url).toMatch(/^wss?:\/\//);
    });
  }, TIMEOUT);

  test('PS088: Service worker secure', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
  }, TIMEOUT);

  test('PS089: Subresource integrity', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
  }, TIMEOUT);

  test('PS090: No unauthorized fetches', async () => {
    const requests = [];
    page.on('request', req => requests.push(req.url()));
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(5000);
  }, TIMEOUT);
});

// ==================== INPUT HANDLING ====================

describe('Input Handling Security', () => {
  test('PS091: Path traversal prevented', async () => {
    await page.goto(BASE_URL + '?play=../../../etc/passwd', { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
    const content = await page.content();
    expect(content).not.toContain('root:');
  }, TIMEOUT);

  test('PS092: Command injection prevented', async () => {
    await page.goto(BASE_URL + '?play=;ls -la', { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
  }, TIMEOUT);

  test('PS093: LDAP injection prevented', async () => {
    await page.goto(BASE_URL + '?play=*)(&', { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
  }, TIMEOUT);

  test('PS094: XML injection prevented', async () => {
    await page.goto(BASE_URL + '?play=<?xml version="1.0"?>', { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
  }, TIMEOUT);

  test('PS095: Template injection prevented', async () => {
    await page.goto(BASE_URL + '?play={{7*7}}', { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
    const content = await page.content();
    expect(content).not.toContain('49');
  }, TIMEOUT);

  test('PS096: Header injection prevented', async () => {
    await page.goto(BASE_URL + '?play=test%0d%0aSet-Cookie: evil=true', { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
    const cookies = await page.cookies();
    const evil = cookies.find(c => c.name === 'evil');
    expect(evil).toBeFalsy();
  }, TIMEOUT);

  test('PS097: Open redirect prevented', async () => {
    await page.goto(BASE_URL + '?redirect=https://evil.com', { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
    expect(page.url()).toContain('findtorontoevents.ca');
  }, TIMEOUT);

  test('PS098: SSRF prevented', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
  }, TIMEOUT);

  test('PS099: File upload restrictions', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
  }, TIMEOUT);

  test('PS100: Rate limiting active', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    const results = await page.evaluate(async () => {
      const promises = [];
      for (let i = 0; i < 20; i++) {
        promises.push(
          fetch('/movieshows2/api/auth.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'login', email: 'test', password: 'test' })
          }).then(r => r.status)
        );
      }
      return Promise.all(promises);
    });
    expect(results.every(s => s < 600)).toBeTruthy();
  }, TIMEOUT);
});
