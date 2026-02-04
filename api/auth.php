<?php
/**
 * MovieShows Authentication API
 * Handles user login, registration, and authentication
 * Uses shared FavCreators database for cross-app authentication
 */

// FavCreators Database Configuration (shared login system)
define('AUTH_DB_HOST', 'mysql.50webs.com');
define('AUTH_DB_NAME', 'ejaguiar1_favcreators');
define('AUTH_DB_USER', 'ejaguiar1_favcreators');
define('AUTH_DB_PASS', 'Solid-Kitten-92-Brave-Vessel');

// Set CORS headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=utf-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit();
}

/**
 * Get auth database connection
 */
function getAuthDb() {
    static $pdo = null;
    if ($pdo === null) {
        try {
            $dsn = "mysql:host=" . AUTH_DB_HOST . ";dbname=" . AUTH_DB_NAME . ";charset=utf8";
            $pdo = new PDO($dsn, AUTH_DB_USER, AUTH_DB_PASS, array(
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
            ));
        } catch (PDOException $e) {
            error_log("Auth DB connection failed: " . $e->getMessage());
            return null;
        }
    }
    return $pdo;
}

/**
 * Send JSON response
 */
function jsonResponse($data, $statusCode = 200) {
    $codes = array(200 => 'OK', 400 => 'Bad Request', 401 => 'Unauthorized', 500 => 'Server Error');
    $msg = isset($codes[$statusCode]) ? $codes[$statusCode] : 'Unknown';
    header("HTTP/1.1 $statusCode $msg");
    echo json_encode($data);
    exit();
}

/**
 * Ensure users table exists
 */
function ensureUsersTable() {
    $pdo = getAuthDb();
    if (!$pdo) return false;
    
    $sql = "CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) UNIQUE,
        password_hash VARCHAR(255),
        display_name VARCHAR(100),
        picture_url VARCHAR(500),
        login_method VARCHAR(50) DEFAULT 'email',
        google_id VARCHAR(100),
        is_admin TINYINT(1) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP NULL,
        app_source VARCHAR(50) DEFAULT 'shared'
    )";
    
    try {
        $pdo->exec($sql);
        
        // Create admin user if not exists (uses same password as hardcoded check)
        $stmt = $pdo->prepare("SELECT id FROM users WHERE email = 'admin'");
        $stmt->execute();
        if (!$stmt->fetch()) {
            $adminHash = password_hash('GetLost2016!', PASSWORD_DEFAULT);
            $stmt = $pdo->prepare("INSERT INTO users (email, password_hash, display_name, is_admin) VALUES ('admin', ?, 'Administrator', 1)");
            $stmt->execute(array($adminHash));
        }
        
        return true;
    } catch (PDOException $e) {
        error_log("Table creation failed: " . $e->getMessage());
        return false;
    }
}

/**
 * Login with email/password
 */
function loginWithEmail($email, $password) {
    // Hardcoded admin credentials (server-side only, not visible to users)
    // This works even when database is unavailable
    define('ADMIN_USER', 'admin');
    define('ADMIN_PASS', 'GetLost2016!');
    
    if ($email === ADMIN_USER && $password === ADMIN_PASS) {
        return array(
            'success' => true,
            'user' => array(
                'id' => 'admin_001',
                'email' => 'admin',
                'name' => 'Administrator',
                'picture' => null,
                'loginMethod' => 'admin',
                'isAdmin' => true,
                'createdAt' => date('c')
            )
        );
    }
    
    // For non-admin users, require database
    $pdo = getAuthDb();
    if (!$pdo) {
        return array('success' => false, 'error' => 'Login service temporarily unavailable');
    }
    
    ensureUsersTable();
    
    // Regular email login
    $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ? AND login_method = 'email'");
    $stmt->execute(array($email));
    $user = $stmt->fetch();
    
    if (!$user) {
        return array('success' => false, 'error' => 'Invalid credentials');
    }
    
    if (!password_verify($password, $user['password_hash'])) {
        return array('success' => false, 'error' => 'Invalid credentials');
    }
    
    updateLastLogin($user['id']);
    
    return array(
        'success' => true,
        'user' => formatUserResponse($user)
    );
}

/**
 * Register new user
 */
function registerUser($email, $password, $displayName) {
    $pdo = getAuthDb();
    if (!$pdo) {
        return array('success' => false, 'error' => 'Registration service temporarily unavailable');
    }
    
    ensureUsersTable();
    
    // Validate email
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        return array('success' => false, 'error' => 'Invalid email address');
    }
    
    // Validate password strength
    if (strlen($password) < 6) {
        return array('success' => false, 'error' => 'Password must be at least 6 characters');
    }
    
    // Check if user exists
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute(array($email));
    if ($stmt->fetch()) {
        return array('success' => false, 'error' => 'Email already registered');
    }
    
    // Create user
    $passwordHash = password_hash($password, PASSWORD_DEFAULT);
    $emailParts = explode('@', $email);
    $nameToUse = $displayName ? $displayName : $emailParts[0];
    $stmt = $pdo->prepare("INSERT INTO users (email, password_hash, display_name, login_method) VALUES (?, ?, ?, 'email')");
    
    try {
        $stmt->execute(array($email, $passwordHash, $nameToUse));
        $userId = $pdo->lastInsertId();
        
        // Fetch the created user
        $stmt = $pdo->prepare("SELECT * FROM users WHERE id = ?");
        $stmt->execute(array($userId));
        $user = $stmt->fetch();
        
        return array(
            'success' => true,
            'user' => formatUserResponse($user)
        );
    } catch (PDOException $e) {
        return array('success' => false, 'error' => 'Registration failed');
    }
}

