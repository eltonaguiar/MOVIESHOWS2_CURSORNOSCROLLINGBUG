<?php
/**
 * MovieShows API - User Endpoint
 * Handles user queues, preferences, and watch history
 */

define('MOVIESHOWS_API', true);
require_once __DIR__ . '/config.php';

setCorsHeaders();

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? 'preferences';

switch ($method) {
    case 'GET':
        handleGet($action);
        break;
    case 'POST':
        handlePost($action);
        break;
    case 'PUT':
        handlePut($action);
        break;
    case 'DELETE':
        handleDelete($action);
        break;
    default:
        errorResponse('Method not allowed', 405);
}

function handleGet($action) {
    $pdo = getDbConnection();
    if (!$pdo) {
        errorResponse('Database connection failed', 500);
    }
    
    $userId = getUserIdFromRequest();
    
    switch ($action) {
        case 'preferences':
            getPreferences($pdo, $userId);
            break;
        case 'queue':
            getQueue($pdo, $userId);
            break;
        case 'history':
            getWatchHistory($pdo, $userId);
            break;
        default:
            errorResponse('Unknown action');
    }
}

function handlePost($action) {
    $pdo = getDbConnection();
    if (!$pdo) {
        errorResponse('Database connection failed', 500);
    }
    
    $userId = getUserIdFromRequest();
    
    switch ($action) {
        case 'preferences':
            savePreferences($pdo, $userId);
            break;
        case 'queue-add':
            addToQueue($pdo, $userId);
            break;
        case 'queue-sync':
            syncQueue($pdo, $userId);
            break;
        case 'watched':
            markWatched($pdo, $userId);
            break;
        default:
            errorResponse('Unknown action');
    }
}

function handlePut($action) {
    $pdo = getDbConnection();
    if (!$pdo) {
        errorResponse('Database connection failed', 500);
    }
    
    $userId = getUserIdFromRequest();
    
    switch ($action) {
        case 'queue-reorder':
            reorderQueue($pdo, $userId);
            break;
        default:
            errorResponse('Unknown action');
    }
}

function handleDelete($action) {
    $pdo = getDbConnection();
    if (!$pdo) {
        errorResponse('Database connection failed', 500);
    }
    
    $userId = getUserIdFromRequest();
    
    switch ($action) {
        case 'queue-remove':
            removeFromQueue($pdo, $userId);
            break;
        case 'queue-clear':
            clearQueue($pdo, $userId);
            break;
        default:
            errorResponse('Unknown action');
    }
}

/**
 * Get user ID from request header or generate new one
 */
function getUserIdFromRequest() {
    $headers = getallheaders();
    $userId = $headers['X-User-Id'] ?? $_GET['user_id'] ?? null;
    
    if (!$userId) {
        // Check if it's a POST with user_id in body
        $body = getJsonBody();
        $userId = $body['userId'] ?? null;
    }
    
    return $userId;
}

/**
 * Get user preferences
 */
function getPreferences($pdo, $userId) {
    if (!$userId) {
        jsonResponse([
            'success' => true,
            'data' => [
                'rewatch_enabled' => false,
                'autoplay' => true,
                'sound_on_scroll' => true
            ]
        ]);
        return;
    }
    
    $stmt = $pdo->prepare("SELECT * FROM user_preferences WHERE user_id = :user_id");
    $stmt->execute(['user_id' => hashUserId($userId)]);
    $prefs = $stmt->fetch();
    
    if (!$prefs) {
        // Return defaults
        jsonResponse([
            'success' => true,
            'data' => [
                'rewatch_enabled' => false,
                'autoplay' => true,
                'sound_on_scroll' => true
            ]
        ]);
        return;
    }
    
    jsonResponse([
        'success' => true,
        'data' => [
            'rewatch_enabled' => (bool)$prefs['rewatch_enabled'],
            'autoplay' => (bool)$prefs['autoplay'],
            'sound_on_scroll' => (bool)$prefs['sound_on_scroll']
        ]
    ]);
}

/**
 * Save user preferences
 */
