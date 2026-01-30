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
        const candidates = Array.from(document.querySelectorAll('div'));
        return candidates.find(el => {
            const style = window.getComputedStyle(el);
            return (style.position === 'fixed' || style.position === 'absolute')
                && style.bottom === '0px'
                && el.offsetHeight < 300
                && el.offsetHeight > 50
                && el.querySelector('img');
        });
    }

    function updateCarouselVisibility() {
        const carousel = findCarouselElement();
        if (!carousel) return;

        const shouldHide = document.body.classList.contains('carousel-hidden');
        if (shouldHide) {
            carousel.style.opacity = '0';
            carousel.style.pointerEvents = 'none';
        } else {
            carousel.style.opacity = '1';
            carousel.style.pointerEvents = 'all';
        }
    }

    function createLayoutControl() {
        if (document.getElementById("layout-control")) return;

        const control = document.createElement("div");
        control.id = "layout-control";
        control.style.marginTop = "4px";
        control.style.display = "flex";
        control.style.flexDirection = "column";
        control.style.gap = "4px";
        control.innerHTML = `
      <div style="display:flex; align-items:center; gap:4px">
          <span style="color: #888; font-size: 11px; width: 30px;">Bar:</span>
          <button data-action="toggle-carousel" class="active">Show</button>
      </div>
      <div style="display:flex; align-items:center; gap:4px">
          <span style="color: #888; font-size: 11px; width: 30px;">Pos:</span>
          <button data-layout="default" class="active">Def</button>
          <button data-layout="raised">High</button>
          <button data-layout="center">Mid</button>
      </div>
      <div style="display:flex; align-items:center; gap:4px">
          <span style="color: #888; font-size: 11px; width: 30px;">Txt:</span>
          <button data-detail="full" class="active">Full</button>
          <button data-detail="title">Title</button>
      </div>
    `;

        const container = document.getElementById("player-size-control");
        if (container) {
            container.style.flexDirection = "column";
            container.style.gap = "8px";
            container.style.alignItems = "stretch";
            container.appendChild(control);
        } else {
            document.body.appendChild(control);
        }

        // Carousel Toggle Logic
        const carouselBtn = control.querySelector('[data-action="toggle-carousel"]');
        carouselBtn.addEventListener('click', () => {
            document.body.classList.toggle('carousel-hidden');
            const isHidden = document.body.classList.contains('carousel-hidden');
            carouselBtn.textContent = isHidden ? 'Hide' : 'Show';
            carouselBtn.classList.toggle('active', !isHidden);
            updateCarouselVisibility();
        });

        // Layout (Pos) Logic
        const savedLayout = localStorage.getItem("movieshows-text-layout") || "default";
        setTextLayout(savedLayout);

        control.querySelectorAll("button[data-layout]").forEach((btn) => {
            btn.addEventListener("click", () => {
                const layout = btn.dataset.layout;
                setTextLayout(layout);
                localStorage.setItem("movieshows-text-layout", layout);
            });
        });

        // Detail (Txt) Logic
        control.querySelectorAll("button[data-detail]").forEach((btn) => {
            btn.addEventListener("click", () => {
                const mode = btn.dataset.detail;
                document.body.classList.remove('detail-full', 'detail-title');
                document.body.classList.add(`detail-${mode}`);

                control.querySelectorAll("button[data-detail]").forEach(b =>
                    b.classList.toggle('active', b.dataset.detail === mode)
                );
            });
        });
        document.body.classList.add('detail-full');
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

        // Find all YouTube iframes and their containers
        const iframes = document.querySelectorAll('iframe[src*="youtube"]');
        iframes.forEach((iframe) => {
            iframe.style.height = height;
            iframe.style.maxHeight = height;

            // Also style parent containers
            let parent = iframe.parentElement;
            for (let i = 0; i < 5 && parent; i++) {
                if (
                    parent.className &&
                    (parent.className.includes("group/player") ||
                        (parent.className.includes("relative") &&
                            parent.className.includes("w-full")))
                ) {
                    parent.style.height = height;
                    parent.style.maxHeight = height;
                    break;
                }
                parent = parent.parentElement;
            }
        });
    }

    function injectStyles() {
        if (document.getElementById("movieshows-custom-styles")) return;

        const style = document.createElement("style");
        style.id = "movieshows-custom-styles";
        style.textContent = `
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
      }
      
      p.text-sm {
        font-size: 1.25rem !important;
        line-height: 1.5 !important;
        text-shadow: 1px 1px 2px rgba(0,0,0,0.9);
        max-width: 80% !important;
        transition: opacity 0.3s ease;
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

      /* Make sure text isn't clipped */
      [class*="line-clamp"] {
        -webkit-line-clamp: 4 !important;
        line-clamp: 4 !important;
        display: -webkit-box !important;
        overflow: visible !important;
      }

      /* Layout Modes */
      
      /* Raised: Pushes text up */
      .text-layout-raised .snap-center h2.text-2xl,
      .text-layout-raised .snap-center p.text-sm,
      .text-layout-raised .snap-center .flex.flex-wrap {
         transform: translateY(-25vh);
         position: relative;
         z-index: 50;
      }

      /* Center: Centered in screen */
      .text-layout-center .snap-center h2.text-2xl {
         position: fixed;
         top: 50%;
         left: 50%;
         transform: translate(-50%, -50%);
         width: 100%;
         text-align: center;
         z-index: 100;
         font-size: 5rem !important;
      }
      .text-layout-center .snap-center p.text-sm,
      .text-layout-center .snap-center .flex.flex-wrap {
         display: none !important;
      }

      /* Player size CSS classes */
      .player-small iframe[src*="youtube"] { height: 40vh !important; max-height: 40vh !important; }
      .player-medium iframe[src*="youtube"] { height: 60vh !important; max-height: 60vh !important; }
      .player-large iframe[src*="youtube"] { height: 85vh !important; max-height: 85vh !important; }
      .player-full iframe[src*="youtube"] { height: 100vh !important; max-height: 100vh !important; }
    `;

        document.head.appendChild(style);
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
