# MovieShows3 Deployment Package Creator
# Run this script to create a ZIP file ready for upload to findtorontoevents.ca/movieshows3

$sourcePath = $PSScriptRoot
$deployPath = Join-Path $sourcePath "deploy-movieshows3"
$zipPath = Join-Path $sourcePath "movieshows3-deploy.zip"

Write-Host "Creating MovieShows3 deployment package..." -ForegroundColor Cyan

# Remove old deploy folder and zip if they exist
if (Test-Path $deployPath) { Remove-Item $deployPath -Recurse -Force }
if (Test-Path $zipPath) { Remove-Item $zipPath -Force }

# Create deploy folder
New-Item -ItemType Directory -Path $deployPath -Force | Out-Null

# Root files to copy
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
    "_not-found.html",
    "file.svg",
    "globe.svg",
    "next.svg",
    "vercel.svg",
    "window.svg"
)

Write-Host "Copying root files..." -ForegroundColor Yellow
foreach ($file in $rootFiles) {
    $src = Join-Path $sourcePath $file
    if (Test-Path $src) {
        Copy-Item $src -Destination $deployPath
        Write-Host "  + $file" -ForegroundColor Green
    } else {
        Write-Host "  - $file (not found)" -ForegroundColor Red
    }
}

# Copy API folder
Write-Host "Copying API folder..." -ForegroundColor Yellow
$apiDest = Join-Path $deployPath "api"
New-Item -ItemType Directory -Path $apiDest -Force | Out-Null

$apiFiles = @(
    "api/.htaccess",
    "api/config.php",
    "api/movies.php",
    "api/user.php",
    "api/playlists.php",
    "api/complete_schema.sql",
    "api/schema_additions.sql"
)

foreach ($file in $apiFiles) {
    $src = Join-Path $sourcePath $file
    if (Test-Path $src) {
        Copy-Item $src -Destination $apiDest
        Write-Host "  + $file" -ForegroundColor Green
    }
}

# Copy _next folder (static assets)
Write-Host "Copying _next static assets..." -ForegroundColor Yellow
$nextSrc = Join-Path $sourcePath "_next"
$nextDest = Join-Path $deployPath "_next"
if (Test-Path $nextSrc) {
    Copy-Item $nextSrc -Destination $nextDest -Recurse
    Write-Host "  + _next folder copied" -ForegroundColor Green
} else {
    Write-Host "  - _next folder not found" -ForegroundColor Red
}

# Create ZIP
Write-Host "Creating ZIP archive..." -ForegroundColor Yellow
Compress-Archive -Path "$deployPath\*" -DestinationPath $zipPath -Force

# Get file count and size
$fileCount = (Get-ChildItem -Path $deployPath -Recurse -File).Count
$zipSize = [math]::Round((Get-Item $zipPath).Length / 1MB, 2)

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Deployment package created successfully!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Files included: $fileCount"
Write-Host "ZIP location: $zipPath"
Write-Host "ZIP size: ${zipSize} MB"
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Upload ZIP contents to: findtorontoevents.ca/movieshows3/"
Write-Host "2. Run api/complete_schema.sql in phpMyAdmin"
Write-Host "3. Test: https://findtorontoevents.ca/movieshows3/"
Write-Host ""

# Cleanup deploy folder (keep only ZIP)
Remove-Item $deployPath -Recurse -Force

Write-Host "Temporary deploy folder cleaned up." -ForegroundColor Gray
