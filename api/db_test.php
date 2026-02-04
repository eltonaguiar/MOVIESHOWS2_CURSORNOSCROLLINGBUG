<?php
/**
 * Database Connection Test - FavCreators (Auth Database)
 */
header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 1);

// FavCreators database for user authentication
$host = 'mysql.50webs.com';
$dbname = 'ejaguiar1_favcreators';
$user = 'ejaguiar1_favcreators';
$pass = 'Solid-Kitten-92-Brave-Vessel';

$result = array(
    'host' => $host,
    'database' => $dbname,
    'user' => $user,
    'php_version' => phpversion()
);

// Try mysqli first (more common on old hosts)
if (function_exists('mysqli_connect')) {
    $mysqli = @mysqli_connect($host, $user, $pass, $dbname);
    if ($mysqli) {
        $result['mysqli_connected'] = true;
        $result['mysqli_message'] = 'Connection successful';
        
        // Try to list tables
        $tables_result = mysqli_query($mysqli, "SHOW TABLES");
        $tables = array();
        while ($row = mysqli_fetch_array($tables_result)) {
            $tables[] = $row[0];
        }
        $result['tables'] = $tables;
        mysqli_close($mysqli);
    } else {
        $result['mysqli_connected'] = false;
        $result['mysqli_error'] = mysqli_connect_error();
    }
}

// Also try PDO
if (class_exists('PDO')) {
    try {
        $dsn = "mysql:host=$host;dbname=$dbname;charset=utf8";
        $pdo = new PDO($dsn, $user, $pass, array(
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
        ));
        
        $result['pdo_connected'] = true;
        $result['pdo_message'] = 'Connection successful';
        
    } catch (PDOException $e) {
        $result['pdo_connected'] = false;
        $result['pdo_error'] = $e->getMessage();
        $result['pdo_error_code'] = $e->getCode();
    }
} else {
    $result['pdo_available'] = false;
}

echo json_encode($result);
