// UI Minimal - Strip back to clean, simple interface
// This runs LAST and aggressively cleans up the UI

(function() {
    console.log('[MovieShows] UI Minimal mode - Creating clean interface...');
    
    // Run cleanup multiple times to catch dynamically added elements
    let cleanupRuns = 0;
    
    function aggressiveCleanup() {
        cleanupRuns++;
        console.log(`[MovieShows] Cleanup run #${cleanupRuns}`);
        
        // Remove ALL feature batch UI elements
        const selectorsToHide = [
            // Feature batch buttons and containers
            '[class*="ratings"]',
            '[class*="accessibility"]',
            '[class*="parental"]',
            '[class*="download"]',
            '[class*="soundtrack"]',
            '[class*="reviews"]',
            '[class*="quotes"]',
            '[class*="trivia"]',
            '[class*="mood"]',
            '[class*="export"]',
            '[class*="gallery"]',
            '[class*="director"]',
            '[class*="studio"]',
            '[class*="franchise"]',
            '[class*="awards"]',
            '[class*="box-office"]',
            '[class*="calendar"]',
            '[class*="country"]',
            '[class*="actor"]',
            '[class*="crew"]',
            '[class*="similar"]',
            '[class*="loop"]',
            '[class*="party"]',
            '[class*="discuss"]',
            '[class*="spoiler"]',
            '[class*="notes"]',
            '[class*="favorites"]',
            '[class*="collections"]',
            '[class*="binge"]',
            '[class*="compare"]',
            '[class*="themes"]',
            '[class*="milestones"]',
            '[class*="goals"]',
            '[class*="bookmarks"]',
            '[class*="pip"]',
            '[class*="session"]',
            '[class*="celebration"]',
            '[class*="chapters"]',
            '[class*="theater"]',
            '[class*="subtitles"]',
            '[class*="report"]',
            '[class*="versions"]',
            '[class*="alerts"]',
            '[class*="preview"]',
            '[class*="smart"]',
            '[class*="freshness"]',
            '[class*="mini-player"]',
            '[class*="discovery"]',
            '[class*="gesture"]',
            '[class*="availability"]',
            '[class*="schedule"]',
            '[class*="quick-actions"]',
            '[class*="speed"]',
            '[class*="content-notes"]',
            '[class*="watchlist-folders"]',
            '[class*="keyboard"]',
            '[class*="age-rating"]',
            '[class*="recently-viewed"]',
            '[class*="duration"]',
            '[class*="quality"]',
            '[class*="popularity"]',
            '[class*="language"]',
            '[class*="seasons"]',
            '[class*="social"]',
            '[class*="filters-smart"]',
            '[class*="recommendations"]',
            '[class*="trivia"]',
            '[class*="time-goals"]',
            '[class*="pip-controls"]',
            '[class*="recovery"]',
            '[id*="sandbox"]',
            '[id*="main-menu"]',
            '[id*="popup-menu"]'
        ];
        
        // Hide elements matching selectors
        selectorsToHide.forEach(selector => {
            try {
                document.querySelectorAll(selector).forEach(el => {
                    el.style.display = 'none';
                });
            } catch(e) {}
        });
        
        // Find and hide buttons with sandbox-related text
        const textToHide = [
            'ratings', 'accessibility', 'parental', 'download queue',
            'audio desc', 'cast & crew', 'soundtrack', 'reviews',
            'bts', 'behind', 'quotes', 'trivia', 'mood match',
            'export', 'share card', 'gallery', 'runtime', 'by year',
            'language', 'director', 'studios', 'franchises', 'awards',
            'box office', 'releases', 'country', 'actor', 'crew',
            'find similar', 'shuffle all', 'loop', 'skip:', 'party mode',
            'discuss', 'shield', 'notes', 'favorites', 'collections',
            'binge', 'compare', 'themes', 'milestones', 'goals',
            'bookmarks', 'pip', 'session', 'celebration', 'calendar',
            'tags', 'invites', 'insights', 'notifications', 'streaks',
            'chapters', 'theater', 'subtitles', 'report', 'versions',
            'quality', 'sync', 'alerts', 'preview', 'smart pause',
            'freshness', 'mini player', 'auto-resume', 'discovery',
            'gesture', 'availability', 'schedule', 'quick actions',
            'speed', 'watchlist folders', 'keyboard', 'age rating',
            'recently viewed', 'duration filter', 'video quality',
            'popularity', 'multi-lang', 'stats widget', 'seasons',
            'content themes', 'quick trailer', 'social media',
            'side by side', 'smart filters', 'recommendations engine',
            'viewing milestones', 'content trivia', 'watch time',
            'export data', 'pip controls', 'session recovery',
            '🎉', 'sandbox', '🧪', '☰ menu', 'advanced', 'smart rec',
            'timeline', 'viewing stats', 'picture-in-picture', 'reminders',
            'scene bookmarks', 'autoplay settings', 'watch party',
            'mood board', 'playlist manager', 'browse collections',
            'compare content', 'content timeline', 'viewing dashboard',
            'pip controller', 'content reminders', 'quick share'
        ];
        
        document.querySelectorAll('button, a, [role="button"]').forEach(btn => {
            const text = (btn.textContent || '').toLowerCase();
            const title = (btn.title || '').toLowerCase();
            const combined = text + ' ' + title;
            
            // Keep essential buttons
            const essentialPatterns = [
                'mute', 'unmute', 'sound', 'click to',
                'all (', 'movies (', 'tv (', 'now playing',
                'filters', 'search', 'queue', 'my queue',
                'like', 'save', 'share', 'open', 'close', 'hide', 
                'show', 'next', 'prev', '▲', '▼', '◄', '►',
                'action', 'comedy', 'drama', 'horror', 'sci-fi', 
                'romance', 'thriller', 'animation', 'documentary', 'fantasy',
                'small', 'medium', 'large', 'full', 'def', 'high', 'mid',
                'bar:', 'title', 'autoplay', 'on', 'off',
                'trending', 'new', 'recently added', 'movie fan',
                'coming soon', 'badges', 'tv mode', 'random',
                'broken', 'hype', 'thought', 'boring', 'emotional'
            ];
            
            const isEssential = essentialPatterns.some(p => combined.includes(p));
            
            if (!isEssential) {
                for (const hideText of textToHide) {
                    if (combined.includes(hideText.toLowerCase())) {
                        btn.style.display = 'none';
                        break;
                    }
                }
            }
        });
        
        // Hide excessive nav items
        const quickNav = document.querySelector('.quick-nav, #quick-nav');
        if (quickNav) {
            const buttons = quickNav.querySelectorAll('button');
            // Keep only first 15 buttons in quick nav
            buttons.forEach((btn, i) => {
                if (i > 15) btn.style.display = 'none';
            });
        }
    }
    
    function addMinimalStyles() {
        if (document.getElementById('minimal-ui-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'minimal-ui-styles';
        style.textContent = `
            /* Hide ALL feature batch containers */
            .feature-panel,
            .feature-modal,
            .feature-popup,
            [class*="batch"],
            [class*="premium"],
            .quick-actions-popup,
            .quick-info-tooltip,
            #main-popup-menu,
            #main-menu-btn,
            #sandbox-link-btn {
                display: none !important;
            }
            
            /* Clean up the video controls area */
            .video-controls,
            .player-controls {
                display: flex !important;
                flex-wrap: wrap !important;
                gap: 5px !important;
                max-width: 400px !important;
                justify-content: center !important;
            }
            
            .video-controls button,
            .player-controls button {
                font-size: 12px !important;
                padding: 6px 10px !important;
                margin: 2px !important;
            }
            
            /* Keep the main player visible and working */
            .video-slide,
            .slide {
                position: relative !important;
            }
            
            .video-slide iframe,
            .slide iframe {
                position: absolute !important;
                top: 0 !important;
                left: 0 !important;
                width: 100% !important;
                height: 100% !important;
            }
            
            /* Clean quick nav */
            .quick-nav, #quick-nav {
                max-width: 350px !important;
                max-height: 60vh !important;
                overflow-y: auto !important;
                padding: 10px !important;
            }
            
            /* Ensure mute button is visible */
            #mute-control {
                display: block !important;
                z-index: 10000 !important;
            }
            
            /* Hide info toggle if cluttering */
            #info-toggle {
                display: none !important;
            }
            
            /* Settings panel - keep minimal */
            .settings-panel,
            #settings-panel {
                max-height: 50vh !important;
                overflow-y: auto !important;
            }
            
            /* Genre buttons - keep simple */
            .genre-buttons {
                max-width: 100% !important;
                display: flex !important;
                flex-wrap: wrap !important;
                gap: 5px !important;
            }
            
            .genre-buttons button {
                padding: 5px 10px !important;
                font-size: 11px !important;
            }
        `;
        document.head.appendChild(style);
    }
    
    function ensureVideoPlays() {
        // Find the active/first video slide
        const activeSlide = document.querySelector('.video-slide.active, .slide.active, [data-active="true"]') 
            || document.querySelector('.video-slide, .slide');
        
        if (!activeSlide) {
            console.log('[MovieShows] No video slide found');
            return;
        }
        
        const iframe = activeSlide.querySelector('iframe');
        if (!iframe) {
            console.log('[MovieShows] No iframe in slide');
            return;
        }
        
        const dataSrc = iframe.getAttribute('data-src');
        const currentSrc = iframe.getAttribute('src');
        
        // If iframe has data-src but no src (or about:blank), activate it
        if (dataSrc && (!currentSrc || currentSrc === 'about:blank' || !currentSrc.includes('youtube'))) {
            console.log('[MovieShows] Activating video playback');
            iframe.src = dataSrc;
            activeSlide.classList.add('active');
        }
    }
    
    function init() {
        addMinimalStyles();
        
        // Run cleanup immediately
        aggressiveCleanup();
        
        // Run again after short delays to catch dynamically added elements
        setTimeout(aggressiveCleanup, 500);
        setTimeout(aggressiveCleanup, 1500);
        setTimeout(aggressiveCleanup, 3000);
        setTimeout(aggressiveCleanup, 5000);
        
        // Ensure video plays
        setTimeout(ensureVideoPlays, 2000);
        
        // Watch for new elements being added
        const observer = new MutationObserver((mutations) => {
            let shouldClean = false;
            mutations.forEach(mutation => {
                if (mutation.addedNodes.length > 0) {
                    shouldClean = true;
                }
            });
            if (shouldClean && cleanupRuns < 20) {
                setTimeout(aggressiveCleanup, 100);
            }
        });
        
        observer.observe(document.body, { childList: true, subtree: true });
        
        console.log('[MovieShows] Minimal UI initialized');
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // Also run on window load
    window.addEventListener('load', () => {
        setTimeout(aggressiveCleanup, 1000);
        setTimeout(ensureVideoPlays, 1500);
    });
})();
