<?php
/**
 * MovieShows API - Movies Endpoint
 * Handles movie/TV show data operations
 */

define('MOVIESHOWS_API', true);
require_once __DIR__ . '/config.php';

setCorsHeaders();

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? 'list';

switch ($method) {
    case 'GET':
        handleGet($action);
        break;
    case 'POST':
        handlePost($action);
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
        case 'list':
            listMovies($pdo);
            break;
        case 'get':
            getMovie($pdo);
            break;
        case 'search':
            searchMovies($pdo);
            break;
        case 'random':
            getRandomMovies($pdo);
            break;
        case 'by-year':
            getMoviesByYear($pdo);
            break;
        case 'by-genre':
            getMoviesByGenre($pdo);
            break;
        case 'stats':
            getStats($pdo);
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
        case 'add':
            addMovie($pdo);
            break;
        case 'bulk-add':
            bulkAddMovies($pdo);
            break;
        case 'sync':
            syncMoviesFromFrontend($pdo);
            break;
        default:
            errorResponse('Unknown action');
    }
}

/**
 * List all movies with trailers and thumbnails
 */
function listMovies($pdo) {
    $type = $_GET['type'] ?? null; // 'movie', 'tv', or null for all
    $limit = min((int)($_GET['limit'] ?? 100), 500);
    $offset = (int)($_GET['offset'] ?? 0);
    $year = $_GET['year'] ?? null;
    
    $sql = "
        SELECT 
            m.id,
            m.title,
            m.type,
            m.genre,
            m.description,
            m.release_year as year,
            m.imdb_rating as rating,
            m.imdb_id,
            m.tmdb_id,
            m.runtime,
            t.youtube_id as trailer_id,
            th.url as poster_url
        FROM movies m
        LEFT JOIN trailers t ON m.id = t.movie_id AND t.is_active = 1 AND t.priority = (
            SELECT MAX(priority) FROM trailers WHERE movie_id = m.id AND is_active = 1
        )
        LEFT JOIN thumbnails th ON m.id = th.movie_id AND th.is_primary = 1
        WHERE 1=1
    ";
    
    $params = [];
    
    if ($type) {
        $sql .= " AND m.type = :type";
        $params['type'] = $type;
    }
    
    if ($year) {
        $sql .= " AND m.release_year = :year";
        $params['year'] = $year;
    }
    
    $sql .= " ORDER BY m.release_year DESC, m.title ASC LIMIT :limit OFFSET :offset";
    
    $stmt = $pdo->prepare($sql);
    foreach ($params as $key => $value) {
        $stmt->bindValue(":$key", $value);
    }
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    $stmt->execute();
    
    $movies = $stmt->fetchAll();
    
    // Format for frontend
    $formatted = array_map(function($movie) {
        return [
            'id' => (int)$movie['id'],
            'title' => $movie['title'],
            'type' => $movie['type'],
            'genre' => $movie['genre'],
            'description' => $movie['description'],
            'year' => (int)$movie['year'],
            'rating' => $movie['rating'] ? (float)$movie['rating'] : null,
            'imdbId' => $movie['imdb_id'],
            'tmdbId' => $movie['tmdb_id'] ? (int)$movie['tmdb_id'] : null,
            'runtime' => $movie['runtime'] ? (int)$movie['runtime'] : null,
            'trailerUrl' => $movie['trailer_id'] ? "https://www.youtube.com/embed/{$movie['trailer_id']}" : null,
            'youtubeId' => $movie['trailer_id'],
            'posterUrl' => $movie['poster_url']
        ];
    }, $movies);
    
    // Get total count
    $countSql = "SELECT COUNT(*) FROM movies m WHERE 1=1";
    if ($type) $countSql .= " AND m.type = :type";
    if ($year) $countSql .= " AND m.release_year = :year";
    
    $countStmt = $pdo->prepare($countSql);
    if ($type) $countStmt->bindValue(':type', $type);
    if ($year) $countStmt->bindValue(':year', $year);
    $countStmt->execute();
    $total = (int)$countStmt->fetchColumn();
    
    jsonResponse([
        'success' => true,
        'data' => $formatted,
        'pagination' => [
            'total' => $total,
            'limit' => $limit,
            'offset' => $offset,
            'hasMore' => ($offset + $limit) < $total
        ]
    ]);
}

/**
 * Get single movie by ID
 */
