<?php
/**
 * Google OAuth Callback Handler for MovieShows
 * Handles the OAuth code exchange and user login
 */

// Error reporting for debugging (remove in production)
error_reporting(E_ALL);
ini_set('display_errors', 0);

// Load Google OAuth Configuration
// Try local config first (not in git), then fall back to template
if (file_exists(__DIR__ . '/google_config.local.php')) {
    require_once __DIR__ . '/google_config.local.php';
} else {
    require_once __DIR__ . '/google_config.php';
}

// Get the authorization code from Google
$code = $_GET['code'] ?? null;
$state = $_GET['state'] ?? '/movieshows2/';
$error = $_GET['error'] ?? null;

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
$tokenData = [
    'code' => $code,
    'client_id' => GOOGLE_CLIENT_ID,
    'client_secret' => GOOGLE_CLIENT_SECRET,
    'redirect_uri' => GOOGLE_REDIRECT_URI,
    'grant_type' => 'authorization_code'
];

$ch = curl_init($tokenUrl);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($tokenData));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/x-www-form-urlencoded']);
$tokenResponse = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode !== 200) {
    redirectWithError("Failed to exchange authorization code");
    exit;
}

$tokenResult = json_decode($tokenResponse, true);
$accessToken = $tokenResult['access_token'] ?? null;

if (!$accessToken) {
    redirectWithError("No access token received from Google");
    exit;
}

// Get user info from Google
$userInfoUrl = 'https://www.googleapis.com/oauth2/v2/userinfo';
$ch = curl_init($userInfoUrl);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Authorization: Bearer ' . $accessToken]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$userInfoResponse = curl_exec($ch);
curl_close($ch);

$userInfo = json_decode($userInfoResponse, true);

if (!$userInfo || !isset($userInfo['email'])) {
    redirectWithError("Failed to get user information from Google");
    exit;
}

// Prepare user data for the frontend
$userData = [
    'id' => 'google_' . ($userInfo['id'] ?? substr(md5($userInfo['email']), 0, 12)),
    'email' => $userInfo['email'],
    'name' => $userInfo['name'] ?? explode('@', $userInfo['email'])[0],
    'picture' => $userInfo['picture'] ?? null,
    'loginMethod' => 'google',
    'verified' => $userInfo['verified_email'] ?? false,
    'createdAt' => date('c')
];

// Encode user data for URL
$userDataJson = json_encode($userData);
$userDataEncoded = base64_encode($userDataJson);

// Redirect back to the app with user data
$redirectUrl = 'https://findtorontoevents.ca/movieshows2/?google_auth=' . urlencode($userDataEncoded);
header('Location: ' . $redirectUrl);
exit;

/**
 * Redirect with error message
 */
function redirectWithError($message) {
    $errorEncoded = urlencode($message);
    header('Location: https://findtorontoevents.ca/movieshows2/?google_error=' . $errorEncoded);
    exit;
}
