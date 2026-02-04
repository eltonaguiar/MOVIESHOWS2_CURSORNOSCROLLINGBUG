# FTP Deployment Script for MovieShows3
$ftpServer = "ftps2.50webs.com"
$ftpUser = $env:FTP_USER
$ftpPass = $env:FTP_PASS
$remotePath = "findtorontoevents.ca/movieshows3"

Write-Host "Deploying to $ftpServer/$remotePath..." -ForegroundColor Cyan

# Files to upload (root level)
$rootFiles = @(
    "index.html",
    "app.js", 
    "script.js",
    "scroll-fix.js",
    "styles.css",
    "db-connector.js",
    "features.js",
    "features-batch2.js",
    "features-batch3.js",
    "features-batch4.js",
    "features-batch5.js",
    "features-batch6.js",
    "features-batch7.js",
    "features-batch8.js",
    "features-batch9.js",
    "features-batch10.js",
    "movies-database.json",
    "favicon.ico",
    ".nojekyll",
    "404.html",
    "_not-found.html"
)

# Create directories first
Write-Host "Creating directories..." -ForegroundColor Yellow
curl.exe --ssl-reqd -k -u "${ftpUser}:${ftpPass}" "ftp://${ftpServer}/" -Q "MKD $remotePath" 2>$null
curl.exe --ssl-reqd -k -u "${ftpUser}:${ftpPass}" "ftp://${ftpServer}/" -Q "MKD $remotePath/api" 2>$null
curl.exe --ssl-reqd -k -u "${ftpUser}:${ftpPass}" "ftp://${ftpServer}/" -Q "MKD $remotePath/_next" 2>$null
curl.exe --ssl-reqd -k -u "${ftpUser}:${ftpPass}" "ftp://${ftpServer}/" -Q "MKD $remotePath/_next/static" 2>$null
curl.exe --ssl-reqd -k -u "${ftpUser}:${ftpPass}" "ftp://${ftpServer}/" -Q "MKD $remotePath/_next/static/chunks" 2>$null
curl.exe --ssl-reqd -k -u "${ftpUser}:${ftpPass}" "ftp://${ftpServer}/" -Q "MKD $remotePath/_next/static/media" 2>$null

# Upload root files
Write-Host "`nUploading root files..." -ForegroundColor Yellow
foreach ($file in $rootFiles) {
    if (Test-Path $file) {
        Write-Host "  + $file" -ForegroundColor Green
        curl.exe --ssl-reqd -k -u "${ftpUser}:${ftpPass}" -T $file "ftp://${ftpServer}/$remotePath/$file" 2>$null
    }
}

# Upload API files
Write-Host "`nUploading API files..." -ForegroundColor Yellow
$apiFiles = Get-ChildItem -Path "api" -File -ErrorAction SilentlyContinue
foreach ($file in $apiFiles) {
    Write-Host "  + api/$($file.Name)" -ForegroundColor Green
    curl.exe --ssl-reqd -k -u "${ftpUser}:${ftpPass}" -T "api/$($file.Name)" "ftp://${ftpServer}/$remotePath/api/$($file.Name)" 2>$null
}

# Upload _next static chunks
Write-Host "`nUploading _next/static/chunks..." -ForegroundColor Yellow
$chunkFiles = Get-ChildItem -Path "_next/static/chunks" -File -ErrorAction SilentlyContinue
foreach ($file in $chunkFiles) {
    Write-Host "  + _next/static/chunks/$($file.Name)" -ForegroundColor Green
    curl.exe --ssl-reqd -k -u "${ftpUser}:${ftpPass}" -T "_next/static/chunks/$($file.Name)" "ftp://${ftpServer}/$remotePath/_next/static/chunks/$($file.Name)" 2>$null
}

# Upload _next static media
Write-Host "`nUploading _next/static/media..." -ForegroundColor Yellow
$mediaFiles = Get-ChildItem -Path "_next/static/media" -File -ErrorAction SilentlyContinue
foreach ($file in $mediaFiles) {
    Write-Host "  + _next/static/media/$($file.Name)" -ForegroundColor Green
    curl.exe --ssl-reqd -k -u "${ftpUser}:${ftpPass}" -T "_next/static/media/$($file.Name)" "ftp://${ftpServer}/$remotePath/_next/static/media/$($file.Name)" 2>$null
}

# Upload SVG files
Write-Host "`nUploading SVG assets..." -ForegroundColor Yellow
$svgFiles = @("file.svg", "globe.svg", "next.svg", "vercel.svg", "window.svg")
foreach ($svg in $svgFiles) {
    if (Test-Path $svg) {
        Write-Host "  + $svg" -ForegroundColor Green
        curl.exe --ssl-reqd -k -u "${ftpUser}:${ftpPass}" -T $svg "ftp://${ftpServer}/$remotePath/$svg" 2>$null
    }
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Deployment complete!" -ForegroundColor Green
Write-Host "URL: https://findtorontoevents.ca/movieshows3/" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan
