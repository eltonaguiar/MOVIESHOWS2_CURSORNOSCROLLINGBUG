// UI Minimal - Clean interface that KEEPS essential navigation
// Keeps: mute, filters, search, queue, category buttons

(function() {
    console.log('[MovieShows] UI Minimal - Clean mode with navigation...');
    
    // Essential buttons to ALWAYS KEEP visible
    const ESSENTIAL_BUTTONS = [
        'click to unmute', 'unmute', 'sound on', 'mute',
        'all (', 'movies (', 'tv (', 'now playing',
        'filters', 'search', 'browse', 'queue', 'my queue',
        'open quick nav', 'close menu', 'close',
        'search & browse'
    ];
    
    function isEssentialButton(btn) {
        const text = (btn.textContent || '').toLowerCase().trim();
        const id = (btn.id || '').toLowerCase();
        
        // Always keep mute control
        if (id === 'mute-control' || id.includes('mute')) return true;
        
        // Check against essential patterns
        return ESSENTIAL_BUTTONS.some(essential => text.includes(essential));
    }
    
    function cleanupUI() {
        console.log('[MovieShows] Running UI cleanup...');
        
        // 1. Hide buttons on non-active slides (reduces clutter)
        document.querySelectorAll('.video-slide:not(.active), .slide:not(.active)').forEach(slide => {
            slide.querySelectorAll('button').forEach(btn => {
                btn.style.display = 'none';
            });
        });
        
        // 2. Hide action button panels
        document.querySelectorAll('.action-buttons, .slide-actions, [class*="action-panel"]').forEach(el => {
            el.style.display = 'none';
        });
        
        // 3. Hide the settings panel on the right
        document.querySelectorAll('div').forEach(div => {
            const style = div.getAttribute('style') || '';
            const text = div.textContent || '';
            
            // Hide fixed right panels with settings content
            if ((style.includes('fixed') && style.includes('right')) ||
                text.includes('Player:') || text.includes('Txt:') || text.includes('Bar:') ||
                (text.includes('Autoplay') && text.includes('ON'))) {
                
                // But don't hide if it contains essential navigation
                const hasEssential = ESSENTIAL_BUTTONS.some(e => text.toLowerCase().includes(e));
                if (!hasEssential) {
                    div.style.display = 'none';
                }
            }
        });
        
        // 4. Hide specific non-essential buttons
        const hideButtonTexts = [
            'like', 'save', 'open', 'share', 'next up', 'similar', 'broken',
            'hype', 'thought', 'boring', 'emotional', 'next description',
            'hide', 'list', 'movie fan', 'shuffle', 'stats', 'badges',
            'mood', 'coming soon', 'autoplay', 'bar:', 'full', 'title',
            'high', 'mid', 'def', 'player:', 'txt', 'dt',
            'accessibility', 'parental', 'trivia', 'export', 'studios',
            'franchises', 'awards', 'releases', 'party', 'shield', 'favorites',
            'director', 'actor', 'crew', 'ratings', 'download', 'soundtrack',
            'reviews', 'quotes', 'gallery', 'runtime', 'year', 'language',
            'country', 'loop', 'skip', 'discuss', 'notes', 'collections',
            'binge', 'compare', 'themes', 'milestones', 'goals', 'bookmarks',
            'pip', 'session', 'celebration', 'calendar', 'tags', 'invites',
            'insights', 'notifications', 'streaks', 'chapters', 'theater',
            'subtitles', 'report', 'versions', 'quality', 'sync', 'alerts',
            'preview', 'speed', 'cast', 'box office', 'trending', 'new',
            'recently', 'random', 'alternative', 'scene', 'quick share',
            'timeline', 'dashboard', 'reminders', 'watch party', 'mood board',
            'playlist manager', 'browse collections', 'compare content', 'smart'
        ];
        
        document.querySelectorAll('button, [role="button"]').forEach(btn => {
            // Skip if essential
            if (isEssentialButton(btn)) return;
            
            const text = (btn.textContent || '').toLowerCase().trim();
            
            // Hide if matches any non-essential pattern
            for (const hideText of hideButtonTexts) {
                if (text.includes(hideText) || text === hideText) {
                    btn.style.display = 'none';
                    break;
                }
            }
        });
        
        // 5. Hide genre buttons (action, comedy, drama, etc)
        const genreNames = ['action', 'comedy', 'drama', 'horror', 'sci-fi', 'romance', 'thriller', 'animation', 'documentary', 'fantasy', 'adventure'];
        document.querySelectorAll('button').forEach(btn => {
            const text = (btn.textContent || '').toLowerCase().trim();
            if (genreNames.includes(text)) {
                btn.style.display = 'none';
            }
        });
        
        // 6. Hide info toggle and action panel toggle
        const infoToggle = document.getElementById('info-toggle');
        if (infoToggle) infoToggle.style.display = 'none';
        
        const actionToggle = document.getElementById('action-panel-toggle');
        if (actionToggle) actionToggle.style.display = 'none';
    }
    
    function addMinimalStyles() {
        if (document.getElementById('minimal-ui-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'minimal-ui-styles';
        style.textContent = `
            /* Hide extra panels */
            .settings-panel, #settings-panel,
            .feature-panel, .feature-modal,
            [class*="premium"], [class*="batch"],
            .quick-actions-popup, .quick-info-tooltip,
            #main-popup-menu, #main-menu-btn, #sandbox-link-btn,
            #info-toggle, #action-panel-toggle,
            .genre-buttons, .duration-filter, .speed-controls {
                display: none !important;
            }
            
            /* Hide buttons on non-active slides */
            .video-slide:not(.active) button,
            .slide:not(.active) button {
                display: none !important;
            }
            
            /* Hide action buttons */
            .action-buttons, .slide-actions, [class*="action-panel"] {
                display: none !important;
            }
            
            /* Keep mute button visible */
            #mute-control {
                display: block !important;
                position: fixed !important;
                bottom: 20px !important;
                left: 20px !important;
                z-index: 10000 !important;
            }
            
            /* Keep navigation visible - IMPORTANT */
            .quick-nav button[class*="filter"],
            .quick-nav button[class*="search"],
            .quick-nav button[class*="queue"],
            button[class*="category"] {
                display: inline-block !important;
            }
            
            /* Ensure video fills screen */
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
        
        // Run cleanup with delays to catch dynamically added elements
        cleanupUI();
        setTimeout(cleanupUI, 500);
        setTimeout(cleanupUI, 1500);
        setTimeout(cleanupUI, 3000);
        
        // Ensure video plays
        setTimeout(ensureVideoPlays, 1000);
        setTimeout(ensureVideoPlays, 3000);
        
        // Watch for dynamically added elements
        const observer = new MutationObserver(() => {
            setTimeout(cleanupUI, 100);
        });
        observer.observe(document.body, { childList: true, subtree: true });
        
        console.log('[MovieShows] Minimal UI ready - navigation preserved');
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    window.addEventListener('load', () => {
        setTimeout(cleanupUI, 500);
        setTimeout(ensureVideoPlays, 1000);
    });
})();
