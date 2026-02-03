# MovieShows3 Deployment Guide

## Deployment Target
**URL:** https://findtorontoevents.ca/movieshows3/

## Database Configuration
- **Host:** mysql.50webs.com
- **Database:** ejaguiar1_tvmoviestrailers
- **User:** ejaguiar1_tvmovie (standard 50webs format)
- **Password:** virus2016

## Files to Upload

### Root Files (upload to /movieshows3/)
```
index.html
app.js
script.js
scroll-fix.js
styles.css
db-connector.js
features.js
features-batch2.js
features-batch3.js
features-batch4.js
features-batch5.js
features-batch6.js
features-batch7.js
features-batch8.js
movies-database.json
favicon.ico
.nojekyll
404.html
_not-found.html
```

### API Folder (upload to /movieshows3/api/)
```
api/.htaccess
api/config.php
api/movies.php
api/user.php
api/playlists.php
```

### Static Assets (upload to /movieshows3/_next/)
Upload entire `_next` folder with subdirectories:
- _next/static/chunks/
- _next/static/media/
- _next/static/KfxUxUUijlHHbd47CO2XA/
- _next/static/uWAMjhqjXN0jZl3x3nBQv/

### SVG Assets
```
file.svg
globe.svg
next.svg
vercel.svg
window.svg
```

## Database Setup Steps

### 1. Run Base Schema (if not already done)
Run `moviesdb_feb32026_538pm.sql` in phpMyAdmin.
This creates the core tables:
- movies
- trailers
- thumbnails
- content_sources
- user_queues
- user_preferences
- shared_playlists
- playlist_items
- sync_log

### 2. Run Schema Additions
Run `api/schema_additions.sql` in phpMyAdmin.
This adds new tables (won't break existing data):
- watch_history
- user_ratings
- user_favorites
- user_bookmarks
- watch_party_sessions
- watch_party_members
- content_reports
- app_analytics

Also adds columns to movies table:
- source
- cast_info
- director

### 3. Verify API Connection
Visit: https://findtorontoevents.ca/movieshows3/api/movies.php?action=stats
Should return JSON with database stats.

## Important Notes

1. **DO NOT modify /movieshows2/** - Database is shared, but that folder may be used later
2. **DO NOT modify main page** - Don't add link to movieshows3 yet
3. **Source identifier:** API uses 'movieshows3' as source to track data origin
4. **Offline fallback:** App works offline using localStorage

## Post-Deployment Testing

1. Load https://findtorontoevents.ca/movieshows3/
2. Check console for "MovieShows DB Connector initialized"
3. Click sync indicator (bottom-left) to verify connection
4. Test video playback
5. Test queue functionality
6. Test category filters

## Troubleshooting

### API 500 Error
- Check PHP error logs
- Verify database credentials in config.php
- Ensure PDO MySQL extension is enabled

### CORS Issues
- Verify .htaccess is uploaded
- Check that Headers module is enabled on server

### Database Connection Failed
- Verify mysql.50webs.com is accessible
- Check username format (ejaguiar1_tvmovie)
- Verify password is correct
