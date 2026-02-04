<?php
/**
 * Google OAuth - Initiate Login
 * Redirects user to Google's OAuth consent screen
 */

// Google OAuth Configuration
// Replace with your actual Google Cloud Console credentials
define('GOOGLE_CLIENT_ID', ''); // Will be set from query param or env
define('GOOGLE_REDIRECT_URI', 'https://findtorontoevents.ca/movieshows2/api/google_callback.php');

// Get client ID from query or use default
$clientId = $_GET['client_id'] ?? getenv('GOOGLE_CLIENT_ID') ?? '';

if (empty($clientId)) {
    // Return error page if no client ID
    header('Content-Type: text/html');
    echo '<!DOCTYPE html><html><head><title>Configuration Error</title></head><body>';
    echo '<h1>Google OAuth not configured</h1>';
    echo '<p>Please set up Google OAuth credentials in the admin panel.</p>';
    echo '<script>setTimeout(function() { window.close(); }, 3000);</script>';
    echo '</body></html>';
    exit;
}

// Build Google OAuth URL
$params = [
    'client_id' => $clientId,
    'redirect_uri' => GOOGLE_REDIRECT_URI,
    'response_type' => 'code',
    'scope' => 'openid email profile',
    'access_type' => 'online',
    'prompt' => 'select_account',
    'state' => bin2hex(random_bytes(16)) // CSRF protection
];

// Store state in session for verification
session_start();
$_SESSION['oauth_state'] = $params['state'];

$googleAuthUrl = 'https://accounts.google.com/o/oauth2/v2/auth?' . http_build_query($params);

// Redirect to Google
header('Location: ' . $googleAuthUrl);
exit;
