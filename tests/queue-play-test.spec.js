// @ts-check
const { test, expect } = require('@playwright/test');

const BASE_URL = 'https://findtorontoevents.ca/movieshows2/';

test.describe('Queue Play Bug Tests', () => {
    
    test.beforeEach(async ({ page }) => {
        // Navigate to the site
        await page.goto(BASE_URL + '?t=' + Date.now());
        
        // Wait for the page to load
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);
    });
    
    test('Up Next items should play the correct video', async ({ page }) => {
        // Click on My Queue button
        const queueButton = page.locator('button:has-text("My Queue")');
        await queueButton.click();
        await page.waitForTimeout(1000);
        
        // Get the "Now Playing" title
        const nowPlayingTitle = await page.locator('h4:near(:text("NOW PLAYING"))').first().textContent();
        console.log('Now Playing:', nowPlayingTitle);
        
        // Get the Up Next items
        const upNextItems = page.locator('.up-next-item');
        const count = await upNextItems.count();
        console.log('Up Next items count:', count);
        
        if (count > 0) {
            // Get the first up-next item's title and index
            const firstUpNext = upNextItems.first();
            const firstUpNextTitle = await firstUpNext.locator('span').last().textContent();
            const firstUpNextIndex = await firstUpNext.getAttribute('data-index');
            console.log('First Up Next:', firstUpNextTitle, 'Index:', firstUpNextIndex);
            
            // Click on the first up-next item
            await firstUpNext.click();
            await page.waitForTimeout(2000);
            
            // Check what's now playing
            const newNowPlaying = await page.locator('h2').first().textContent();
            console.log('After click, video title:', newNowPlaying);
            
            // Verify the correct video is playing
            expect(newNowPlaying?.trim()).toBe(firstUpNextTitle?.trim());
        }
    });
    
    test('Debug: Log queue panel structure', async ({ page }) => {
        // Click on My Queue button
        const queueButton = page.locator('button:has-text("My Queue")');
        await queueButton.click();
        await page.waitForTimeout(1000);
        
        // Take a screenshot
        await page.screenshot({ path: 'queue-panel-debug.png' });
        
        // Log the structure
        const upNextItems = await page.locator('.up-next-item').all();
        console.log('\n=== UP NEXT ITEMS ===');
        for (let i = 0; i < upNextItems.length; i++) {
            const item = upNextItems[i];
            const title = await item.locator('span').last().textContent();
            const index = await item.getAttribute('data-index');
            console.log(`Item ${i + 1}: "${title}" (data-index: ${index})`);
        }
        
        // Get all video slides and their titles
        const videoSlides = await page.locator('.snap-center').all();
        console.log('\n=== VIDEO SLIDES ===');
        for (let i = 0; i < Math.min(videoSlides.length, 10); i++) {
            const slide = videoSlides[i];
            const title = await slide.locator('h2').textContent().catch(() => 'No title');
            console.log(`Slide ${i}: "${title}"`);
        }
    });
    
    test('Saved Queue play button should play correct video', async ({ page }) => {
        // First, add a video to the saved queue by clicking "List" button
        const listButton = page.locator('button:has-text("List")').first();
        if (await listButton.isVisible()) {
            await listButton.click();
            await page.waitForTimeout(500);
        }
        
        // Open the queue panel
        const queueButton = page.locator('button:has-text("My Queue")');
        await queueButton.click();
        await page.waitForTimeout(1000);
        
        // Check if there are saved queue items
        const playQueueButtons = page.locator('.play-queue-item');
        const count = await playQueueButtons.count();
        console.log('Saved queue items with play button:', count);
        
        if (count > 0) {
            // Get the title of the first queue item
            const firstQueueItem = page.locator('.queue-item').first();
            const itemTitle = await firstQueueItem.locator('h4, span').first().textContent();
            console.log('First queue item title:', itemTitle);
            
            // Click play on the first queue item
            await playQueueButtons.first().click();
            await page.waitForTimeout(2000);
            
            // Check what's now playing
            const nowPlaying = await page.locator('h2').first().textContent();
            console.log('Now playing after click:', nowPlaying);
            
            // They should match
            expect(nowPlaying?.trim()).toContain(itemTitle?.trim() || '');
        }
    });
});