function savePreferences($pdo, $userId) {
    if (!$userId) {
        errorResponse('User ID required');
    }
    
    $data = getJsonBody();
    $hashedId = hashUserId($userId);
    
    $stmt = $pdo->prepare("
        INSERT INTO user_preferences (user_id, rewatch_enabled, autoplay, sound_on_scroll)
        VALUES (:user_id, :rewatch, :autoplay, :sound)
        ON DUPLICATE KEY UPDATE
            rewatch_enabled = VALUES(rewatch_enabled),
            autoplay = VALUES(autoplay),
            sound_on_scroll = VALUES(sound_on_scroll),
            updated_at = CURRENT_TIMESTAMP
    ");
    
    $stmt->execute([
        'user_id' => $hashedId,
        'rewatch' => isset($data['rewatch_enabled']) ? (int)$data['rewatch_enabled'] : 0,
        'autoplay' => isset($data['autoplay']) ? (int)$data['autoplay'] : 1,
        'sound' => isset($data['sound_on_scroll']) ? (int)$data['sound_on_scroll'] : 1
    ]);
    
    jsonResponse([
        'success' => true,
        'message' => 'Preferences saved'
    ]);
}

/**
 * Get user queue
 */
function getQueue($pdo, $userId) {
    if (!$userId) {
        jsonResponse([
            'success' => true,
            'data' => []
        ]);
        return;
    }
    
    $hashedId = hashUserId($userId);
    
    $stmt = $pdo->prepare("
        SELECT 
            m.id,
            m.title,
            m.type,
            m.genre,
            m.release_year as year,
            t.youtube_id as trailer_id,
            th.url as poster_url,
            uq.position,
            uq.watched,
            uq.watch_count,
            uq.last_watched_at,
            uq.added_at
        FROM user_queues uq
        JOIN movies m ON uq.movie_id = m.id
        LEFT JOIN trailers t ON m.id = t.movie_id AND t.is_active = 1
        LEFT JOIN thumbnails th ON m.id = th.movie_id AND th.is_primary = 1
        WHERE uq.user_id = :user_id
        ORDER BY uq.position ASC
    ");
    $stmt->execute(['user_id' => $hashedId]);
    
    $queue = $stmt->fetchAll();
    
    // Format for frontend
    $formatted = array_map(function($item) {
        return [
            'id' => (int)$item['id'],
            'title' => $item['title'],
            'type' => $item['type'],
            'genre' => $item['genre'],
            'year' => (int)$item['year'],
            'trailerUrl' => $item['trailer_id'] ? "https://www.youtube.com/embed/{$item['trailer_id']}" : null,
            'posterUrl' => $item['poster_url'],
            'position' => (int)$item['position'],
            'watched' => (bool)$item['watched'],
            'watchCount' => (int)$item['watch_count'],
            'lastWatchedAt' => $item['last_watched_at'],
            'addedAt' => $item['added_at']
        ];
    }, $queue);
    
    jsonResponse([
        'success' => true,
        'data' => $formatted
    ]);
}

/**
 * Add movie to queue
 */
function addToQueue($pdo, $userId) {
    if (!$userId) {
        errorResponse('User ID required');
    }
    
    $data = getJsonBody();
    
    if (empty($data['movieId']) && empty($data['title'])) {
        errorResponse('Movie ID or title required');
    }
    
    $hashedId = hashUserId($userId);
    
    try {
        // Find movie by ID or title
        if (!empty($data['movieId'])) {
            $stmt = $pdo->prepare("SELECT id FROM movies WHERE id = :id");
            $stmt->execute(['id' => $data['movieId']]);
        } else {
            $stmt = $pdo->prepare("SELECT id FROM movies WHERE title = :title");
            $stmt->execute(['title' => $data['title']]);
        }
        $movie = $stmt->fetch();
        
        if (!$movie) {
            // If movie not found by title, try to add it first
            if (!empty($data['title'])) {
                $stmt = $pdo->prepare("
                    INSERT INTO movies (title, type, genre, release_year)
                    VALUES (:title, :type, :genre, :year)
                ");
                $stmt->execute([
                    'title' => $data['title'],
                    'type' => $data['type'] ?? 'movie',
                    'genre' => $data['genre'] ?? null,
                    'year' => $data['year'] ?? null
                ]);
                $movieId = $pdo->lastInsertId();
                
                // Add trailer if provided
                if (!empty($data['youtubeId'])) {
                    $stmt = $pdo->prepare("
                        INSERT INTO trailers (movie_id, youtube_id, priority, source)
                        VALUES (:movie_id, :youtube_id, 1, :source)
                    ");
                    $stmt->execute([
                        'movie_id' => $movieId,
                        'youtube_id' => $data['youtubeId'],
                        'source' => APP_SOURCE
                    ]);
                }
                
                // Add poster if provided
                if (!empty($data['posterUrl'])) {
                    $stmt = $pdo->prepare("
                        INSERT INTO thumbnails (movie_id, url, is_primary)
                        VALUES (:movie_id, :url, 1)
                    ");
                    $stmt->execute([
                        'movie_id' => $movieId,
                        'url' => $data['posterUrl']
                    ]);
                }
            } else {
                errorResponse('Movie not found');
            }
        } else {
            $movieId = $movie['id'];
        }
        
        // Get next position
        $stmt = $pdo->prepare("SELECT COALESCE(MAX(position), 0) + 1 as next_pos FROM user_queues WHERE user_id = :user_id");
        $stmt->execute(['user_id' => $hashedId]);
        $nextPos = $stmt->fetchColumn();
        
        // Add to queue
        $stmt = $pdo->prepare("
            INSERT INTO user_queues (user_id, movie_id, position)
            VALUES (:user_id, :movie_id, :position)
            ON DUPLICATE KEY UPDATE position = VALUES(position)
        ");
        $stmt->execute([
            'user_id' => $hashedId,
            'movie_id' => $movieId,
            'position' => $nextPos
        ]);
        
        jsonResponse([
            'success' => true,
            'message' => 'Added to queue',
            'position' => $nextPos
        ]);
        
    } catch (Exception $e) {
        errorResponse('Failed to add to queue: ' . $e->getMessage(), 500);
    }
}

/**
 * Sync entire queue from frontend
 */
function syncQueue($pdo, $userId) {
    if (!$userId) {
        errorResponse('User ID required');
    }
    
    $data = getJsonBody();
    
    if (!isset($data['queue']) || !is_array($data['queue'])) {
        errorResponse('Queue array required');
    }
    
    $hashedId = hashUserId($userId);
    
    try {
        $pdo->beginTransaction();
        
        // Clear existing queue
        $stmt = $pdo->prepare("DELETE FROM user_queues WHERE user_id = :user_id");
        $stmt->execute(['user_id' => $hashedId]);
        
        // Add each item
        $position = 1;
        foreach ($data['queue'] as $item) {
            if (empty($item['title'])) continue;
            
            // Find or create movie
            $stmt = $pdo->prepare("SELECT id FROM movies WHERE title = :title");
            $stmt->execute(['title' => $item['title']]);
            $movie = $stmt->fetch();
            
            if (!$movie) {
                // Create movie
                $stmt = $pdo->prepare("
                    INSERT INTO movies (title, type, genre, release_year)
                    VALUES (:title, :type, :genre, :year)
                ");
                $stmt->execute([
                    'title' => $item['title'],
                    'type' => $item['type'] ?? 'movie',
                    'genre' => $item['genre'] ?? null,
                    'year' => $item['year'] ?? null
                ]);
                $movieId = $pdo->lastInsertId();
                
                // Add trailer
                if (!empty($item['youtubeId']) || !empty($item['trailerUrl'])) {
                    $youtubeId = $item['youtubeId'] ?? extractYouTubeIdSimple($item['trailerUrl']);
                    if ($youtubeId) {
                        $stmt = $pdo->prepare("
                            INSERT IGNORE INTO trailers (movie_id, youtube_id, priority, source)
                            VALUES (:movie_id, :youtube_id, 1, :source)
                        ");
                        $stmt->execute([
                            'movie_id' => $movieId,
                            'youtube_id' => $youtubeId,
                            'source' => APP_SOURCE
                        ]);
                    }
                }
                
                // Add poster
                if (!empty($item['posterUrl'])) {
                    $stmt = $pdo->prepare("
                        INSERT IGNORE INTO thumbnails (movie_id, url, is_primary)
                        VALUES (:movie_id, :url, 1)
                    ");
                    $stmt->execute([
                        'movie_id' => $movieId,
                        'url' => $item['posterUrl']
                    ]);
                }
            } else {
                $movieId = $movie['id'];
            }
            
            // Add to queue
            $stmt = $pdo->prepare("
                INSERT INTO user_queues (user_id, movie_id, position)
                VALUES (:user_id, :movie_id, :position)
            ");
            $stmt->execute([
                'user_id' => $hashedId,
                'movie_id' => $movieId,
                'position' => $position++
            ]);
        }
        
        $pdo->commit();
        
        jsonResponse([
            'success' => true,
            'message' => 'Queue synced',
            'count' => $position - 1
        ]);
        
    } catch (Exception $e) {
        $pdo->rollBack();
        errorResponse('Failed to sync queue: ' . $e->getMessage(), 500);
    }
}

/**
 * Reorder queue
 */
function reorderQueue($pdo, $userId) {
    if (!$userId) {
        errorResponse('User ID required');
    }
    
    $data = getJsonBody();
    
    if (!isset($data['order']) || !is_array($data['order'])) {
        errorResponse('Order array required');
    }
    
    $hashedId = hashUserId($userId);
    
    try {
        $pdo->beginTransaction();
        
        foreach ($data['order'] as $position => $movieId) {
            $stmt = $pdo->prepare("
                UPDATE user_queues 
                SET position = :position 
                WHERE user_id = :user_id AND movie_id = :movie_id
            ");
            $stmt->execute([
                'position' => $position + 1,
                'user_id' => $hashedId,
                'movie_id' => $movieId
            ]);
        }
        
        $pdo->commit();
        
        jsonResponse([
            'success' => true,
            'message' => 'Queue reordered'
        ]);
        
    } catch (Exception $e) {
        $pdo->rollBack();
        errorResponse('Failed to reorder queue: ' . $e->getMessage(), 500);
    }
}

/**
 * Remove from queue
 */
function removeFromQueue($pdo, $userId) {
    if (!$userId) {
        errorResponse('User ID required');
    }
    
    $movieId = $_GET['movie_id'] ?? null;
    if (!$movieId) {
        errorResponse('Movie ID required');
    }
    
    $hashedId = hashUserId($userId);
    
    $stmt = $pdo->prepare("DELETE FROM user_queues WHERE user_id = :user_id AND movie_id = :movie_id");
    $stmt->execute([
        'user_id' => $hashedId,
        'movie_id' => $movieId
    ]);
    
    jsonResponse([
        'success' => true,
        'message' => 'Removed from queue'
    ]);
}

/**
 * Clear entire queue
 */
function clearQueue($pdo, $userId) {
    if (!$userId) {
        errorResponse('User ID required');
    }
    
    $hashedId = hashUserId($userId);
    
    $stmt = $pdo->prepare("DELETE FROM user_queues WHERE user_id = :user_id");
    $stmt->execute(['user_id' => $hashedId]);
    
    jsonResponse([
        'success' => true,
        'message' => 'Queue cleared'
    ]);
}

/**
 * Mark movie as watched
 */
function markWatched($pdo, $userId) {
    if (!$userId) {
        errorResponse('User ID required');
    }
    
    $data = getJsonBody();
    $movieId = $data['movieId'] ?? null;
    
    if (!$movieId) {
        errorResponse('Movie ID required');
    }
    
    $hashedId = hashUserId($userId);
    
    $stmt = $pdo->prepare("
        UPDATE user_queues 
        SET watched = 1, watch_count = watch_count + 1, last_watched_at = CURRENT_TIMESTAMP
        WHERE user_id = :user_id AND movie_id = :movie_id
    ");
    $stmt->execute([
        'user_id' => $hashedId,
        'movie_id' => $movieId
    ]);
    
    jsonResponse([
        'success' => true,
        'message' => 'Marked as watched'
    ]);
}

/**
 * Get watch history
 */
function getWatchHistory($pdo, $userId) {
    if (!$userId) {
        jsonResponse([
            'success' => true,
            'data' => []
        ]);
        return;
    }
    
    $hashedId = hashUserId($userId);
    $limit = min((int)($_GET['limit'] ?? 50), 100);
    
    $stmt = $pdo->prepare("
        SELECT 
            m.id,
            m.title,
            m.type,
            m.release_year as year,
            th.url as poster_url,
            uq.watch_count,
            uq.last_watched_at
        FROM user_queues uq
        JOIN movies m ON uq.movie_id = m.id
        LEFT JOIN thumbnails th ON m.id = th.movie_id AND th.is_primary = 1
        WHERE uq.user_id = :user_id AND uq.watched = 1
        ORDER BY uq.last_watched_at DESC
        LIMIT :limit
    ");
    $stmt->bindValue(':user_id', $hashedId);
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->execute();
    
    jsonResponse([
        'success' => true,
        'data' => $stmt->fetchAll()
    ]);
}

/**
 * Hash user ID for privacy
 */
function hashUserId($userId) {
    // Create a consistent numeric hash for the user_id
    // The user_queues table expects an integer user_id
    return abs(crc32($userId . '_movieshows_salt'));
}

/**
 * Extract YouTube ID (simplified version for this file)
 */
function extractYouTubeIdSimple($url) {
    if (empty($url)) return null;
    if (preg_match('/^[a-zA-Z0-9_-]{11}$/', $url)) return $url;
    if (preg_match('/(?:youtube\.com\/(?:embed\/|watch\?v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/', $url, $m)) {
        return $m[1];
    }
    return null;
}