function getMovie($pdo) {
    $id = $_GET['id'] ?? null;
    if (!$id) {
        errorResponse('Movie ID required');
    }
    
    $sql = "
        SELECT 
            m.*,
            GROUP_CONCAT(DISTINCT t.youtube_id) as trailer_ids,
            GROUP_CONCAT(DISTINCT th.url) as poster_urls
        FROM movies m
        LEFT JOIN trailers t ON m.id = t.movie_id AND t.is_active = 1
        LEFT JOIN thumbnails th ON m.id = th.movie_id
        WHERE m.id = :id
        GROUP BY m.id
    ";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute(['id' => $id]);
    $movie = $stmt->fetch();
    
    if (!$movie) {
        errorResponse('Movie not found', 404);
    }
    
    jsonResponse([
        'success' => true,
        'data' => $movie
    ]);
}

/**
 * Search movies
 */
function searchMovies($pdo) {
    $query = $_GET['q'] ?? '';
    if (strlen($query) < 2) {
        errorResponse('Query too short');
    }
    
    $limit = min((int)($_GET['limit'] ?? 20), 50);
    
    $sql = "
        SELECT 
            m.id,
            m.title,
            m.type,
            m.genre,
            m.release_year as year,
            th.url as poster_url,
            t.youtube_id as trailer_id
        FROM movies m
        LEFT JOIN thumbnails th ON m.id = th.movie_id AND th.is_primary = 1
        LEFT JOIN trailers t ON m.id = t.movie_id AND t.is_active = 1
        WHERE m.title LIKE :query
        ORDER BY 
            CASE WHEN m.title LIKE :exact THEN 0 ELSE 1 END,
            m.release_year DESC
        LIMIT :limit
    ";
    
    $stmt = $pdo->prepare($sql);
    $stmt->bindValue(':query', "%$query%");
    $stmt->bindValue(':exact', "$query%");
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->execute();
    
    jsonResponse([
        'success' => true,
        'data' => $stmt->fetchAll()
    ]);
}

/**
 * Get random movies
 */
function getRandomMovies($pdo) {
    $count = min((int)($_GET['count'] ?? 10), 50);
    $type = $_GET['type'] ?? null;
    
    $sql = "
        SELECT 
            m.id, m.title, m.type, m.genre, m.release_year as year,
            t.youtube_id as trailer_id, th.url as poster_url
        FROM movies m
        LEFT JOIN trailers t ON m.id = t.movie_id AND t.is_active = 1
        LEFT JOIN thumbnails th ON m.id = th.movie_id AND th.is_primary = 1
        WHERE t.youtube_id IS NOT NULL
    ";
    
    if ($type) {
        $sql .= " AND m.type = :type";
    }
    
    $sql .= " ORDER BY RAND() LIMIT :count";
    
    $stmt = $pdo->prepare($sql);
    if ($type) $stmt->bindValue(':type', $type);
    $stmt->bindValue(':count', $count, PDO::PARAM_INT);
    $stmt->execute();
    
    jsonResponse([
        'success' => true,
        'data' => $stmt->fetchAll()
    ]);
}

/**
 * Get movies by year
 */
function getMoviesByYear($pdo) {
    $year = $_GET['year'] ?? date('Y');
    $limit = min((int)($_GET['limit'] ?? 50), 100);
    
    $sql = "
        SELECT 
            m.id, m.title, m.type, m.genre, m.release_year as year,
            t.youtube_id as trailer_id, th.url as poster_url
        FROM movies m
        LEFT JOIN trailers t ON m.id = t.movie_id AND t.is_active = 1
        LEFT JOIN thumbnails th ON m.id = th.movie_id AND th.is_primary = 1
        WHERE m.release_year = :year AND t.youtube_id IS NOT NULL
        ORDER BY m.title ASC
        LIMIT :limit
    ";
    
    $stmt = $pdo->prepare($sql);
    $stmt->bindValue(':year', $year, PDO::PARAM_INT);
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->execute();
    
    jsonResponse([
        'success' => true,
        'data' => $stmt->fetchAll()
    ]);
}

/**
 * Get movies by genre
 */
function getMoviesByGenre($pdo) {
    $genre = $_GET['genre'] ?? null;
    if (!$genre) {
        errorResponse('Genre required');
    }
    
    $limit = min((int)($_GET['limit'] ?? 50), 100);
    
    $sql = "
        SELECT 
            m.id, m.title, m.type, m.genre, m.release_year as year,
            t.youtube_id as trailer_id, th.url as poster_url
        FROM movies m
        LEFT JOIN trailers t ON m.id = t.movie_id AND t.is_active = 1
        LEFT JOIN thumbnails th ON m.id = th.movie_id AND th.is_primary = 1
        WHERE m.genre LIKE :genre AND t.youtube_id IS NOT NULL
        ORDER BY m.release_year DESC, m.title ASC
        LIMIT :limit
    ";
    
    $stmt = $pdo->prepare($sql);
    $stmt->bindValue(':genre', "%$genre%");
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->execute();
    
    jsonResponse([
        'success' => true,
        'data' => $stmt->fetchAll()
    ]);
}

/**
 * Get database stats
 */
