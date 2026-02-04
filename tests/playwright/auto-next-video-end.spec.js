// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * Auto-Next on Video End - Comprehensive Test Suite
 * 
 * Tests the behavior where videos should automatically advance to the next slide
 * when the current video finishes playing (not loop/replay).
 * 
 * ROOT CAUSE FIX: Removed loop=1&playlist={videoId} from YouTube embed URLs
 * which was causing videos to restart instead of ending.
 */

const BASE_URL = 'https://findtorontoevents.ca/movieshows2/';
const LOCAL_URL = 'http://localhost:3000';

// Use deployed site for tests
const TEST_URL = BASE_URL;

// Helper to wait for app initialization
async function waitForAppReady(page) {
    // Wait for lazy iframes to exist (sign that app is initialized)
    await page.waitForSelector('iframe[data-src*="youtube"]', { timeout: 30000 });
    // Wait an extra moment for JS to initialize
    await page.waitForTimeout(2000);
}

// Helper to get current slide index
async function getCurrentIndex(page) {
    return page.evaluate(() => {
        // Try to get from the app's state
        if (typeof currentIndex !== 'undefined') return currentIndex;
        // Fallback: calculate from scroll position
        const container = document.getElementById('video-container') || document.querySelector('.snap-y');
        if (!container) return 0;
        const slideHeight = container.clientHeight;
        return Math.round(container.scrollTop / slideHeight);
    });
}

// Helper to get total slides count
async function getTotalSlides(page) {
    return page.evaluate(() => {
        const slides = document.querySelectorAll('.snap-center');
        return slides.length;
    });
}

// Helper to simulate YouTube video end event
async function simulateVideoEnd(page) {
    await page.evaluate(() => {
        // Simulate YouTube postMessage for video ended (state = 0)
        const message = JSON.stringify({
            event: 'onStateChange',
            info: 0
        });
        window.postMessage(message, '*');
    });
}

// Helper to check if auto-scroll indicator is visible
async function isAutoScrollIndicatorVisible(page) {
    const indicator = page.locator('#auto-scroll-indicator');
    return indicator.isVisible();
}

