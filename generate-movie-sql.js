/**
 * Generate SQL to populate the movies database
 * - Adds new columns if needed
 * - Inserts movies without duplicating existing ones
 */

const fs = require('fs');
const path = require('path');

// Load movies database
const moviesData = require('./movies-database.json');
const movies = moviesData.items || [];

console.log(`Processing ${movies.length} movies...`);

// SQL output
let sql = `-- MovieShows Database Population Script
-- Generated: ${new Date().toISOString()}
-- Total movies: ${movies.length}
-- WARNING: This script ADDS data, does NOT delete anything

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";
SET NAMES utf8mb4;

-- ============================================
-- STEP 1: Add new columns if they don't exist
-- ============================================

-- Add poster_url column
SET @exist := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'movies' AND COLUMN_NAME = 'poster_url');
SET @sqlstmt := IF(@exist = 0, 
    'ALTER TABLE movies ADD COLUMN poster_url VARCHAR(500) DEFAULT NULL AFTER imdb_rating',
    'SELECT "poster_url column already exists"');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add trailer_url column
SET @exist := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'movies' AND COLUMN_NAME = 'trailer_url');
SET @sqlstmt := IF(@exist = 0, 
    'ALTER TABLE movies ADD COLUMN trailer_url VARCHAR(500) DEFAULT NULL AFTER poster_url',
    'SELECT "trailer_url column already exists"');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add source column
SET @exist := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'movies' AND COLUMN_NAME = 'source');
SET @sqlstmt := IF(@exist = 0, 
    'ALTER TABLE movies ADD COLUMN source VARCHAR(100) DEFAULT NULL AFTER trailer_url',
    'SELECT "source column already exists"');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add index on trailer_url for duplicate checking
-- Using a prefix index since trailer_url can be long
SET @exist := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'movies' AND INDEX_NAME = 'idx_trailer_url');
SET @sqlstmt := IF(@exist = 0, 
    'ALTER TABLE movies ADD INDEX idx_trailer_url (trailer_url(255))',
    'SELECT "idx_trailer_url index already exists"');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add unique constraint on title + trailer_url to prevent exact duplicates
-- (A movie CAN have multiple trailer URLs, but not the same URL twice)

-- ============================================
-- STEP 2: Insert movies (skip if trailer_url already exists)
-- ============================================

`;

// Helper function to escape SQL strings
function escapeSql(str) {
    if (str === null || str === undefined) return 'NULL';
    return "'" + String(str).replace(/'/g, "''").replace(/\\/g, '\\\\') + "'";
}

// Process each movie
let insertCount = 0;
movies.forEach((movie, idx) => {
    // Skip movies without trailer URLs
    if (!movie.trailerUrl) return;
    
    const title = movie.title || 'Unknown';
    const type = movie.type === 'tv' ? 'tv' : 'movie';
    const genre = Array.isArray(movie.genres) ? movie.genres.join(', ') : (movie.genre || null);
    const description = movie.description || null;
    const releaseYear = movie.year ? parseInt(movie.year) || null : null;
    const imdbRating = movie.rating && movie.rating !== 'TBD' ? parseFloat(movie.rating) || null : null;
    const posterUrl = movie.posterUrl || null;
    const trailerUrl = movie.trailerUrl;
    const source = movie.source || null;
    
    // Use INSERT IGNORE or check for existing trailer_url
    sql += `-- Movie ${idx + 1}: ${title}
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT ${escapeSql(title)}, '${type}', ${escapeSql(genre)}, ${escapeSql(description)}, 
       ${releaseYear || 'NULL'}, ${imdbRating || 'NULL'}, ${escapeSql(posterUrl)}, 
       ${escapeSql(trailerUrl)}, ${escapeSql(source)}
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = ${escapeSql(trailerUrl)}
);

`;
    insertCount++;
});

sql += `
-- ============================================
-- Summary
-- ============================================
-- Total INSERT statements: ${insertCount}
-- Each INSERT checks if trailer_url already exists to prevent duplicates
-- Movies CAN have multiple different trailer URLs (distinct URLs are allowed)

SELECT CONCAT('Total movies in database: ', COUNT(*)) AS summary FROM movies;
`;

// Write to file
const outputPath = path.join(__dirname, 'populate-movies-database.sql');
fs.writeFileSync(outputPath, sql, 'utf8');

console.log(`\nSQL file generated: ${outputPath}`);
console.log(`Total INSERT statements: ${insertCount}`);
console.log('\nNext steps:');
console.log('1. Review the SQL file');
console.log('2. Run it in phpMyAdmin or via MySQL CLI');
