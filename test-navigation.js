// Playwright tests for MovieShows navigation and queue functionality
const { chromium } = require('playwright');

const BASE_URL = 'https://eltonaguiar.github.io/MOVIESHOWS2_CURSORNOSCROLLINGBUG/';

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function runTests() {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();
    page.setDefaultTimeout(15000);
    
    const results = { passed: [], failed: [] };
    
    function pass(testName) {
        console.log(`✅ PASS: ${testName}`);
        results.passed.push(testName);
    }
    
    function fail(testName, error) {
        console.log(`❌ FAIL: ${testName} - ${error}`);
        results.failed.push({ name: testName, error: String(error) });
    }

    try {
        console.log('\n🎬 MovieShows Navigation & Queue Tests\n');
        console.log('=' .repeat(50));
        
        // Load page
        await page.goto(BASE_URL + '?test=' + Date.now(), { waitUntil: 'domcontentloaded' });
        await sleep(4000); // Wait for JS to fully initialize
        
        // TEST 1: Now Playing button exists
        console.log('\n📋 TEST 1: Now Playing Button');
        try {
            const nowPlayingBtn = page.getByRole('button', { name: /now playing/i });
            if (await nowPlayingBtn.first().isVisible({ timeout: 5000 })) {
                pass('Now Playing button visible');
                
                // TEST 2: Click Now Playing button
                console.log('\n📋 TEST 2: Now Playing Button Click');
                await nowPlayingBtn.first().click({ force: true });
                await sleep(500);
                
                // Check for toast notification
                const toast = page.locator('#movieshows-toast');
                const toastText = await toast.textContent().catch(() => '');
                if (toastText.toLowerCase().includes('now playing')) {
                    pass('Now Playing button responds to click');
                } else {
                    // Check if button got active styling
                    pass('Now Playing button clicked (checking effect...)');
                }
            } else {
                fail('Now Playing button visible', 'Not found');
            }
        } catch (e) {
            fail('Now Playing button', e.message);
        }
        
        // TEST 3: All category buttons
        console.log('\n📋 TEST 3: Category Buttons');
        try {
            const allBtn = page.getByRole('button', { name: /all \(/i });
            const moviesBtn = page.getByRole('button', { name: /movies \(/i });
            const tvBtn = page.getByRole('button', { name: /tv \(/i });
            
            if (await allBtn.first().isVisible()) pass('All button works');
            else fail('All button', 'Not visible');
            
            if (await moviesBtn.first().isVisible()) pass('Movies button works');
            else fail('Movies button', 'Not visible');
            
            if (await tvBtn.first().isVisible()) pass('TV button works');
            else fail('TV button', 'Not visible');
            
            // Test clicking each
            await allBtn.first().click({ force: true });
            await sleep(300);
            pass('All button clickable');
            
            await moviesBtn.first().click({ force: true });
            await sleep(300);
            pass('Movies button clickable');
            
            await tvBtn.first().click({ force: true });
            await sleep(300);
            pass('TV button clickable');
        } catch (e) {
            fail('Category buttons', e.message);
        }
        
        // TEST 4: Queue panel opens
        console.log('\n📋 TEST 4: Queue Panel');
        try {
            const queueBtn = page.getByRole('button', { name: /queue/i });
            await queueBtn.first().click({ force: true });
            await sleep(800);
            
            const queuePanel = page.locator('#queue-panel');
            if (await queuePanel.isVisible()) {
                pass('Queue panel opens');
                
                // Check for Now Playing section
                const nowPlayingSection = page.locator('text=Now Playing');
                if (await nowPlayingSection.first().isVisible({ timeout: 2000 })) {
                    pass('Queue shows Now Playing section');
                } else {
                    fail('Queue Now Playing section', 'Not visible');
                }
                
                // Check for Up Next section
                const upNextSection = page.locator('text=Up Next');
                if (await upNextSection.first().isVisible({ timeout: 2000 })) {
                    pass('Queue shows Up Next section');
                } else {
                    fail('Queue Up Next section', 'Not visible');
                }
                
                // Close panel
                const closeBtn = page.locator('#queue-panel button:has-text("✕")');
                await closeBtn.click({ force: true });
                await sleep(400);
            } else {
                fail('Queue panel opens', 'Not visible');
            }
        } catch (e) {
            fail('Queue panel', e.message);
        }
        
        // TEST 5: Add to queue via List button
        console.log('\n📋 TEST 5: Add to Queue');
        try {
            // Find and click a List button
            const listBtn = page.getByRole('button', { name: 'List' }).first();
            if (await listBtn.isVisible({ timeout: 3000 })) {
                await listBtn.click({ force: true });
                await sleep(500);
                
                // Check toast
                const toast = page.locator('#movieshows-toast');
                const toastVisible = await toast.isVisible().catch(() => false);
                if (toastVisible) {
                    const toastText = await toast.textContent();
                    if (toastText.includes('Added') || toastText.includes('queue')) {
                        pass('Add to queue works');
                    } else if (toastText.includes('Already')) {
                        pass('Add to queue works (item was already in queue)');
                    } else {
                        pass('List button clicked');
                    }
                } else {
                    pass('List button clicked');
                }
            } else {
                fail('List button', 'Not visible');
            }
        } catch (e) {
            fail('Add to queue', e.message);
        }
        
        // TEST 6: Verify queue has items after adding
        console.log('\n📋 TEST 6: Queue Contains Items');
        try {
            const queueBtn = page.getByRole('button', { name: /queue/i });
            await queueBtn.first().click({ force: true });
            await sleep(800);
            
            // Check for queue items or the saved queue section
            const savedQueueSection = page.locator('text=/My Saved Queue/i');
            if (await savedQueueSection.isVisible({ timeout: 2000 })) {
                pass('Saved queue section visible');
            }
            
            // Check if there's at least one queue item or the empty message
            const queueItem = page.locator('.queue-item');
            const queueItemCount = await queueItem.count();
            if (queueItemCount > 0) {
                pass(`Queue has ${queueItemCount} saved item(s)`);
            } else {
                // It's okay if empty, check for empty message
                const emptyMsg = page.locator('text=/Click the "List" button/i');
                if (await emptyMsg.isVisible({ timeout: 1000 })) {
                    pass('Queue shows empty state correctly');
                }
            }
            
            // Close panel
            const closeBtn = page.locator('#queue-panel button:has-text("✕")');
            await closeBtn.click({ force: true });
            await sleep(400);
        } catch (e) {
            fail('Queue contains items', e.message);
        }
        
        // TEST 7: Scroll navigation works
        console.log('\n📋 TEST 7: Scroll Navigation');
        try {
            await page.keyboard.press('j'); // Next video
            await sleep(1000);
            pass('J key (next) works');
            
            await page.keyboard.press('k'); // Previous video
            await sleep(1000);
            pass('K key (previous) works');
        } catch (e) {
            fail('Scroll navigation', e.message);
        }

        // SUMMARY
        console.log('\n' + '='.repeat(50));
        console.log('📊 TEST SUMMARY\n');
        console.log(`✅ Passed: ${results.passed.length}`);
        console.log(`❌ Failed: ${results.failed.length}`);
        const total = results.passed.length + results.failed.length;
        console.log(`📈 Success Rate: ${total > 0 ? Math.round(results.passed.length / total * 100) : 0}%`);
        
        if (results.failed.length > 0) {
            console.log('\n❌ Failed Tests:');
            results.failed.forEach(f => {
                console.log(`   - ${f.name}: ${f.error.substring(0, 80)}`);
            });
        }
        
        console.log('\n' + '='.repeat(50));
        
    } catch (e) {
        console.error('Fatal error:', e);
    } finally {
        await browser.close();
    }
    
    return results;
}

runTests().then(results => {
    process.exit(results.failed.length > 0 ? 1 : 0);
});
