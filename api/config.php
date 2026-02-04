<?php
/**
 * MovieShows Database Configuration
 * Database shared with findtorontoevents.ca/movieshows2
 */

// Prevent direct access
if (!defined('MOVIESHOWS_API')) {
    header('HTTP/1.1 403 Forbidden');
    exit('Direct access forbidden');
}

// Database credentials
define('DB_HOST', 'mysql.50webs.com');  // 50webs MySQL server
define('DB_NAME', 'ejaguiar1_tvmoviestrailers');
define('DB_USER', 'ejaguiar1_tvmoviestrailers'); // Username = database name on 50webs
define('DB_PASS', 'virus2016');

// App identifier to avoid conflicts with shared database
define('APP_SOURCE', 'movieshows2');

// CORS settings
$GLOBALS['ALLOWED_ORIGINS'] = array(
    'http://localhost',
    'http://localhost:3000',
    'http://127.0.0.1',
    'https://eltonaguiar.github.io',
    'https://findtorontoevents.ca'
);

/**
 * Get database connection
 */
function getDbConnection() {
    static $pdo = null;
    
    if ($pdo === null) {
        try {
            $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4";
            $options = array(
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false
            );
            $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
            $pdo->exec("SET NAMES utf8mb4");
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
    $origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
    
    // Check if origin is allowed
    $allowed = false;
    foreach ($GLOBALS['ALLOWED_ORIGINS'] as $allowedOrigin) {
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
        header('HTTP/1.1 204 No Content');
        exit();
    }
}

/**
 * Send JSON response
 */
function jsonResponse($data, $statusCode = 200) {
    $statusMessages = array(
        200 => 'OK',
        201 => 'Created',
        204 => 'No Content',
        400 => 'Bad Request',
        401 => 'Unauthorized',
        403 => 'Forbidden',
        404 => 'Not Found',
        500 => 'Internal Server Error'
    );
    $msg = isset($statusMessages[$statusCode]) ? $statusMessages[$statusCode] : 'Unknown';
    header("HTTP/1.1 $statusCode $msg");
    echo json_encode($data);
    exit();
}

/**
 * Send error response
 */
function errorResponse($message, $statusCode = 400) {
    jsonResponse(array('error' => true, 'message' => $message), $statusCode);
}

/**
 * Get request body as JSON
 */
function getJsonBody() {
    $body = file_get_contents('php://input');
    $decoded = json_decode($body, true);
    return $decoded ? $decoded : array();
}

/**
 * Generate unique user ID (stored in cookie/localStorage)
 */
function generateUserId() {
    return 'user_' . md5(uniqid(mt_rand(), true));
}

/**
 * Get or create user ID from request
 */
function getUserId() {
    $headers = function_exists('getallheaders') ? getallheaders() : array();
    $userId = isset($headers['X-User-Id']) ? $headers['X-User-Id'] : (isset($_GET['user_id']) ? $_GET['user_id'] : null);
    
    if (!$userId) {
        // Generate new user ID
        $userId = generateUserId();
    }
    
    return $userId;
}
