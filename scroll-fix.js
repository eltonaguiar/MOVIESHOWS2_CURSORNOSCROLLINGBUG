// TikTok-style scroll navigation fix for MovieShows
(function () {
    "use strict";

    let initialized = false;
    let scrollContainer = null;
    let videoSlides = [];
    let currentIndex = 0;
    let isScrolling = false;
    let scrollTimeout = null;
    const SCROLL_COOLDOWN = 500;

    // ========== PLAYER SIZE CONTROL ==========

    function createPlayerSizeControl() {
        if (document.getElementById("player-size-control")) return;

        const control = document.createElement("div");
        control.id = "player-size-control";
        control.innerHTML = `
      <span style="color: #888; font-size: 11px; margin-right: 8px;">Player:</span>
      <button data-size="small">S</button>
      <button data-size="medium">M</button>
      <button data-size="large" class="active">L</button>
      <button data-size="full">Full</button>
    `;

        document.body.appendChild(control);

        const savedSize = localStorage.getItem("movieshows-player-size") || "large";
        setPlayerSize(savedSize);

        control.querySelectorAll("button").forEach((btn) => {
            btn.addEventListener("click", () => {
                const size = btn.dataset.size;
                setPlayerSize(size);
                localStorage.setItem("movieshows-player-size", size);
            });
        });
    }

    function findCarouselElement() {
        // Heuristic to find the bottom carousel
        // Look for the "Hot Picks" section specifically
        const headings = Array.from(document.querySelectorAll('h3'));
        const hotPicksHeader = headings.find(h => h.textContent.includes('Hot Picks'));
        if (hotPicksHeader) {
            let p = hotPicksHeader.parentElement;
            while (p && p.tagName !== 'BODY') {
                const style = window.getComputedStyle(p);
                // "absolute top-[85vh]..."
                if ((style.position === 'absolute' || style.position === 'fixed') &&
                    (style.top.includes('85vh') || p.classList.contains('top-[85vh]'))) {
                    return p;
                }
                if (p.querySelector && p.querySelector('.overflow-x-auto')) {
                    const wrapper = p.closest('section') || p.parentElement;
                    return wrapper;
                }
                p = p.parentElement;
            }
        }

        // Fallback: look for the specific top-[85vh] Class
        const specific = document.querySelector('.top-\\[85vh\\]');
        if (specific) return specific;

        // Fallback heuristic
        const candidates = Array.from(document.querySelectorAll('div'));
        return candidates.find(el => {
            const style = window.getComputedStyle(el);
            return (style.position === 'absolute' && style.top.includes('85vh'));
        });
    }

    function updateCarouselVisibility() {
        const carousel = findCarouselElement();
        if (!carousel) {
            console.log("[MovieShows] Carousel NOT found");
            return;
        }

        console.log("[MovieShows] Toggling carousel:", carousel);

        const shouldHide = document.body.classList.contains('carousel-hidden');
        // Use display: none !important to force it
        if (shouldHide) {
            carousel.style.setProperty('display', 'none', 'important');
        } else {
            carousel.style.setProperty('display', 'block', 'important'); // Or original display? 
            // Better to just remove the property if showing, but if we set none important we might need block important
            // Try removing first
            carousel.style.removeProperty('display');
            if (window.getComputedStyle(carousel).display === 'none') {
                carousel.style.setProperty('display', 'block', 'important');
            }
        }
    }

    function createLayoutControl() {
        if (document.getElementById("layout-control")) return;

        const control = document.createElement("div");
        control.id = "layout-control";
        control.style.marginTop = "4px";
        control.innerHTML = `
      <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 4px;">
          <span style="color: #888; font-size: 11px; margin-right: 2px;">Txt:</span>
          <button data-layout="default" class="active">Def</button>
          <button data-layout="raised">High</button>
          <button data-layout="center">Mid</button>
      </div>
      <div style="display: flex; align-items: center; justify-content:space-between; gap: 2px; margin-bottom: 4px;">
          <div style="display:flex; align-items:center; gap:2px;">
             <span style="color: #888; font-size: 11px;">Y:</span>
             <button id="adj-up" style="padding: 2px 6px;">▲</button>
             <button id="adj-down" style="padding: 2px 6px;">▼</button>
             <span id="adj-val-y" style="color: #fff; font-size: 10px; min-width: 25px; text-align: center;">0</span>
          </div>
          <div style="display:flex; align-items:center; gap:2px;">
             <span style="color: #888; font-size: 11px;">X:</span>
             <button id="adj-left" style="padding: 2px 6px;">◄</button>
             <button id="adj-right" style="padding: 2px 6px;">►</button>
             <span id="adj-val-x" style="color: #fff; font-size: 10px; min-width: 25px; text-align: center;">0</span>
          </div>
      </div>
      <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
          <button data-action="toggle-carousel" class="active" style="width:100%;">Bar: Show</button>
      </div>
      <div style="display: flex; align-items: center; gap: 4px;">
          <span style="color: #888; font-size: 11px; margin-right: 2px;">Dtl:</span>
          <button data-detail="full" class="active">Full</button>
          <button data-detail="title">Title</button>
    `;

        const container = document.getElementById("player-size-control");
        if (container) {
            container.appendChild(control);

            // Layout Mode
            const layoutBtns = control.querySelectorAll('button[data-layout]');
            layoutBtns.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    layoutBtns.forEach(b => b.classList.remove('active'));
                    e.target.classList.add('active');
                    setTextLayout(e.target.dataset.layout);
                });
            });

            // Detail Mode
            const detailBtns = control.querySelectorAll('button[data-detail]');
            detailBtns.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    detailBtns.forEach(b => b.classList.remove('active'));
                    e.target.classList.add('active');
                    const mode = e.target.dataset.detail;
                    document.body.classList.remove('detail-full', 'detail-title');
                    document.body.classList.add(`detail-${mode}`);
                });
            });

            // Carousel Toggle
            const carouselBtn = control.querySelector('[data-action="toggle-carousel"]');
            carouselBtn.addEventListener('click', () => {
                document.body.classList.toggle('carousel-hidden');
                const isHidden = document.body.classList.contains('carousel-hidden');
                carouselBtn.textContent = isHidden ? 'Bar: Hide' : 'Bar: Show';
                carouselBtn.classList.toggle('active', !isHidden);
                updateCarouselVisibility();
            });

            // Manual Adjustment
            let currentOffsetY = 0;
            let currentOffsetX = 0;

            const updateOffset = () => {
                document.documentElement.style.setProperty('--text-offset-y', `${currentOffsetY}px`);
                document.documentElement.style.setProperty('--text-offset-x', `${currentOffsetX}px`);
                document.getElementById('adj-val-y').textContent = currentOffsetY;
                document.getElementById('adj-val-x').textContent = currentOffsetX;
            };

            document.getElementById('adj-up').addEventListener('click', () => { currentOffsetY += 10; updateOffset(); });
            document.getElementById('adj-down').addEventListener('click', () => { currentOffsetY -= 10; updateOffset(); });
            document.getElementById('adj-left').addEventListener('click', () => { currentOffsetX -= 10; updateOffset(); });
            document.getElementById('adj-right').addEventListener('click', () => { currentOffsetX += 10; updateOffset(); });
        } else {
            document.body.appendChild(control);
        }

        // Initialize saved layout
        const savedLayout = localStorage.getItem("movieshows-text-layout") || "default";
        setTextLayout(savedLayout);
    }

    function setTextLayout(layout) {
        document.body.classList.remove(
            "text-layout-default",
            "text-layout-raised",
            "text-layout-overlay",
            "text-layout-compact"
        );
        document.body.classList.add(`text-layout-${layout}`);

        const control = document.getElementById("layout-control");
        if (control) {
            control.querySelectorAll("button").forEach((btn) => {
                btn.classList.toggle("active", btn.dataset.layout === layout);
            });
        }
        console.log("[MovieShows] Text layout:", layout);
    }

    function setPlayerSize(size) {
        document.body.classList.remove(
            "player-small",
            "player-medium",
            "player-large",
            "player-full",
        );
        document.body.classList.add(`player-${size}`);

        const control = document.getElementById("player-size-control");
        if (control) {
            // Only toggle the size buttons, which are direct children of the container's top level (before we added the layout control) or we need to be specific
            // Actually, we can just look for buttons with data-size
            control.querySelectorAll("button[data-size]").forEach((btn) => {
                btn.classList.toggle("active", btn.dataset.size === size);
            });
        }

        // Apply size directly to iframes found on page
        applyPlayerSize(size);

        console.log("[MovieShows] Player size:", size);
    }

    function applyPlayerSize(size) {
        const heights = {
            small: "40vh",
            medium: "60vh",
            large: "85vh",
            full: "100vh",
        };

        const height = heights[size] || heights.large;

        // 1. Resize all iframes
        const iframes = document.querySelectorAll('iframe');
        iframes.forEach((iframe) => {
            iframe.style.height = height;
            iframe.style.maxHeight = height;
        });

        // 2. Resize the main section container
        // struct: section > div.group/player
        const playerGroups = document.querySelectorAll('.group\\/player');
        playerGroups.forEach(group => {
            // Resize the group itself
            group.style.height = height;

            // Resize the parent section
            const section = group.closest('section');
            if (section) {
                section.style.height = height;
                section.style.maxHeight = height;
                // Ensure z-index is correct for full screen
                if (size === 'full') {
                    section.style.zIndex = '50';
                } else {
                    section.style.removeProperty('z-index');
                }
            }
        });

        // 3. Fallback: Search for the section by class signature if group not found
        if (playerGroups.length === 0) {
            const sections = document.querySelectorAll('section');
            sections.forEach(sec => {
                if (sec.classList.contains('bg-black') && sec.classList.contains('z-10')) {
                    sec.style.height = height;
                }
            });
        }
    }

    function fixCarouselZIndex() {
        // Use the existing finder logic
        const carousel = findCarouselElement();
        if (carousel) {
            carousel.style.zIndex = "1000"; // Ensure it's above everything including the player
            // If it's fixed or absolute, z-index will work
        }
    }

    let isProcessingCarouselClick = false;

    function setupCarouselInteractions() {
        const observer = new MutationObserver(() => {
            const carousel = findCarouselElement();
            if (!carousel) return;

            const items = carousel.querySelectorAll('img:not([data-click-handled])');
            items.forEach(img => {
                img.setAttribute('data-click-handled', 'true');
                // Target the parent A tag or DIV, or just the IMG itself if no parent
                const container = img.closest('a') || img.closest('div.cursor-pointer') || img.parentElement;

                // Allow clicking the image itself if container is weird
                const target = container || img;

                target.style.pointerEvents = "auto";
                target.style.cursor = "pointer";

                target.addEventListener('click', (e) => {
                    // Stop any other listeners (like the broken one)
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();

                    if (isProcessingCarouselClick) return;
                    isProcessingCarouselClick = true;
                    setTimeout(() => { isProcessingCarouselClick = false; }, 1000);

                    const title = img.alt || img.title;
                    console.log(`[MovieShows] Clicked carousel item: "${title}"`);
                    if (!title) return;

                    // 1. Check if already properly loaded in feed (Video Slides)
                    // We check the LAST 50 slides to save perf but cover most use cases
                    const recentSlides = videoSlides;
                    let index = -1;

                    // First exact match (Case insensitive)
                    index = recentSlides.findIndex(slide => {
                        const h2 = slide.querySelector('h2');
                        return h2 && h2.textContent.toLowerCase().trim() === title.toLowerCase().trim();
                    });

                    // If not found, try VERY Strict inclusion (must contain full title)
                    if (index === -1) {
                        index = recentSlides.findIndex(slide => {
                            const h2 = slide.querySelector('h2');
                            // If title is "Scream 7", "Scream" should NOT match.
                            // But if title is "Scream", "Scream 7" might be okay? No, let's be strict.
                            // The carousel item is usually the "source of truth" for what user wants.
                            return h2 && h2.textContent.toLowerCase() === title.toLowerCase();
                        });
                    }

                    if (index !== -1) {
                        console.log(`[MovieShows] Found in feed at index ${index}. Jumping...`);
                        scrollToSlide(index);
                        return;
                    }

                    // 2. Load from DB or Fallback
                    let movie = null;

                    if (allMoviesData.length > 0) {
                        // Improved Fuzzy Match Strategy
                        const normalize = (str) => str.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();
                        const targetSlug = normalize(title);
                        const targetTokens = targetSlug.split(' ').filter(t => t.length > 2);

                        movie = allMoviesData.find(m => {
                            const mTitle = normalize(m.title);
                            return mTitle.includes(targetSlug) || targetSlug.includes(mTitle);
                        });

                        // Fallback: Token matching
                        if (!movie && targetTokens.length > 0) {
                            movie = allMoviesData.find(m => {
                                const mTitle = normalize(m.title);
                                return targetTokens.some(token => mTitle.includes(token));
                            });
                        }
                    }

                    // 3. Check hardcoded Fallback Data (for missing 2026 Hot Picks)
                    if (!movie) {
                        const fallbackMovies = [
                            {
                                title: "Scream 7",
                                year: "2026",
                                trailerUrl: "https://www.youtube.com/watch?v=UJrghaPJ0RY", // Official Teaser
                                genres: ["Horror", "Mystery"],
                                rating: "8.5"
                            },
                            {
                                title: "Scream", // In case title is just Scream
                                year: "2026",
                                trailerUrl: "https://www.youtube.com/watch?v=UJrghaPJ0RY",
                                genres: ["Horror", "Mystery"],
                                rating: "8.5"
                            },
                            {
                                title: "Avatar: Fire and Ash",
                                year: "2026",
                                trailerUrl: "https://www.youtube.com/watch?v=d9My665987w", // Avatar 2 as placeholder
                                genres: ["Sci-Fi", "Action"],
                                rating: "9.0"
                            },
                            {
                                title: "The Batman Part II",
                                year: "2026",
                                trailerUrl: "https://www.youtube.com/watch?v=mqqft2x_Aa4", // The Batman
                                genres: ["Action", "Crime"],
                                rating: "8.8"
                            },
                            {
                                title: "Shrek 5",
                                year: "2026",
                                trailerUrl: "https://www.youtube.com/watch?v=CwXOrWvPBPk", // Shrek placeholder
                                genres: ["Animation", "Comedy"],
                                rating: "8.0"
                            },
                            {
                                title: "Toy Story 5",
                                year: "2026",
                                trailerUrl: "https://www.youtube.com/watch?v=wmiIUN-7qhE", // Toy Story 4
                                genres: ["Animation", "Family"],
                                rating: "8.2"
                            }
                        ];

                        // Strict/Loose match on fallback
                        const normalize = (str) => str.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();
                        const targetSlug = normalize(title);
                        movie = fallbackMovies.find(m => {
                            const mTitle = normalize(m.title);
                            return mTitle.includes(targetSlug) || targetSlug.includes(mTitle);
                        });
                    }

                    if (movie) {
                        console.log(`[MovieShows] Found movie: "${movie.title}"`);
                        showToast(`Playing: ${movie.title}`);
                        addMovieToFeed(movie, true);
                    } else {
                        console.warn(`[MovieShows] Movie "${title}" not found in DB or Fallback.`);
                        showToast(`Could not find "${title}"`, true);
                    }
                }, true); // Capture phase
            });
        });

        observer.observe(document.body, { childList: true, subtree: true });
    }

    // Simple Toast Notification
    function showToast(message, isError = false) {
        let toast = document.getElementById('movieshows-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'movieshows-toast';
            toast.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(0,0,0,0.85);
                color: white;
                padding: 12px 24px;
                border-radius: 8px;
                font-weight: bold;
                z-index: 10000;
                pointer-events: none;
                transition: opacity 0.3s;
                opacity: 0;
                box-shadow: 0 4px 12px rgba(0,0,0,0.5);
                text-align: center;
                backdrop-filter: blur(4px);
                border: 1px solid rgba(255,255,255,0.1);
            `;
            document.body.appendChild(toast);
        }

        toast.textContent = message;
        toast.style.color = isError ? '#f87171' : '#4ade80'; // Red or Green
        toast.style.opacity = '1';

        // Hide previous timeout
        if (toast.timeout) clearTimeout(toast.timeout);
        toast.timeout = setTimeout(() => {
            toast.style.opacity = '0';
        }, 2000);
    }

    function injectStyles() {
        if (document.getElementById("movieshows-custom-styles")) return;

        const style = document.createElement("style");
        style.id = "movieshows-custom-styles";
        style.textContent = `
      /* ... (previous styles) ... */
      
      /* Player size control */
      #player-size-control {
        position: fixed;
        top: 8px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 9999;
        display: flex;
        align-items: center;
        gap: 6px;
        background: rgba(0, 0, 0, 0.9);
        padding: 8px 16px;
        border-radius: 12px;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.15);
        font-family: sans-serif;
      }
      
      #layout-control button, #player-size-control button {
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        color: #aaa;
        padding: 4px 10px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 11px;
        font-weight: bold;
        transition: all 0.2s;
        flex: 1;
        text-align: center;
      }

      #layout-control button:hover, #player-size-control button:hover {
        background: rgba(255, 255, 255, 0.2);
        color: white;
      }

      #layout-control button.active, #player-size-control button.active {
        background: #22c55e;
        border-color: #22c55e;
        color: black;
      }

      /* Fix title and description visibility */
      h2.text-2xl {
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;
        font-size: 3.5rem !important;
        line-height: 1.1 !important;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.9);
        margin-bottom: 0.5rem !important;
        transition: transform 0.3s ease;
        pointer-events: auto; /* Allow text selection/interaction */
      }
      
      p.text-sm {
        font-size: 1.25rem !important;
        line-height: 1.5 !important;
        text-shadow: 1px 1px 2px rgba(0,0,0,0.9);
        max-width: 80% !important;
        transition: opacity 0.3s ease;
        pointer-events: auto;
      }
      
      /* Text Container Interaction Fix */
      .snap-center > div.absolute.bottom-4.left-4 {
          pointer-events: auto; /* Allow interaction so wheel events bubble to document */
          transform: translate(var(--text-offset-x), var(--text-offset-y)) !important; 
          transition: transform 0.1s ease-out, bottom 0.3s ease;
      }

      /* Detail Modes */
      body.detail-title p.text-sm {
        display: none !important;
      }
      body.detail-title .flex.flex-wrap {
        display: none !important;
      }

      /* Ensure the bottom info section is fully visible */
      .snap-center [class*="bottom-4"][class*="left-4"] {
        left: 16px !important;
      }
      
      /* AUTOMATIC POSITION ADJUSTMENT FOR SIZES (Default "Def" position) */
      .player-medium .snap-center > div.absolute.bottom-4.left-4 {
          bottom: 15vh !important;
      }
      .player-large .snap-center > div.absolute.bottom-4.left-4 {
          bottom: 22vh !important;
      }
      
      /* Make sure text isn't clipped */
      [class*="line-clamp"] {
        -webkit-line-clamp: 4 !important;
        line-clamp: 4 !important;
        display: -webkit-box !important;
        overflow: visible !important;
      }

      /* Layout Modes */
      
      /* Raised: Lift the ENTIRE text container up explicitly */
      /* Redefine Raised to be a specific high position */
      .text-layout-raised .snap-center > div.absolute.bottom-4.left-4 {
         bottom: 35vh !important; /* Definitive high position */
         transform: none !important;
         transition: bottom 0.3s ease;
      }

      /* Center: Centered in screen - heavily modified to look like a title card */
      .text-layout-center .snap-center > div.absolute.bottom-4.left-4 {
         bottom: 50% !important;
         top: auto !important;
         /* Include offsets in calculation: x, y */
         transform: translate(var(--text-offset-x), calc(50% + var(--text-offset-y))) !important;
         display: flex;
         flex-direction: column;
         align-items: center;
         text-align: center;
         width: 100%;
         left: 0 !important;
         right: 0 !important;
         background: transparent !important;
         /* pointer-events: auto by default now */
      }
      .text-layout-center h2.text-2xl {
         font-size: 5rem !important;
         text-align: center;
         text-shadow: 0 4px 8px rgba(0,0,0,0.8);
      }
      /* Hide description/badges in center mode, but keep title */
      .text-layout-center p.text-sm,
      .text-layout-center .flex.flex-wrap,
      .text-layout-center .flex.items-center.gap-2 { 
         display: none !important;
      }

      /* Player size CSS classes */
      .player-small iframe[src*="youtube"] { height: 40vh !important; max-height: 40vh !important; }
      .player-medium iframe[src*="youtube"] { height: 60vh !important; max-height: 60vh !important; }
      .player-large iframe[src*="youtube"] { height: 85vh !important; max-height: 85vh !important; }
      .player-full iframe[src*="youtube"] { height: 100vh !important; max-height: 100vh !important; }
    `;
        document.head.appendChild(style);

        // Also apply z-index fix immediately
        fixCarouselZIndex();
        setInterval(fixCarouselZIndex, 2000); // Polling checks
    }

    // ========== DATA & INFINITE SCROLL ==========

    let allMoviesData = [];

    async function loadMoviesData() {
        if (allMoviesData.length > 0) return;

        // ONLY use the stable large database, with cache busting
        const source = 'movies-database.json?v=' + new Date().getTime();

        try {
            console.log(`[MovieShows] Attempting to load: ${source}`);
            const res = await fetch(source);

            if (res.ok) {
                const data = await res.json();
                // Handle different possible structures
                const items = data.items || data.movies || data;

                if (Array.isArray(items) && items.length > 0) {
                    allMoviesData = items;
                    console.log(`[MovieShows] SUCCESS: Loaded ${items.length} items.`);

                    // Immediately hydrate the UI
                    ensureMinimumCount(20);
                    updateUpNextCount();
                    checkInfiniteScroll();
                } else {
                    console.error(`[MovieShows] Data loaded but format incorrect or empty:`, data);
                }
            } else {
                console.error(`[MovieShows] HTTP Error loading data: ${res.status}`);
            }
        } catch (e) {
            console.error(`[MovieShows] CRITICAL FETCH ERROR:`, e);
        }
    }

    function ensureMinimumCount(min) {
        if (videoSlides.length < min && allMoviesData.length > 0) {
            const needed = min - videoSlides.length;
            console.log(`[MovieShows] Pre-filling feed with ${needed} more shows...`);

            // Get current titles
            const existingTitles = videoSlides.map(s => s.querySelector('h2')?.textContent || "");

            // Filter candidates
            let candidates = allMoviesData.filter(m => !existingTitles.includes(m.title));

            // If we ran out of unique content, allow duplicates (but shuffle)
            if (candidates.length < needed) {
                console.log("[MovieShows] Running low on unique content, recycling...");
                candidates = [...allMoviesData].sort(() => 0.5 - Math.random());
            }

            const toAdd = candidates
                .sort(() => 0.5 - Math.random())
                .slice(0, needed);

            toAdd.forEach(m => addMovieToFeed(m, false));
        }
    }

    function getYouTubeEmbedUrl(url) {
        if (!url) return "";
        let videoId = "";
        try {
            if (url.includes("v=")) {
                videoId = url.split("v=")[1].split("&")[0];
            } else if (url.includes("youtu.be/")) {
                videoId = url.split("youtu.be/")[1].split("?")[0];
            } else if (url.includes("embed/")) {
                return url;
            }
        } catch (e) { return url; }

        if (videoId) {
            // Autoplay=1, Mute=0, Loop=1
            return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&controls=0&loop=1&playlist=${videoId}`;
        }
        return url;
    }

    function createSlide(movie) {
        const slide = document.createElement("div");
        slide.className = "h-full w-full snap-center";

        const embedUrl = getYouTubeEmbedUrl(movie.trailerUrl);
        const genresHtml = (movie.genres || []).map(g =>
            `<span class="text-xs bg-white/10 backdrop-blur-sm px-2 py-1 rounded-full text-gray-100 border border-white/10">${g}</span>`
        ).join("");

        const rating = movie.rating ? `IMDb ${movie.rating}` : "TBD";
        const year = movie.year || "2026";

        slide.innerHTML = `
            <div class="relative w-full h-full flex items-center justify-center overflow-hidden snap-center bg-transparent">
                <div class="absolute inset-0 w-full h-full bg-black">
                     <iframe 
                        data-src="${embedUrl}" 
                        src="" 
                        class="w-full h-full object-cover lazy-iframe" 
                        allow="autoplay; encrypted-media; picture-in-picture" 
                        allowfullscreen 
                        style="pointer-events: auto;"
                        frameborder="0">
                     </iframe>
                </div>
                <div class="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/80 pointer-events-none z-20"></div>
                
                <!-- Right Action Buttons (Simplified) -->
                <div class="absolute right-4 bottom-20 flex flex-col items-center gap-4 z-30 pointer-events-auto">
                    <button class="flex flex-col items-center gap-1 group">
                        <div class="p-3 rounded-full bg-black/40 backdrop-blur-sm transition-all duration-200 group-hover:bg-black/60">
                             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-heart w-8 h-8 text-white"><path d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5"></path></svg>
                        </div>
                        <span class="text-xs font-semibold drop-shadow-md text-white">Like</span>
                    </button>
                    <button class="flex flex-col items-center gap-1 group">
                        <div class="p-3 rounded-full bg-black/40 backdrop-blur-sm transition-all duration-200 group-hover:bg-black/60">
                             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-plus w-8 h-8 text-white"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        </div>
                        <span class="text-xs font-semibold drop-shadow-md text-white">List</span>
                    </button>
                    <button class="flex flex-col items-center gap-1 group">
                        <div class="p-3 rounded-full bg-black/40 backdrop-blur-sm transition-all duration-200 group-hover:bg-black/60">
                             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-share2 w-8 h-8 text-white"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" x2="15.42" y1="13.51" y2="17.49"></line><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"></line></svg>
                        </div>
                        <span class="text-xs font-semibold drop-shadow-md text-white">Share</span>
                    </button>
                </div>

                <!-- Bottom Info -->
                <div class="absolute bottom-4 left-4 right-16 z-30 flex flex-col gap-2 pointer-events-none">
                    <div class="flex items-center gap-2">
                         <div class="bg-yellow-500 text-black text-[10px] font-black px-2 py-0.5 rounded flex items-center gap-1 cursor-pointer pointer-events-auto hover:bg-yellow-400">${rating}</div>
                         <div class="bg-white/20 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded">${year}</div>
                         <div class="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">${movie.source || "In Theatres"}</div>
                    </div>
                    <h2 class="text-2xl font-bold text-white drop-shadow-lg leading-tight pointer-events-auto w-full">${movie.title}</h2>
                    <div class="relative group/desc pointer-events-auto max-w-[90%]">
                        <p class="text-sm text-gray-200 line-clamp-3 drop-shadow-sm transition-all duration-300 w-full">${movie.description || ""}</p>
                    </div>
                    <div class="flex flex-wrap gap-2 mt-2">
                        ${genresHtml}
                    </div>
                </div>
            </div>
        `;
        return slide;
    }

    function addMovieToFeed(movie, scrollAfter = false) {
        if (!scrollContainer) return;

        // Prevent strictly adjacent duplicates, but allow repeats eventually
        const lastSlide = videoSlides[videoSlides.length - 1];
        if (lastSlide) {
            const h2 = lastSlide.querySelector('h2');
            if (h2 && h2.textContent === movie.title) return;
        }

        const slide = createSlide(movie);
        scrollContainer.appendChild(slide);
        videoSlides.push(slide);
        updateUpNextCount();

        if (scrollAfter) {
            // Wait for DOM to stabilize
            requestAnimationFrame(() => {
                scrollToSlide(videoSlides.length - 1);
                // Force player size application on new slide
                const size = localStorage.getItem("movieshows-player-size") || "large";
                applyPlayerSize(size);
            });
        }
    }

    function injectQueueCloseButton(headerEl) {
        if (headerEl.querySelector('.custom-queue-close')) return;

        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '✕';
        closeBtn.className = 'custom-queue-close';
        closeBtn.title = "Close Queue";
        closeBtn.style.cssText = "margin-left: auto; background: #ef4444; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: bold; border: none; cursor: pointer; pointer-events: auto; z-index: 9999;";

        closeBtn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log("[MovieShows] Closing queue...");

            // 1. Try finding the React close button (usually 'x' SVG)
            const panel = headerEl.closest('div.fixed') || headerEl.parentElement.parentElement;
            if (panel) {
                const buttons = panel.querySelectorAll('button');
                const nativeClose = Array.from(buttons).find(b => b.textContent.includes('✕') || b.querySelector('svg') || b.getAttribute('aria-label') === 'Close menu');
                if (nativeClose && nativeClose !== closeBtn) {
                    nativeClose.click();
                    return;
                }
                // If no native close, just hide the panel
                panel.style.display = 'none';
            }
        };

        headerEl.style.display = 'flex';
        headerEl.style.alignItems = 'center';
        headerEl.style.justifyContent = 'space-between';

        // Ensure the header text is wrapped if needed, but usually we can just append
        headerEl.appendChild(closeBtn);
    }

    function updateUpNextCount() {
        // Update the green button
        const spans = Array.from(document.querySelectorAll('span'));
        const upNextSpan = spans.find(s => s.textContent.includes("Up Next"));
        if (upNextSpan) {
            const count = Math.max(20, allMoviesData.length - videoSlides.length + 20);
            upNextSpan.textContent = `${count}+ Up Next - Infinite`;
            if (upNextSpan.parentElement) upNextSpan.parentElement.style.background = "#22c55e";
        }

        // Try to update the "Queue (10)" text in the side panel header if visible
        // And ensure it has a close button
        const headings = Array.from(document.querySelectorAll('h2, div'));
        const queueHeader = headings.find(el =>
            el.textContent && /Queue\s*\((\d+|Infinite)\)/.test(el.textContent) && (el.tagName === 'H2' || el.classList.contains('text-xl'))
        );

        if (queueHeader) {
            if (!queueHeader.textContent.includes('Infinite')) {
                queueHeader.innerHTML = queueHeader.innerHTML.replace(/\(\d+\)/, '(Infinite)');
            }
            injectQueueCloseButton(queueHeader);
        }
    }

    let processingInfiniteScroll = false;

    function checkInfiniteScroll() {
        if (!scrollContainer || allMoviesData.length === 0) return;

        // Threshold: 3 screens from bottom
        const scrollBottom = scrollContainer.scrollTop + scrollContainer.clientHeight;
        const totalHeight = scrollContainer.scrollHeight;
        const distance = totalHeight - scrollBottom;

        // If we are close to the end (within 3 slides height)
        if (distance < (scrollContainer.clientHeight * 3)) {
            // Rate limit to avoid spamming
            if (processingInfiniteScroll) return;
            processingInfiniteScroll = true;
            setTimeout(() => processingInfiniteScroll = false, 1000);

            console.log("[MovieShows] Infinite Scroll Triggered!");
            const recentTitles = videoSlides.slice(-15).map(s => s.querySelector('h2')?.textContent).filter(Boolean);
            const candidates = allMoviesData.filter(m => !recentTitles.includes(m.title));

            if (candidates.length > 0) {
                const toAdd = candidates.sort(() => 0.5 - Math.random()).slice(0, 3);
                toAdd.forEach(m => addMovieToFeed(m));
            } else {
                // Recycle
                const recycled = allMoviesData.sort(() => 0.5 - Math.random()).slice(0, 3);
                recycled.forEach(m => addMovieToFeed(m));
            }
        }
    }

    // ========== SCROLL NAVIGATION ==========

    function findScrollContainer() {
        const containers = document.querySelectorAll(
            '[class*="overflow-y-scroll"]',
        );
        for (const container of containers) {
            if (container.className.includes("snap-y")) {
                return container;
            }
        }
        const snapCenterEl = document.querySelector('[class*="snap-center"]');
        if (snapCenterEl && snapCenterEl.parentElement) {
            return snapCenterEl.parentElement;
        }
        return null;
    }

    function findVideoSlides() {
        if (!scrollContainer) return [];
        return Array.from(
            scrollContainer.querySelectorAll('[class*="snap-center"]'),
        );
    }

    function clickQueuePlayButton() {
        const allButtons = document.querySelectorAll("button");
        for (const btn of allButtons) {
            if (btn.textContent?.includes("Play Queue")) {
                btn.click();
                return true;
            }
        }

        const greenPlayBtn = document.querySelector('button[class*="bg-green"]');
        if (greenPlayBtn) {
            greenPlayBtn.click();
            return true;
        }

        return false;
    }

    function getCurrentVisibleIndex() {
        if (!scrollContainer || videoSlides.length === 0) return 0;

        const slideHeight = scrollContainer.clientHeight;
        if (slideHeight <= 0) return 0;

        return Math.max(
            0,
            Math.min(
                videoSlides.length - 1,
                Math.round(scrollContainer.scrollTop / slideHeight),
            ),
        );
    }

    function scrollToSlide(index) {
        if (!scrollContainer || index < 0 || index >= videoSlides.length) return;

        const slideHeight = scrollContainer.clientHeight;
        scrollContainer.scrollTo({
            top: index * slideHeight,
            behavior: "smooth",
        });

        currentIndex = index;
    }

    function handleScroll() {
        if (isScrolling) return;

        const newIndex = getCurrentVisibleIndex();
        if (newIndex !== currentIndex) {
            currentIndex = newIndex;
            checkInfiniteScroll(); // Check if we need more content
        }
    }

    function handleWheel(e) {
        const target = e.target;

        if (
            target.closest("#player-size-control") ||
            target.closest('.overflow-y-auto:not([class*="snap-y"])') ||
            target.closest('[class*="Queue"]') ||
            target.closest('[class*="fixed"][class*="right"]') ||
            target.closest("select")
        ) {
            return;
        }

        if (!scrollContainer || isScrolling) {
            if (isScrolling) e.preventDefault();
            return;
        }

        if (Math.abs(e.deltaY) < 20) return;

        e.preventDefault();

        const direction = e.deltaY > 0 ? 1 : -1;
        const newIndex = Math.max(
            0,
            Math.min(videoSlides.length - 1, currentIndex + direction),
        );

        if (newIndex !== currentIndex) {
            isScrolling = true;
            scrollToSlide(newIndex);

            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                isScrolling = false;
                currentIndex = getCurrentVisibleIndex();
                // Re-apply player size after scroll
                const size = localStorage.getItem("movieshows-player-size") || "large";
                setTimeout(() => applyPlayerSize(size), 100);
            }, SCROLL_COOLDOWN);
        }
    }

    function handleKeydown(e) {
        if (
            e.target.tagName === "INPUT" ||
            e.target.tagName === "TEXTAREA" ||
            e.target.tagName === "SELECT"
        ) {
            return;
        }

        if (isScrolling) return;

        let direction = 0;
        switch (e.key) {
            case "ArrowDown":
            case "j":
            case "J":
                direction = 1;
                break;
            case "ArrowUp":
            case "k":
            case "K":
                direction = -1;
                break;
            case "Home":
                if (videoSlides.length > 0) {
                    e.preventDefault();
                    isScrolling = true;
                    scrollToSlide(0);
                    clearTimeout(scrollTimeout);
                    scrollTimeout = setTimeout(() => {
                        isScrolling = false;
                    }, SCROLL_COOLDOWN);
                }
                return;
            case "End":
                if (videoSlides.length > 0) {
                    e.preventDefault();
                    isScrolling = true;
                    scrollToSlide(videoSlides.length - 1);
                    clearTimeout(scrollTimeout);
                    scrollTimeout = setTimeout(() => {
                        isScrolling = false;
                    }, SCROLL_COOLDOWN);
                }
                return;
            case "1":
                setPlayerSize("small");
                localStorage.setItem("movieshows-player-size", "small");
                return;
            case "2":
                setPlayerSize("medium");
                localStorage.setItem("movieshows-player-size", "medium");
                return;
            case "3":
                setPlayerSize("large");
                localStorage.setItem("movieshows-player-size", "large");
                return;
            case "4":
                setPlayerSize("full");
                localStorage.setItem("movieshows-player-size", "full");
                return;
        }

        if (direction === 0) return;

        e.preventDefault();

        const newIndex = Math.max(
            0,
            Math.min(videoSlides.length - 1, currentIndex + direction),
        );

        if (newIndex !== currentIndex) {
            isScrolling = true;
            scrollToSlide(newIndex);

            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                isScrolling = false;
                currentIndex = getCurrentVisibleIndex();
            }, SCROLL_COOLDOWN);
        }
    }

    let touchStartY = 0;
    let touchStartTime = 0;

    function handleTouchStart(e) {
        touchStartY = e.touches[0].clientY;
        touchStartTime = Date.now();
    }

    function handleTouchEnd(e) {
        if (isScrolling) return;

        const touchEndY = e.changedTouches[0].clientY;
        const deltaY = touchStartY - touchEndY;
        const duration = Date.now() - touchStartTime;

        if (duration < 300 && Math.abs(deltaY) > 50) {
            const direction = deltaY > 0 ? 1 : -1;
            const newIndex = Math.max(
                0,
                Math.min(videoSlides.length - 1, currentIndex + direction),
            );

            if (newIndex !== currentIndex) {
                isScrolling = true;
                scrollToSlide(newIndex);

                clearTimeout(scrollTimeout);
                scrollTimeout = setTimeout(() => {
                    isScrolling = false;
                    currentIndex = getCurrentVisibleIndex();
                }, SCROLL_COOLDOWN);
            }
        }
    }

    // Watch for new iframes being added and apply size
    function setupIframeObserver() {
        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.addedNodes.length) {
                    const size =
                        localStorage.getItem("movieshows-player-size") || "large";
                    setTimeout(() => applyPlayerSize(size), 200);

                    // Also observe new iframes for playback control
                    const newIframes = Array.from(mutation.addedNodes)
                        .flatMap(node => node.querySelectorAll ? Array.from(node.querySelectorAll('iframe.lazy-iframe')) : []);

                    if (videoObserver && newIframes.length > 0) {
                        newIframes.forEach(iframe => videoObserver.observe(iframe));
                    }
                    break;
                }
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });
    }

    let videoObserver = null;
    function setupVideoObserver() {
        if (videoObserver) return;

        videoObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const iframe = entry.target;
                if (entry.isIntersecting) {
                    // Load src if empty
                    const dataSrc = iframe.getAttribute('data-src');
                    if (dataSrc && !iframe.getAttribute('src')) {
                        console.log(`[MovieShows] Playing video: ${dataSrc}`);
                        iframe.setAttribute('src', dataSrc);
                    }
                } else {
                    // Unload src to stop playback
                    if (iframe.getAttribute('src')) {
                        console.log(`[MovieShows] Pausing video (out of view)`);
                        iframe.setAttribute('src', '');
                    }
                }
            });
        }, {
            threshold: 0.5 // 50% visible to play
        });

        // Observe existing
        document.querySelectorAll('iframe.lazy-iframe').forEach(iframe => {
            videoObserver.observe(iframe);
        });
    }

    function init() {
        if (initialized) return;

        console.log("[MovieShows] Initializing...");

        injectStyles();
        setupVideoObserver(); // Add this line
        setupIframeObserver();
        createPlayerSizeControl();
        createLayoutControl();
        setupCarouselInteractions();

        // START LOADING DATA
        loadMoviesData();

        scrollContainer = findScrollContainer();
        if (!scrollContainer) {
            setTimeout(init, 1000);
            return;
        }

        videoSlides = findVideoSlides();
        if (videoSlides.length === 0) {
            setTimeout(init, 1000);
            return;
        }

        console.log("[MovieShows] Found", videoSlides.length, "videos");

        document.addEventListener("wheel", handleWheel, {
            passive: false,
            capture: true,
        });
        document.addEventListener("keydown", handleKeydown);
        document.addEventListener("touchstart", handleTouchStart, {
            passive: true,
        });
        document.addEventListener("touchend", handleTouchEnd, { passive: true });
        scrollContainer.addEventListener("scroll", handleScroll, { passive: true });

        currentIndex = getCurrentVisibleIndex();

        // Setup observer to apply size when iframes load
        setupIframeObserver();

        // Apply initial player size
        const savedSize = localStorage.getItem("movieshows-player-size") || "large";
        setTimeout(() => applyPlayerSize(savedSize), 500);

        // Auto-click play queue
        setTimeout(() => {
            if (!clickQueuePlayButton()) {
                setTimeout(clickQueuePlayButton, 2000);
            }
        }, 2000);

        initialized = true;
        console.log(
            "[MovieShows] Ready! Scroll: wheel/arrows/J/K | Size: 1/2/3/4 keys",
        );
    }

    function setupMutationObserver() {
        const observer = new MutationObserver(() => {
            if (!initialized) {
                init();
            } else if (scrollContainer) {
                const newSlides = findVideoSlides();
                if (newSlides.length !== videoSlides.length) {
                    videoSlides = newSlides;
                }
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => {
            // Wait for React Hydration to finish
            setupMutationObserver();
            setTimeout(init, 3000);
        });
    } else {
        setupMutationObserver();
        setTimeout(init, 3000);
    }
})();
