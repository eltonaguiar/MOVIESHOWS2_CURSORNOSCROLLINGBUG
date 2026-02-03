/**
 * MovieShows Database Builder
 * Fetches movies and TV shows from TMDB API to build a comprehensive database
 * 
 * Usage: TMDB_API_KEY=your_key node build-database.js
 * Or: Create a .env file with TMDB_API_KEY=your_key
 */

const fs = require('fs');
const path = require('path');

// Load .env if exists
try {
    const envPath = path.join(__dirname, '.env');
    if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf-8');
        envContent.split('\n').forEach(line => {
            const [key, ...value] = line.split('=');
            if (key && value.length) {
                process.env[key.trim()] = value.join('=').trim();
            }
        });
    }
} catch (e) { /* ignore */ }

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';

if (!TMDB_API_KEY || TMDB_API_KEY === 'your_tmdb_api_key_here') {
    console.error('ERROR: Please set TMDB_API_KEY environment variable or create .env file');
    console.error('Get your API key at: https://www.themoviedb.org/settings/api');
    process.exit(1);
}

// Configuration
const CONFIG = {
    // Target minimums per category
    minMovies: 120,
    minTVShows: 100,
    minNowPlaying: 50,
    
    // Years to fetch (priority order)
    years: [2027, 2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015],
    
    // Pages to fetch per year
    pagesPerYear: 3,
    
    // Delay between requests (ms) to avoid rate limiting
    requestDelay: 250
};

// Genre cache
let movieGenres = {};
let tvGenres = {};

// Results storage
const allItems = [];
const seenTitles = new Set();

// Helper: delay
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// Helper: fetch with retry
async function fetchJSON(url, retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            return await response.json();
        } catch (e) {
            console.error(`  Fetch error (attempt ${i + 1}/${retries}): ${e.message}`);
            if (i < retries - 1) await delay(1000);
        }
    }
    return null;
}

// Fetch genres
async function fetchGenres() {
    console.log('Fetching genres...');
    
    const movieData = await fetchJSON(`${TMDB_BASE_URL}/genre/movie/list?api_key=${TMDB_API_KEY}&language=en-US`);
    if (movieData?.genres) {
        movieData.genres.forEach(g => movieGenres[g.id] = g.name);
    }
    
    const tvData = await fetchJSON(`${TMDB_BASE_URL}/genre/tv/list?api_key=${TMDB_API_KEY}&language=en-US`);
    if (tvData?.genres) {
        tvData.genres.forEach(g => tvGenres[g.id] = g.name);
    }
    
    console.log(`  Loaded ${Object.keys(movieGenres).length} movie genres, ${Object.keys(tvGenres).length} TV genres`);
}

// Fetch trailer for an item
async function fetchTrailer(id, type) {
    const data = await fetchJSON(`${TMDB_BASE_URL}/${type}/${id}/videos?api_key=${TMDB_API_KEY}&language=en-US`);
    if (data?.results) {
        // Prefer official trailers, then teasers, then any YouTube video
        const videos = data.results.filter(v => v.site === 'YouTube');
        const trailer = videos.find(v => v.type === 'Trailer' && v.official) ||
                       videos.find(v => v.type === 'Trailer') ||
                       videos.find(v => v.type === 'Teaser') ||
                       videos[0];
        if (trailer) {
            return `https://www.youtube.com/watch?v=${trailer.key}`;
        }
    }
    return null;
}

// Convert TMDB item to our format
async function convertItem(item, type, source = 'TMDB') {
    const title = item.title || item.name;
    
    // Skip if already seen
    if (seenTitles.has(title)) return null;
    
    const year = (item.release_date || item.first_air_date || '').split('-')[0];
    if (!year) return null;
    
    // Fetch trailer
    await delay(CONFIG.requestDelay);
    const trailerUrl = await fetchTrailer(item.id, type === 'movie' ? 'movie' : 'tv');
    
    // Skip if no trailer
    if (!trailerUrl) return null;
    
    seenTitles.add(title);
    
    const genres = type === 'movie' 
        ? (item.genre_ids || []).map(id => movieGenres[id]).filter(Boolean)
        : (item.genre_ids || []).map(id => tvGenres[id]).filter(Boolean);
    
    return {
        title,
        type,
        year,
        rating: item.vote_average?.toFixed(1) || '0.0',
        genres: genres.slice(0, 4),
        source,
        trailerUrl,
        posterUrl: item.poster_path ? `${TMDB_IMAGE_BASE}${item.poster_path}` : null,
        description: item.overview || '',
        nowPlaying: source === 'Now Playing' || source === 'In Theatres' ? ['Theatres'] : []
    };
}

