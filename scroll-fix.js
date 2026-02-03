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
    
    // ========== NAVIGATION STATE ==========
    let currentFilter = 'all'; // all, movies, tv, nowplaying
    let searchPanel = null;
    let filterPanel = null;
    let queuePanel = null;
    let userQueue = JSON.parse(localStorage.getItem("movieshows-queue") || "[]");
    
    // ========== MUTE CONTROL ==========
    let isMuted = localStorage.getItem("movieshows-muted") !== "false"; // Default to muted for autoplay
    
    function createMuteControl() {
        if (document.getElementById("mute-control")) return;
        
        const btn = document.createElement("button");
        btn.id = "mute-control";
        btn.innerHTML = isMuted ? "🔇 Unmute" : "🔊 Muted";
        btn.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            z-index: 10000;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            border: 2px solid #22c55e;
            padding: 12px 20px;
            border-radius: 25px;
            cursor: pointer;
            font-size: 14px;
            font-weight: bold;
            backdrop-filter: blur(10px);
            transition: all 0.2s;
            box-shadow: 0 4px 12px rgba(0,0,0,0.5);
        `;
        
        btn.addEventListener("mouseenter", () => {
            btn.style.background = "rgba(34, 197, 94, 0.9)";
            btn.style.transform = "scale(1.05)";
        });
        btn.addEventListener("mouseleave", () => {
            btn.style.background = "rgba(0, 0, 0, 0.8)";
            btn.style.transform = "scale(1)";
        });
        
        btn.addEventListener("click", () => {
            isMuted = !isMuted;
            localStorage.setItem("movieshows-muted", isMuted ? "true" : "false");
            btn.innerHTML = isMuted ? "🔇 Unmute" : "🔊 Muted";
            applyMuteStateToAllVideos();
            console.log(`[MovieShows] Sound ${isMuted ? 'muted' : 'unmuted'}`);
        });
        
        document.body.appendChild(btn);
        console.log("[MovieShows] Mute control created");
    }
    
    function applyMuteStateToAllVideos() {
        // Update all iframe src URLs to reflect mute state
        const iframes = document.querySelectorAll('iframe[src*="youtube"]');
        iframes.forEach(iframe => {
            const currentSrc = iframe.src;
            if (currentSrc) {
                // Replace mute parameter
                let newSrc;
                if (currentSrc.includes('mute=')) {
                    newSrc = currentSrc.replace(/mute=\d/, `mute=${isMuted ? 1 : 0}`);
                } else {
                    newSrc = currentSrc + `&mute=${isMuted ? 1 : 0}`;
                }
                
                // Only update if changed (to avoid reload flicker)
                if (newSrc !== currentSrc) {
                    iframe.src = newSrc;
                }
            }
        });
    }
    
    function getMuteParam() {
        return isMuted ? 1 : 0;
    }

    // ========== NAVIGATION PANELS ==========
    
    function createPanelBase(id, title) {
        const panel = document.createElement("div");
        panel.id = id;
        panel.style.cssText = `
            position: fixed;
            top: 0;
            right: -400px;
            width: 380px;
            max-width: 90vw;
            height: 100vh;
            background: rgba(15, 15, 20, 0.98);
            backdrop-filter: blur(20px);
            z-index: 10001;
            transition: right 0.3s ease;
            overflow-y: auto;
            border-left: 1px solid rgba(255,255,255,0.1);
            box-shadow: -10px 0 30px rgba(0,0,0,0.5);
        `;
        
        const header = document.createElement("div");
        header.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px;
            border-bottom: 1px solid rgba(255,255,255,0.1);
            position: sticky;
            top: 0;
            background: rgba(15, 15, 20, 0.98);
            z-index: 10;
        `;
        
        const titleEl = document.createElement("h2");
        titleEl.textContent = title;
        titleEl.style.cssText = "color: white; font-size: 20px; font-weight: bold; margin: 0;";
        
        const closeBtn = document.createElement("button");
        closeBtn.innerHTML = "✕";
        closeBtn.style.cssText = `
            background: rgba(255,255,255,0.1);
            border: none;
            color: white;
            width: 36px;
            height: 36px;
            border-radius: 50%;
            cursor: pointer;
            font-size: 18px;
            transition: all 0.2s;
        `;
        closeBtn.addEventListener("mouseenter", () => closeBtn.style.background = "rgba(255,255,255,0.2)");
        closeBtn.addEventListener("mouseleave", () => closeBtn.style.background = "rgba(255,255,255,0.1)");
        closeBtn.addEventListener("click", () => closePanel(panel));
        
        header.appendChild(titleEl);
        header.appendChild(closeBtn);
        panel.appendChild(header);
        
        const content = document.createElement("div");
        content.className = "panel-content";
        content.style.cssText = "padding: 20px;";
        panel.appendChild(content);
        
        document.body.appendChild(panel);
        return panel;
    }
    
    function openPanel(panel) {
        // Close any other open panels
        [searchPanel, filterPanel, queuePanel].forEach(p => {
            if (p && p !== panel) closePanel(p);
        });
        panel.style.right = "0";
    }
    
    function closePanel(panel) {
        if (panel) panel.style.right = "-400px";
    }
    
    function createSearchPanel() {
        if (searchPanel) return searchPanel;
        
        searchPanel = createPanelBase("search-panel", "Search & Browse");
        const content = searchPanel.querySelector(".panel-content");
        
        // Search input
        const searchBox = document.createElement("div");
        searchBox.style.cssText = "margin-bottom: 20px;";
        searchBox.innerHTML = `
            <div style="position: relative;">
                <input type="text" id="movie-search-input" placeholder="Search movies & shows..." 
                    style="width: 100%; padding: 14px 14px 14px 45px; background: rgba(255,255,255,0.1); 
                    border: 1px solid rgba(255,255,255,0.2); border-radius: 12px; color: white; 
                    font-size: 16px; outline: none; transition: all 0.2s;">
                <svg style="position: absolute; left: 14px; top: 50%; transform: translateY(-50%); width: 20px; height: 20px; color: #888;" 
                    xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
            </div>
        `;
        content.appendChild(searchBox);
        
        // Results container
        const results = document.createElement("div");
        results.id = "search-results";
        results.style.cssText = "display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;";
        content.appendChild(results);
        
        // Search functionality
        const input = searchBox.querySelector("#movie-search-input");
        input.addEventListener("focus", () => {
            input.style.borderColor = "#22c55e";
            input.style.background = "rgba(255,255,255,0.15)";
        });
        input.addEventListener("blur", () => {
            input.style.borderColor = "rgba(255,255,255,0.2)";
            input.style.background = "rgba(255,255,255,0.1)";
        });
        
        let searchTimeout;
        input.addEventListener("input", (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => performSearch(e.target.value), 300);
        });
        
        // Show initial results
        setTimeout(() => performSearch(""), 100);
        
        return searchPanel;
    }
    
    function performSearch(query) {
        const results = document.getElementById("search-results");
        if (!results) return;
        
        let filtered = allMoviesData;
        
        if (query.trim()) {
            const q = query.toLowerCase();
            filtered = allMoviesData.filter(m => 
                m.title?.toLowerCase().includes(q) ||
                m.description?.toLowerCase().includes(q) ||
                m.genres?.some(g => g.toLowerCase().includes(q))
            );
        }
        
        // Apply category filter
        if (currentFilter === 'movies') {
            filtered = filtered.filter(m => !m.type || m.type === 'movie');
        } else if (currentFilter === 'tv') {
            filtered = filtered.filter(m => m.type === 'tv' || m.type === 'series');
        } else if (currentFilter === 'nowplaying') {
            filtered = filtered.filter(m => m.source === 'Now Playing' || m.source === 'In Theatres');
        }
        
        // Limit results
        filtered = filtered.slice(0, 30);
        
        results.innerHTML = filtered.length === 0 
            ? '<p style="color: #888; text-align: center; grid-column: span 2;">No results found</p>'
            : filtered.map(m => createMovieCard(m)).join("");
        
        // Add click handlers
        results.querySelectorAll(".movie-card").forEach(card => {
            card.addEventListener("click", () => {
                const title = card.dataset.title;
                const movie = allMoviesData.find(m => m.title === title);
                if (movie) {
                    closePanel(searchPanel);
                    showToast(`Playing: ${movie.title}`);
                    addMovieToFeed(movie, true, true);
                }
            });
        });
    }
    
    function createMovieCard(movie) {
        const posterUrl = movie.posterUrl || movie.image || `https://via.placeholder.com/150x225/1a1a2e/ffffff?text=${encodeURIComponent(movie.title?.substring(0,10) || 'Movie')}`;
        return `
            <div class="movie-card" data-title="${movie.title || ''}" style="
                cursor: pointer;
                border-radius: 12px;
                overflow: hidden;
                background: rgba(255,255,255,0.05);
                transition: all 0.2s;
                border: 1px solid rgba(255,255,255,0.1);
            " onmouseenter="this.style.transform='scale(1.03)';this.style.borderColor='#22c55e'" 
               onmouseleave="this.style.transform='scale(1)';this.style.borderColor='rgba(255,255,255,0.1)'">
                <img src="${posterUrl}" alt="${movie.title}" style="width: 100%; aspect-ratio: 2/3; object-fit: cover;" 
                    onerror="this.src='https://via.placeholder.com/150x225/1a1a2e/ffffff?text=No+Image'">
                <div style="padding: 10px;">
                    <h4 style="color: white; font-size: 13px; font-weight: 600; margin: 0 0 4px 0; 
                        white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${movie.title || 'Unknown'}</h4>
                    <p style="color: #888; font-size: 11px; margin: 0;">${movie.year || ''} ${movie.rating ? '• ⭐ ' + movie.rating : ''}</p>
                </div>
            </div>
        `;
    }
    
    function createFilterPanel() {
        if (filterPanel) return filterPanel;
        
        filterPanel = createPanelBase("filter-panel", "Filters");
        const content = filterPanel.querySelector(".panel-content");
        
        content.innerHTML = `
            <div style="margin-bottom: 24px;">
                <h3 style="color: #888; font-size: 12px; text-transform: uppercase; margin-bottom: 12px;">Content Type</h3>
                <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                    <button class="filter-btn active" data-filter="all">All</button>
                    <button class="filter-btn" data-filter="movies">Movies</button>
                    <button class="filter-btn" data-filter="tv">TV Shows</button>
                    <button class="filter-btn" data-filter="nowplaying">Now Playing</button>
                </div>
            </div>
            <div style="margin-bottom: 24px;">
                <h3 style="color: #888; font-size: 12px; text-transform: uppercase; margin-bottom: 12px;">Genres</h3>
                <div id="genre-filters" style="display: flex; flex-wrap: wrap; gap: 8px;"></div>
            </div>
            <div style="margin-bottom: 24px;">
                <h3 style="color: #888; font-size: 12px; text-transform: uppercase; margin-bottom: 12px;">Year</h3>
                <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                    <button class="filter-btn" data-year="2026">2026</button>
                    <button class="filter-btn" data-year="2025">2025</button>
                    <button class="filter-btn" data-year="2024">2024</button>
                    <button class="filter-btn" data-year="older">Older</button>
                </div>
            </div>
            <button id="apply-filters" style="
                width: 100%; padding: 14px; background: #22c55e; color: black; font-weight: bold;
                border: none; border-radius: 12px; cursor: pointer; font-size: 16px; margin-top: 20px;
                transition: all 0.2s;
            ">Apply Filters</button>
        `;
        
        // Style filter buttons
        const style = document.createElement("style");
        style.textContent = `
            .filter-btn {
                padding: 8px 16px;
                background: rgba(255,255,255,0.1);
                border: 1px solid rgba(255,255,255,0.2);
                color: #ccc;
                border-radius: 20px;
                cursor: pointer;
                font-size: 13px;
                transition: all 0.2s;
            }
            .filter-btn:hover {
                background: rgba(255,255,255,0.2);
                color: white;
            }
            .filter-btn.active {
                background: #22c55e;
                border-color: #22c55e;
                color: black;
            }
        `;
        document.head.appendChild(style);
        
        // Populate genres
        const genreContainer = content.querySelector("#genre-filters");
        const genres = [...new Set(allMoviesData.flatMap(m => m.genres || []))].sort();
        genreContainer.innerHTML = genres.slice(0, 15).map(g => 
            `<button class="filter-btn" data-genre="${g}">${g}</button>`
        ).join("");
        
        // Add click handlers
        content.querySelectorAll(".filter-btn[data-filter]").forEach(btn => {
            btn.addEventListener("click", () => {
                content.querySelectorAll(".filter-btn[data-filter]").forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                currentFilter = btn.dataset.filter;
                updateCategoryButtons();
            });
        });
        
        content.querySelectorAll(".filter-btn[data-genre]").forEach(btn => {
            btn.addEventListener("click", () => btn.classList.toggle("active"));
        });
        
        content.querySelectorAll(".filter-btn[data-year]").forEach(btn => {
            btn.addEventListener("click", () => {
                content.querySelectorAll(".filter-btn[data-year]").forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
            });
        });
        
        content.querySelector("#apply-filters").addEventListener("click", () => {
            closePanel(filterPanel);
            showToast("Filters applied!");
            // Refresh search if open
            if (searchPanel && searchPanel.style.right === "0px") {
                const input = document.getElementById("movie-search-input");
                if (input) performSearch(input.value);
            }
        });
        
        return filterPanel;
    }
    
    function createQueuePanel() {
        if (queuePanel) return queuePanel;
        
        queuePanel = createPanelBase("queue-panel", "My Queue");
        updateQueuePanel();
        return queuePanel;
    }
    
    function updateQueuePanel() {
        if (!queuePanel) return;
        const content = queuePanel.querySelector(".panel-content");
        
        if (userQueue.length === 0) {
            content.innerHTML = `
                <div style="text-align: center; padding: 40px 20px;">
                    <svg style="width: 64px; height: 64px; color: #444; margin-bottom: 16px;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
                    </svg>
                    <h3 style="color: white; font-size: 18px; margin-bottom: 8px;">Your queue is empty</h3>
                    <p style="color: #888; font-size: 14px;">Save movies and shows to watch later by clicking the "List" button.</p>
                </div>
            `;
            return;
        }
        
        content.innerHTML = `
            <div style="margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center;">
                <span style="color: #888; font-size: 14px;">${userQueue.length} item${userQueue.length > 1 ? 's' : ''}</span>
                <button id="clear-queue" style="color: #ef4444; background: none; border: none; cursor: pointer; font-size: 13px;">Clear All</button>
            </div>
            <div id="queue-items" style="display: flex; flex-direction: column; gap: 12px;"></div>
        `;
        
        const itemsContainer = content.querySelector("#queue-items");
        itemsContainer.innerHTML = userQueue.map((item, index) => `
            <div class="queue-item" data-index="${index}" style="
                display: flex; gap: 12px; padding: 12px; background: rgba(255,255,255,0.05);
                border-radius: 12px; cursor: pointer; transition: all 0.2s;
                border: 1px solid rgba(255,255,255,0.1);
            ">
                <img src="${item.posterUrl || 'https://via.placeholder.com/60x90/1a1a2e/ffffff?text=?'}" 
                    style="width: 60px; height: 90px; object-fit: cover; border-radius: 8px;">
                <div style="flex: 1; min-width: 0;">
                    <h4 style="color: white; font-size: 14px; margin: 0 0 4px 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${item.title}</h4>
                    <p style="color: #888; font-size: 12px; margin: 0;">${item.year || ''}</p>
                    <button class="play-queue-item" style="margin-top: 8px; padding: 6px 12px; background: #22c55e; color: black; 
                        border: none; border-radius: 6px; font-size: 12px; font-weight: bold; cursor: pointer;">▶ Play</button>
                    <button class="remove-queue-item" style="margin-top: 8px; margin-left: 8px; padding: 6px 12px; background: rgba(255,255,255,0.1); 
                        color: white; border: none; border-radius: 6px; font-size: 12px; cursor: pointer;">Remove</button>
                </div>
            </div>
        `).join("");
        
        // Add handlers
        content.querySelector("#clear-queue")?.addEventListener("click", () => {
            userQueue = [];
            saveQueue();
            updateQueuePanel();
            showToast("Queue cleared");
        });
        
        itemsContainer.querySelectorAll(".play-queue-item").forEach(btn => {
            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                const index = parseInt(btn.closest(".queue-item").dataset.index);
                const item = userQueue[index];
                if (item) {
                    const movie = allMoviesData.find(m => m.title === item.title) || item;
                    closePanel(queuePanel);
                    showToast(`Playing: ${movie.title}`);
                    addMovieToFeed(movie, true, true);
                }
            });
        });
        
        itemsContainer.querySelectorAll(".remove-queue-item").forEach(btn => {
            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                const index = parseInt(btn.closest(".queue-item").dataset.index);
                userQueue.splice(index, 1);
                saveQueue();
                updateQueuePanel();
                showToast("Removed from queue");
            });
        });
    }
    
    function addToQueue(movie) {
        if (!movie?.title) return;
        if (userQueue.some(q => q.title === movie.title)) {
            showToast("Already in queue", true);
            return;
        }
        userQueue.push({
            title: movie.title,
            posterUrl: movie.posterUrl || movie.image,
            year: movie.year,
            trailerUrl: movie.trailerUrl
        });
        saveQueue();
        updateQueuePanel();
        showToast(`Added "${movie.title}" to queue`);
    }
    
    function saveQueue() {
        localStorage.setItem("movieshows-queue", JSON.stringify(userQueue));
    }
    
    function setupNavigationHandlers() {
        // Use event delegation on document body for navigation buttons
        document.body.addEventListener("click", (e) => {
            const btn = e.target.closest("button");
            if (!btn) return;
            
            const btnText = btn.textContent?.trim().toLowerCase() || "";
            const btnName = btn.getAttribute("aria-label")?.toLowerCase() || btn.getAttribute("name")?.toLowerCase() || "";
            
            // Search & Browse button
            if (btnText.includes("search") || btnName.includes("search")) {
                e.preventDefault();
                e.stopPropagation();
                const panel = createSearchPanel();
                openPanel(panel);
                setTimeout(() => document.getElementById("movie-search-input")?.focus(), 100);
                return;
            }
            
            // Filters button
            if (btnText === "filters" || btnName.includes("filter")) {
                e.preventDefault();
                e.stopPropagation();
                const panel = createFilterPanel();
                openPanel(panel);
                return;
            }
            
            // My Queue button
            if (btnText.includes("queue") && !btnText.includes("play")) {
                e.preventDefault();
                e.stopPropagation();
                const panel = createQueuePanel();
                openPanel(panel);
                return;
            }
            
            // Category buttons
            if (btnText.includes("all (")) {
                e.preventDefault();
                e.stopPropagation();
                currentFilter = 'all';
                updateCategoryButtons();
                showToast("Showing all content");
                return;
            }
            if (btnText.includes("movies (")) {
                e.preventDefault();
                e.stopPropagation();
                currentFilter = 'movies';
                updateCategoryButtons();
                showToast("Showing movies only");
                return;
            }
            if (btnText.includes("tv (")) {
                e.preventDefault();
                e.stopPropagation();
                currentFilter = 'tv';
                updateCategoryButtons();
                showToast("Showing TV shows only");
                return;
            }
            if (btnText.includes("now playing")) {
                e.preventDefault();
                e.stopPropagation();
                currentFilter = 'nowplaying';
                updateCategoryButtons();
                showToast("Showing now playing");
                return;
            }
            
            // List button (add to queue) - find current movie
            if (btnText === "list" || btnText === "save") {
                e.preventDefault();
                e.stopPropagation();
                const slide = btn.closest(".snap-center") || videoSlides[currentIndex];
                if (slide) {
                    const title = slide.querySelector("h2")?.textContent;
                    if (title) {
                        const movie = allMoviesData.find(m => m.title === title);
                        if (movie) addToQueue(movie);
                    }
                }
                return;
            }
        }, true);
        
        // Handle Escape key to close panels
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") {
                [searchPanel, filterPanel, queuePanel].forEach(p => {
                    if (p) closePanel(p);
                });
            }
        });
        
        console.log("[MovieShows] Navigation handlers set up");
    }
    
    function updateCategoryButtons() {
        // Update the visual state of category buttons in the original UI
        const buttons = document.querySelectorAll("button");
        buttons.forEach(btn => {
            const text = btn.textContent?.toLowerCase() || "";
            const isActive = 
                (currentFilter === 'all' && text.includes("all (")) ||
                (currentFilter === 'movies' && text.includes("movies (")) ||
                (currentFilter === 'tv' && text.includes("tv (")) ||
                (currentFilter === 'nowplaying' && text.includes("now playing"));
            
            if (text.includes("all (") || text.includes("movies (") || text.includes("tv (") || text.includes("now playing")) {
                if (isActive) {
                    btn.style.background = "#22c55e";
                    btn.style.color = "black";
                } else {
                    btn.style.background = "";
                    btn.style.color = "";
                }
            }
        });
    }

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

    function getYouTubeEmbedUrl(url, forceInitialMute = true) {
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
            // For initial load, always mute=1 for autoplay compliance
            // After user interaction (unmute button), we can use mute=0
            const muteValue = forceInitialMute ? 1 : getMuteParam();
            return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=${muteValue}&controls=1&playsinline=1&loop=1&playlist=${videoId}&modestbranding=1&rel=0&enablejsapi=1`;
        }
        return url;
    }

    function createSlide(movie, loadImmediately = false) {
        const slide = document.createElement("div");
        slide.className = "h-full w-full snap-center";

        const embedUrl = getYouTubeEmbedUrl(movie.trailerUrl);
        const genresHtml = (movie.genres || []).map(g =>
            `<span class="text-xs bg-white/10 backdrop-blur-sm px-2 py-1 rounded-full text-gray-100 border border-white/10">${g}</span>`
        ).join("");

        const rating = movie.rating ? `IMDb ${movie.rating}` : "TBD";
        const year = movie.year || "2026";

        // If loadImmediately is true, set src directly; otherwise use lazy loading
        const iframeSrc = loadImmediately ? embedUrl : "";
        
        slide.innerHTML = `
            <div class="relative w-full h-full flex items-center justify-center overflow-hidden snap-center bg-transparent">
                <div class="absolute inset-0 w-full h-full bg-black">
                     <iframe 
                        data-src="${embedUrl}" 
                        src="${iframeSrc}" 
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
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-heart w-8 h-8 text-white"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path></svg>
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

    function addMovieToFeed(movie, scrollAfter = false, loadImmediately = false) {
        if (!scrollContainer) {
            console.error("[MovieShows] addMovieToFeed failed: No scrollContainer.");
            scrollContainer = findScrollContainer(); // Try again
            if (!scrollContainer) return;
        }

        console.log(`[MovieShows] Adding movie to feed: ${movie.title} (Scroll: ${scrollAfter}, LoadNow: ${loadImmediately})`);

        // Prevent strictly adjacent duplicates, but allow repeats eventually
        const lastSlide = videoSlides[videoSlides.length - 1];
        if (lastSlide) {
            const h2 = lastSlide.querySelector('h2');
            // Allow re-adding if forced (e.g. from carousel click)
            if (!scrollAfter && h2 && h2.textContent === movie.title) {
                console.log("[MovieShows] Skipped adding duplicate (adjacent)");
                return;
            }
        }

        const slide = createSlide(movie, loadImmediately);
        scrollContainer.appendChild(slide);

        // Refresh videoSlides list
        videoSlides = findVideoSlides();

        updateUpNextCount();

        if (scrollAfter) {
            // Force scroll
            setTimeout(() => {
                console.log(`[MovieShows] Scattering to index ${videoSlides.length - 1}`);
                scrollToSlide(videoSlides.length - 1);

                // Force player size application on new slide
                const size = localStorage.getItem("movieshows-player-size") || "large";
                applyPlayerSize(size);

                // FORCE PLAY: bypass observer delay
                const iframe = slide.querySelector('iframe');
                if (iframe && iframe.dataset.src) {
                    console.log("[MovieShows] Force playing video...");
                    iframe.src = iframe.dataset.src;
                }
            }, 100);
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
        
        // Force play video after scroll completes
        setTimeout(() => {
            forcePlayVisibleVideos();
        }, 500);
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
                    let dataSrc = iframe.getAttribute('data-src');
                    if (dataSrc && !iframe.getAttribute('src')) {
                        // Apply current mute state to the URL
                        if (dataSrc.includes('mute=')) {
                            dataSrc = dataSrc.replace(/mute=\d/, `mute=${getMuteParam()}`);
                        }
                        console.log(`[MovieShows] Playing video (muted=${isMuted}): ${dataSrc}`);
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

    function clearPlaceholderSlides() {
        if (!scrollContainer) return;
        
        // Find slides that don't have real video content (no data-src on iframe)
        const slides = scrollContainer.querySelectorAll('[class*="snap-center"]');
        let removed = 0;
        
        slides.forEach(slide => {
            const iframe = slide.querySelector('iframe[data-src]');
            // If no iframe with data-src, it's a placeholder - remove it
            if (!iframe) {
                slide.remove();
                removed++;
            }
        });
        
        if (removed > 0) {
            console.log(`[MovieShows] Cleared ${removed} placeholder slides`);
        }
    }

    function populateInitialVideos() {
        if (allMoviesData.length === 0) {
            console.log("[MovieShows] Waiting for movie data...");
            setTimeout(populateInitialVideos, 500);
            return;
        }

        // Clear any placeholder slides first
        clearPlaceholderSlides();
        
        // Reset videoSlides after clearing
        videoSlides = [];

        // Check if we already have video slides with real content
        const existingSlides = scrollContainer?.querySelectorAll('iframe[data-src]') || [];
        if (existingSlides.length > 0) {
            console.log(`[MovieShows] Already have ${existingSlides.length} video slides`);
            videoSlides = findVideoSlides();
            return;
        }

        console.log("[MovieShows] Populating initial videos from database...");

        // CRITICAL: Only use movies that have a valid trailerUrl
        const moviesWithTrailers = allMoviesData.filter(m => m.trailerUrl && m.trailerUrl.length > 10);
        console.log(`[MovieShows] Found ${moviesWithTrailers.length} movies with valid trailer URLs`);

        if (moviesWithTrailers.length === 0) {
            console.error("[MovieShows] No movies with trailer URLs found!");
            return;
        }

        // Find Dune: Part Two first (specifically "Dune", not just "part two")
        const duneMovie = moviesWithTrailers.find(m => 
            m.title?.toLowerCase().includes('dune')
        );
        
        // Build initial list: Dune first if found, then others
        let initialMovies = [];
        if (duneMovie) {
            console.log(`[MovieShows] Found Dune movie: ${duneMovie.title}`);
            initialMovies.push(duneMovie);
            // Add 9 more random movies (excluding Dune)
            const others = moviesWithTrailers.filter(m => m.title !== duneMovie.title).slice(0, 9);
            initialMovies = initialMovies.concat(others);
        } else {
            // Fallback: just use first 10 with trailers
            initialMovies = moviesWithTrailers.slice(0, 10);
        }

        // Add movies to feed - load first one immediately, others lazy
        initialMovies.forEach((movie, index) => {
            console.log(`[MovieShows] Adding: ${movie.title} (trailer: ${movie.trailerUrl ? 'YES' : 'NO'})`);
            addMovieToFeed(movie, false, index === 0); // loadImmediately for first one
        });

        // Refresh slide list AFTER adding all movies
        videoSlides = findVideoSlides();
        console.log(`[MovieShows] Added ${initialMovies.length} initial videos`);

        // Scroll to first slide and FORCE play video
        if (videoSlides.length > 0) {
            setTimeout(() => {
                scrollToSlide(0);
                // Force all visible iframes to load
                forcePlayVisibleVideos();
            }, 300);
        }
    }
    
    function forcePlayVisibleVideos() {
        // Find all iframes and set their src if empty
        const allIframes = document.querySelectorAll('iframe[data-src]');
        console.log(`[MovieShows] forcePlayVisibleVideos - Found ${allIframes.length} iframes`);
        
        allIframes.forEach((iframe, index) => {
            const src = iframe.getAttribute('src');
            const dataSrc = iframe.dataset.src;
            
            console.log(`[MovieShows] Iframe ${index}: src="${src || 'empty'}", data-src="${dataSrc || 'none'}"`);
            
            // Check if iframe is in viewport
            const rect = iframe.getBoundingClientRect();
            const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
            
            // Force load if: in viewport AND (no src OR src is empty) AND has data-src
            if (isVisible && (!src || src === '') && dataSrc) {
                console.log(`[MovieShows] Loading visible iframe ${index}:`, dataSrc);
                iframe.src = dataSrc;
            }
        });
        
        // ALWAYS force-load the first iframe regardless of visibility
        const firstIframe = document.querySelector('iframe[data-src]');
        if (firstIframe) {
            const src = firstIframe.getAttribute('src');
            const dataSrc = firstIframe.dataset.src;
            console.log(`[MovieShows] First iframe check: src="${src || 'empty'}", data-src="${dataSrc || 'none'}"`);
            
            if (dataSrc && dataSrc.includes('youtube')) {
                // Always ensure first iframe has src set
                if (!src || src === '' || src !== dataSrc) {
                    console.log("[MovieShows] FORCE setting first iframe src:", dataSrc);
                    firstIframe.src = dataSrc;
                } else {
                    console.log("[MovieShows] First iframe already has correct src");
                }
            }
        } else {
            console.log("[MovieShows] WARNING: No iframes found with data-src!");
        }
    }

    function init() {
        if (initialized) return;

        console.log("[MovieShows] Initializing...");

        injectStyles();
        setupVideoObserver();
        setupIframeObserver();
        createPlayerSizeControl();
        createLayoutControl();
        createMuteControl();  // Add persistent mute/unmute button
        setupCarouselInteractions();
        setupNavigationHandlers();  // Enable search, filters, queue panels

        // START LOADING DATA
        loadMoviesData();

        scrollContainer = findScrollContainer();
        if (!scrollContainer) {
            setTimeout(init, 1000);
            return;
        }

        // Clear placeholders and populate with real videos
        setTimeout(populateInitialVideos, 1000);

        videoSlides = findVideoSlides();
        // Don't require existing slides - we'll add them
        if (videoSlides.length === 0) {
            console.log("[MovieShows] No slides yet, will populate after data loads");
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