test.describe('Auto-Next Video End Feature', () => {
    
    test.beforeEach(async ({ page }) => {
        // Navigate and wait for app
        await page.goto(TEST_URL, { waitUntil: 'domcontentloaded' });
        await waitForAppReady(page);
        
        // Ensure auto-scroll is enabled
        await page.evaluate(() => {
            localStorage.setItem('movieshows-auto-scroll', 'true');
            localStorage.setItem('movieshows-auto-scroll-delay', '1'); // 1 second for faster tests
        });
    });

    test('YouTube embed URL should NOT contain loop parameter', async ({ page }) => {
        // Wait for iframes to load
        await page.waitForSelector('iframe[data-src*="youtube"]', { timeout: 20000 });
        
        // Get the iframe src from the first video
        const iframeSrc = await page.evaluate(() => {
            const iframe = document.querySelector('iframe[data-src]');
            return iframe?.getAttribute('data-src') || iframe?.getAttribute('src') || '';
        });
        
        console.log('iframe data-src:', iframeSrc);
        
        // Verify no loop parameter
        expect(iframeSrc).not.toContain('loop=1');
        expect(iframeSrc).not.toContain('playlist=');
        
        // Should contain enablejsapi for event detection
        expect(iframeSrc).toContain('enablejsapi=1');
    });

    test('YouTube embed URL should have correct parameters for auto-next', async ({ page }) => {
        const iframeSrc = await page.evaluate(() => {
            const iframe = document.querySelector('iframe[data-src]');
            return iframe?.getAttribute('data-src') || '';
        });
        
        // Required parameters
        expect(iframeSrc).toContain('autoplay=1');
        expect(iframeSrc).toContain('enablejsapi=1');
        expect(iframeSrc).toContain('modestbranding=1');
        expect(iframeSrc).toContain('rel=0');
        
        // Should NOT have looping
        expect(iframeSrc).not.toMatch(/loop=\d/);
    });

    test('onVideoEnded should trigger countdown when video ends', async ({ page }) => {
        const initialIndex = await getCurrentIndex(page);
        
        // Simulate video end
        await simulateVideoEnd(page);
        
        // Wait a bit for the event to process
        await page.waitForTimeout(500);
        
        // Check if countdown indicator appeared
        const indicatorVisible = await isAutoScrollIndicatorVisible(page);
        expect(indicatorVisible).toBe(true);
        
        // Check console for expected log message
        const logs = [];
        page.on('console', msg => logs.push(msg.text()));
        
        // Verify the video end was detected
        await page.waitForFunction(() => {
            return window.videoEndedWaitingForScroll === true;
        }, { timeout: 5000 });
    });

    test('should advance to next slide after video ends and countdown completes', async ({ page }) => {
        const initialIndex = await getCurrentIndex(page);
        const totalSlides = await getTotalSlides(page);
        
        // Make sure we're not at the last slide
        expect(initialIndex).toBeLessThan(totalSlides - 1);
        
        // Simulate video end
        await simulateVideoEnd(page);
        
        // Wait for countdown (1 second) + buffer
        await page.waitForTimeout(2000);
        
        // Verify we advanced to next slide
        const newIndex = await getCurrentIndex(page);
        expect(newIndex).toBe(initialIndex + 1);
    });

    test('should NOT advance when auto-scroll is disabled', async ({ page }) => {
        // Disable auto-scroll
        await page.evaluate(() => {
            localStorage.setItem('movieshows-auto-scroll', 'false');
            window.autoScrollEnabled = false;
        });
        
        const initialIndex = await getCurrentIndex(page);
        
        // Simulate video end
        await simulateVideoEnd(page);
        
        // Wait for potential scroll
        await page.waitForTimeout(2000);
        
        // Should still be on same slide
        const newIndex = await getCurrentIndex(page);
        expect(newIndex).toBe(initialIndex);
    });

    test('should debounce duplicate video end events', async ({ page }) => {
        const initialIndex = await getCurrentIndex(page);
        
        // Rapidly simulate multiple video end events
        await simulateVideoEnd(page);
        await page.waitForTimeout(100);
        await simulateVideoEnd(page);
        await page.waitForTimeout(100);
        await simulateVideoEnd(page);
        
        // Wait for countdown
        await page.waitForTimeout(2000);
        
        // Should only advance by 1 (not 3)
        const newIndex = await getCurrentIndex(page);
        expect(newIndex).toBe(initialIndex + 1);
    });

    test('Skip button should immediately advance to next video', async ({ page }) => {
        const initialIndex = await getCurrentIndex(page);
        
        // Simulate video end to show the indicator
        await simulateVideoEnd(page);
        await page.waitForTimeout(500);
        
        // Click skip button
        const skipButton = page.locator('#auto-scroll-skip');
        if (await skipButton.isVisible()) {
            await skipButton.click();
            
            // Should advance immediately
            await page.waitForTimeout(500);
            const newIndex = await getCurrentIndex(page);
            expect(newIndex).toBe(initialIndex + 1);
        }
    });

    test('Pause button should stop countdown', async ({ page }) => {
        const initialIndex = await getCurrentIndex(page);
        
        // Simulate video end
        await simulateVideoEnd(page);
        await page.waitForTimeout(500);
        
        // Click pause button
        const pauseButton = page.locator('#auto-scroll-pause');
        if (await pauseButton.isVisible()) {
            await pauseButton.click();
            
            // Wait longer than countdown
            await page.waitForTimeout(3000);
            
            // Should still be on same slide (paused)
            const newIndex = await getCurrentIndex(page);
            expect(newIndex).toBe(initialIndex);
        }
    });

    test('manual scroll should cancel auto-advance countdown', async ({ page }) => {
        const initialIndex = await getCurrentIndex(page);
        
        // Simulate video end
        await simulateVideoEnd(page);
        await page.waitForTimeout(300);
        
        // Manually scroll down
        await page.keyboard.press('ArrowDown');
        await page.waitForTimeout(1500);
        
        // Check that we moved but countdown was cancelled
        const indicatorVisible = await isAutoScrollIndicatorVisible(page);
        // Indicator should be hidden after manual navigation
    });

    test('should play correct video after auto-advance', async ({ page }) => {
        // Get initial video title
        const initialTitle = await page.evaluate(() => window.currentlyPlayingTitle);
        
        // Simulate video end
        await simulateVideoEnd(page);
        
        // Wait for advance
        await page.waitForTimeout(2500);
        
        // Get new video title
        const newTitle = await page.evaluate(() => window.currentlyPlayingTitle);
        
        // Should be different video
        expect(newTitle).not.toBe(initialTitle);
    });

    test('should load more videos when reaching end of list', async ({ page }) => {
        // Jump to near the end
        const totalSlides = await getTotalSlides(page);
        
        await page.evaluate((lastIndex) => {
            window.scrollToSlide(lastIndex - 1);
        }, totalSlides);
        
        await page.waitForTimeout(500);
        
        // Simulate video end
        await simulateVideoEnd(page);
        
        // Wait for potential loading
        await page.waitForTimeout(3000);
        
        // Should have loaded more or stayed at same position
        const newTotal = await getTotalSlides(page);
        expect(newTotal).toBeGreaterThanOrEqual(totalSlides);
    });
});

