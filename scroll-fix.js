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

    function setupCarouselInteractions() {
        const observer = new MutationObserver(() => {
            const carousel = findCarouselElement();
            if (!carousel) return;

            const items = carousel.querySelectorAll('img:not([data-click-handled])');
            items.forEach(img => {
                img.setAttribute('data-click-handled', 'true');
                const container = img.closest('div.cursor-pointer') || img.parentElement;

                if (container) {
                    container.style.pointerEvents = "auto";
                    container.addEventListener('click', (e) => {
                        const title = img.alt;
                        if (title) {
                            const index = videoSlides.findIndex(slide => {
                                const h2 = slide.querySelector('h2');
                                return h2 && h2.textContent.trim().toLowerCase().includes(title.toLowerCase());
                            });

                            if (index !== -1) {
                                console.log(`[MovieShows] Found movie "${title}" at index ${index}. Jumping...`);
                                e.preventDefault();
                                e.stopPropagation();
                                scrollToSlide(index);
                            }
                        }
                    }, true);
                }
            });
        });

        observer.observe(document.body, { childList: true, subtree: true });
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
                    break;
                }
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });
    }

    function init() {
        if (initialized) return;

        console.log("[MovieShows] Initializing...");

        injectStyles();
        createPlayerSizeControl();
        createLayoutControl();
        setupCarouselInteractions();

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
            setupMutationObserver();
            setTimeout(init, 2000);
        });
    } else {
        setupMutationObserver();
        setTimeout(init, 2000);
    }
})();
