<?php
/**
 * Google OAuth Callback Handler for MovieShows
 * Handles the OAuth code exchange and user login
 */

// Error reporting
error_reporting(E_ALL);
ini_set('display_errors', 0);

// Load Google OAuth Configuration
if (file_exists(dirname(__FILE__) . '/google_config.local.php')) {
    require_once dirname(__FILE__) . '/google_config.local.php';
} else {
    require_once dirname(__FILE__) . '/google_config.php';
}

// FavCreators Database Configuration (shared login system)
define('AUTH_DB_HOST', 'mysql.50webs.com');
define('AUTH_DB_NAME', 'ejaguiar1_favcreators');
define('AUTH_DB_USER', 'ejaguiar1_favcreators');
define('AUTH_DB_PASS', 'Solid-Kitten-92-Brave-Vessel');

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

// Get the authorization code from Google
$code = isset($_GET['code']) ? $_GET['code'] : null;
$state = isset($_GET['state']) ? $_GET['state'] : '/movieshows2/';
$error = isset($_GET['error']) ? $_GET['error'] : null;

// Handle errors
if ($error) {
    redirectWithError("Google login was cancelled or failed: " . htmlspecialchars($error));
    exit;
}

if (!$code) {
    redirectWithError("No authorization code received from Google");
    exit;
}

// Exchange the authorization code for tokens
$tokenUrl = 'https://oauth2.googleapis.com/token';
$tokenData = array(
    'code' => $code,
    'client_id' => GOOGLE_CLIENT_ID,
    'client_secret' => GOOGLE_CLIENT_SECRET,
    'redirect_uri' => GOOGLE_REDIRECT_URI,
    'grant_type' => 'authorization_code'
);

$ch = curl_init($tokenUrl);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($tokenData));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/x-www-form-urlencoded'));
// SSL options for older PHP/cURL
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);
$tokenResponse = curl_exec($ch);
$curlError = curl_error($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($curlError) {
    redirectWithError("Connection error: " . $curlError);
    exit;
}

if ($httpCode !== 200) {
    $errorMsg = "Token exchange failed (HTTP $httpCode)";
    $decoded = json_decode($tokenResponse, true);
    if ($decoded && isset($decoded['error_description'])) {
        $errorMsg .= ": " . $decoded['error_description'];
    } elseif ($decoded && isset($decoded['error'])) {
        $errorMsg .= ": " . $decoded['error'];
    }
    redirectWithError($errorMsg);
    exit;
}

$tokenResult = json_decode($tokenResponse, true);
$accessToken = isset($tokenResult['access_token']) ? $tokenResult['access_token'] : null;

if (!$accessToken) {
    redirectWithError("No access token received from Google");
    exit;
}

// Get user info from Google
$userInfoUrl = 'https://www.googleapis.com/oauth2/v2/userinfo';
$ch = curl_init($userInfoUrl);
curl_setopt($ch, CURLOPT_HTTPHEADER, array('Authorization: Bearer ' . $accessToken));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);
$userInfoResponse = curl_exec($ch);
curl_close($ch);

$userInfo = json_decode($userInfoResponse, true);

if (!$userInfo || !isset($userInfo['email'])) {
    redirectWithError("Failed to get user information from Google");
    exit;
}

// Save/update user in database
$dbUser = saveGoogleUserToDatabase($userInfo);

// Prepare user data for the frontend
$emailParts = explode('@', $userInfo['email']);
$userData = array(
    'id' => $dbUser ? 'user_' . $dbUser['id'] : 'google_' . (isset($userInfo['id']) ? $userInfo['id'] : substr(md5($userInfo['email']), 0, 12)),
    'email' => $userInfo['email'],
    'name' => isset($userInfo['name']) ? $userInfo['name'] : $emailParts[0],
    'picture' => isset($userInfo['picture']) ? $userInfo['picture'] : null,
    'loginMethod' => 'google',
    'verified' => isset($userInfo['verified_email']) ? $userInfo['verified_email'] : false,
    'isAdmin' => $dbUser ? (bool)$dbUser['is_admin'] : false,
    'createdAt' => $dbUser ? $dbUser['created_at'] : date('c')
);

// Encode user data for URL
$userDataJson = json_encode($userData);
$userDataEncoded = base64_encode($userDataJson);

// Redirect back to the app with user data
$redirectUrl = 'https://findtorontoevents.ca/movieshows2/?google_auth=' . urlencode($userDataEncoded);
header('Location: ' . $redirectUrl);
exit;

/**
 * Save or update Google user in database
 */
function saveGoogleUserToDatabase($googleUser) {
    $pdo = getAuthDb();
    if (!$pdo) {
        return null;
    }
    
    try {
        // Ensure users table exists
        $pdo->exec("CREATE TABLE IF NOT EXISTS users (
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
        )");
        
        $email = $googleUser['email'];
        $googleId = isset($googleUser['id']) ? $googleUser['id'] : null;
        $emailParts = explode('@', $email);
        $name = isset($googleUser['name']) ? $googleUser['name'] : $emailParts[0];
        $picture = isset($googleUser['picture']) ? $googleUser['picture'] : null;
        
        // Check if user exists
        $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ? OR google_id = ?");
        $stmt->execute(array($email, $googleId));
        $user = $stmt->fetch();
        
        if ($user) {
            // Update existing user
            $stmt = $pdo->prepare("UPDATE users SET google_id = ?, picture_url = ?, last_login = NOW() WHERE id = ?");
            $stmt->execute(array($googleId, $picture, $user['id']));
            
            // Refresh
            $stmt = $pdo->prepare("SELECT * FROM users WHERE id = ?");
            $stmt->execute(array($user['id']));
            return $stmt->fetch();
        } else {
            // Create new user
            $stmt = $pdo->prepare("INSERT INTO users (email, display_name, picture_url, login_method, google_id, last_login) VALUES (?, ?, ?, 'google', ?, NOW())");
            $stmt->execute(array($email, $name, $picture, $googleId));
            
            $stmt = $pdo->prepare("SELECT * FROM users WHERE id = ?");
            $stmt->execute(array($pdo->lastInsertId()));
            return $stmt->fetch();
        }
    } catch (PDOException $e) {
        error_log("Google user DB save failed: " . $e->getMessage());
        return null;
    }
}

/**
 * Redirect with error message
 */
function redirectWithError($message) {
    $errorEncoded = urlencode($message);
    header('Location: https://findtorontoevents.ca/movieshows2/?google_error=' . $errorEncoded);
    exit;
}
