<?php
/**
 * Google OAuth - Initiate Login
 * Redirects user to Google's OAuth consent screen
 */

// Load config
if (file_exists(dirname(__FILE__) . '/google_config.local.php')) {
    require_once dirname(__FILE__) . '/google_config.local.php';
} else {
    require_once dirname(__FILE__) . '/google_config.php';
}

// Build Google OAuth URL
$params = array(
    'client_id' => GOOGLE_CLIENT_ID,
    'redirect_uri' => GOOGLE_REDIRECT_URI,
    'response_type' => 'code',
    'scope' => 'openid email profile',
    'access_type' => 'online',
    'prompt' => 'select_account',
    'state' => '/movieshows2/'
);

$googleAuthUrl = 'https://accounts.google.com/o/oauth2/v2/auth?' . http_build_query($params);

// Redirect to Google
header('Location: ' . $googleAuthUrl);
exit;
