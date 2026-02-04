// UI Minimal - ULTRA CLEAN interface
// Keeps ONLY: mute button, category filters, basic player controls

(function() {
    console.log('[MovieShows] UI Minimal - ULTRA CLEAN mode...');
    
    // Essential buttons to KEEP (everything else gets hidden)
    const KEEP_BUTTONS = [
        'click to unmute', 'sound on', 'mute',
        'all (', 'movies (', 'tv (', 'now playing',
        'filters', 'search', 'queue', 'my queue',
        'close', '✕', 'x',
        'like', 'save',
        'open quick nav', 'close menu'
    ];
    
    function shouldKeepButton(text) {
        const lowerText = text.toLowerCase().trim();
        return KEEP_BUTTONS.some(keep => lowerText.includes(keep));
    }
    
    function ultraCleanup() {
        console.log('[MovieShows] Running ultra cleanup...');
        
        // CRITICAL: Hide ALL buttons inside non-active slides
        document.querySelectorAll('.video-slide:not(.active), .slide:not(.active), div[class*="slide"]:not(.active)').forEach(slide => {
            slide.querySelectorAll('button').forEach(btn => {
                btn.style.display = 'none';
            });
        });
        
        // Hide ALL action buttons everywhere for clean look
        document.querySelectorAll('.action-buttons, .slide-actions, [class*="action-panel"]').forEach(el => {
            el.style.display = 'none';
        });
        
        // Hide buttons with these names everywhere
        const hideButtonNames = [
            'like', 'save', 'open', 'share', 'next up', 'similar', 'broken', 
            'hype', 'thought', 'boring', 'emotional', 'next description', 
            'hide', 'list', 'player:', 'txt', 'dt', 'movie fan', 'shuffle',
            'stats', 'badges', 'mood', 'coming soon', 'sound on', 'sound off',
            'autoplay', 'bar:', 'full', 'title', 'high', 'mid', 'def'
        ];
        document.querySelectorAll('button').forEach(btn => {
            const text = (btn.textContent || '').toLowerCase().trim();
            if (hideButtonNames.some(name => text === name || text.includes(name))) {
                btn.style.display = 'none';
            }
        });
        
        // Hide the settings panel on the right side
        document.querySelectorAll('div').forEach(div => {
            const style = div.getAttribute('style') || '';
            const text = div.textContent || '';
            
            // Hide fixed right panels
            if (style.includes('fixed') && style.includes('right') && !div.id?.includes('mute')) {
                div.style.display = 'none';
            }
            
            // Hide panels with settings-like content
            if (text.includes('Player:') || text.includes('Txt:') || text.includes('Bar:') || 
                text.includes('Autoplay') || (text.includes('S') && text.includes('M') && text.includes('L') && text.includes('Full'))) {
                div.style.display = 'none';
            }
        });
        
        // Hide bottom bar buttons (Mood, Shuffle, Stats, Badges, etc)
        document.querySelectorAll('button').forEach(btn => {
            const text = (btn.textContent || '').toLowerCase();
            const bottomBarButtons = ['mood', 'shuffle', 'stats', 'badges', 'coming soon', 'movie fan', 'sound on', 'sound off'];
            if (bottomBarButtons.some(b => text.includes(b))) {
                // Keep only the mute button
                if (!text.includes('unmute') && btn.id !== 'mute-control') {
                    btn.style.display = 'none';
                }
            }
        });
        
        // Hide Like, List, Share buttons at bottom left
        document.querySelectorAll('button').forEach(btn => {
            const text = (btn.textContent || '').trim().toLowerCase();
            if (text === 'like' || text === 'list' || text === 'share') {
                btn.style.display = 'none';
            }
        });
        
        // Hide ALL buttons in the quick-nav except essentials
        const quickNav = document.querySelector('.quick-nav, #quick-nav, nav');
        if (quickNav) {
            const buttons = quickNav.querySelectorAll('button, a');
            buttons.forEach(btn => {
                const text = btn.textContent || '';
                if (!shouldKeepButton(text)) {
                    btn.style.display = 'none';
                }
            });
        }
        
        // Hide most action buttons except like/save
        document.querySelectorAll('.action-buttons button, .slide-actions button').forEach(btn => {
            const text = (btn.textContent || '').toLowerCase();
            if (!text.includes('like') && !text.includes('save') && !text.includes('share')) {
                btn.style.display = 'none';
            }
        });
        
        // Hide all the extra feature buttons that got injected
        const hidePatterns = [
            'accessibility', 'parental', 'trivia', 'mood', 'export',
            'studios', 'franchises', 'awards', 'releases', 'party',
            'shield', 'favorites', 'director', 'actor', 'crew',
            'similar', 'broken', 'hype', 'thought', 'boring', 'emotional',
            'ratings', 'download', 'soundtrack', 'reviews', 'quotes',
            'gallery', 'runtime', 'year', 'language', 'country',
            'loop', 'skip', 'discuss', 'notes', 'collections',
            'binge', 'compare', 'themes', 'milestones', 'goals',
            'bookmarks', 'pip', 'session', 'celebration', 'calendar',
            'tags', 'invites', 'insights', 'notifications', 'streaks',
            'chapters', 'theater', 'subtitles', 'report', 'versions',
            'quality', 'sync', 'alerts', 'preview', 'speed',
            'shuffle', 'cast', 'box office', 'trending', 'new',
            'recently', 'coming soon', 'badges', 'tv mode', 'random',
            'next description', 'alternative', 'movie fan', 'stats',
            'autoplay settings', 'watch party', 'mood board',
            'playlist manager', 'browse collections', 'compare content',
            'smart', 'scene', 'quick share', 'timeline', 'dashboard',
            'reminders', 'action', 'comedy', 'drama', 'horror',
            'sci-fi', 'romance', 'thriller', 'animation', 'documentary',
            'fantasy', 'def', 'high', 'mid', 'bar:', 'title',
            '▲', '▼', '◄', '►', 'full', 'show actions'
        ];
        
        document.querySelectorAll('button, [role="button"]').forEach(btn => {
            // Skip mute control
            if (btn.id === 'mute-control') return;
            
            const text = (btn.textContent || '').toLowerCase();
            const title = (btn.title || '').toLowerCase();
            const combined = text + ' ' + title;
            
            // Check if it matches any hide pattern
            for (const pattern of hidePatterns) {
                if (combined.includes(pattern)) {
                    btn.style.display = 'none';
                    break;
                }
            }
        });
        
        // Also hide the settings panel buttons (S, M, L, Full, etc)
        const settingsPanel = document.querySelector('.settings-panel, #settings-panel, [class*="settings"]');
        if (settingsPanel) {
            settingsPanel.style.display = 'none';
        }
        
        // Hide info toggle
        const infoToggle = document.getElementById('info-toggle');
        if (infoToggle) infoToggle.style.display = 'none';
        
        // Hide action panel toggle
        const actionToggle = document.getElementById('action-panel-toggle');
        if (actionToggle) actionToggle.style.display = 'none';
    }
    
    function addMinimalStyles() {
        if (document.getElementById('ultra-minimal-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'ultra-minimal-styles';
        style.textContent = `
            /* Hide ALL extra UI elements */
            .settings-panel,
            #settings-panel,
            .feature-panel,
            .feature-modal,
            [class*="premium"],
            [class*="batch"],
            .quick-actions-popup,
            .quick-info-tooltip,
            #main-popup-menu,
            #main-menu-btn,
            #sandbox-link-btn,
            #info-toggle,
            #action-panel-toggle,
            .genre-buttons,
            .duration-filter,
            .speed-controls,
            [class*="toolbar"],
            [class*="player-size"],
            [class*="size-control"],
            .control-panel,
            #control-panel,
            [class*="settings-toggle"] {
                display: none !important;
            }
            
            /* Hide the right side settings panel - AGGRESSIVE */
            div[style*="position: fixed"][style*="right"],
            div[style*="position:fixed"][style*="right"],
            [class*="settings"],
            [class*="control-panel"],
            [id*="settings"],
            [id*="control"] {
                display: none !important;
            }
            
            /* Hide ALL the extra feature buttons */
            button:not(#mute-control):not([class*="category"]):not([class*="filter"]) {
                /* Will be selectively shown */
            }
            
            /* Hide specific buttons by content */
            button[title*="Movie Fan"],
            button[title*="Shuffle"],
            button[title*="Stats"],
            button[title*="Badges"],
            button[title*="Mood"],
            button[title*="Coming"],
            button[title*="Hide"],
            button[title*="Settings"] {
                display: none !important;
            }
            
            /* Clean quick nav - minimal */
            .quick-nav, #quick-nav {
                max-width: 280px !important;
                padding: 10px !important;
                background: rgba(26, 26, 46, 0.95) !important;
            }
            
            /* CRITICAL: Hide ALL buttons on non-active slides */
            .video-slide:not(.active) button,
            .video-slide:not(.active) .action-buttons,
            .video-slide:not(.active) .slide-actions,
            .slide:not(.active) button,
            .slide:not(.active) .action-buttons,
            div[class*="slide"]:not(.active) button {
                display: none !important;
                visibility: hidden !important;
                pointer-events: none !important;
            }
            
            /* Also hide action buttons even on active slide for cleaner look */
            .action-buttons,
            .slide-actions,
            [class*="action-panel"] {
                display: none !important;
            }
            
            /* Keep mute button visible and prominent */
            #mute-control {
                display: block !important;
                position: fixed !important;
                bottom: 20px !important;
                left: 20px !important;
                z-index: 10000 !important;
            }
            
            /* Ensure video fills screen properly */
            .video-slide, .slide {
                width: 100vw !important;
                height: 100vh !important;
                position: relative !important;
            }
            
            .video-slide iframe, .slide iframe {
                width: 100% !important;
                height: 100% !important;
                position: absolute !important;
                top: 0 !important;
                left: 0 !important;
            }
            
            /* Clean movie info overlay */
            .video-info, .movie-info {
                position: absolute !important;
                bottom: 80px !important;
                left: 20px !important;
                right: 20px !important;
                background: linear-gradient(transparent, rgba(0,0,0,0.8)) !important;
                padding: 20px !important;
                border-radius: 10px !important;
            }
            
            /* Simple category buttons */
            .category-filters button {
                background: rgba(255,255,255,0.1) !important;
                border: 1px solid rgba(255,255,255,0.2) !important;
                color: white !important;
                padding: 8px 16px !important;
                margin: 4px !important;
                border-radius: 20px !important;
                font-size: 13px !important;
            }
            
            .category-filters button.active,
            .category-filters button:hover {
                background: #e94560 !important;
                border-color: #e94560 !important;
            }
        `;
        document.head.appendChild(style);
    }
    
    function ensureVideoPlays() {
        const activeSlide = document.querySelector('.video-slide.active, .slide.active') 
            || document.querySelector('.video-slide, .slide');
        
        if (!activeSlide) return;
        
        const iframe = activeSlide.querySelector('iframe');
        if (!iframe) return;
        
        const dataSrc = iframe.getAttribute('data-src');
        const currentSrc = iframe.getAttribute('src');
        
        if (dataSrc && (!currentSrc || !currentSrc.includes('youtube'))) {
            console.log('[MovieShows] Activating video...');
            iframe.src = dataSrc;
            activeSlide.classList.add('active');
        }
    }
    
    function init() {
        addMinimalStyles();
        
        // Run cleanup multiple times
        ultraCleanup();
        setTimeout(ultraCleanup, 300);
        setTimeout(ultraCleanup, 800);
        setTimeout(ultraCleanup, 1500);
        setTimeout(ultraCleanup, 3000);
        setTimeout(ultraCleanup, 5000);
        
        // Ensure video plays
        setTimeout(ensureVideoPlays, 1000);
        setTimeout(ensureVideoPlays, 3000);
        
        // Watch for dynamically added elements
        const observer = new MutationObserver(() => {
            setTimeout(ultraCleanup, 50);
        });
        observer.observe(document.body, { childList: true, subtree: true });
        
        console.log('[MovieShows] Ultra minimal UI ready');
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    window.addEventListener('load', () => {
        setTimeout(ultraCleanup, 500);
        setTimeout(ensureVideoPlays, 1000);
    });
})();