/**
 * Login or register with Google
 */
function loginWithGoogle($googleData) {
    $pdo = getAuthDb();
    if (!$pdo) {
        return array('success' => false, 'error' => 'Login service temporarily unavailable');
    }
    
    ensureUsersTable();
    
    $email = isset($googleData['email']) ? $googleData['email'] : null;
    $googleId = isset($googleData['id']) ? $googleData['id'] : null;
    $name = isset($googleData['name']) ? $googleData['name'] : '';
    $picture = isset($googleData['picture']) ? $googleData['picture'] : '';
    
    if (!$email) {
        return array('success' => false, 'error' => 'Email required');
    }
    
    // Check if user exists by Google ID or email
    $stmt = $pdo->prepare("SELECT * FROM users WHERE google_id = ? OR email = ?");
    $stmt->execute(array($googleId, $email));
    $user = $stmt->fetch();
    
    if ($user) {
        // Update existing user with Google info
        $stmt = $pdo->prepare("UPDATE users SET google_id = ?, picture_url = ?, last_login = NOW() WHERE id = ?");
        $stmt->execute(array($googleId, $picture, $user['id']));
        
        // Refresh user data
        $stmt = $pdo->prepare("SELECT * FROM users WHERE id = ?");
        $stmt->execute(array($user['id']));
        $user = $stmt->fetch();
    } else {
        // Create new user
        $stmt = $pdo->prepare("INSERT INTO users (email, display_name, picture_url, login_method, google_id) VALUES (?, ?, ?, 'google', ?)");
        $stmt->execute(array($email, $name, $picture, $googleId));
        
        $stmt = $pdo->prepare("SELECT * FROM users WHERE id = ?");
        $stmt->execute(array($pdo->lastInsertId()));
        $user = $stmt->fetch();
    }
    
    return array(
        'success' => true,
        'user' => formatUserResponse($user)
    );
}

/**
 * Update last login timestamp
 */
function updateLastLogin($userId) {
    $pdo = getAuthDb();
    if ($pdo) {
        $stmt = $pdo->prepare("UPDATE users SET last_login = NOW() WHERE id = ?");
        $stmt->execute(array($userId));
    }
}

/**
 * Format user response (remove sensitive data)
 */
function formatUserResponse($user) {
    $emailParts = explode('@', $user['email']);
    $defaultName = isset($emailParts[0]) ? $emailParts[0] : 'User';
    
    return array(
        'id' => 'user_' . $user['id'],
        'email' => $user['email'],
        'name' => $user['display_name'] ? $user['display_name'] : $defaultName,
        'picture' => $user['picture_url'],
        'loginMethod' => $user['login_method'],
        'isAdmin' => (bool)$user['is_admin'],
        'createdAt' => $user['created_at']
    );
}

// Handle requests
$action = isset($_GET['action']) ? $_GET['action'] : (isset($_POST['action']) ? $_POST['action'] : '');
$input = json_decode(file_get_contents('php://input'), true);
if (!$input) $input = array();

switch ($action) {
    case 'login':
        $email = isset($input['email']) ? $input['email'] : (isset($_POST['email']) ? $_POST['email'] : '');
        $password = isset($input['password']) ? $input['password'] : (isset($_POST['password']) ? $_POST['password'] : '');
        jsonResponse(loginWithEmail($email, $password));
        break;
        
    case 'register':
        $email = isset($input['email']) ? $input['email'] : (isset($_POST['email']) ? $_POST['email'] : '');
        $password = isset($input['password']) ? $input['password'] : (isset($_POST['password']) ? $_POST['password'] : '');
        $displayName = isset($input['displayName']) ? $input['displayName'] : (isset($_POST['displayName']) ? $_POST['displayName'] : '');
        jsonResponse(registerUser($email, $password, $displayName));
        break;
        
    case 'google':
        jsonResponse(loginWithGoogle($input));
        break;
        
    case 'check':
        // Check if database is accessible
        $pdo = getAuthDb();
        if ($pdo) {
            ensureUsersTable();
            jsonResponse(array('success' => true, 'message' => 'Auth database connected', 'database' => AUTH_DB_NAME));
        } else {
            jsonResponse(array('success' => false, 'error' => 'Auth database unavailable'));
        }
        break;
        
    default:
        jsonResponse(array('error' => 'Invalid action', 'actions' => array('login', 'register', 'google', 'check')));
}