// Fetch movies for a specific year
async function fetchMoviesForYear(year, pages = CONFIG.pagesPerYear) {
    console.log(`\nFetching movies for ${year}...`);
    const items = [];
    
    for (let page = 1; page <= pages; page++) {
        const url = `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&language=en-US&sort_by=popularity.desc&primary_release_year=${year}&page=${page}&vote_count.gte=10`;
        await delay(CONFIG.requestDelay);
        const data = await fetchJSON(url);
        
        if (data?.results) {
            for (const item of data.results) {
                const converted = await convertItem(item, 'movie', 'Popular');
                if (converted) {
                    items.push(converted);
                    process.stdout.write(`  Found: ${converted.title} (${converted.year})\r`);
                }
            }
        }
    }
    
    console.log(`  ${year}: Found ${items.length} movies with trailers`);
    return items;
}

// Fetch TV shows for a specific year
async function fetchTVForYear(year, pages = CONFIG.pagesPerYear) {
    console.log(`\nFetching TV shows for ${year}...`);
    const items = [];
    
    for (let page = 1; page <= pages; page++) {
        const url = `${TMDB_BASE_URL}/discover/tv?api_key=${TMDB_API_KEY}&language=en-US&sort_by=popularity.desc&first_air_date_year=${year}&page=${page}&vote_count.gte=10`;
        await delay(CONFIG.requestDelay);
        const data = await fetchJSON(url);
        
        if (data?.results) {
            for (const item of data.results) {
                const converted = await convertItem(item, 'tv', 'Popular');
                if (converted) {
                    items.push(converted);
                    process.stdout.write(`  Found: ${converted.title} (${converted.year})\r`);
                }
            }
        }
    }
    
    console.log(`  ${year}: Found ${items.length} TV shows with trailers`);
    return items;
}

// Fetch now playing movies
async function fetchNowPlaying(pages = 3) {
    console.log('\nFetching Now Playing movies...');
    const items = [];
    
    for (let page = 1; page <= pages; page++) {
        const url = `${TMDB_BASE_URL}/movie/now_playing?api_key=${TMDB_API_KEY}&language=en-US&page=${page}&region=US`;
        await delay(CONFIG.requestDelay);
        const data = await fetchJSON(url);
        
        if (data?.results) {
            for (const item of data.results) {
                const converted = await convertItem(item, 'movie', 'In Theatres');
                if (converted) {
                    converted.nowPlaying = ['Theatres'];
                    items.push(converted);
                    process.stdout.write(`  Found: ${converted.title}\r`);
                }
            }
        }
    }
    
    console.log(`  Now Playing: Found ${items.length} movies`);
    return items;
}

// Fetch upcoming movies
async function fetchUpcoming(pages = 3) {
    console.log('\nFetching Upcoming movies...');
    const items = [];
    
    for (let page = 1; page <= pages; page++) {
        const url = `${TMDB_BASE_URL}/movie/upcoming?api_key=${TMDB_API_KEY}&language=en-US&page=${page}&region=US`;
        await delay(CONFIG.requestDelay);
        const data = await fetchJSON(url);
        
        if (data?.results) {
            for (const item of data.results) {
                const converted = await convertItem(item, 'movie', 'Coming Soon');
                if (converted) {
                    items.push(converted);
                    process.stdout.write(`  Found: ${converted.title}\r`);
                }
            }
        }
    }
    
    console.log(`  Upcoming: Found ${items.length} movies`);
    return items;
}

// Fetch top-rated to fill gaps
async function fetchTopRated(type, pages = 5) {
    console.log(`\nFetching Top Rated ${type}...`);
    const items = [];
    
    for (let page = 1; page <= pages; page++) {
        const url = `${TMDB_BASE_URL}/${type}/top_rated?api_key=${TMDB_API_KEY}&language=en-US&page=${page}`;
        await delay(CONFIG.requestDelay);
        const data = await fetchJSON(url);
        
        if (data?.results) {
            for (const item of data.results) {
                const converted = await convertItem(item, type === 'movie' ? 'movie' : 'tv', 'Top Rated');
                if (converted) {
                    items.push(converted);
                    process.stdout.write(`  Found: ${converted.title}\r`);
                }
            }
        }
    }
    
    console.log(`  Top Rated ${type}: Found ${items.length} items`);
    return items;
}

