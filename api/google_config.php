<?php
/**
 * Google OAuth Configuration
 * This file should NOT be committed to version control
 * Copy this to google_config.local.php and fill in your credentials
 */

// Google OAuth Credentials - FILL IN YOUR OWN
define('GOOGLE_CLIENT_ID', getenv('GOOGLE_CLIENT_ID') ?: '');
define('GOOGLE_CLIENT_SECRET', getenv('GOOGLE_CLIENT_SECRET') ?: '');
define('GOOGLE_REDIRECT_URI', 'https://findtorontoevents.ca/movieshows2/api/google_callback.php');
