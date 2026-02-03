-- MovieShows Database Schema Additions
-- Run this AFTER the base schema (moviesdb_feb32026_538pm.sql)
-- These additions extend the database without modifying existing tables

USE `ejaguiar1_tvmoviestrailers`;

-- --------------------------------------------------------
-- Table: watch_history - Track what users have watched
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `watch_history` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `movie_id` int NOT NULL,
  `watched_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `watch_duration` int DEFAULT NULL COMMENT 'Seconds watched',
  `completed` tinyint(1) DEFAULT '0',
  `source` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'movieshows2_cursor',
  PRIMARY KEY (`id`),
  KEY `idx_user_watched` (`user_id`, `watched_at` DESC),
  KEY `idx_movie_id` (`movie_id`),
  CONSTRAINT `watch_history_movie_fk` FOREIGN KEY (`movie_id`) REFERENCES `movies` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: user_ratings - Store user ratings for movies
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `user_ratings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `movie_id` int NOT NULL,
  `rating` tinyint NOT NULL COMMENT '1-5 stars',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_rating` (`user_id`, `movie_id`),
  KEY `idx_movie_rating` (`movie_id`, `rating`),
  CONSTRAINT `user_ratings_movie_fk` FOREIGN KEY (`movie_id`) REFERENCES `movies` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: user_favorites - Store user favorites
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `user_favorites` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `movie_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_favorite` (`user_id`, `movie_id`),
  KEY `idx_movie_id` (`movie_id`),
  CONSTRAINT `user_favorites_movie_fk` FOREIGN KEY (`movie_id`) REFERENCES `movies` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: user_bookmarks - Store scene bookmarks
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `user_bookmarks` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `movie_id` int NOT NULL,
  `timestamp_seconds` int NOT NULL DEFAULT '0',
  `note` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_movie` (`user_id`, `movie_id`),
  CONSTRAINT `user_bookmarks_movie_fk` FOREIGN KEY (`movie_id`) REFERENCES `movies` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: watch_party_sessions - Watch party management
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `watch_party_sessions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `party_code` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `host_user_id` int NOT NULL,
  `movie_id` int DEFAULT NULL,
  `current_time` int DEFAULT '0' COMMENT 'Current playback time in seconds',
  `is_playing` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `last_activity` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `expires_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `party_code` (`party_code`),
  KEY `idx_host` (`host_user_id`),
  KEY `idx_movie` (`movie_id`),
  CONSTRAINT `watch_party_movie_fk` FOREIGN KEY (`movie_id`) REFERENCES `movies` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: watch_party_members - Party participants
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `watch_party_members` (
  `id` int NOT NULL AUTO_INCREMENT,
  `party_id` int NOT NULL,
  `user_id` int NOT NULL,
  `joined_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `last_seen` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_party_user` (`party_id`, `user_id`),
  CONSTRAINT `party_members_party_fk` FOREIGN KEY (`party_id`) REFERENCES `watch_party_sessions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: content_reports - User reported content issues
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `content_reports` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `movie_id` int NOT NULL,
  `report_type` enum('broken_video','wrong_trailer','inappropriate','other') COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `status` enum('pending','reviewed','resolved','dismissed') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `reviewed_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_movie_status` (`movie_id`, `status`),
  KEY `idx_type_status` (`report_type`, `status`),
  CONSTRAINT `content_reports_movie_fk` FOREIGN KEY (`movie_id`) REFERENCES `movies` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: app_analytics - Basic analytics tracking
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `app_analytics` (
  `id` int NOT NULL AUTO_INCREMENT,
  `event_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `event_data` json DEFAULT NULL,
  `user_id` int DEFAULT NULL,
  `session_id` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `source` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'movieshows2_cursor',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_event_type` (`event_type`, `created_at`),
  KEY `idx_user_session` (`user_id`, `session_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Add columns to existing tables (if they don't exist)
-- These use ALTER statements that won't fail if column exists
-- --------------------------------------------------------

-- Add 'source' column to movies if it doesn't exist
SET @exist := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
               WHERE TABLE_SCHEMA = 'ejaguiar1_tvmoviestrailers' 
               AND TABLE_NAME = 'movies' 
               AND COLUMN_NAME = 'source');
SET @sqlstmt := IF(@exist = 0, 
    'ALTER TABLE movies ADD COLUMN source VARCHAR(50) DEFAULT NULL AFTER updated_at',
    'SELECT "Column source already exists"');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add 'cast' column to movies if it doesn't exist
SET @exist := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
               WHERE TABLE_SCHEMA = 'ejaguiar1_tvmoviestrailers' 
               AND TABLE_NAME = 'movies' 
               AND COLUMN_NAME = 'cast_info');
SET @sqlstmt := IF(@exist = 0, 
    'ALTER TABLE movies ADD COLUMN cast_info TEXT DEFAULT NULL AFTER runtime',
    'SELECT "Column cast_info already exists"');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add 'director' column to movies if it doesn't exist
SET @exist := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
               WHERE TABLE_SCHEMA = 'ejaguiar1_tvmoviestrailers' 
               AND TABLE_NAME = 'movies' 
               AND COLUMN_NAME = 'director');
SET @sqlstmt := IF(@exist = 0, 
    'ALTER TABLE movies ADD COLUMN director VARCHAR(255) DEFAULT NULL AFTER cast_info',
    'SELECT "Column director already exists"');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- --------------------------------------------------------
-- Create views for common queries
-- --------------------------------------------------------

-- View: Popular movies with trailer counts and average ratings
CREATE OR REPLACE VIEW `v_popular_movies` AS
SELECT 
    m.id,
    m.title,
    m.type,
    m.genre,
    m.release_year,
    m.imdb_rating,
    COUNT(DISTINCT t.id) as trailer_count,
    COUNT(DISTINCT th.id) as thumbnail_count,
    COALESCE(AVG(ur.rating), 0) as avg_user_rating,
    COUNT(DISTINCT ur.id) as rating_count
FROM movies m
LEFT JOIN trailers t ON m.id = t.movie_id AND t.is_active = 1
LEFT JOIN thumbnails th ON m.id = th.movie_id
LEFT JOIN user_ratings ur ON m.id = ur.movie_id
GROUP BY m.id
ORDER BY rating_count DESC, avg_user_rating DESC;

-- View: Recently added movies
CREATE OR REPLACE VIEW `v_recent_movies` AS
SELECT 
    m.*,
    t.youtube_id as primary_trailer,
    th.url as primary_thumbnail
FROM movies m
LEFT JOIN trailers t ON m.id = t.movie_id AND t.is_active = 1 AND t.priority = (
    SELECT MAX(priority) FROM trailers WHERE movie_id = m.id AND is_active = 1
)
LEFT JOIN thumbnails th ON m.id = th.movie_id AND th.is_primary = 1
ORDER BY m.created_at DESC
LIMIT 100;

-- --------------------------------------------------------
-- Insert sample data markers (won't duplicate)
-- --------------------------------------------------------

INSERT IGNORE INTO sync_log (sync_type, status, items_processed, error_message)
VALUES ('schema_additions', 'success', 0, 'Schema additions applied successfully');

-- Success indicator
SELECT 'Schema additions applied successfully!' as result;