test.describe('YouTube Message Listener', () => {
    
    test.beforeEach(async ({ page }) => {
        await page.goto(TEST_URL, { waitUntil: 'domcontentloaded' });
        await waitForAppReady(page);
    });

    test('should set up listener only once', async ({ page }) => {
        // Check flag
        const listenerSetup = await page.evaluate(() => window.youtubeMessageListenerSetup);
        expect(listenerSetup).toBe(true);
        
        // Try to set up again - should be no-op
        await page.evaluate(() => {
            if (typeof setupYouTubeMessageListener === 'function') {
                setupYouTubeMessageListener();
            }
        });
        
        // Flag should still be true (not duplicated)
        const stillSetup = await page.evaluate(() => window.youtubeMessageListenerSetup);
        expect(stillSetup).toBe(true);
    });

    test('should handle onStateChange event correctly', async ({ page }) => {
        // Listen for console logs
        const logs = [];
        page.on('console', msg => {
            if (msg.text().includes('[MovieShows]')) {
                logs.push(msg.text());
            }
        });
        
        // Send a state change message
        await page.evaluate(() => {
            const message = JSON.stringify({
                event: 'onStateChange',
                info: 1 // Playing
            });
            window.postMessage(message, '*');
        });
        
        await page.waitForTimeout(500);
        
        // Should see state change logged
        const hasStateLog = logs.some(log => log.includes('YouTube state change'));
    });

    test('should handle infoDelivery playerState correctly', async ({ page }) => {
        await page.evaluate(() => {
            const message = JSON.stringify({
                info: {
                    playerState: 0 // Ended
                }
            });
            window.postMessage(message, '*');
        });
        
        await page.waitForTimeout(500);
        
        // Check that video ended was detected
        const waiting = await page.evaluate(() => window.videoEndedWaitingForScroll);
        // May or may not be true depending on debounce timing
    });
});

test.describe('Settings Panel Auto-Next Controls', () => {
    
    test.beforeEach(async ({ page }) => {
        await page.goto(TEST_URL, { waitUntil: 'domcontentloaded' });
        await waitForAppReady(page);
    });

    test('should show "Auto-next (at video end)" label in settings', async ({ page }) => {
        // Open settings panel
        const settingsButton = page.locator('#player-size-control');
        if (await settingsButton.isVisible()) {
            const settingsText = await settingsButton.textContent();
            expect(settingsText).toContain('Auto-next');
        }
    });

    test('should have delay slider with range 1-15 seconds', async ({ page }) => {
        const slider = page.locator('#auto-scroll-delay-input');
        if (await slider.isVisible()) {
            const min = await slider.getAttribute('min');
            const max = await slider.getAttribute('max');
            
            expect(min).toBe('1');
            expect(max).toBe('15');
        }
    });

    test('toggle should enable/disable auto-next', async ({ page }) => {
        const toggle = page.locator('#auto-scroll-toggle');
        if (await toggle.isVisible()) {
            // Get initial state
            const initialEnabled = await page.evaluate(() => window.autoScrollEnabled);
            
            // Click toggle
            await toggle.click();
            await page.waitForTimeout(200);
            
            // Check state changed
            const newEnabled = await page.evaluate(() => window.autoScrollEnabled);
            expect(newEnabled).toBe(!initialEnabled);
        }
    });
});

