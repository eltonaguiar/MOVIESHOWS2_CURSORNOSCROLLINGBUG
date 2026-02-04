<?php
/**
 * Google OAuth Configuration
 * This file should NOT be committed to version control
 * Copy this to google_config.local.php and fill in your credentials
 */

// Google OAuth Credentials - FILL IN YOUR OWN
$envClientId = getenv('GOOGLE_CLIENT_ID');
$envClientSecret = getenv('GOOGLE_CLIENT_SECRET');
define('GOOGLE_CLIENT_ID', $envClientId ? $envClientId : '');
define('GOOGLE_CLIENT_SECRET', $envClientSecret ? $envClientSecret : '');
define('GOOGLE_REDIRECT_URI', 'https://findtorontoevents.ca/movieshows2/api/google_callback.php');