// Main build function
async function buildDatabase() {
    console.log('='.repeat(60));
    console.log('MovieShows Database Builder');
    console.log('='.repeat(60));
    console.log(`Target: ${CONFIG.minMovies} movies, ${CONFIG.minTVShows} TV shows, ${CONFIG.minNowPlaying} now playing`);
    console.log(`Years: ${CONFIG.years.join(', ')}`);
    
    // Fetch genres first
    await fetchGenres();
    
    // 1. Fetch Now Playing (highest priority)
    const nowPlaying = await fetchNowPlaying(4);
    allItems.push(...nowPlaying);
    
    // 2. Fetch Upcoming
    const upcoming = await fetchUpcoming(4);
    allItems.push(...upcoming);
    
    // 3. Fetch by year (future first)
    for (const year of CONFIG.years) {
        // Check if we need more content
        const currentMovies = allItems.filter(i => i.type === 'movie').length;
        const currentTV = allItems.filter(i => i.type === 'tv').length;
        
        if (currentMovies < CONFIG.minMovies) {
            const movies = await fetchMoviesForYear(year);
            allItems.push(...movies);
        }
        
        if (currentTV < CONFIG.minTVShows) {
            const tvShows = await fetchTVForYear(year);
            allItems.push(...tvShows);
        }
        
        console.log(`  Running totals: ${allItems.filter(i => i.type === 'movie').length} movies, ${allItems.filter(i => i.type === 'tv').length} TV shows`);
    }
    
    // 4. Fill remaining with top-rated if needed
    const finalMovieCount = allItems.filter(i => i.type === 'movie').length;
    const finalTVCount = allItems.filter(i => i.type === 'tv').length;
    
    if (finalMovieCount < CONFIG.minMovies) {
        console.log(`\nNeed ${CONFIG.minMovies - finalMovieCount} more movies, fetching top-rated...`);
        const topMovies = await fetchTopRated('movie', 5);
        allItems.push(...topMovies);
    }
    
    if (finalTVCount < CONFIG.minTVShows) {
        console.log(`\nNeed ${CONFIG.minTVShows - finalTVCount} more TV shows, fetching top-rated...`);
        const topTV = await fetchTopRated('tv', 5);
        allItems.push(...topTV);
    }
    
    // Sort: Now Playing first, then by year (newest first), then by rating
    allItems.sort((a, b) => {
        // Now playing first
        const aNowPlaying = a.nowPlaying?.length > 0 || a.source === 'In Theatres' || a.source === 'Now Playing';
        const bNowPlaying = b.nowPlaying?.length > 0 || b.source === 'In Theatres' || b.source === 'Now Playing';
        if (aNowPlaying && !bNowPlaying) return -1;
        if (!aNowPlaying && bNowPlaying) return 1;
        
        // Then by year (newest first)
        const yearDiff = parseInt(b.year || '0') - parseInt(a.year || '0');
        if (yearDiff !== 0) return yearDiff;
        
        // Then by rating
        return parseFloat(b.rating || '0') - parseFloat(a.rating || '0');
    });
    
    // Build final stats
    const movies = allItems.filter(i => i.type === 'movie');
    const tvShows = allItems.filter(i => i.type === 'tv');
    const nowPlayingItems = allItems.filter(i => i.nowPlaying?.length > 0 || i.source === 'In Theatres' || i.source === 'Now Playing' || i.source === 'Coming Soon');
    
    // Build database object
    const database = {
        exported: new Date().toISOString(),
        totalItems: allItems.length,
        movies: movies.length,
        tvShows: tvShows.length,
        nowPlaying: nowPlayingItems.length,
        yearRange: {
            min: Math.min(...allItems.map(i => parseInt(i.year) || 9999)),
            max: Math.max(...allItems.map(i => parseInt(i.year) || 0))
        },
        items: allItems
    };
    
    // Write to file
    const outputPath = path.join(__dirname, 'movies-database.json');
    fs.writeFileSync(outputPath, JSON.stringify(database, null, 2));
    
    console.log('\n' + '='.repeat(60));
    console.log('BUILD COMPLETE');
    console.log('='.repeat(60));
    console.log(`Total items: ${allItems.length}`);
    console.log(`  Movies: ${movies.length}`);
    console.log(`  TV Shows: ${tvShows.length}`);
    console.log(`  Now Playing/Coming Soon: ${nowPlayingItems.length}`);
    console.log(`  Year range: ${database.yearRange.min} - ${database.yearRange.max}`);
    console.log(`\nSaved to: ${outputPath}`);
    
    // Year breakdown
    console.log('\nYear breakdown:');
    const yearCounts = {};
    allItems.forEach(i => {
        yearCounts[i.year] = (yearCounts[i.year] || 0) + 1;
    });
    Object.keys(yearCounts).sort((a, b) => b - a).forEach(year => {
        console.log(`  ${year}: ${yearCounts[year]} items`);
    });
}

// Run
buildDatabase().catch(console.error);
