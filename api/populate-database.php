<?php
/**
 * MovieShows Database Population Script
 * Adds movies from movies-database.json to the MySQL database
 * - SAFE: Only adds data, never deletes
 * - Prevents duplicates based on trailer_url
 * - Compatible with PHP 5.4+
 */

// Security: Only allow from specific referrers or with secret key
$secretKey = isset($_GET['key']) ? $_GET['key'] : '';
if ($secretKey !== 'movieshows2026populate') {
    http_response_code(403);
    die('Access denied. Use ?key=movieshows2026populate');
}

header('Content-Type: text/plain; charset=utf-8');
echo "=== MovieShows Database Population ===\n\n";

// Database connection - use localhost since running on same server
$host = 'localhost';
$dbname = 'ejaguiar1_tvmoviestrailers';
$username = 'ejaguiar1_tvmoviestrailers';  // Try database name as username
$password = 'virus2016';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    echo "✓ Database connection successful\n\n";
} catch (PDOException $e) {
    die("✗ Database connection failed: " . $e->getMessage() . "\n");
}

// Step 1: Add columns if they don't exist
echo "--- STEP 1: Adding columns if needed ---\n";

$columnsToAdd = array(
    'poster_url' => 'VARCHAR(500) DEFAULT NULL',
    'trailer_url' => 'VARCHAR(500) DEFAULT NULL',
    'source' => 'VARCHAR(100) DEFAULT NULL'
);

foreach ($columnsToAdd as $column => $definition) {
    try {
        // Check if column exists
        $stmt = $pdo->prepare("SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'movies' AND COLUMN_NAME = ?");
        $stmt->execute(array($dbname, $column));
        $exists = $stmt->fetchColumn() > 0;
        
        if (!$exists) {
            $pdo->exec("ALTER TABLE movies ADD COLUMN $column $definition");
            echo "✓ Added column: $column\n";
        } else {
            echo "- Column already exists: $column\n";
        }
    } catch (PDOException $e) {
        echo "✗ Error with column $column: " . $e->getMessage() . "\n";
    }
}

// Add index on trailer_url if not exists
try {
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
        WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'movies' AND INDEX_NAME = 'idx_trailer_url'");
    $stmt->execute(array($dbname));
    $indexExists = $stmt->fetchColumn() > 0;
    
    if (!$indexExists) {
        $pdo->exec("ALTER TABLE movies ADD INDEX idx_trailer_url (trailer_url(255))");
        echo "✓ Added index: idx_trailer_url\n";
    } else {
        echo "- Index already exists: idx_trailer_url\n";
    }
} catch (PDOException $e) {
    echo "✗ Error with index: " . $e->getMessage() . "\n";
}

echo "\n";

// Step 2: Load and insert movies
echo "--- STEP 2: Inserting movies ---\n";

// Load movies from JSON file
$jsonPath = dirname(__DIR__) . '/movies-database.json';
if (!file_exists($jsonPath)) {
    // Try alternate paths
    $jsonPath = __DIR__ . '/movies-database.json';
}
if (!file_exists($jsonPath)) {
    $jsonPath = $_SERVER['DOCUMENT_ROOT'] . '/movieshows2/movies-database.json';
}

if (!file_exists($jsonPath)) {
    die("✗ movies-database.json not found at $jsonPath\n");
}

$jsonData = json_decode(file_get_contents($jsonPath), true);
$movies = isset($jsonData['items']) ? $jsonData['items'] : array();

echo "Found " . count($movies) . " movies in JSON file\n\n";

// Prepare insert statement
$insertSql = "INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT ?, ?, ?, ?, ?, ?, ?, ?, ?
WHERE NOT EXISTS (SELECT 1 FROM movies WHERE trailer_url = ?)";

$insertStmt = $pdo->prepare($insertSql);

$inserted = 0;
$skipped = 0;
$errors = 0;

foreach ($movies as $idx => $movie) {
    // Skip movies without trailer URLs
    if (empty($movie['trailerUrl'])) {
        $skipped++;
        continue;
    }
    
    $title = isset($movie['title']) ? $movie['title'] : 'Unknown';
    $type = (isset($movie['type']) && $movie['type'] === 'tv') ? 'tv' : 'movie';
    
    // Handle genres (can be array or string)
    $genre = null;
    if (isset($movie['genres']) && is_array($movie['genres'])) {
        $genre = implode(', ', $movie['genres']);
    } elseif (isset($movie['genre'])) {
        $genre = $movie['genre'];
    }
    
    $description = isset($movie['description']) ? $movie['description'] : null;
    $releaseYear = !empty($movie['year']) ? intval($movie['year']) : null;
    $imdbRating = (!empty($movie['rating']) && $movie['rating'] !== 'TBD') ? floatval($movie['rating']) : null;
    $posterUrl = isset($movie['posterUrl']) ? $movie['posterUrl'] : null;
    $trailerUrl = $movie['trailerUrl'];
    $source = isset($movie['source']) ? $movie['source'] : null;
    
    try {
        $insertStmt->execute(array(
            $title, $type, $genre, $description, $releaseYear, $imdbRating,
            $posterUrl, $trailerUrl, $source, $trailerUrl
        ));
        
        if ($insertStmt->rowCount() > 0) {
            $inserted++;
            if ($inserted <= 10 || $inserted % 50 === 0) {
                echo "✓ Inserted: $title\n";
            }
        } else {
            // Movie already exists (trailer_url match)
            $skipped++;
        }
    } catch (PDOException $e) {
        $errors++;
        echo "✗ Error inserting '$title': " . $e->getMessage() . "\n";
    }
}

echo "\n";
echo "=== SUMMARY ===\n";
echo "Inserted: $inserted\n";
echo "Skipped (duplicate or no trailer): $skipped\n";
echo "Errors: $errors\n";

// Show total count
$countStmt = $pdo->query("SELECT COUNT(*) FROM movies");
$totalCount = $countStmt->fetchColumn();
echo "\nTotal movies in database: $totalCount\n";

echo "\n=== DONE ===\n";
?>