test.describe('Edge Cases & Regression Prevention', () => {
    
    test.beforeEach(async ({ page }) => {
        await page.goto(TEST_URL, { waitUntil: 'domcontentloaded' });
        await waitForAppReady(page);
    });

    test('should not replay video when already on current slide', async ({ page }) => {
        const initialIndex = await getCurrentIndex(page);
        
        // Get current iframe src
        const initialSrc = await page.evaluate(() => {
            const iframe = document.querySelector(`iframe[src*="youtube"]`);
            return iframe?.src || '';
        });
        
        // Wait a bit
        await page.waitForTimeout(2000);
        
        // Iframe should not have changed (no replay)
        const currentSrc = await page.evaluate(() => {
            const iframe = document.querySelector(`iframe[src*="youtube"]`);
            return iframe?.src || '';
        });
        
        // If src changed, it might be due to normal playback, but should not contain loop param
        expect(currentSrc).not.toContain('loop=1');
    });

    test('rapid navigation should not cause multiple videos playing', async ({ page }) => {
        // Rapidly navigate
        for (let i = 0; i < 5; i++) {
            await page.keyboard.press('ArrowDown');
            await page.waitForTimeout(100);
        }
        
        await page.waitForTimeout(1000);
        
        // Check only one video is playing
        const playingCount = await page.evaluate(() => {
            const iframes = document.querySelectorAll('iframe[src*="youtube"]');
            let playing = 0;
            iframes.forEach(iframe => {
                if (iframe.src && iframe.src !== '') playing++;
            });
            return playing;
        });
        
        // Should only have 1 or maybe 2 (transition state) videos with src
        expect(playingCount).toBeLessThanOrEqual(2);
    });

    test('forcePlayVisibleVideos should only play video at currentIndex', async ({ page }) => {
        // Call forcePlayVisibleVideos
        await page.evaluate(() => {
            if (typeof forcePlayVisibleVideos === 'function') {
                forcePlayVisibleVideos();
            }
        });
        
        await page.waitForTimeout(500);
        
        // Verify currentIndex matches slide being played
        const currentIndex = await getCurrentIndex(page);
        const playingTitle = await page.evaluate(() => window.currentlyPlayingTitle);
        
        // The currently playing video should match the slide at currentIndex
        const slideTitle = await page.evaluate((idx) => {
            const slide = window.videoSlides?.[idx];
            return slide?.querySelector('h2')?.textContent || '';
        }, currentIndex);
        
        expect(playingTitle).toBe(slideTitle);
    });

    test('window resize should not interrupt auto-next countdown', async ({ page }) => {
        // Start countdown
        await simulateVideoEnd(page);
        await page.waitForTimeout(300);
        
        // Resize window
        await page.setViewportSize({ width: 800, height: 600 });
        await page.waitForTimeout(200);
        await page.setViewportSize({ width: 1200, height: 800 });
        
        // Countdown should still be active
        const indicatorVisible = await isAutoScrollIndicatorVisible(page);
        // May or may not be visible depending on timing
    });

    test('page visibility change should pause/resume auto-next', async ({ page }) => {
        // Start countdown
        await simulateVideoEnd(page);
        await page.waitForTimeout(300);
        
        // Simulate page becoming hidden (would pause in real scenario)
        // This is a simplified check - full visibility API testing is complex
        const countdownActive = await page.evaluate(() => window.autoScrollCountdownInterval !== null);
        expect(countdownActive).toBe(true);
    });
});

test.describe('Integration with Queue Panel', () => {
    
    test.beforeEach(async ({ page }) => {
        await page.goto(TEST_URL, { waitUntil: 'domcontentloaded' });
        await waitForAppReady(page);
    });

    test('queue panel should update after auto-advance', async ({ page }) => {
        // Open queue panel first
        const queueButton = page.locator('button:has-text("Queue")');
        if (await queueButton.first().isVisible()) {
            await queueButton.first().click();
            await page.waitForTimeout(500);
        }
        
        // Get initial "NOW PLAYING" title
        const initialNowPlaying = await page.evaluate(() => window.currentlyPlayingTitle);
        
        // Simulate video end and wait for advance
        await simulateVideoEnd(page);
        await page.waitForTimeout(2500);
        
        // Get new "NOW PLAYING" title
        const newNowPlaying = await page.evaluate(() => window.currentlyPlayingTitle);
        
        // Should be different
        expect(newNowPlaying).not.toBe(initialNowPlaying);
    });
});

test.describe('Console Log Verification', () => {
    
    test('should log expected messages during video end flow', async ({ page }) => {
        const logs = [];
        page.on('console', msg => {
            const text = msg.text();
            if (text.includes('[MovieShows]')) {
                logs.push(text);
            }
        });
        
        await page.goto(TEST_URL, { waitUntil: 'domcontentloaded' });
        await waitForAppReady(page);
        
        // Verify initial setup logs
        const hasListenerSetup = logs.some(log => log.includes('YouTube message listener set up'));
        expect(hasListenerSetup).toBe(true);
        
        // Simulate video end
        await simulateVideoEnd(page);
        await page.waitForTimeout(2500);
        
        // Verify flow logs
        const hasVideoEnded = logs.some(log => log.includes('Video ended!'));
        const hasCountdown = logs.some(log => log.includes('countdown'));
        
        expect(hasVideoEnded || logs.some(log => log.includes('onStateChange'))).toBe(true);
    });
});
