-- ============================================================
-- MovieShows Complete Database Schema
-- Safe to run - uses IF NOT EXISTS, won't delete existing data
-- Database: ejaguiar1_tvmoviestrailers
-- ============================================================

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";
SET NAMES utf8mb4;

-- Use the database
USE `ejaguiar1_tvmoviestrailers`;

-- ============================================================
-- CORE TABLES (Original Schema)
-- ============================================================

-- Table: movies - Core content storage
CREATE TABLE IF NOT EXISTS `movies` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('movie','tv') COLLATE utf8mb4_unicode_ci DEFAULT 'movie',
  `genre` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `release_year` int DEFAULT NULL,
  `imdb_rating` decimal(3,1) DEFAULT NULL,
  `imdb_id` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tmdb_id` int DEFAULT NULL,
  `runtime` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_type` (`type`),
  KEY `idx_release_year` (`release_year`),
  KEY `idx_imdb_id` (`imdb_id`),
  KEY `idx_tmdb_id` (`tmdb_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: trailers - YouTube trailer links
CREATE TABLE IF NOT EXISTS `trailers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `movie_id` int NOT NULL,
  `youtube_id` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `priority` int DEFAULT '0',
  `source` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `view_count` bigint DEFAULT '0',
  `duration` int DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `last_checked` timestamp NULL DEFAULT NULL,
  `error_count` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_movie_priority` (`movie_id`,`priority` DESC),
  KEY `idx_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: thumbnails - Poster/image URLs
CREATE TABLE IF NOT EXISTS `thumbnails` (
  `id` int NOT NULL AUTO_INCREMENT,
  `movie_id` int NOT NULL,
  `url` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_primary` tinyint(1) DEFAULT '0',
  `width` int DEFAULT NULL,
  `height` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_movie_primary` (`movie_id`,`is_primary` DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: content_sources - Track where content came from
CREATE TABLE IF NOT EXISTS `content_sources` (
  `id` int NOT NULL AUTO_INCREMENT,
  `movie_id` int NOT NULL,
  `source` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `source_data` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_movie_source` (`movie_id`,`source`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: user_preferences - User settings
CREATE TABLE IF NOT EXISTS `user_preferences` (
  `user_id` int NOT NULL,
  `rewatch_enabled` tinyint(1) DEFAULT '0',
  `autoplay` tinyint(1) DEFAULT '1',
  `sound_on_scroll` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: user_queues - User saved queue
CREATE TABLE IF NOT EXISTS `user_queues` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `movie_id` int NOT NULL,
  `position` int NOT NULL,
  `watched` tinyint(1) DEFAULT '0',
  `watch_count` int DEFAULT '0',
  `last_watched_at` timestamp NULL DEFAULT NULL,
  `added_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_movie` (`user_id`,`movie_id`),
  KEY `movie_id` (`movie_id`),
  KEY `idx_user_position` (`user_id`,`position`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: shared_playlists - Shareable playlist headers
CREATE TABLE IF NOT EXISTS `shared_playlists` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `share_code` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `view_count` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `share_code` (`share_code`),
  KEY `idx_share_code` (`share_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: playlist_items - Items in playlists
CREATE TABLE IF NOT EXISTS `playlist_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `playlist_id` int NOT NULL,
  `movie_id` int NOT NULL,
  `position` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `movie_id` (`movie_id`),
  KEY `idx_playlist_position` (`playlist_id`,`position`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: sync_log - Track sync operations
CREATE TABLE IF NOT EXISTS `sync_log` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sync_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('success','failed','partial') COLLATE utf8mb4_unicode_ci DEFAULT 'success',
  `items_processed` int DEFAULT '0',
  `error_message` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_sync_type` (`sync_type`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- EXTENDED TABLES (MovieShows3 Additions)
-- ============================================================

-- Table: watch_history - Track what users watched
CREATE TABLE IF NOT EXISTS `watch_history` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `movie_id` int NOT NULL,
  `watched_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `watch_duration` int DEFAULT NULL COMMENT 'Seconds watched',
  `completed` tinyint(1) DEFAULT '0',
  `source` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'movieshows3',
  PRIMARY KEY (`id`),
  KEY `idx_user_watched` (`user_id`, `watched_at` DESC),
  KEY `idx_movie_id` (`movie_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: user_ratings - User star ratings
CREATE TABLE IF NOT EXISTS `user_ratings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `movie_id` int NOT NULL,
  `rating` tinyint NOT NULL COMMENT '1-5 stars',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_rating` (`user_id`, `movie_id`),
  KEY `idx_movie_rating` (`movie_id`, `rating`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: user_favorites - User favorites list
CREATE TABLE IF NOT EXISTS `user_favorites` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `movie_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_favorite` (`user_id`, `movie_id`),
  KEY `idx_movie_id` (`movie_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: user_bookmarks - Scene timestamp bookmarks
CREATE TABLE IF NOT EXISTS `user_bookmarks` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `movie_id` int NOT NULL,
  `timestamp_seconds` int NOT NULL DEFAULT '0',
  `note` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_movie` (`user_id`, `movie_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: watch_party_sessions - Watch party rooms
CREATE TABLE IF NOT EXISTS `watch_party_sessions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `party_code` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `host_user_id` int NOT NULL,
  `movie_id` int DEFAULT NULL,
  `current_time` int DEFAULT '0' COMMENT 'Playback time in seconds',
  `is_playing` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `last_activity` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `expires_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `party_code` (`party_code`),
  KEY `idx_host` (`host_user_id`),
  KEY `idx_movie` (`movie_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: watch_party_members - Party participants
CREATE TABLE IF NOT EXISTS `watch_party_members` (
  `id` int NOT NULL AUTO_INCREMENT,
  `party_id` int NOT NULL,
  `user_id` int NOT NULL,
  `joined_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `last_seen` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_party_user` (`party_id`, `user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: content_reports - User content reports
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
  KEY `idx_type_status` (`report_type`, `status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: app_analytics - Basic event tracking
CREATE TABLE IF NOT EXISTS `app_analytics` (
  `id` int NOT NULL AUTO_INCREMENT,
  `event_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `event_data` json DEFAULT NULL,
  `user_id` int DEFAULT NULL,
  `session_id` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `source` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'movieshows3',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_event_type` (`event_type`, `created_at`),
  KEY `idx_user_session` (`user_id`, `session_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- ADD FOREIGN KEY CONSTRAINTS (Only if not exist)
-- Using separate statements so failures don't stop execution
-- ============================================================

-- Note: Run these individually if some fail due to existing constraints

-- trailers -> movies
-- ALTER TABLE `trailers` ADD CONSTRAINT `trailers_movie_fk` FOREIGN KEY (`movie_id`) REFERENCES `movies` (`id`) ON DELETE CASCADE;

-- thumbnails -> movies  
-- ALTER TABLE `thumbnails` ADD CONSTRAINT `thumbnails_movie_fk` FOREIGN KEY (`movie_id`) REFERENCES `movies` (`id`) ON DELETE CASCADE;

-- content_sources -> movies
-- ALTER TABLE `content_sources` ADD CONSTRAINT `content_sources_movie_fk` FOREIGN KEY (`movie_id`) REFERENCES `movies` (`id`) ON DELETE CASCADE;

-- user_queues -> movies
-- ALTER TABLE `user_queues` ADD CONSTRAINT `user_queues_movie_fk` FOREIGN KEY (`movie_id`) REFERENCES `movies` (`id`) ON DELETE CASCADE;

-- playlist_items -> shared_playlists
-- ALTER TABLE `playlist_items` ADD CONSTRAINT `playlist_items_playlist_fk` FOREIGN KEY (`playlist_id`) REFERENCES `shared_playlists` (`id`) ON DELETE CASCADE;

-- playlist_items -> movies
-- ALTER TABLE `playlist_items` ADD CONSTRAINT `playlist_items_movie_fk` FOREIGN KEY (`movie_id`) REFERENCES `movies` (`id`) ON DELETE CASCADE;

-- ============================================================
-- SAFE COLUMN ADDITIONS (Won't fail if column exists)
-- ============================================================

-- Add source column to movies
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'ejaguiar1_tvmoviestrailers' 
    AND TABLE_NAME = 'movies' AND COLUMN_NAME = 'source');
SET @sql = IF(@col_exists = 0, 
    'ALTER TABLE movies ADD COLUMN source VARCHAR(50) DEFAULT NULL', 
    'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add cast_info column to movies
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'ejaguiar1_tvmoviestrailers' 
    AND TABLE_NAME = 'movies' AND COLUMN_NAME = 'cast_info');
SET @sql = IF(@col_exists = 0, 
    'ALTER TABLE movies ADD COLUMN cast_info TEXT DEFAULT NULL', 
    'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add director column to movies
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'ejaguiar1_tvmoviestrailers' 
    AND TABLE_NAME = 'movies' AND COLUMN_NAME = 'director');
SET @sql = IF(@col_exists = 0, 
    'ALTER TABLE movies ADD COLUMN director VARCHAR(255) DEFAULT NULL', 
    'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================================
-- VIEWS FOR COMMON QUERIES
-- ============================================================

-- Popular movies view
CREATE OR REPLACE VIEW `v_popular_movies` AS
SELECT 
    m.id, m.title, m.type, m.genre, m.release_year, m.imdb_rating,
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

-- Recent movies view
CREATE OR REPLACE VIEW `v_recent_movies` AS
SELECT 
    m.*, t.youtube_id as primary_trailer, th.url as primary_thumbnail
FROM movies m
LEFT JOIN trailers t ON m.id = t.movie_id AND t.is_active = 1 
    AND t.priority = (SELECT MAX(priority) FROM trailers WHERE movie_id = m.id AND is_active = 1)
LEFT JOIN thumbnails th ON m.id = th.movie_id AND th.is_primary = 1
ORDER BY m.created_at DESC
LIMIT 100;

-- Movies with trailers view (for quick lookup)
CREATE OR REPLACE VIEW `v_movies_with_trailers` AS
SELECT 
    m.id, m.title, m.type, m.genre, m.release_year, m.description,
    t.youtube_id, th.url as poster_url
FROM movies m
INNER JOIN trailers t ON m.id = t.movie_id AND t.is_active = 1
LEFT JOIN thumbnails th ON m.id = th.movie_id AND th.is_primary = 1
ORDER BY m.release_year DESC, m.title;

-- ============================================================
-- LOG SCHEMA SETUP
-- ============================================================

INSERT INTO sync_log (sync_type, status, items_processed, error_message)
VALUES ('movieshows3_schema_setup', 'success', 0, 'Complete schema applied successfully')
ON DUPLICATE KEY UPDATE error_message = 'Schema re-applied';

COMMIT;

SELECT 'MovieShows3 schema setup complete!' as status;
