<?php
/**
 * MovieShows Database Configuration
 * Database shared with findtorontoevents.ca/movieshows2
 */

// Prevent direct access
if (!defined('MOVIESHOWS_API')) {
    http_response_code(403);
    exit('Direct access forbidden');
}

// Database credentials
define('DB_HOST', 'localhost');  // Use localhost when running on server
define('DB_NAME', 'ejaguiar1_tvmoviestrailers');
define('DB_USER', 'ejaguiar1_tvmoviestrailers'); // Username = database name on 50webs
define('DB_PASS', 'virus2016');

// App identifier to avoid conflicts with shared database
define('APP_SOURCE', 'movieshows3'); // Unique identifier for this app instance (movieshows3 deployment)

// CORS settings
define('ALLOWED_ORIGINS', [
    'http://localhost',
    'http://localhost:3000',
    'http://127.0.0.1',
    'https://eltonaguiar.github.io',
    'https://findtorontoevents.ca'
]);

/**
 * Get database connection
 */
function getDbConnection() {
    static $pdo = null;
    
    if ($pdo === null) {
        try {
            $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4";
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
                PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4"
            ];
            $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        } catch (PDOException $e) {
            error_log("Database connection failed: " . $e->getMessage());
            return null;
        }
    }
    
    return $pdo;
}

/**
 * Set CORS headers
 */
function setCorsHeaders() {
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    
    // Check if origin is allowed
    $allowed = false;
    foreach (ALLOWED_ORIGINS as $allowedOrigin) {
        if (strpos($origin, $allowedOrigin) !== false || $origin === $allowedOrigin) {
            $allowed = true;
            break;
        }
    }
    
    if ($allowed) {
        header("Access-Control-Allow-Origin: $origin");
    } else {
        header("Access-Control-Allow-Origin: *");
    }
    
    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
    header("Access-Control-Max-Age: 86400");
    header("Content-Type: application/json; charset=utf-8");
    
    // Handle preflight
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(204);
        exit();
    }
}

/**
 * Send JSON response
 */
function jsonResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit();
}

/**
 * Send error response
 */
function errorResponse($message, $statusCode = 400) {
    jsonResponse(['error' => true, 'message' => $message], $statusCode);
}

/**
 * Get request body as JSON
 */
function getJsonBody() {
    $body = file_get_contents('php://input');
    return json_decode($body, true) ?? [];
}

/**
 * Generate unique user ID (stored in cookie/localStorage)
 */
function generateUserId() {
    return 'user_' . bin2hex(random_bytes(16));
}

/**
 * Get or create user ID from request
 */
function getUserId() {
    $headers = getallheaders();
    $userId = $headers['X-User-Id'] ?? $_GET['user_id'] ?? null;
    
    if (!$userId) {
        // Generate new user ID
        $userId = generateUserId();
    }
    
    return $userId;
}
