<?php
/**
 * MovieShows API - Playlists Endpoint
 * Handles shared playlists
 */

define('MOVIESHOWS_API', true);
require_once __DIR__ . '/config.php';

setCorsHeaders();

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? 'get';

switch ($method) {
    case 'GET':
        handleGet($action);
        break;
    case 'POST':
        handlePost($action);
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
    
    switch ($action) {
        case 'get':
            getPlaylist($pdo);
            break;
        case 'my-playlists':
            getMyPlaylists($pdo);
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
    
    switch ($action) {
        case 'create':
            createPlaylist($pdo);
            break;
        case 'add-item':
            addToPlaylist($pdo);
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
    
    switch ($action) {
        case 'delete':
            deletePlaylist($pdo);
            break;
        case 'remove-item':
            removeFromPlaylist($pdo);
            break;
        default:
            errorResponse('Unknown action');
    }
}

/**
 * Get playlist by share code
 */
function getPlaylist($pdo) {
    $code = $_GET['code'] ?? null;
    if (!$code) {
        errorResponse('Share code required');
    }
    
    // Get playlist
    $stmt = $pdo->prepare("
        SELECT id, title, view_count, created_at 
        FROM shared_playlists 
        WHERE share_code = :code
    ");
    $stmt->execute(['code' => $code]);
    $playlist = $stmt->fetch();
    
    if (!$playlist) {
        errorResponse('Playlist not found', 404);
    }
    
    // Increment view count
    $stmt = $pdo->prepare("UPDATE shared_playlists SET view_count = view_count + 1 WHERE id = :id");
    $stmt->execute(['id' => $playlist['id']]);
    
    // Get items
    $stmt = $pdo->prepare("
        SELECT 
            m.id,
            m.title,
            m.type,
            m.genre,
            m.release_year as year,
            t.youtube_id as trailer_id,
            th.url as poster_url,
            pi.position
        FROM playlist_items pi
        JOIN movies m ON pi.movie_id = m.id
        LEFT JOIN trailers t ON m.id = t.movie_id AND t.is_active = 1
        LEFT JOIN thumbnails th ON m.id = th.movie_id AND th.is_primary = 1
        WHERE pi.playlist_id = :playlist_id
        ORDER BY pi.position ASC
    ");
    $stmt->execute(['playlist_id' => $playlist['id']]);
    $items = $stmt->fetchAll();
    
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
            'position' => (int)$item['position']
        ];
    }, $items);
    
    jsonResponse([
        'success' => true,
        'data' => [
            'id' => (int)$playlist['id'],
            'title' => $playlist['title'],
            'shareCode' => $code,
            'viewCount' => (int)$playlist['view_count'] + 1,
            'createdAt' => $playlist['created_at'],
            'items' => $formatted,
            'itemCount' => count($formatted)
        ]
    ]);
}

/**
 * Get user's playlists
 */
function getMyPlaylists($pdo) {
    $userId = getUserIdFromRequest();
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
            sp.id,
            sp.share_code,
            sp.title,
            sp.view_count,
            sp.created_at,
            COUNT(pi.id) as item_count
        FROM shared_playlists sp
        LEFT JOIN playlist_items pi ON sp.id = pi.playlist_id
        WHERE sp.user_id = :user_id
        GROUP BY sp.id
        ORDER BY sp.created_at DESC
    ");
    $stmt->execute(['user_id' => $hashedId]);
    
    jsonResponse([
        'success' => true,
        'data' => $stmt->fetchAll()
    ]);
}

/**
 * Create new playlist
 */
function createPlaylist($pdo) {
    $userId = getUserIdFromRequest();
    if (!$userId) {
        errorResponse('User ID required');
    }
    
    $data = getJsonBody();
    $title = $data['title'] ?? 'My Playlist';
    $items = $data['items'] ?? [];
    
    $hashedId = hashUserId($userId);
    
    try {
        $pdo->beginTransaction();
        
        // Generate unique share code
        $shareCode = generateShareCode();
        
        // Ensure unique
        $stmt = $pdo->prepare("SELECT id FROM shared_playlists WHERE share_code = :code");
        $stmt->execute(['code' => $shareCode]);
        while ($stmt->fetch()) {
            $shareCode = generateShareCode();
            $stmt->execute(['code' => $shareCode]);
        }
        
        // Create playlist
        $stmt = $pdo->prepare("
            INSERT INTO shared_playlists (user_id, share_code, title)
            VALUES (:user_id, :code, :title)
        ");
        $stmt->execute([
            'user_id' => $hashedId,
            'code' => $shareCode,
            'title' => $title
        ]);
        $playlistId = $pdo->lastInsertId();
        
        // Add items
        if (!empty($items)) {
            $position = 1;
            foreach ($items as $item) {
                $movieId = $item['id'] ?? $item['movieId'] ?? null;
                
                if (!$movieId && !empty($item['title'])) {
                    // Try to find by title
                    $stmt = $pdo->prepare("SELECT id FROM movies WHERE title = :title");
                    $stmt->execute(['title' => $item['title']]);
                    $movie = $stmt->fetch();
                    
                    if ($movie) {
                        $movieId = $movie['id'];
                    } else {
                        // Create movie
                        $stmt = $pdo->prepare("
                            INSERT INTO movies (title, type, release_year)
                            VALUES (:title, :type, :year)
                        ");
                        $stmt->execute([
                            'title' => $item['title'],
                            'type' => $item['type'] ?? 'movie',
                            'year' => $item['year'] ?? null
                        ]);
                        $movieId = $pdo->lastInsertId();
                    }
                }
                
                if ($movieId) {
                    $stmt = $pdo->prepare("
                        INSERT INTO playlist_items (playlist_id, movie_id, position)
                        VALUES (:playlist_id, :movie_id, :position)
                    ");
                    $stmt->execute([
                        'playlist_id' => $playlistId,
                        'movie_id' => $movieId,
                        'position' => $position++
                    ]);
                }
            }
        }
        
        $pdo->commit();
        
        jsonResponse([
            'success' => true,
            'data' => [
                'id' => $playlistId,
                'shareCode' => $shareCode,
                'title' => $title,
                'itemCount' => count($items)
            ]
        ]);
        
    } catch (Exception $e) {
        $pdo->rollBack();
        errorResponse('Failed to create playlist: ' . $e->getMessage(), 500);
    }
}

/**
 * Add item to playlist
 */
function addToPlaylist($pdo) {
    $userId = getUserIdFromRequest();
    if (!$userId) {
        errorResponse('User ID required');
    }
    
    $data = getJsonBody();
    $playlistId = $data['playlistId'] ?? null;
    $movieId = $data['movieId'] ?? null;
    
    if (!$playlistId || !$movieId) {
        errorResponse('Playlist ID and Movie ID required');
    }
    
    $hashedId = hashUserId($userId);
    
    // Verify ownership
    $stmt = $pdo->prepare("SELECT id FROM shared_playlists WHERE id = :id AND user_id = :user_id");
    $stmt->execute(['id' => $playlistId, 'user_id' => $hashedId]);
    if (!$stmt->fetch()) {
        errorResponse('Playlist not found or access denied', 403);
    }
    
    // Get next position
    $stmt = $pdo->prepare("SELECT COALESCE(MAX(position), 0) + 1 FROM playlist_items WHERE playlist_id = :id");
    $stmt->execute(['id' => $playlistId]);
    $nextPos = $stmt->fetchColumn();
    
    // Add item
    $stmt = $pdo->prepare("
        INSERT INTO playlist_items (playlist_id, movie_id, position)
        VALUES (:playlist_id, :movie_id, :position)
    ");
    $stmt->execute([
        'playlist_id' => $playlistId,
        'movie_id' => $movieId,
        'position' => $nextPos
    ]);
    
    jsonResponse([
        'success' => true,
        'message' => 'Added to playlist'
    ]);
}

/**
 * Delete playlist
 */
function deletePlaylist($pdo) {
    $userId = getUserIdFromRequest();
    if (!$userId) {
        errorResponse('User ID required');
    }
    
    $playlistId = $_GET['id'] ?? null;
    if (!$playlistId) {
        errorResponse('Playlist ID required');
    }
    
    $hashedId = hashUserId($userId);
    
    // Verify ownership and delete (cascade will handle items)
    $stmt = $pdo->prepare("DELETE FROM shared_playlists WHERE id = :id AND user_id = :user_id");
    $stmt->execute(['id' => $playlistId, 'user_id' => $hashedId]);
    
    if ($stmt->rowCount() === 0) {
        errorResponse('Playlist not found or access denied', 403);
    }
    
    jsonResponse([
        'success' => true,
        'message' => 'Playlist deleted'
    ]);
}

/**
 * Remove item from playlist
 */
function removeFromPlaylist($pdo) {
    $userId = getUserIdFromRequest();
    if (!$userId) {
        errorResponse('User ID required');
    }
    
    $playlistId = $_GET['playlist_id'] ?? null;
    $movieId = $_GET['movie_id'] ?? null;
    
    if (!$playlistId || !$movieId) {
        errorResponse('Playlist ID and Movie ID required');
    }
    
    $hashedId = hashUserId($userId);
    
    // Verify ownership
    $stmt = $pdo->prepare("SELECT id FROM shared_playlists WHERE id = :id AND user_id = :user_id");
    $stmt->execute(['id' => $playlistId, 'user_id' => $hashedId]);
    if (!$stmt->fetch()) {
        errorResponse('Playlist not found or access denied', 403);
    }
    
    // Remove item
    $stmt = $pdo->prepare("DELETE FROM playlist_items WHERE playlist_id = :playlist_id AND movie_id = :movie_id");
    $stmt->execute([
        'playlist_id' => $playlistId,
        'movie_id' => $movieId
    ]);
    
    jsonResponse([
        'success' => true,
        'message' => 'Removed from playlist'
    ]);
}

/**
 * Get user ID from request
 */
function getUserIdFromRequest() {
    $headers = getallheaders();
    $userId = $headers['X-User-Id'] ?? $_GET['user_id'] ?? null;
    
    if (!$userId) {
        $body = getJsonBody();
        $userId = $body['userId'] ?? null;
    }
    
    return $userId;
}

/**
 * Hash user ID
 */
function hashUserId($userId) {
    return abs(crc32($userId . '_movieshows_salt'));
}

/**
 * Generate share code
 */
function generateShareCode() {
    $chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    $code = 'PL-';
    for ($i = 0; $i < 8; $i++) {
        $code .= $chars[random_int(0, strlen($chars) - 1)];
    }
    return $code;
}