function getStats($pdo) {
    $stats = [];
    
    // Total counts
    $stmt = $pdo->query("SELECT COUNT(*) as total, 
        SUM(CASE WHEN type = 'movie' THEN 1 ELSE 0 END) as movies,
        SUM(CASE WHEN type = 'tv' THEN 1 ELSE 0 END) as tv_shows
        FROM movies");
    $counts = $stmt->fetch();
    
    // Trailers count
    $stmt = $pdo->query("SELECT COUNT(*) FROM trailers WHERE is_active = 1");
    $trailerCount = $stmt->fetchColumn();
    
    // Years range
    $stmt = $pdo->query("SELECT MIN(release_year) as min_year, MAX(release_year) as max_year FROM movies");
    $years = $stmt->fetch();
    
    // Genre breakdown
    $stmt = $pdo->query("SELECT genre, COUNT(*) as count FROM movies WHERE genre IS NOT NULL GROUP BY genre ORDER BY count DESC LIMIT 10");
    $genres = $stmt->fetchAll();
    
    jsonResponse([
        'success' => true,
        'data' => [
            'totalMovies' => (int)$counts['total'],
            'movies' => (int)$counts['movies'],
            'tvShows' => (int)$counts['tv_shows'],
            'trailers' => (int)$trailerCount,
            'yearRange' => [
                'min' => (int)$years['min_year'],
                'max' => (int)$years['max_year']
            ],
            'topGenres' => $genres
        ]
    ]);
}

/**
 * Add single movie
 */
function addMovie($pdo) {
    $data = getJsonBody();
    
    if (empty($data['title'])) {
        errorResponse('Title is required');
    }
    
    try {
        $pdo->beginTransaction();
        
        // Check if movie exists
        $stmt = $pdo->prepare("SELECT id FROM movies WHERE title = :title AND release_year = :year");
        $stmt->execute([
            'title' => $data['title'],
            'year' => $data['year'] ?? null
        ]);
        $existing = $stmt->fetch();
        
        if ($existing) {
            $movieId = $existing['id'];
        } else {
            // Insert movie
            $stmt = $pdo->prepare("
                INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, imdb_id, tmdb_id, runtime)
                VALUES (:title, :type, :genre, :description, :year, :rating, :imdb_id, :tmdb_id, :runtime)
            ");
            $stmt->execute([
                'title' => $data['title'],
                'type' => $data['type'] ?? 'movie',
                'genre' => $data['genre'] ?? null,
                'description' => $data['description'] ?? null,
                'year' => $data['year'] ?? null,
                'rating' => $data['rating'] ?? null,
                'imdb_id' => $data['imdbId'] ?? null,
                'tmdb_id' => $data['tmdbId'] ?? null,
                'runtime' => $data['runtime'] ?? null
            ]);
            $movieId = $pdo->lastInsertId();
        }
        
        // Add trailer if provided
        if (!empty($data['youtubeId']) || !empty($data['trailerUrl'])) {
            $youtubeId = $data['youtubeId'] ?? extractYouTubeId($data['trailerUrl']);
            if ($youtubeId) {
                // Check if trailer exists
                $stmt = $pdo->prepare("SELECT id FROM trailers WHERE movie_id = :movie_id AND youtube_id = :youtube_id");
                $stmt->execute(['movie_id' => $movieId, 'youtube_id' => $youtubeId]);
                if (!$stmt->fetch()) {
                    $stmt = $pdo->prepare("
                        INSERT INTO trailers (movie_id, youtube_id, title, priority, source)
                        VALUES (:movie_id, :youtube_id, :title, 1, :source)
                    ");
                    $stmt->execute([
                        'movie_id' => $movieId,
                        'youtube_id' => $youtubeId,
                        'title' => $data['title'] . ' - Trailer',
                        'source' => APP_SOURCE
                    ]);
                }
            }
        }
        
        // Add thumbnail if provided
        if (!empty($data['posterUrl'])) {
            $stmt = $pdo->prepare("SELECT id FROM thumbnails WHERE movie_id = :movie_id AND url = :url");
            $stmt->execute(['movie_id' => $movieId, 'url' => $data['posterUrl']]);
            if (!$stmt->fetch()) {
                $stmt = $pdo->prepare("
                    INSERT INTO thumbnails (movie_id, url, is_primary)
                    VALUES (:movie_id, :url, 1)
                ");
                $stmt->execute([
                    'movie_id' => $movieId,
                    'url' => $data['posterUrl']
                ]);
            }
        }
        
        $pdo->commit();
        
        jsonResponse([
            'success' => true,
            'message' => 'Movie added successfully',
            'id' => $movieId
        ]);
        
    } catch (Exception $e) {
        $pdo->rollBack();
        error_log("Add movie error: " . $e->getMessage());
        errorResponse('Failed to add movie: ' . $e->getMessage(), 500);
    }
}

/**
 * Bulk add movies (for syncing from frontend)
 */
function bulkAddMovies($pdo) {
    $data = getJsonBody();
    
    if (empty($data['movies']) || !is_array($data['movies'])) {
        errorResponse('Movies array required');
    }
    
    $movies = $data['movies'];
    $added = 0;
    $updated = 0;
    $errors = [];
    
    try {
        $pdo->beginTransaction();
        
        foreach ($movies as $movie) {
            if (empty($movie['title'])) continue;
            
            try {
                // Check if exists
                $stmt = $pdo->prepare("SELECT id FROM movies WHERE title = :title AND (release_year = :year OR release_year IS NULL)");
                $stmt->execute([
                    'title' => $movie['title'],
                    'year' => $movie['year'] ?? null
                ]);
                $existing = $stmt->fetch();
                
                if ($existing) {
                    $movieId = $existing['id'];
                    $updated++;
                } else {
                    // Insert
                    $stmt = $pdo->prepare("
                        INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, imdb_id, tmdb_id)
                        VALUES (:title, :type, :genre, :desc, :year, :rating, :imdb, :tmdb)
                    ");
                    $stmt->execute([
                        'title' => $movie['title'],
                        'type' => $movie['type'] ?? 'movie',
                        'genre' => $movie['genre'] ?? null,
                        'desc' => $movie['description'] ?? null,
                        'year' => $movie['year'] ?? null,
                        'rating' => $movie['rating'] ?? null,
                        'imdb' => $movie['imdbId'] ?? null,
                        'tmdb' => $movie['tmdbId'] ?? null
                    ]);
                    $movieId = $pdo->lastInsertId();
                    $added++;
                }
                
                // Add trailer
                $youtubeId = $movie['youtubeId'] ?? extractYouTubeId($movie['trailerUrl'] ?? '');
                if ($youtubeId) {
                    $stmt = $pdo->prepare("
                        INSERT IGNORE INTO trailers (movie_id, youtube_id, title, priority, source)
                        VALUES (:movie_id, :youtube_id, :title, 1, :source)
                    ");
                    $stmt->execute([
                        'movie_id' => $movieId,
                        'youtube_id' => $youtubeId,
                        'title' => $movie['title'] . ' - Trailer',
                        'source' => APP_SOURCE
                    ]);
                }
                
                // Add thumbnail
                if (!empty($movie['posterUrl'])) {
                    $stmt = $pdo->prepare("
                        INSERT IGNORE INTO thumbnails (movie_id, url, is_primary)
                        VALUES (:movie_id, :url, 1)
                    ");
                    $stmt->execute([
                        'movie_id' => $movieId,
                        'url' => $movie['posterUrl']
                    ]);
                }
                
            } catch (Exception $e) {
                $errors[] = $movie['title'] . ': ' . $e->getMessage();
            }
        }
        
        // Log sync
        $stmt = $pdo->prepare("
            INSERT INTO sync_log (sync_type, status, items_processed, error_message)
            VALUES ('bulk_add', :status, :items, :errors)
        ");
        $stmt->execute([
            'status' => empty($errors) ? 'success' : 'partial',
            'items' => $added + $updated,
            'errors' => empty($errors) ? null : implode('; ', array_slice($errors, 0, 5))
        ]);
        
        $pdo->commit();
        
        jsonResponse([
            'success' => true,
            'added' => $added,
            'updated' => $updated,
            'errors' => count($errors),
            'errorMessages' => array_slice($errors, 0, 5)
        ]);
        
    } catch (Exception $e) {
        $pdo->rollBack();
        errorResponse('Bulk add failed: ' . $e->getMessage(), 500);
    }
}

/**
 * Sync movies from frontend allMoviesData
 */
function syncMoviesFromFrontend($pdo) {
    $data = getJsonBody();
    
    if (empty($data['movies'])) {
        errorResponse('No movies to sync');
    }
    
    // Forward to bulk add
    $_POST = $data;
    bulkAddMovies($pdo);
}

/**
 * Extract YouTube video ID from URL
 */
function extractYouTubeId($url) {
    if (empty($url)) return null;
    
    // Already just an ID
    if (preg_match('/^[a-zA-Z0-9_-]{11}$/', $url)) {
        return $url;
    }
    
    // Standard YouTube URL patterns
    $patterns = [
        '/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/',
        '/youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/',
        '/youtu\.be\/([a-zA-Z0-9_-]{11})/',
        '/youtube\.com\/v\/([a-zA-Z0-9_-]{11})/'
    ];
    
    foreach ($patterns as $pattern) {
        if (preg_match($pattern, $url, $matches)) {
            return $matches[1];
        }
    }
    
    return null;
}
