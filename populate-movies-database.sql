-- MovieShows Database Population Script
-- Generated: 2026-02-04T00:18:56.282Z
-- Total movies: 382
-- WARNING: This script ADDS data, does NOT delete anything

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";
SET NAMES utf8mb4;

-- ============================================
-- STEP 1: Add new columns if they don't exist
-- ============================================

-- Add poster_url column
SET @exist := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'movies' AND COLUMN_NAME = 'poster_url');
SET @sqlstmt := IF(@exist = 0, 
    'ALTER TABLE movies ADD COLUMN poster_url VARCHAR(500) DEFAULT NULL AFTER imdb_rating',
    'SELECT "poster_url column already exists"');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add trailer_url column
SET @exist := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'movies' AND COLUMN_NAME = 'trailer_url');
SET @sqlstmt := IF(@exist = 0, 
    'ALTER TABLE movies ADD COLUMN trailer_url VARCHAR(500) DEFAULT NULL AFTER poster_url',
    'SELECT "trailer_url column already exists"');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add source column
SET @exist := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'movies' AND COLUMN_NAME = 'source');
SET @sqlstmt := IF(@exist = 0, 
    'ALTER TABLE movies ADD COLUMN source VARCHAR(100) DEFAULT NULL AFTER trailer_url',
    'SELECT "source column already exists"');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add index on trailer_url for duplicate checking
-- Using a prefix index since trailer_url can be long
SET @exist := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'movies' AND INDEX_NAME = 'idx_trailer_url');
SET @sqlstmt := IF(@exist = 0, 
    'ALTER TABLE movies ADD INDEX idx_trailer_url (trailer_url(255))',
    'SELECT "idx_trailer_url index already exists"');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add unique constraint on title + trailer_url to prevent exact duplicates
-- (A movie CAN have multiple trailer URLs, but not the same URL twice)

-- ============================================
-- STEP 2: Insert movies (skip if trailer_url already exists)
-- ============================================

-- Movie 1: Sentenced to Be a Hero
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Sentenced to Be a Hero', 'tv', 'Animation, Action', 'In a world where heroism is a punishment, Xylo Forbartz, a condemned goddess killer, battles endless hordes of monstrous abominations as part of Penal Hero Unit 9004. Death is no escape, only a cycle of resurrection and relentless combat. But when Xylo encounters a mysterious new goddess, their unlikely alliance sparks a rebellion that could shatter the chains of eternal punishment.', 
       2026, 9, 'https://image.tmdb.org/t/p/w500/k8bh5mvHDx3czHSF56v9lRyulLC.jpg', 
       'https://www.youtube.com/watch?v=B5qZX2kh-7w', 'In Theatres'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=B5qZX2kh-7w'
);

-- Movie 2: The Pendragon Cycle: Rise of the Merlin
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'The Pendragon Cycle: Rise of the Merlin', 'tv', 'Action, Family, Drama', 'Merlin, the immortal son of the bard Taliesin and Atlantean Princess Charis, is followed through his tragic upbringing, descent into madness, and shocking disappearance, leading to the legend that surrounds him. Set before King Arthur''s birth, Merlin, assumed dead or a myth, reemerges in sub-Roman Britain to unite the fractured kingdoms under threat from Saxon invaders.', 
       2026, 8.6, 'https://image.tmdb.org/t/p/w500/jJfk8NXauN4UgFQ1qn9lFzEk7ib.jpg', 
       'https://www.youtube.com/watch?v=6iGrFKHGgL4', 'In Theatres'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=6iGrFKHGgL4'
);

-- Movie 3: The Lord of the Rings: The Two Towers
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'The Lord of the Rings: The Two Towers', 'movie', 'Adventure, Fantasy, Action', 'Frodo Baggins and the other members of the Fellowship continue on their sacred quest to destroy the One Ring--but on separate paths. Their destinies lie at two towers--Orthanc Tower in Isengard, where the corrupt wizard Saruman awaits, and Sauron''s fortress at Barad-dur, deep within the dark lands of Mordor. Frodo and Sam are trekking to Mordor to destroy the One Ring of Power while Gimli, Legolas and Aragorn search for the orc-captured Merry and Pippin. All along, nefarious wizard Saruman awaits the Fellowship members at the Orthanc Tower in Isengard.', 
       2026, 8.4, 'https://image.tmdb.org/t/p/w500/5VTN0pR8gcqV3EPUHHfMGnJYN9L.jpg', 
       'https://www.youtube.com/watch?v=HUkDW37WaI0', 'In Theatres'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=HUkDW37WaI0'
);

-- Movie 4: A Knight of the Seven Kingdoms
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'A Knight of the Seven Kingdoms', 'tv', 'Drama, Action', 'A century before the events of Game of Thrones, two unlikely heroes wandered Westeros: a young, naive but courageous knight, Ser Duncan the Tall, and his diminutive squire, Egg. Set in an age when the Targaryen line still holds the Iron Throne and the last dragon has not yet passed from living memory, great destinies, powerful foes, and dangerous exploits await these improbable and incomparable friends.', 
       2026, 8.1, 'https://image.tmdb.org/t/p/w500/6igvNs5VJB4ryBLgjjXksDVs0Fm.jpg', 
       'https://www.youtube.com/watch?v=sItUCKJQLTU', 'In Theatres'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=sItUCKJQLTU'
);

-- Movie 5: Steal
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Steal', 'tv', 'Drama, Crime, Mystery', 'A typical day at Lochmill Capital is upended when armed thieves burst in and force Zara and her best friend Luke to execute their demands. In the aftermath, conflicted detective Rhys races against time to find out who stole £4 billion pounds of people''s pensions and why.', 
       2026, 7.7, 'https://image.tmdb.org/t/p/w500/6KmlaPhsohh3Ki9XJUq0jiUYbf3.jpg', 
       'https://www.youtube.com/watch?v=8rMfMzNAJaM', 'In Theatres'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=8rMfMzNAJaM'
);

-- Movie 6: Shelter
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Shelter', 'movie', 'Action, Crime, Thriller', 'A man living in self-imposed exile on a remote island rescues a young girl from a violent storm, setting off a chain of events that forces him out of seclusion to protect her from enemies tied to his past.', 
       2026, 7.5, 'https://image.tmdb.org/t/p/w500/klvZs66SG19qmacdwxSRkdFQhQS.jpg', 
       'https://www.youtube.com/watch?v=kCY4Y3Y8UpA', 'In Theatres'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=kCY4Y3Y8UpA'
);

-- Movie 7: 28 Years Later: The Bone Temple
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT '28 Years Later: The Bone Temple', 'movie', 'Horror, Thriller, Sci-Fi', 'Dr. Kelson finds himself in a shocking new relationship - with consequences that could change the world as they know it - and Spike''s encounter with Jimmy Crystal becomes a nightmare he can''t escape.', 
       2026, 7.2, 'https://image.tmdb.org/t/p/w500/kK1BGkG3KAvWB0WMV1DfOx9yTMZ.jpg', 
       'https://www.youtube.com/watch?v=IZMxrdUXrjg', 'In Theatres'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=IZMxrdUXrjg'
);

-- Movie 8: Dracula
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Dracula', 'movie', 'Horror, Fantasy, Romance', 'When a 15th-century prince denounces God after the devastating loss of his wife, he inherits an eternal curse: he becomes Dracula. Condemned to wander the centuries, he defies fate and death itself, guided by a single hope — to be reunited with his lost love.', 
       2026, 7.2, 'https://image.tmdb.org/t/p/w500/ykyRfv7JDofLxXLAwtLXaSuaFfM.jpg', 
       'https://www.youtube.com/watch?v=hverb7siYJ8', 'In Theatres'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=hverb7siYJ8'
);

-- Movie 9: Wonder Man
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Wonder Man', 'tv', 'Comedy, Drama', 'Simon and Trevor, two actors at opposite ends of their careers, chase life-changing roles.', 
       2026, 6.9, 'https://image.tmdb.org/t/p/w500/6yy9nQlFt2l6UVWzrfhszFCaZ5C.jpg', 
       'https://www.youtube.com/watch?v=90G8qegDumc', 'In Theatres'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=90G8qegDumc'
);

-- Movie 10: Mercy
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Mercy', 'movie', 'Sci-Fi, Action, Thriller', 'In the near future, a detective stands on trial accused of murdering his wife. He has ninety minutes to prove his innocence to the advanced AI Judge he once championed, before it determines his fate.', 
       2026, 6.9, 'https://image.tmdb.org/t/p/w500/1LzdlxK9ctsnx7nXoGF1ImHKddl.jpg', 
       'https://www.youtube.com/watch?v=xsyNtyjIFXg', 'In Theatres'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=xsyNtyjIFXg'
);

-- Movie 11: Send Help
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Send Help', 'movie', 'Horror, Thriller, Comedy', 'Two colleagues become stranded on a deserted island, the only survivors of a plane crash. On the island, they must overcome past grievances and work together to survive, but ultimately, it''s a battle of wills and wits to make it out alive.', 
       2026, 6.9, 'https://image.tmdb.org/t/p/w500/mlV70IuchLZXcXKowjwSpSfdfUB.jpg', 
       'https://www.youtube.com/watch?v=tUt2Hb_y5YU', 'In Theatres'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=tUt2Hb_y5YU'
);

-- Movie 12: Greenland 2: Migration
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Greenland 2: Migration', 'movie', 'Adventure, Thriller, Sci-Fi', 'Having found the safety of the Greenland bunker after the comet Clarke decimated the Earth, the Garrity family must now risk everything to embark on a perilous journey across the wasteland of Europe to find a new home.', 
       2026, 6.6, 'https://image.tmdb.org/t/p/w500/dtPwBZjzqTaObjG4fKStRkBq1uu.jpg', 
       'https://www.youtube.com/watch?v=zwfCPPttT4s', 'In Theatres'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=zwfCPPttT4s'
);

-- Movie 13: Primate
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Primate', 'movie', 'Horror, Thriller', 'Lucy, a college student, along with her friends, spend their vacation at her family''s home in Hawaii, which includes her pet chimpanzee, Ben. However, when Ben contracts rabies after being bitten by a rabid animal, the group must fight for their lives in order to avoid the now-violent chimp.', 
       2026, 6.6, 'https://image.tmdb.org/t/p/w500/z97hrgI5wbGbZvSVkBfAeBnFKAg.jpg', 
       'https://www.youtube.com/watch?v=jElnR65Otoo', 'In Theatres'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=jElnR65Otoo'
);

-- Movie 14: The Wrecking Crew
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'The Wrecking Crew', 'movie', 'Action, Comedy, Crime, Mystery', 'Estranged half-brothers Jonny and James reunite after their father''s mysterious death. As they search for the truth, buried secrets reveal a conspiracy threatening to tear their family apart.', 
       2026, 6.2, 'https://image.tmdb.org/t/p/w500/gbVwHl4YPSq6BcC92TQpe7qUTh6.jpg', 
       'https://www.youtube.com/watch?v=v8R0xDczERo', 'In Theatres'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=v8R0xDczERo'
);

-- Movie 15: Return to Silent Hill
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Return to Silent Hill', 'movie', 'Horror, Mystery', 'When James receives a mysterious letter from his lost love Mary, he is drawn to Silent Hill—a once-familiar town now consumed by darkness. As he searches for her, James faces monstrous creatures and unravels a terrifying truth that will push him to the edge of his sanity.', 
       2026, 5.3, 'https://image.tmdb.org/t/p/w500/fqAGFN2K2kDL0EHxvJaXzaMUkkt.jpg', 
       'https://www.youtube.com/watch?v=cbFSZ_8r58Y', 'In Theatres'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=cbFSZ_8r58Y'
);

-- Movie 16: "Wuthering Heights"
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT '"Wuthering Heights"', 'movie', 'Drama, Romance', 'Tragedy strikes when Heathcliff falls in love with Catherine Earnshaw, a woman from a wealthy family in 18th-century England.', 
       2026, NULL, 'https://image.tmdb.org/t/p/w500/ywRO5dyE8RyyXJd6cvd69jLZeic.jpg', 
       'https://www.youtube.com/watch?v=VaSo2ur9_7s', 'In Theatres'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=VaSo2ur9_7s'
);

-- Movie 17: GOAT
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'GOAT', 'movie', 'Animation, Comedy, Family, Action', 'Will, a small goat with big dreams, gets a once-in-a-lifetime shot to join the pros and play roarball – a high-intensity, co-ed, full-contact sport dominated by the fastest, fiercest animals in the world. Will''s new teammates aren''t thrilled about having a little goat on their roster, but Will is determined to revolutionize the sport and prove once and for all that ''smalls can ball''! He has to do something he has never done before.', 
       2026, NULL, 'https://image.tmdb.org/t/p/w500/oXIj3R3QxcQ9wkv9YBWouBNmnFZ.jpg', 
       'https://www.youtube.com/watch?v=CnBlvCfzGb8', 'In Theatres'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=CnBlvCfzGb8'
);

-- Movie 18: Iron Lung
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Iron Lung', 'movie', 'Horror, Sci-Fi', 'The stars are gone. The planets have disappeared. Only individuals aboard space stations or starships were left to give the end a name - The Quiet Rapture. After decades of decay and crumbling infrastructure, the Consolidation of Iron has made a discovery on a barren moon designated AT-5. An ocean of blood. Hoping to discover desperately needed resources they immediately launch an expedition. A submarine is crafted and a convict is welded inside. Due to the pressure and depth of the ocean the forward viewport has been encased in metal. If successful, they will earn their freedom. If not, another will follow. This will be the 13th expedition.', 
       2026, NULL, 'https://image.tmdb.org/t/p/w500/sIwakdbMGS1krtgendTWpxTY9Hw.jpg', 
       'https://www.youtube.com/watch?v=IaEtA56pd_w', 'In Theatres'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=IaEtA56pd_w'
);

-- Movie 19: The Voice of Hind Rajab
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'The Voice of Hind Rajab', 'movie', 'Drama', 'January 29, 2024. Red Crescent volunteers receive an emergency call. A five-year old girl is trapped in a car under fire in Gaza, pleading for rescue. While trying to keep her on the line, they do everything they can to get an ambulance to her. Her name was Hind Rajab.', 
       2026, 8.2, 'https://image.tmdb.org/t/p/w500/fBcBY8kdBiPsRdtkbldwg3ThlyJ.jpg', 
       'https://www.youtube.com/watch?v=JkeKrG0YONQ', 'In Theatres'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=JkeKrG0YONQ'
);

-- Movie 20: Call Me Mother
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Call Me Mother', 'movie', 'Comedy, Drama', 'Twinkle is a single queer mother whose dream of officially adopting her son gets shaken when the boy''s biological mother, Mara, unexpectedly reappears.', 
       2026, 8, 'https://image.tmdb.org/t/p/w500/p0umaKN4HpuA8ynXNofbOuhz7ON.jpg', 
       'https://www.youtube.com/watch?v=cFZmGrP108E', 'In Theatres'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=cFZmGrP108E'
);

-- Movie 21: Father Mother Sister Brother
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Father Mother Sister Brother', 'movie', 'Comedy, Drama', 'Three stories concerning the relationships between adult children, their somewhat distant parent (or parents), and each other: a reclusive father visited by his grown children in the US, sisters visiting their novelist mother in Dublin, and adult twins called back to their Paris apartment to address a family tragedy.', 
       2026, 6.7, 'https://image.tmdb.org/t/p/w500/zewZA6sL52YSH8xIH4wbG5GadjV.jpg', 
       'https://www.youtube.com/watch?v=PA07EmbZ0b0', 'In Theatres'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=PA07EmbZ0b0'
);

-- Movie 22: The Choral
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'The Choral', 'movie', 'Comedy, Drama, Music', 'As World War I rages on, Dr. Henry Guthrie takes over a British choral society that''s lost most of its men to the army. The community soon discovers that the best response to the chaos of war is to make beautiful music together.', 
       2026, 6.6, 'https://image.tmdb.org/t/p/w500/yQtms7CSM0CE0W6dYbLLAATb5rL.jpg', 
       'https://www.youtube.com/watch?v=6zRVP-ZgMm8', 'In Theatres'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=6zRVP-ZgMm8'
);

-- Movie 23: Cold Storage
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Cold Storage', 'movie', 'Comedy, Sci-Fi, Thriller', 'When a mutating, highly contagious fungus escapes a sealed facility, two young employees – joined by a grizzled bioterror operative – must survive the wildest night shift ever to save humanity from extinction.', 
       2026, 4, 'https://image.tmdb.org/t/p/w500/pfqkETJ2A3zXZJuNcufZbAJNnKA.jpg', 
       'https://www.youtube.com/watch?v=L9biJQ3rn_8', 'In Theatres'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=L9biJQ3rn_8'
);

-- Movie 24: Scream 7
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Scream 7', 'movie', 'Horror, Mystery, Crime', 'When a new Ghostface killer emerges in the quiet town where Sidney Prescott has built a new life, her darkest fears are realized as her daughter becomes the next target. Determined to protect her family, Sidney must face the horrors of her past to put an end to the bloodshed once and for all.', 
       2026, NULL, 'https://image.tmdb.org/t/p/w500/jjyuk0edLiW8vOSnlfwWCCLpbh5.jpg', 
       'https://www.youtube.com/watch?v=kFdDOLP5mXY', 'In Theatres'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=kFdDOLP5mXY'
);

-- Movie 25: Kokuho
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Kokuho', 'movie', 'Drama', 'Nagasaki, 1964: Following the death of his yakuza father, 15-year-old Kikuo is taken under the wing of a famous kabuki actor. Alongside Shunsuke, the actor’s only son, he decides to dedicate himself to this traditional form of theatre. For decades, the two young men grow and evolve together – and one will become the greatest Japanese master of the art of kabuki.', 
       2026, 8.2, 'https://image.tmdb.org/t/p/w500/a15F5KJ4mleusJR1YKP4zUyZaxG.jpg', 
       'https://www.youtube.com/watch?v=Y0KfXj3Skao', 'In Theatres'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=Y0KfXj3Skao'
);

-- Movie 26: Melania
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Melania', 'movie', 'Documentary', 'Offering unprecedented access to the 20 days leading up to the 2025 Presidential Inauguration — through the eyes of the First Lady-elect herself — step inside Melania Trump''s world as she orchestrates inauguration plans, navigates the complexities of the White House transition, and reenters public life with her family. With exclusive footage capturing critical meetings, private conversations, and never-before-seen environments, Mrs. Trump returns to one of the world''s most powerful roles.', 
       2026, 3, 'https://image.tmdb.org/t/p/w500/ba6Silct0Y4pyvrSv0Tj0Urmx9f.jpg', 
       'https://www.youtube.com/watch?v=dxXJAqOU00g', 'In Theatres'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=dxXJAqOU00g'
);

-- Movie 27: Crime 101
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Crime 101', 'movie', 'Crime, Thriller', 'When an elusive thief whose high-stakes heists unfold along the iconic 101 freeway in Los Angeles eyes the score of a lifetime, with hopes of this being his final job, his path collides with a disillusioned insurance broker who is facing her own crossroads, forcing the two to collaborate. Determined to crack the case, a relentless detective closes in on the operation, raising the stakes even higher.', 
       2026, NULL, 'https://image.tmdb.org/t/p/w500/fDj8ZATOTmiFy7BF43L3XLIOrf0.jpg', 
       'https://www.youtube.com/watch?v=KeEHsuZ4Ja4', 'In Theatres'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=KeEHsuZ4Ja4'
);

-- Movie 28: The Well
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'The Well', 'movie', 'Drama, Thriller', 'In a world where environmental collapse has left survivors to fight for the precious resources needed to survive, a young woman’s loyalties are tested by the arrival of a wounded man. When he discovers her family has a secret supply of fresh water it puts them all in the crosshairs of a dangerous cult, and their ruthless leader Gabriel.', 
       2026, NULL, 'https://image.tmdb.org/t/p/w500/4LaC3a1ZMrIBXsDGaPFHaa2mzCI.jpg', 
       'https://www.youtube.com/watch?v=IsGm5UAJMs4', 'In Theatres'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=IsGm5UAJMs4'
);

-- Movie 29: We Bury the Dead
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'We Bury the Dead', 'movie', 'Horror, Thriller, Sci-Fi, Drama', 'After a catastrophic military disaster, the dead don''t just rise—they hunt. The military insists they are harmless and slow-moving, offering hope to grieving families. But when Ava enters a quarantine zone searching for her missing husband, she uncovers the horrifying truth: the undead are growing more violent, more relentless, and more dangerous with every passing hour.', 
       2026, 6.4, 'https://image.tmdb.org/t/p/w500/vWOALCjS3cANciJKkG0qV8k1izW.jpg', 
       'https://www.youtube.com/watch?v=iE-W-wEJJqw', 'In Theatres'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=iE-W-wEJJqw'
);

-- Movie 30: Whistle
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Whistle', 'movie', 'Horror, Mystery', 'When a group of misfit teenagers stumble upon an ancient Aztec death whistle, they learn that by blowing it, its terrifying sound will invoke their future deaths to hunt them down. As the body count rises, the friends investigate the origins of the deadly artifact in a desperate effort to stop the horrifying chain of events that they''ve set in motion.', 
       2026, 2, 'https://image.tmdb.org/t/p/w500/ieOiiCBbf0SNwR39iiA2xnGOnab.jpg', 
       'https://www.youtube.com/watch?v=K784dJXVhBo', 'In Theatres'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=K784dJXVhBo'
);

-- Movie 31: Nirvanna the Band the Show the Movie
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Nirvanna the Band the Show the Movie', 'movie', 'Comedy, Sci-Fi, Adventure', 'When their plan to book a show at the Rivoli goes horribly wrong, Matt and Jay accidentally travel back to the year 2008.', 
       2026, NULL, 'https://image.tmdb.org/t/p/w500/sm5TGX8WbnCd9Uo26cLyTxVwA1n.jpg', 
       'https://www.youtube.com/watch?v=y2K9ccMREOI', 'In Theatres'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=y2K9ccMREOI'
);

-- Movie 32: Lupin the IIIRD: The Movie - The Immortal Bloodline
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Lupin the IIIRD: The Movie - The Immortal Bloodline', 'movie', 'Animation, Action, Crime', 'After fending off a series of skilled assassins, gentleman thief Lupin III and his band of allies follow a strange invitation to an uncharted island. When their plane is shot down, the gang is stranded and soon hunted by the island’s inhabitants, past enemies, and a monstrous immortal being known as Muom, who threatens to destroy Lupin''s legacy. As a deadly toxic fog settles over them, Lupin must confront his greatest enemy in his most daring escapade yet.', 
       2026, 8, 'https://image.tmdb.org/t/p/w500/oqipJVMlnXeDakXtINMeIAl341q.jpg', 
       'https://www.youtube.com/watch?v=_xHWDNnU7ps', 'In Theatres'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=_xHWDNnU7ps'
);

-- Movie 33: Unexpected Family
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Unexpected Family', 'movie', 'Comedy, Drama', 'For family reasons, Zhong Bufan, a young man from a small town, flees his home to try to reach Beijing. On the way, he crosses paths with Ren Jiqing, an old man suffering from Alzheimer''s disease who mistakes him for his son.', 
       2026, 7.3, 'https://image.tmdb.org/t/p/w500/jTuu8wLW2RUg1IzX4IC7wqpsjIo.jpg', 
       'https://www.youtube.com/watch?v=qo_ci3zwRVw', 'In Theatres'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=qo_ci3zwRVw'
);

-- Movie 34: Rosemead
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Rosemead', 'movie', 'Drama', 'In a race against time, an ailing woman discovers her teenage son''s violent obsessions and must go to great lengths to protect him, and possibly others, in this portrait of a Chinese American family. Inspired by true events.', 
       2026, 7, 'https://image.tmdb.org/t/p/w500/uVilyfKrB5ZkhXh7MMaIaevzueR.jpg', 
       'https://www.youtube.com/watch?v=IwQy6jV1QCM', 'In Theatres'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=IwQy6jV1QCM'
);

-- Movie 35: The Chronology of Water
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'The Chronology of Water', 'movie', 'Drama', 'Growing up in an environment torn apart by violence and alcohol, a young woman finds her voice through the written word and her salvation as a swimmer.', 
       2026, 6.9, 'https://image.tmdb.org/t/p/w500/a0myciW2wnVBOB1fnHLUOVgX0fD.jpg', 
       'https://www.youtube.com/watch?v=OycsHnfoVz0', 'In Theatres'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=OycsHnfoVz0'
);

-- Movie 36: The Stranger
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'The Stranger', 'movie', 'Drama, Crime', 'In 1930s Algeria, the daily life of an indifferent Frenchman is shaken by the death of his mother and a fateful encounter on a beach.', 
       2026, 6.8, 'https://image.tmdb.org/t/p/w500/11lx7Isd86SIPeNuWlAPjYTfr57.jpg', 
       'https://www.youtube.com/watch?v=gR912kHSOlA', 'In Theatres'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=gR912kHSOlA'
);

-- Movie 37: Dead Man's Wire
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Dead Man''s Wire', 'movie', 'Crime, Drama', 'In 1977, former real estate developer Tony Kiritsis puts a dead man''s switch on himself and the mortgage banker who did him wrong, demanding $5 million and a personal apology.', 
       2026, 6.3, 'https://image.tmdb.org/t/p/w500/71FPde8V7DbnAHgUZfwrpxPOFG6.jpg', 
       'https://www.youtube.com/watch?v=0dTPOrJXqOw', 'In Theatres'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=0dTPOrJXqOw'
);

-- Movie 38: Islands
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Islands', 'movie', 'Thriller, Drama, Crime', 'In this twisty thriller, a tennis coach at a tropical resort finds himself at the center of a missing persons mystery. Tom teaches tennis during the day and parties at night. When an enigmatic tourist arrives, Tom is unable to shake the feeling he has met her before. Tension and attraction grow, until her husband disappears, and the police suspect Tom.', 
       2026, 6.2, 'https://image.tmdb.org/t/p/w500/a5CewSvoMsfAdg093AKzovKfVHd.jpg', 
       'https://www.youtube.com/watch?v=MifpmLyraBE', 'In Theatres'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=MifpmLyraBE'
);

-- Movie 39: Zombie Land Saga: Yumeginga Paradise
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Zombie Land Saga: Yumeginga Paradise', 'movie', 'Animation, Comedy, Music, Action', 'Zombies × Idols × Saga — Seriously!? What kind of madness will this outrageous, expectation-defying anime unleash on the big screen!? Legendary girls return as zombies to fight as Saga''s local idols in the groundbreaking zombie-idol anime, “ZOMBIE LAND SAGA.” With outrageous zombie antics, unexpectedly moving moments, and music that transcends the idol genre, the series became an instant sensation, spanning its production over two TV anime seasons. And now, their stage expands to the movie theater — everything is packed into this ultimate entertainment experience!!!!!!! The unprecedented Galaxy Festival Movie begins now!!', 
       2026, NULL, 'https://image.tmdb.org/t/p/w500/a4xxEU8MQLaVeduHUe3nn7m5iXd.jpg', 
       'https://www.youtube.com/watch?v=G1nG-AKY7Yk', 'In Theatres'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=G1nG-AKY7Yk'
);

-- Movie 40: How to Make a Killing
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'How to Make a Killing', 'movie', 'Comedy, Thriller, Drama', 'Disowned at birth by his obscenely wealthy family, blue-collar Becket Redfellow will stop at nothing to reclaim his inheritance, no matter how many relatives stand in his way.', 
       2026, NULL, 'https://image.tmdb.org/t/p/w500/yQ7OP2HYxl9YmkWNMkuUA2YaF5.jpg', 
       'https://www.youtube.com/watch?v=B7RslMKZ2Yc', 'In Theatres'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=B7RslMKZ2Yc'
);

-- Movie 41: Busted Water Pipes
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Busted Water Pipes', 'movie', 'Comedy, Crime', 'A crime-fighting cop maintains a zero-crime rate and faces job loss, so he decides to fabricate a major case, unaware that actual grave robbers are targeting a treasure-filled tomb located directly beneath his police station.', 
       2026, NULL, 'https://image.tmdb.org/t/p/w500/kDsSmwtX8N0wmxRRdxjgYHenFNe.jpg', 
       'https://www.youtube.com/watch?v=YJizr6Sgri4', 'In Theatres'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=YJizr6Sgri4'
);

-- Movie 42: Honey Bunch
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Honey Bunch', 'movie', 'Drama, Thriller', 'Diana''s husband is taking her to an experimental trauma facility deep in the wilderness, but she can''t remember why... As her memories begin to creep back in so do some unwelcome sinister truths about her marriage.', 
       2026, NULL, 'https://image.tmdb.org/t/p/w500/rR6zS2sPpcjND92cCLmsuMNok7M.jpg', 
       'https://www.youtube.com/watch?v=7bG6ymmZM7s', 'In Theatres'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=7bG6ymmZM7s'
);

-- Movie 43: Follies
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Follies', 'movie', 'Comedy, Romance', 'François and Julie, together for 16 years and parents of two children, can no longer connect intimately. They decide to open up their relationship in order to engage in sexual follies that will allow them to learn more about themselves.', 
       2026, NULL, 'https://image.tmdb.org/t/p/w500/8gPI34eVTkBXLXDFBQJbDeAOvsP.jpg', 
       'https://www.youtube.com/watch?v=w1ZfKWzpTt4', 'In Theatres'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=w1ZfKWzpTt4'
);

-- Movie 44: My Father's Shadow
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'My Father''s Shadow', 'movie', 'Drama, History', 'Two young brothers explore Lagos with their estranged father during the 1993 Nigerian election crisis, witnessing both the city''s magnitude and their father''s daily struggles as political unrest threatens their journey home.', 
       2026, 8, 'https://image.tmdb.org/t/p/w500/aLQYyqWlIBBU3L8L84txbh0x1nq.jpg', 
       'https://www.youtube.com/watch?v=50ICTaEuQxg', 'In Theatres'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=50ICTaEuQxg'
);

-- Movie 45: ALL YOU NEED IS KILL
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'ALL YOU NEED IS KILL', 'movie', 'Animation, Action, Mystery, Sci-Fi', 'When a massive alien flower known as "Darol" unexpectedly erupts in a deadly event, unleashing monstrous creatures that decimate the population of Japan, Rita is caught in the destruction—and killed. But then she wakes up again. And again. Caught in an endless time loop, Rita must navigate the trauma and repetition of death until she crosses paths with Keiji, a shy young man trapped in the same cycle. Together, they fight to break free from the loop and find meaning in the chaos around them.', 
       2026, 6, 'https://image.tmdb.org/t/p/w500/kznh3ACnXYVyyAYes7JN6i1wy2d.jpg', 
       'https://www.youtube.com/watch?v=0YpXN40vIxM', 'In Theatres'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=0YpXN40vIxM'
);

-- Movie 46: The Richest Woman in the World
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'The Richest Woman in the World', 'movie', 'Drama, Comedy', 'An elderly billionaire woman gives hundreds of millions of euros to a younger gay artist she is close to. Her daughter files a complaint for abuse of a vulnerable person and a scandal erupts.', 
       2026, 5.9, 'https://image.tmdb.org/t/p/w500/sxaMtiQLgUhMbvuSxNo5BZZ7EVs.jpg', 
       'https://www.youtube.com/watch?v=w0SzsfPzB7g', 'In Theatres'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=w0SzsfPzB7g'
);

-- Movie 47: The Moment
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'The Moment', 'movie', 'Drama, Comedy, Music', 'A rising pop sensation navigates fame and industry pressures while preparing for her arena tour debut, revealing the transformation of underground culture into mainstream success.', 
       2026, 4, 'https://image.tmdb.org/t/p/w500/txnHhq3GA1zDxZQMk2igq9CyA8v.jpg', 
       'https://www.youtube.com/watch?v=2oiLhpZp7sY', 'In Theatres'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=2oiLhpZp7sY'
);

-- Movie 48: EPiC: Elvis Presley in Concert
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'EPiC: Elvis Presley in Concert', 'movie', 'Music, Documentary', 'A mix of a documentary and concert film made using unused footage from Elvis: That''s the Way It Is, the film of Elvis'' legendary 1970 Summer Festival in Las Vegas and Elvis''s road concert film from two years later, Elvis on Tour, that were found during the production of 2022''s Elvis.', 
       2026, NULL, 'https://image.tmdb.org/t/p/w500/433YxgwVpX8sUPbqzjTAQjLkPX0.jpg', 
       'https://www.youtube.com/watch?v=2s_dCvUgOBI', 'In Theatres'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=2s_dCvUgOBI'
);

-- Movie 49: Charlie the Wonderdog
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Charlie the Wonderdog', 'movie', 'Action, Animation, Adventure, Comedy', 'Timid nine year old Danny teams up with his beloved family dog Charlie, who gets abducted by aliens and returns with superpowers, to thwart a plan by the neighbor''s sinister cat Puddy to destroy humanity.', 
       2026, NULL, 'https://image.tmdb.org/t/p/w500/whvkL0wzxgKmVbaPontq9NlVd5z.jpg', 
       'https://www.youtube.com/watch?v=uUDfO0Q4sog', 'In Theatres'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=uUDfO0Q4sog'
);

-- Movie 50: Two Sleepy People
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Two Sleepy People', 'movie', 'Romance, Comedy, Drama', 'Two Sleepy People is a story about two coworkers who, after taking a new line of melatonin gummies, are trapped in the same dream every night.', 
       2026, NULL, 'https://image.tmdb.org/t/p/w500/5EjVkMVZroBXTgDFdkW27NS6CD9.jpg', 
       'https://www.youtube.com/watch?v=xI3pH4X1ZcU', 'In Theatres'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=xI3pH4X1ZcU'
);

-- Movie 66: Wicked: For Good
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Wicked: For Good', 'movie', 'Documentary, Music', 'A documentary or special screening related to the making of the Wicked movies.', 
       2026, NULL, 'https://image.tmdb.org/t/p/w500/wickedforgood.jpg', 
       'https://www.youtube.com/watch?v=6COmYeLsz4c', 'In Theatres'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=6COmYeLsz4c'
);

-- Movie 79: The Hunger Games: Sunrise on the Reaping
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'The Hunger Games: Sunrise on the Reaping', 'movie', 'Sci-Fi, Action, Drama', 'A prequel exploring the 50th Hunger Games and the story of Haymitch Abernathy.', 
       2026, NULL, 'https://image.tmdb.org/t/p/w500/tBcYjVLqpjdlpnYUxRfIhyxPNQH.jpg', 
       'https://www.youtube.com/watch?v=u9Mv98Gr5pY', 'In Theatres'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=u9Mv98Gr5pY'
);

-- Movie 80: The Odyssey
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'The Odyssey', 'movie', 'Adventure, Drama, Fantasy', 'Christopher Nolan''s epic adaptation of Homer''s Odyssey starring Matt Damon.', 
       2026, NULL, 'https://image.tmdb.org/t/p/w500/hek3koDUyRQq7oYKZ6LX6RMeZO0.jpg', 
       'https://www.youtube.com/watch?v=YoHD9XEInc0', 'In Theatres'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=YoHD9XEInc0'
);

-- Movie 81: The Devil Wears Prada 2
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'The Devil Wears Prada 2', 'movie', 'Comedy, Drama', 'Miranda Priestly returns in this sequel to the beloved 2006 film.', 
       2026, NULL, 'https://image.tmdb.org/t/p/w500/6qzqKVHnpXHfPaXe3AH8mRxn6V4.jpg', 
       'https://www.youtube.com/watch?v=6ZOZwUQKu3E', 'In Theatres'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=6ZOZwUQKu3E'
);

-- Movie 82: Masters of the Universe
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Masters of the Universe', 'movie', 'Action, Fantasy, Sci-Fi', 'Nicholas Galitzine stars as He-Man in this epic fantasy adventure.', 
       2026, NULL, 'https://image.tmdb.org/t/p/w500/vRQnzOn4HjIMX4LBq9nHhFXbsSu.jpg', 
       'https://www.youtube.com/watch?v=ZWaFu4_xTR4', 'In Theatres'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=ZWaFu4_xTR4'
);

-- Movie 83: Wuthering Heights
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Wuthering Heights', 'movie', 'Drama, Romance', 'Margot Robbie and Jacob Elordi star in this adaptation of the classic novel.', 
       2026, NULL, 'https://image.tmdb.org/t/p/w500/sMIBcLFnobhTlPXHeDmxPFBOPNy.jpg', 
       'https://www.youtube.com/watch?v=UGxcGvxu-3o', 'In Theatres'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=UGxcGvxu-3o'
);

-- Movie 84: The Mandalorian and Grogu
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'The Mandalorian and Grogu', 'movie', 'Sci-Fi, Action, Adventure', 'The Mandalorian and Grogu''s story continues on the big screen.', 
       2026, NULL, 'https://image.tmdb.org/t/p/w500/sWgBv7LV2PRoQgkxwlibdGXKz1S.jpg', 
       'https://www.youtube.com/watch?v=XmI7WKrAtqs', 'In Theatres'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=XmI7WKrAtqs'
);

-- Movie 85: Spider-Man 4
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Spider-Man 4', 'movie', 'Action, Adventure, Sci-Fi', 'Tom Holland returns as Spider-Man in his next solo adventure.', 
       2026, NULL, 'https://image.tmdb.org/t/p/w500/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg', 
       'https://www.youtube.com/watch?v=rt-2cxAiPJk', 'In Theatres'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=rt-2cxAiPJk'
);

-- Movie 86: The Pitt
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'The Pitt', 'tv', 'Drama', 'The staff of Pittsburgh''s Trauma Medical Center work around the clock to save lives in an overcrowded and underfunded emergency department.', 
       2025, 8.7, 'https://image.tmdb.org/t/p/w500/kvFSpESyBZMjaeOJDx7RS3P1jey.jpg', 
       'https://www.youtube.com/watch?v=ufR_08V38sQ', 'In Theatres'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=ufR_08V38sQ'
);

-- Movie 87: David
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'David', 'movie', 'Animation, Family, Drama', 'From the songs of his mother’s heart to the whispers of a faithful God, David’s story begins in quiet devotion. When the giant Goliath rises to terrorize a nation, a young shepherd armed with only a sling, a few stones, and unshakable faith steps forward. Pursued by power and driven by purpose, his journey tests the limits of loyalty, love, and courage—culminating in a battle not just for a crown, but for the soul of a kingdom.', 
       2025, 7.9, 'https://image.tmdb.org/t/p/w500/7lFG1WrCwAxBfyGK8ahlBVzXno7.jpg', 
       'https://www.youtube.com/watch?v=2ocVv1m5NVU', 'In Theatres'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=2ocVv1m5NVU'
);

-- Movie 88: Marty Supreme
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Marty Supreme', 'movie', 'Drama', 'Marty Mauser, a young man with a dream no one respects, goes to hell and back in pursuit of greatness.', 
       2025, 7.9, 'https://image.tmdb.org/t/p/w500/firAhZA0uQvRL2slp7v3AnOj0ZX.jpg', 
       'https://www.youtube.com/watch?v=pwE3ZG1kIqw', 'In Theatres'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=pwE3ZG1kIqw'
);

-- Movie 89: Hamnet
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Hamnet', 'movie', 'Drama, Romance, History', 'The powerful story of love and loss that inspired the creation of Shakespeare''s timeless masterpiece, Hamlet.', 
       2025, 7.8, 'https://image.tmdb.org/t/p/w500/61xMzN4h8iLk0hq6oUzr9Ts6GE9.jpg', 
       'https://www.youtube.com/watch?v=I06-qKLtxCk', 'In Theatres'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=I06-qKLtxCk'
);

-- Movie 90: Rental Family
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Rental Family', 'movie', 'Comedy, Drama', 'An American actor in Tokyo struggles to find purpose until he lands an unusual gig: working for a Japanese ''rental family'' agency, playing stand-in roles for strangers. As he immerses himself in his clients'' worlds, he begins to form genuine bonds that blur the lines between performance and reality.', 
       2025, 7.8, 'https://image.tmdb.org/t/p/w500/A5lswNlytTUrnMWsuD0NFfhZlf3.jpg', 
       'https://www.youtube.com/watch?v=WcsoZYwhlxw', 'In Theatres'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=WcsoZYwhlxw'
);

-- Movie 91: The Secret Agent
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'The Secret Agent', 'movie', 'Crime, Drama, Thriller', 'Brazil, 1977. Marcelo, a technology expert in his early 40s, is on the run. Hoping to reunite with his son, he travels to Recife during Carnival but soon realizes that the city is not the safe haven he was expecting.', 
       2025, 7.7, 'https://image.tmdb.org/t/p/w500/iLE2YOmeboeTDC7GlOp1dzh1VFo.jpg', 
       'https://www.youtube.com/watch?v=9UfrzDKrhEc', 'In Theatres'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=9UfrzDKrhEc'
);

-- Movie 92: No Other Choice
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'No Other Choice', 'movie', 'Crime, Thriller, Comedy', 'After being laid off and humiliated by a ruthless job market, a veteran paper mill manager descends into violence in a desperate bid to reclaim his dignity.', 
       2025, 7.7, 'https://image.tmdb.org/t/p/w500/zqxc2O6eOcPdkcmvem9kgGHvkmM.jpg', 
       'https://www.youtube.com/watch?v=qdW-NLafWOA', 'In Theatres'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=qdW-NLafWOA'
);

-- Movie 93: Zootopia 2
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Zootopia 2', 'movie', 'Animation, Comedy, Adventure, Family, Mystery', 'After cracking the biggest case in Zootopia''s history, rookie cops Judy Hopps and Nick Wilde find themselves on the twisting trail of a great mystery when Gary De''Snake arrives and turns the animal metropolis upside down. To crack the case, Judy and Nick must go undercover to unexpected new parts of town, where their growing partnership is tested like never before.', 
       2025, 7.6, 'https://image.tmdb.org/t/p/w500/oJ7g2CifqpStmoYQyaLQgEU32qO.jpg', 
       'https://www.youtube.com/watch?v=k8t8rvRO7Ug', 'In Theatres'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=k8t8rvRO7Ug'
);

-- Movie 94: Sentimental Value
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Sentimental Value', 'movie', 'Drama', 'Sisters Nora and Agnes reunite with their estranged father, the charismatic Gustav, a once-renowned director who offers stage actress Nora a role in what he hopes will be his comeback film. When Nora turns it down, she soon discovers he has given her part to an eager young Hollywood star.', 
       2025, 7.6, 'https://image.tmdb.org/t/p/w500/pz9NCWxxOk3o0W3v1Zkhawrwb4i.jpg', 
       'https://www.youtube.com/watch?v=zBFstFXdk90', 'In Theatres'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=zBFstFXdk90'
);

-- Movie 95: The Day the Earth Blew Up: A Looney Tunes Movie
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'The Day the Earth Blew Up: A Looney Tunes Movie', 'movie', 'Family, Comedy, Adventure, Animation, Sci-Fi', 'Porky and Daffy, the classic animated odd couple, turn into unlikely heroes when their antics at the local bubble gum factory uncover a secret alien mind control plot. Against all odds, the two are determined to save their town (and the world!)...that is if they don''t drive each other crazy in the process.', 
       2025, 7.6, 'https://image.tmdb.org/t/p/w500/s2lB1kaYCdGSnZX5meQCiOR6HfX.jpg', 
       'https://www.youtube.com/watch?v=rfavar8cEPs', 'In Theatres'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=rfavar8cEPs'
);

-- Movie 96: Sinners
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Sinners', 'movie', 'Horror, Action, Thriller', 'Trying to leave their troubled lives behind, twin brothers return to their hometown to start again, only to discover that an even greater evil is waiting to welcome them back.', 
       2025, 7.5, 'https://image.tmdb.org/t/p/w500/qTvFWCGeGXgBRaINLY1zqgTPSpn.jpg', 
       'https://www.youtube.com/watch?v=wDajDVYC3Mo', 'In Theatres'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=wDajDVYC3Mo'
);

-- Movie 97: Song Sung Blue
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Song Sung Blue', 'movie', 'Drama, Music, Romance', 'Based on a true story, two down-on-their-luck musicians form a joyous Neil Diamond tribute band, proving it''s never too late to find love and follow your dreams.', 
       2025, 7.5, 'https://image.tmdb.org/t/p/w500/kQzDdxI0F5z16qo2vzDoqdVMl4O.jpg', 
       'https://www.youtube.com/watch?v=Hm12K_cuLWA', 'In Theatres'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=Hm12K_cuLWA'
);

-- Movie 98: One Battle After Another
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'One Battle After Another', 'movie', 'Thriller, Crime, Action', 'Washed-up revolutionary Bob exists in a state of stoned paranoia, surviving off-grid with his spirited, self-reliant daughter, Willa. When his evil nemesis resurfaces after 16 years and she goes missing, the former radical scrambles to find her, father and daughter both battling the consequences of his past.', 
       2025, 7.4, 'https://image.tmdb.org/t/p/w500/m1jFoahEbeQXtx4zArT2FKdbNIj.jpg', 
       'https://www.youtube.com/watch?v=u6GVb4p7oD4', 'In Theatres'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=u6GVb4p7oD4'
);

-- Movie 99: Bugonia
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Bugonia', 'movie', 'Sci-Fi, Thriller, Comedy', 'Two conspiracy obsessed young men kidnap the high-powered CEO of a major company, convinced that she is an alien intent on destroying planet Earth.', 
       2025, 7.4, 'https://image.tmdb.org/t/p/w500/rSdOua3wKMEaFWDcKAYWRjXQWOt.jpg', 
       'https://www.youtube.com/watch?v=gZ6pPFK6kaQ', 'In Theatres'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=gZ6pPFK6kaQ'
);

-- Movie 100: Avatar: Fire and Ash
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Avatar: Fire and Ash', 'movie', 'Sci-Fi, Adventure, Fantasy', 'In the wake of the devastating war against the RDA and the loss of their eldest son, Jake Sully and Neytiri face a new threat on Pandora: the Ash People, a violent and power-hungry Na''vi tribe led by the ruthless Varang. Jake''s family must fight for their survival and the future of Pandora in a conflict that pushes them to their emotional and physical limits.', 
       2025, 7.3, 'https://image.tmdb.org/t/p/w500/5bxrxnRaxZooBAxgUVBZ13dpzC7.jpg', 
       'https://www.youtube.com/watch?v=RlofL5WU28k', 'In Theatres'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=RlofL5WU28k'
);

-- Movie 101: The Housemaid
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'The Housemaid', 'movie', 'Mystery, Thriller', 'Trying to escape her past, Millie Calloway accepts a job as a live-in housemaid for the wealthy Nina and Andrew Winchester. But what begins as a dream job quickly unravels into something far more dangerous—a sexy, seductive game of secrets, scandal, and power.', 
       2025, 7.1, 'https://image.tmdb.org/t/p/w500/cWsBscZzwu5brg9YjNkGewRUvJX.jpg', 
       'https://www.youtube.com/watch?v=TGdKFCVn6G0', 'In Theatres'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=TGdKFCVn6G0'
);

-- Movie 102: Sirāt
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Sirāt', 'movie', 'Drama, Thriller, Music', 'A man and his son arrive at a rave lost in the mountains of Morocco. They are looking for Marina, their daughter and sister, who disappeared months ago at another rave. Driven by fate, they decide to follow a group of ravers in search of one last party, in hopes Marina will be there.', 
       2025, 6.8, 'https://image.tmdb.org/t/p/w500/bzBtsLi17rK4G6kDvOXfUZfAhca.jpg', 
       'https://www.youtube.com/watch?v=3_9OkHX8ZiA', 'In Theatres'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=3_9OkHX8ZiA'
);

-- Movie 103: The SpongeBob Movie: Search for SquarePants
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'The SpongeBob Movie: Search for SquarePants', 'movie', 'Animation, Family, Comedy, Adventure, Fantasy', 'Desperate to be a big guy, SpongeBob sets out to prove his bravery to Mr. Krabs by following The Flying Dutchman – a mysterious swashbuckling ghost pirate – on a seafaring adventure that takes him to the deepest depths of the deep sea, where no Sponge has gone before.', 
       2025, 6.6, 'https://image.tmdb.org/t/p/w500/pDWYW9v8fmJdA7N0I1MOdQA3ETq.jpg', 
       'https://www.youtube.com/watch?v=UazW5vuAsF0', 'In Theatres'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=UazW5vuAsF0'
);

-- Movie 104: Spartacus: House of Ashur
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Spartacus: House of Ashur', 'tv', 'Drama, Action', 'In a world where he survived the events of Spartacus (2010), Ashur clawed his way to power, owning the same ludus that once owned him. Allying with a fierce gladiatrix, Ashur ignites a new kind of spectacle that offends the elite.', 
       2025, 6.3, 'https://image.tmdb.org/t/p/w500/vNByuzy60v31nmUVPMA8oAtneUK.jpg', 
       'https://www.youtube.com/watch?v=sHl32450smA', 'In Theatres'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=sHl32450smA'
);

-- Movie 105: Anaconda
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Anaconda', 'movie', 'Adventure, Comedy, Horror', 'A group of friends facing mid-life crises head to the rainforest with the intention of remaking their favorite movie from their youth, only to find themselves in a fight for their lives against natural disasters, giant snakes and violent criminals.', 
       2025, 6, 'https://image.tmdb.org/t/p/w500/qxMv3HwAB3XPuwNLMhVRg795Ktp.jpg', 
       'https://www.youtube.com/watch?v=jMbBuQAYOeM', 'In Theatres'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=jMbBuQAYOeM'
);

-- Movie 106: Silent Night, Deadly Night
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Silent Night, Deadly Night', 'movie', 'Horror, Thriller', 'After witnessing his parents'' brutal murder on Christmas Eve, Billy transforms into a Killer Santa, delivering a yearly spree of calculated, chilling violence. This year, his blood-soaked mission collides with love, as a young woman challenges him to confront his darkness.', 
       2025, 5.9, 'https://image.tmdb.org/t/p/w500/xCdSd7NnRdnL8DGLVhI95WhUNoi.jpg', 
       'https://www.youtube.com/watch?v=wIi7YOvQe7s', 'In Theatres'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=wIi7YOvQe7s'
);

-- Movie 107: Ella McCay
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Ella McCay', 'movie', 'Comedy, Drama', 'An idealistic young politician juggles familial issues and a challenging work life while preparing to take over the job of her mentor, the state’s longtime incumbent governor.', 
       2025, 5.4, 'https://image.tmdb.org/t/p/w500/iQCtK477yqp6xnHHrQG2P0lXoow.jpg', 
       'https://www.youtube.com/watch?v=pK0wPlOyqNk', 'In Theatres'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=pK0wPlOyqNk'
);

-- Movie 110: Wicked: Part Two
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Wicked: Part Two', 'movie', 'Musical, Fantasy, Drama', 'The conclusion of the epic musical saga starring Cynthia Erivo and Ariana Grande.', 
       2025, NULL, 'https://image.tmdb.org/t/p/w500/wicked2wicked2wicked.jpg', 
       'https://www.youtube.com/watch?v=6COmYeLsz4c', 'In Theatres'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=6COmYeLsz4c'
);

-- Movie 124: Mission: Impossible - The Final Reckoning
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Mission: Impossible - The Final Reckoning', 'movie', 'Action, Thriller, Adventure', 'Ethan Hunt faces his most dangerous mission yet.', 
       2025, 8.1, 'https://image.tmdb.org/t/p/w500/kTlprrfR3L1OAI6dLqRWECU3iKD.jpg', 
       'https://www.youtube.com/watch?v=NOhDyUmT9z0', 'In Theatres'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=NOhDyUmT9z0'
);

-- Movie 125: 28 Years Later
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT '28 Years Later', 'movie', 'Horror, Thriller, Sci-Fi', 'The rage virus resurfaces 28 years after the original outbreak.', 
       2025, 7.8, 'https://image.tmdb.org/t/p/w500/djMHuhf7LD3F7WAMhqZmTEKbv2j.jpg', 
       'https://www.youtube.com/watch?v=bHfxFUnjPRk', 'In Theatres'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=bHfxFUnjPRk'
);

-- Movie 126: Thunderbolts*
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Thunderbolts*', 'movie', 'Action, Sci-Fi', 'A team of antiheroes is assembled for dangerous missions.', 
       2025, 7.5, 'https://image.tmdb.org/t/p/w500/m3DQ8W7ngFfVxShElqNRr4EpDhv.jpg', 
       'https://www.youtube.com/watch?v=LDq756MewEI', 'In Theatres'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=LDq756MewEI'
);

-- Movie 127: Ballerina
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Ballerina', 'movie', 'Action, Thriller, Crime', 'A John Wick spinoff following a deadly ballerina assassin.', 
       2025, 7.4, 'https://image.tmdb.org/t/p/w500/cqNF8nrgMBcYD6UJLbmOg9D3Lhu.jpg', 
       'https://www.youtube.com/watch?v=dX7aXv8B4UQ', 'In Theatres'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=dX7aXv8B4UQ'
);

-- Movie 128: The Accountant 2
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'The Accountant 2', 'movie', 'Action, Thriller, Crime', 'Ben Affleck returns as the deadly accountant.', 
       2025, 7.3, 'https://image.tmdb.org/t/p/w500/nAzF0yCQvVKbSJiJCAbuhWOqLwm.jpg', 
       'https://www.youtube.com/watch?v=W0iB7RftezA', 'In Theatres'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=W0iB7RftezA'
);

-- Movie 129: Karate Kid: Legends
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Karate Kid: Legends', 'movie', 'Action, Drama, Family', 'Jackie Chan and Ralph Macchio team up in this martial arts epic.', 
       2025, 7, 'https://image.tmdb.org/t/p/w500/i5KDaWVzSyDPPXYuA5yW7Fmvpjt.jpg', 
       'https://www.youtube.com/watch?v=VdLGPt3_bSI', 'In Theatres'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=VdLGPt3_bSI'
);

-- Movie 130: Freakier Friday
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Freakier Friday', 'movie', 'Comedy, Family, Fantasy', 'Jamie Lee Curtis and Lindsay Lohan return for another body swap adventure.', 
       2025, 7, 'https://image.tmdb.org/t/p/w500/rIAKXGF90iuYoOcWiJkMcfG03WF.jpg', 
       'https://www.youtube.com/watch?v=qAu3xLqqPP8', 'In Theatres'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=qAu3xLqqPP8'
);

-- Movie 131: A Minecraft Movie
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'A Minecraft Movie', 'movie', 'Adventure, Family, Comedy', 'A live-action adaptation of the beloved video game.', 
       2025, 6.5, 'https://image.tmdb.org/t/p/w500/yFHHfHcUgGAxziP1C3lLt0q2T4s.jpg', 
       'https://www.youtube.com/watch?v=wJO_vIDylog', 'In Theatres'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=wJO_vIDylog'
);

-- Movie 132: Fallout
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Fallout', 'tv', 'Action', 'The story of haves and have-nots in a world in which there''s almost nothing left to have. 200 years after the apocalypse, the gentle denizens of luxury fallout shelters are forced to return to the irradiated hellscape their ancestors left behind — and are shocked to discover an incredibly complex, gleefully weird, and highly violent universe waiting for them.', 
       2024, 8.1, 'https://image.tmdb.org/t/p/w500/c15BtJxCXMrISLVmysdsnZUPQft.jpg', 
       'https://www.youtube.com/watch?v=7h8zJHywjAw', 'In Theatres'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=7h8zJHywjAw'
);

-- Movie 135: 【OSHI NO KO】
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT '【OSHI NO KO】', 'tv', 'Animation, Drama', 'A small-town doctor gets sucked into the ruthless world of show business when he crosses paths with a popular teen idol who holds a secret.', 
       2023, 8.3, 'https://image.tmdb.org/t/p/w500/rFp74PFpz14AHrtlVPrLyrSng47.jpg', 
       'https://www.youtube.com/watch?v=FQLfj75E2JI', 'In Theatres'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=FQLfj75E2JI'
);

-- Movie 136: The Daily Life of the Immortal King
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'The Daily Life of the Immortal King', 'tv', 'Animation, Comedy, Action', 'As a cultivation genius who has achieved a new realm every two years since he was a year old, Wang Ling is a near-invincible existence with prowess far beyond his control. But now that he’s sixteen, he faces his greatest battle yet – Senior High School. With one challenge after another popping up, his plans for a low-key high school life seem further and further away…', 
       2020, 8.3, 'https://image.tmdb.org/t/p/w500/7By0jV3kf9MVvv3X3K8u4mhRUwp.jpg', 
       'https://www.youtube.com/watch?v=ugUm2Q0FNq8', 'In Theatres'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=ugUm2Q0FNq8'
);

-- Movie 137: The Good Doctor
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'The Good Doctor', 'tv', 'Drama', 'Shaun Murphy, a young surgeon with autism and savant syndrome, relocates from a quiet country life to join a prestigious hospital''s surgical unit. Unable to personally connect with those around him, Shaun uses his extraordinary medical gifts to save lives and challenge the skepticism of his colleagues.', 
       2017, 8.5, 'https://image.tmdb.org/t/p/w500/luhKkdD80qe62fwop6sdrXK9jUT.jpg', 
       'https://www.youtube.com/watch?v=lnY9FWUTY84', 'In Theatres'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=lnY9FWUTY84'
);

-- Movie 138: The Night Manager
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'The Night Manager', 'tv', 'Drama, Mystery, Crime', 'Former British soldier Jonathan Pine navigates the shadowy recesses of Whitehall and Washington where an unholy alliance operates between the intelligence community and the secret arms trade. To infiltrate the inner circle of lethal arms dealer Richard Onslow Roper, Pine must himself become a criminal.', 
       2016, 7.7, 'https://image.tmdb.org/t/p/w500/1MccRnw41qQjREuZkovqP2UX1i3.jpg', 
       'https://www.youtube.com/watch?v=ZoJ3lu03jug', 'In Theatres'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=ZoJ3lu03jug'
);

-- Movie 139: Chicago Med
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Chicago Med', 'tv', 'Drama', 'An emotional thrill ride through the day-to-day chaos of the city''s most explosive hospital and the courageous team of doctors who hold it together. They will tackle unique new cases inspired by topical events, forging fiery relationships in the pulse-pounding pandemonium of the emergency room.', 
       2015, 8.3, 'https://image.tmdb.org/t/p/w500/9eym662FRJJb9wdgCiDKPDciZzf.jpg', 
       'https://www.youtube.com/watch?v=U2NZ7G02e40', 'In Theatres'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=U2NZ7G02e40'
);

-- Movie 140: The Late Show with Stephen Colbert
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'The Late Show with Stephen Colbert', 'tv', 'Comedy, Talk', 'Stephen Colbert brings his signature satire and comedy to The Late Show with Stephen Colbert, the #1 show in late night, where he talks with an eclectic mix of guests about what is new and relevant in the worlds of politics, entertainment, business, music, technology, and more. Featuring bandleader Jon Batiste with his band Stay Human, the Emmy Award-nominated show is broadcast from the historic Ed Sullivan Theater.', 
       2015, 6.2, 'https://image.tmdb.org/t/p/w500/9jkThAGYj2yp8jsS6Nriy5mzKFT.jpg', 
       'https://www.youtube.com/watch?v=nWufb0qL1xU', 'In Theatres'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=nWufb0qL1xU'
);

-- Movie 141: Chicago P.D.
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Chicago P.D.', 'tv', 'Crime, Drama', 'A riveting police drama about the men and women of the Chicago Police Department''s District 21 who put it all on the line to serve and protect their community. District 21 is made up of two distinctly different groups: the uniformed cops who patrol the beat and go head-to-head with the city''s street crimes and the Intelligence Unit that combats the city''s major offenses - organized crime, drug trafficking, high profile murders and beyond.', 
       2014, 8.4, 'https://image.tmdb.org/t/p/w500/bez40PgT36RUu4gstD2A6GSM0tP.jpg', 
       'https://www.youtube.com/watch?v=NZcr9IFS9R0', 'In Theatres'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=NZcr9IFS9R0'
);

-- Movie 142: Fargo
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Fargo', 'tv', 'Crime, Drama', 'A close-knit anthology series dealing with stories involving malice, violence and murder based in and around Minnesota.', 
       2014, 8.3, 'https://image.tmdb.org/t/p/w500/6U9CPeD8obHzweikFhiLhpc7YBT.jpg', 
       'https://www.youtube.com/watch?v=FXIeYKlMA_0', 'In Theatres'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=FXIeYKlMA_0'
);

-- Movie 143: The Tonight Show Starring Jimmy Fallon
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'The Tonight Show Starring Jimmy Fallon', 'tv', 'Comedy, Talk', 'After Jay Leno''s second retirement from the program, Jimmy Fallon stepped in as his permanent replacement. After 42 years in Los Angeles the program was brought back to New York.', 
       2014, 5.9, 'https://image.tmdb.org/t/p/w500/1N4o5PmmqhlVDrcdJ2RlCFWbLGX.jpg', 
       'https://www.youtube.com/watch?v=q-0YafsWK_M', 'In Theatres'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=q-0YafsWK_M'
);

-- Movie 144: Late Night with Seth Meyers
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Late Night with Seth Meyers', 'tv', 'Talk, Comedy', 'Seth Meyers, who is "Saturday Night Live''s" longest serving anchor on the show''s wildly popular "Weekend Update," takes over as host of NBC''s "Late Night" — home to A-list celebrity guests, memorable comedy and the best in musical talent. As the Emmy Award-winning head writer for "SNL," Meyers has established a reputation for sharp wit and perfectly timed comedy, and has gained fame for his spot-on jokes and satire. Meyers takes his departure from "SNL" to his new post at "Late Night," as Jimmy Fallon moves to "The Tonight Show".', 
       2014, 5.3, 'https://image.tmdb.org/t/p/w500/jm95V8XjfvqmEhw0MN09wbg9Mi3.jpg', 
       'https://www.youtube.com/watch?v=rLwbzGyC6t4', 'In Theatres'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=rLwbzGyC6t4'
);

-- Movie 145: Game of Thrones
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Game of Thrones', 'tv', 'Drama, Action', 'Seven noble families fight for control of the mythical land of Westeros. Friction between the houses leads to full-scale war. All while a very ancient evil awakens in the farthest north. Amidst the war, a neglected military order of misfits, the Night''s Watch, is all that stands between the realms of men and icy horrors beyond.', 
       2011, 8.5, 'https://image.tmdb.org/t/p/w500/1XS1oqL89opfnbLl8WnZY1O1uJx.jpg', 
       'https://www.youtube.com/watch?v=KPLWWIOCOOQ', 'In Theatres'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=KPLWWIOCOOQ'
);

-- Movie 146: Death in Paradise
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Death in Paradise', 'tv', 'Comedy, Crime, Drama, Mystery', 'A brilliant but idiosyncratic British detective and his resourceful local team solve baffling murder mysteries on the fictional Caribbean island of Saint Marie.', 
       2011, 7.5, 'https://image.tmdb.org/t/p/w500/u7t6vCyqAdD5hE4eEfTrZmVljDi.jpg', 
       'https://www.youtube.com/watch?v=f9B6dljC7ag', 'In Theatres'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=f9B6dljC7ag'
);

-- Movie 147: Supernatural
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Supernatural', 'tv', 'Drama, Mystery', 'When they were boys, Sam and Dean Winchester lost their mother to a mysterious and demonic supernatural force. Subsequently, their father raised them to be soldiers. He taught them about the paranormal evil that lives in the dark corners and on the back roads of America ... and he taught them how to kill it. Now, the Winchester brothers crisscross the country in their ''67 Chevy Impala, battling every kind of supernatural threat they encounter along the way. ', 
       2005, 8.3, 'https://image.tmdb.org/t/p/w500/u40gJarLPlIkwouKlzGdobQOV9k.jpg', 
       'https://www.youtube.com/watch?v=yy96yJjkvjo', 'In Theatres'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=yy96yJjkvjo'
);

-- Movie 148: The Lord of the Rings: The Return of the King
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'The Lord of the Rings: The Return of the King', 'movie', 'Adventure, Fantasy, Action', 'As armies mass for a final battle that will decide the fate of the world--and powerful, ancient forces of Light and Dark compete to determine the outcome--one member of the Fellowship of the Ring is revealed as the noble heir to the throne of the Kings of Men. Yet, the sole hope for triumph over evil lies with a brave hobbit, Frodo, who, accompanied by his loyal friend Sam and the hideous, wretched Gollum, ventures deep into the very dark heart of Mordor on his seemingly impossible quest to destroy the Ring of Power.​', 
       2003, 8.5, 'https://image.tmdb.org/t/p/w500/rCzpDGLbOoPwLjy3OAm5NUPOTrC.jpg', 
       'https://www.youtube.com/watch?v=1zPLzpqjO4U', 'In Theatres'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=1zPLzpqjO4U'
);

-- Movie 149: Mayday
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Mayday', 'tv', 'Documentary, Drama, Crime', 'Major real-life air disasters are depicted in this series. Each episode features a detailed dramatized reconstruction of the incident based on cockpit voice recorders and air traffic control transcripts, as well as eyewitnesses recounts and interviews with aviation experts.', 
       2003, 8.2, 'https://image.tmdb.org/t/p/w500/sUfJxQarDfBMgmJgsgJqmVP16UU.jpg', 
       'https://www.youtube.com/watch?v=D1PRxyN3qf0', 'In Theatres'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=D1PRxyN3qf0'
);

-- Movie 150: The Lord of the Rings: The Fellowship of the Ring
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'The Lord of the Rings: The Fellowship of the Ring', 'movie', 'Adventure, Fantasy, Action', 'Young hobbit Frodo Baggins, after inheriting a mysterious ring from his uncle Bilbo, must leave his home in order to keep it from falling into the hands of its evil creator. Along the way, a fellowship is formed to protect the ringbearer and make sure that the ring arrives at its final destination: Mt. Doom, the only place where it can be destroyed.', 
       2001, 8.4, 'https://image.tmdb.org/t/p/w500/6oom5QYQ2yQTMJIbnvbkBL9cHo6.jpg', 
       'https://www.youtube.com/watch?v=CbYmZOV3G-Q', 'In Theatres'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=CbYmZOV3G-Q'
);

-- Movie 151: Midsomer Murders
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Midsomer Murders', 'tv', 'Crime, Drama, Mystery', 'The peacefulness of the Midsomer community is shattered by violent crimes, suspects are placed under suspicion, and it is up to a veteran DCI and his young sergeant to calmly and diligently eliminate the innocent and ruthlessly pursue the guilty. ', 
       1997, 7.5, 'https://image.tmdb.org/t/p/w500/pz7tsWxe0TTdfJnWPjZAEnrSl5M.jpg', 
       'https://www.youtube.com/watch?v=ym8b4UJDqcw', 'In Theatres'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=ym8b4UJDqcw'
);

-- Movie 152: Friends
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Friends', 'tv', 'Comedy', 'Six young people from New York City, on their own and struggling to survive in the real world, find the companionship, comfort and support they get from each other to be the perfect antidote to the pressures of life.', 
       1994, 8.4, 'https://image.tmdb.org/t/p/w500/2koX1xLkpTQM4IZebYvKysFW1Nh.jpg', 
       'https://www.youtube.com/watch?v=7BLgQ-vRcjs', 'In Theatres'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=7BLgQ-vRcjs'
);

-- Movie 153: Kamen Rider
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Kamen Rider', 'tv', 'Action, Drama', 'Takeshi Hongo is a promising young man with a passion for motorcycle racing. However, his dreams are suddenly ruined when he gets kidnapped by Shocker, the evil secret organization planning to dominate the world. After being remodeled into a cyborg, Takeshi escapes and swears to protect the world from the inhuman monsters.', 
       1971, 6.5, 'https://image.tmdb.org/t/p/w500/lv3OlrXyTNg4Dz0JrtopOmMziNs.jpg', 
       'https://www.youtube.com/watch?v=FY4TBfTLPEM', 'In Theatres'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=FY4TBfTLPEM'
);

-- Movie 154: Mission: Impossible 8
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Mission: Impossible 8', 'movie', 'Action, Thriller, Adventure', 'Tom Cruise returns as Ethan Hunt in the conclusion of the Dead Reckoning saga.', 
       2027, NULL, 'https://image.tmdb.org/t/p/w500/NNxYkU70HPurnNCSiCjYAmacwm.jpg', 
       'https://www.youtube.com/watch?v=avz06PDqDbM', 'Coming Soon'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=avz06PDqDbM'
);

-- Movie 155: Fantastic Four: First Steps
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Fantastic Four: First Steps', 'movie', 'Action, Sci-Fi, Adventure', 'Marvel''s First Family finally arrives in the MCU.', 
       2027, NULL, 'https://image.tmdb.org/t/p/w500/4Gdigj0EgUNexHJJXTArxk0O8Fv.jpg', 
       'https://www.youtube.com/watch?v=p2_QXWXVVxk', 'Coming Soon'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=p2_QXWXVVxk'
);

-- Movie 156: Predator: Badlands
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Predator: Badlands', 'movie', 'Sci-Fi, Action, Thriller', 'A new chapter in the Predator franchise.', 
       2027, NULL, 'https://image.tmdb.org/t/p/w500/5N0gPmHG6ofOj7Cd7ByFfvvRjFT.jpg', 
       'https://www.youtube.com/watch?v=PN9WdnZuDz8', 'Coming Soon'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=PN9WdnZuDz8'
);

-- Movie 157: Jurassic World 4
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Jurassic World 4', 'movie', 'Action, Adventure, Sci-Fi', 'A new era of dinosaur chaos begins.', 
       2027, NULL, 'https://image.tmdb.org/t/p/w500/oU7Ohr3T8VKz3sAMmkHl0SWn6xQ.jpg', 
       'https://www.youtube.com/watch?v=RFinNxS5KN4', 'Coming Soon'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=RFinNxS5KN4'
);

-- Movie 158: Cosmic Princess Kaguya!
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Cosmic Princess Kaguya!', 'movie', 'Animation, Fantasy, Music, Sci-Fi', 'Iroha''s life gets knocked off its orbit when Kaguya, a carefree runaway from the Moon, moves in and convinces her to perform in a virtual world together.', 
       2026, 8.4, 'https://image.tmdb.org/t/p/w500/9I9cM38gecZcwJ0C6r0cwfvtPJP.jpg', 
       'https://www.youtube.com/watch?v=uine6d15yGE', 'Netflix'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=uine6d15yGE'
);

-- Movie 159: Memory of a Killer
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Memory of a Killer', 'tv', 'Crime', 'Angelo Ledda lives two totally separate lives — fearsome NYC hitman and sleepy upstate Cooperstown photocopier salesman and father. Both of them are threatened when he is diagnosed with Alzheimer''s, a disease he already lost his older brother to.', 
       2026, 8.2, 'https://image.tmdb.org/t/p/w500/3kpXrWW6gmlngwgSa52IhBpjPuz.jpg', 
       'https://www.youtube.com/watch?v=TdenhFzKenM', 'Hulu'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=TdenhFzKenM'
);

-- Movie 160: Finding Her Edge
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Finding Her Edge', 'tv', 'Drama', 'A former ice dancer returns to the rink with an exciting new partner while holding onto feelings for her old one — her first love.', 
       2026, 7.1, 'https://image.tmdb.org/t/p/w500/rundKWddXHke82ee8Sv9KJmuGhn.jpg', 
       'https://www.youtube.com/watch?v=ppZ3qgtFOME', 'Netflix'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=ppZ3qgtFOME'
);

-- Movie 161: The Rip
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'The Rip', 'movie', 'Action, Thriller, Crime', 'Trust frays when a team of Miami cops discovers millions in cash inside a run-down stash house, calling everyone — and everything — into question.', 
       2026, 7, 'https://image.tmdb.org/t/p/w500/p4bW2sJKAwcHuLpfoZK7Zo63osA.jpg', 
       'https://www.youtube.com/watch?v=yeR5bcbRPak', 'Netflix'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=yeR5bcbRPak'
);

-- Movie 162: The Beauty
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'The Beauty', 'tv', 'Drama', 'The world of high fashion turns dark when international supermodels begin dying in gruesome and mysterious ways. FBI Agents Cooper Madsen and Jordan Bennett are sent to Paris to uncover the truth. As they delve deeper into the case, they uncover a sexually transmitted virus that transforms ordinary people into visions of physical perfection, but with terrifying consequences.', 
       2026, 5.6, 'https://image.tmdb.org/t/p/w500/tZTG2PPAukzksPkiQV9c4suIQXk.jpg', 
       'https://www.youtube.com/watch?v=9NmM4tM5Xl0', 'Disney+'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=9NmM4tM5Xl0'
);

-- Movie 163: Star Trek: Starfleet Academy
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Star Trek: Starfleet Academy', 'tv', 'Action', 'A young group of cadets come together to pursue a common dream of hope and optimism. Under the watchful and demanding eyes of their instructors, they will discover what it takes to become Starfleet officers as they navigate blossoming friendships, explosive rivalries, first loves and a new enemy that threatens both the Academy and the Federation itself.', 
       2026, 5, 'https://image.tmdb.org/t/p/w500/m4JnADIJkF5ck6jq7GUEcPBKxd0.jpg', 
       'https://www.youtube.com/watch?v=rHDDzcyNWGs', 'Paramount Plus'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=rHDDzcyNWGs'
);

-- Movie 164: From the Ashes: The Pit
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'From the Ashes: The Pit', 'movie', 'Thriller, Drama', 'Trapped in an underground pit during a storm, three students from an all-girls school must confront their personal conflicts as they fight to survive.', 
       2026, 3.8, 'https://image.tmdb.org/t/p/w500/iwZIR8wp1lqj69zsbWmZKhXTTIU.jpg', 
       'https://www.youtube.com/watch?v=0Uc4M9JvL0g', 'Netflix'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=0Uc4M9JvL0g'
);

-- Movie 167: The Boys Season 5
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'The Boys Season 5', 'tv', 'Action, Comedy, Crime', 'The final season of the superhero satire series.', 
       2026, 8.7, 'https://image.tmdb.org/t/p/w500/stTEycfG9929HYGCNrLxbDaFhLz.jpg', 
       'https://www.youtube.com/watch?v=_PH8WvI8t_Q', 'Prime Video'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=_PH8WvI8t_Q'
);

-- Movie 168: House of the Dragon Season 3
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'House of the Dragon Season 3', 'tv', 'Drama, Fantasy, Action', 'The Targaryen civil war continues in this Game of Thrones prequel.', 
       2026, 8.5, 'https://image.tmdb.org/t/p/w500/1X4h40fcB4WWUmIBK0auQDOGxkR.jpg', 
       'https://www.youtube.com/watch?v=DotnJ7tTA34', 'Max'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=DotnJ7tTA34'
);

-- Movie 169: Hacks Season 4
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Hacks Season 4', 'tv', 'Comedy, Drama', 'Deborah Vance and Ava continue their comedic partnership.', 
       2026, 8.5, 'https://image.tmdb.org/t/p/w500/lzf4rS7vpuT1z9HQAhMy5tM9I8N.jpg', 
       'https://www.youtube.com/watch?v=CYjKjh62MtI', 'Max'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=CYjKjh62MtI'
);

-- Movie 170: Euphoria Season 3
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Euphoria Season 3', 'tv', 'Drama', 'The critically acclaimed teen drama returns.', 
       2026, 8.4, 'https://image.tmdb.org/t/p/w500/jtnfNzqZwN4E32FGGxx1YZaBWWf.jpg', 
       'https://www.youtube.com/watch?v=2vT2QdLgEL8', 'Max'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=2vT2QdLgEL8'
);

-- Movie 171: The Gilded Age Season 3
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'The Gilded Age Season 3', 'tv', 'Drama, History', 'The period drama continues in 1880s New York.', 
       2026, 8, 'https://image.tmdb.org/t/p/w500/uWs7E8bfH1QcLJDsK6RlIPz6UBP.jpg', 
       'https://www.youtube.com/watch?v=5KGV5yqMGX0', 'Max'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=5KGV5yqMGX0'
);

-- Movie 172: Ahsoka Season 2
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Ahsoka Season 2', 'tv', 'Action, Adventure, Sci-Fi', 'Ahsoka Tano''s search for Grand Admiral Thrawn continues.', 
       2026, 7.8, 'https://image.tmdb.org/t/p/w500/eiJeWeCAEZAmRppnXHiTWDcCd3Q.jpg', 
       'https://www.youtube.com/watch?v=J5-f0MA8TaU', 'Disney+'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=J5-f0MA8TaU'
);

-- Movie 173: Lanterns
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Lanterns', 'tv', 'Sci-Fi, Action, Drama', 'Kyle Chandler stars as Hal Jordan in this DC series.', 
       2026, NULL, 'https://image.tmdb.org/t/p/w500/nnShzLQDdhJBiVCnW0MWQaF8Xbs.jpg', 
       'https://www.youtube.com/watch?v=TI1Z7cZVJVk', 'Max'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=TI1Z7cZVJVk'
);

-- Movie 174: Pluribus
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Pluribus', 'tv', 'Drama', 'The most miserable person on Earth must save the world from happiness.', 
       2025, 7.9, 'https://image.tmdb.org/t/p/w500/nrM2xFUfKJJEmZzd5d7kohT2G0C.jpg', 
       'https://www.youtube.com/watch?v=a6lzvWby9UE', 'Apple TV+'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=a6lzvWby9UE'
);

-- Movie 175: F1
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'F1', 'movie', 'Action, Drama', 'Racing legend Sonny Hayes is coaxed out of retirement to lead a struggling Formula 1 team—and mentor a young hotshot driver—while chasing one more chance at glory.', 
       2025, 7.8, 'https://image.tmdb.org/t/p/w500/vqBmyAj0Xm9LnS1xe1MSlMAJyHq.jpg', 
       'https://www.youtube.com/watch?v=yQhnhH2adFM', 'Apple TV+'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=yQhnhH2adFM'
);

-- Movie 176: Frankenstein
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Frankenstein', 'movie', 'Drama, Fantasy, Horror', 'Dr. Victor Frankenstein, a brilliant but egotistical scientist, brings a creature to life in a monstrous experiment that ultimately leads to the undoing of both the creator and his tragic creation.', 
       2025, 7.7, 'https://image.tmdb.org/t/p/w500/g4JtvGlQO7DByTI6frUobqvSL3R.jpg', 
       'https://www.youtube.com/watch?v=9WZllcEgWrM', 'Netflix'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=9WZllcEgWrM'
);

-- Movie 177: Train Dreams
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Train Dreams', 'movie', 'Drama', 'A logger leads a life of quiet grace as he experiences love and loss during an era of monumental change in early 20th-century America.', 
       2025, 7.3, 'https://image.tmdb.org/t/p/w500/wfzYOVdafdbD1d3SxNqiBtV2Yhx.jpg', 
       'https://www.youtube.com/watch?v=6voWeM-xQ4Y', 'Netflix'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=6voWeM-xQ4Y'
);

-- Movie 178: The Big Fake
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'The Big Fake', 'movie', 'Thriller, Crime, Drama', 'Toni Chichiarelli arrives in Rome with the dream of becoming a painter, but his talent leads him elsewhere — from art galleries to state secrets. Between art, crime, and power, his signature ends up everywhere — even in the history of Italy.', 
       2025, 6.4, 'https://image.tmdb.org/t/p/w500/A188B94iDLdB6499QBYbz74WgOF.jpg', 
       'https://www.youtube.com/watch?v=OMeOauwYjRs', 'Netflix'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=OMeOauwYjRs'
);

-- Movie 192: Reacher Season 3
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Reacher Season 3', 'tv', 'Action, Crime, Drama', 'Jack Reacher faces new dangerous adversaries.', 
       2025, 8.2, 'https://image.tmdb.org/t/p/w500/xoTpbHNqt0b8smBjhwWFJ6erTBR.jpg', 
       'https://www.youtube.com/watch?v=C9vCoVL04cE', 'Prime Video'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=C9vCoVL04cE'
);

-- Movie 196: The Witcher Season 4
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'The Witcher Season 4', 'tv', 'Action, Adventure, Drama', 'Liam Hemsworth takes over as Geralt of Rivia.', 
       2025, 7.5, 'https://image.tmdb.org/t/p/w500/7vjaCdMw15FEbXyLQTVa04URsPm.jpg', 
       'https://www.youtube.com/watch?v=S1lrHqP-KTI', 'Netflix'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=S1lrHqP-KTI'
);

-- Movie 197: The Bride
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'The Bride', 'movie', 'Sci-Fi, Drama, Romance', 'A reimagining of Bride of Frankenstein.', 
       2025, 7.2, 'https://image.tmdb.org/t/p/w500/c5Tqxeo1UpBvnAc3csUm7j3hlQl.jpg', 
       'https://www.youtube.com/watch?v=AQCJ46kFqQE', 'Netflix'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=AQCJ46kFqQE'
);

-- Movie 198: Havoc
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Havoc', 'movie', 'Action, Thriller, Crime', 'Tom Hardy stars as a detective navigating a criminal conspiracy.', 
       2025, 7.1, 'https://image.tmdb.org/t/p/w500/pnXLFioDeftqjlCVlRmXvIdMsdP.jpg', 
       'https://www.youtube.com/watch?v=mW4kMGjVlf8', 'Netflix'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=mW4kMGjVlf8'
);

-- Movie 199: Arcane Season 2
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Arcane Season 2', 'tv', 'Animation, Action, Adventure', 'The animated League of Legends series continues.', 
       2024, 9, 'https://image.tmdb.org/t/p/w500/fqldf2t8ztc9aiwn3k6mlX3tvRT.jpg', 
       'https://www.youtube.com/watch?v=TUzoyKwNK0E', 'Netflix'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=TUzoyKwNK0E'
);

-- Movie 201: Shogun
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Shogun', 'tv', 'Drama, History, War', 'An English sailor becomes embroiled in feudal Japan''s political conflicts.', 
       2024, 8.9, 'https://image.tmdb.org/t/p/w500/7O4iVfOMQmdCSxhOg1WnNHghII4.jpg', 
       'https://www.youtube.com/watch?v=ikqHXEXivtc', 'Hulu'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=ikqHXEXivtc'
);

-- Movie 203: The Penguin
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'The Penguin', 'tv', 'Crime, Drama, Thriller', 'Colin Farrell returns as Oz Cobb in this Batman spinoff.', 
       2024, 8.6, 'https://image.tmdb.org/t/p/w500/6bE57bZfE0bKxEIGGbNWFBUhBVA.jpg', 
       'https://www.youtube.com/watch?v=0z_LAIaQGpU', 'Max'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=0z_LAIaQGpU'
);

-- Movie 206: Slow Horses Season 4
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Slow Horses Season 4', 'tv', 'Drama, Thriller', 'The disgraced MI5 agents at Slough House face new dangers.', 
       2024, 8.5, 'https://image.tmdb.org/t/p/w500/pjVHLPChJEXtSx1EFCKyKNGGqI9.jpg', 
       'https://www.youtube.com/watch?v=TYqXWJ-E4Nc', 'Apple TV+'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=TYqXWJ-E4Nc'
);

-- Movie 207: Cobra Kai Season 6
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Cobra Kai Season 6', 'tv', 'Action, Comedy, Drama', 'The final season of the Karate Kid sequel series.', 
       2024, 8.4, 'https://image.tmdb.org/t/p/w500/m4TU47z7GVLhJFnt6sd0QKVXWAV.jpg', 
       'https://www.youtube.com/watch?v=OHQZ4a5lNEo', 'Netflix'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=OHQZ4a5lNEo'
);

-- Movie 208: The Wild Robot
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'The Wild Robot', 'movie', 'Animation, Family, Sci-Fi', 'A robot learns to survive in the wilderness and becomes a mother.', 
       2024, 8.3, 'https://image.tmdb.org/t/p/w500/wTnV3PCVW5O92JMrFvvrRcV39RU.jpg', 
       'https://www.youtube.com/watch?v=67vbA5ZJdKQ', 'Peacock'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=67vbA5ZJdKQ'
);

-- Movie 209: Ripley
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Ripley', 'tv', 'Crime, Drama, Thriller', 'Andrew Scott stars as the charming con man Tom Ripley.', 
       2024, 8.3, 'https://image.tmdb.org/t/p/w500/h8qaWXjNlzZIslEjQ1P1QkF5Dgo.jpg', 
       'https://www.youtube.com/watch?v=ygPKf-LFSA0', 'Netflix'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=ygPKf-LFSA0'
);

-- Movie 210: Silo Season 2
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Silo Season 2', 'tv', 'Drama, Mystery, Sci-Fi', 'Juliette continues to uncover the mysteries of the Silo.', 
       2024, 8.3, 'https://image.tmdb.org/t/p/w500/2A3dWXKQjYUyHfCAGqbHXGYKXZV.jpg', 
       'https://www.youtube.com/watch?v=AnRyjBDC1q0', 'Apple TV+'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=AnRyjBDC1q0'
);

-- Movie 211: Abbott Elementary Season 4
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Abbott Elementary Season 4', 'tv', 'Comedy', 'The mockumentary follows teachers at an underfunded school.', 
       2024, 8.3, 'https://image.tmdb.org/t/p/w500/b6GdKl0oj1fq6ZRKF66IIH2LcnO.jpg', 
       'https://www.youtube.com/watch?v=KCsyVHubdtA', 'Hulu'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=KCsyVHubdtA'
);

-- Movie 212: Industry Season 3
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Industry Season 3', 'tv', 'Drama', 'The high-finance drama continues at Pierpoint & Co.', 
       2024, 8.2, 'https://image.tmdb.org/t/p/w500/aVS22RYkMlzPhRTBNqIrGgDWDm0.jpg', 
       'https://www.youtube.com/watch?v=W9Q8Q38j21A', 'Max'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=W9Q8Q38j21A'
);

-- Movie 213: Only Murders in the Building Season 4
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Only Murders in the Building Season 4', 'tv', 'Comedy, Crime, Mystery', 'The amateur sleuths investigate a new murder mystery.', 
       2024, 8.2, 'https://image.tmdb.org/t/p/w500/A6tMQAo6t6eRFCPhsrShmxZtzyy.jpg', 
       'https://www.youtube.com/watch?v=7mwjhsNmUwE', 'Hulu'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=7mwjhsNmUwE'
);

-- Movie 215: Baby Reindeer
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Baby Reindeer', 'tv', 'Comedy, Drama, Thriller', 'A comedian''s life is turned upside down by a stalker.', 
       2024, 8.1, 'https://image.tmdb.org/t/p/w500/tDJ2NR5kvTHBQNm4I3mULmpRPQ8.jpg', 
       'https://www.youtube.com/watch?v=l0rcLPpGVFQ', 'Netflix'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=l0rcLPpGVFQ'
);

-- Movie 216: High Potential
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'High Potential', 'tv', 'Drama, Crime, Mystery', 'Morgan is a single mom with an exceptional mind, whose unconventional knack for solving crimes leads to an unusual and unstoppable partnership with a by-the-book seasoned detective.', 
       2024, 8, 'https://image.tmdb.org/t/p/w500/xCtaUDBUP1iKqtoqpHfeH1T2pWF.jpg', 
       'https://www.youtube.com/watch?v=W6zbdYNg9Rs', 'Disney+'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=W6zbdYNg9Rs'
);

-- Movie 219: 3 Body Problem
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT '3 Body Problem', 'tv', 'Drama, Mystery, Sci-Fi', 'Scientists across the world face an extinction-level threat.', 
       2024, 7.8, 'https://image.tmdb.org/t/p/w500/v7dGq4VCFJ8kl1qYJNZfOTYEhLq.jpg', 
       'https://www.youtube.com/watch?v=mogBq06fGN8', 'Netflix'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=mogBq06fGN8'
);

-- Movie 220: True Detective: Night Country
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'True Detective: Night Country', 'tv', 'Crime, Drama, Mystery', 'Detectives investigate the disappearance of researchers in Alaska.', 
       2024, 7.8, 'https://image.tmdb.org/t/p/w500/pB6rF0Vq9Mi0mfBdCkFsXDJPUzP.jpg', 
       'https://www.youtube.com/watch?v=oTnwx8jFI_Y', 'Max'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=oTnwx8jFI_Y'
);

-- Movie 221: Alien: Romulus
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Alien: Romulus', 'movie', 'Horror, Sci-Fi, Thriller', 'A group of young space colonizers face the deadliest life form in the universe.', 
       2024, 7.6, 'https://image.tmdb.org/t/p/w500/b33nnKl1GSFbao4l3fZDDqsMx0F.jpg', 
       'https://www.youtube.com/watch?v=x0XDEhP4MQs', 'Hulu'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=x0XDEhP4MQs'
);

-- Movie 222: Sonic the Hedgehog 3
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Sonic the Hedgehog 3', 'movie', 'Action, Adventure, Comedy', 'Sonic and friends face Shadow the Hedgehog.', 
       2024, 7.6, 'https://image.tmdb.org/t/p/w500/d8Ryb8AunYAuycVKFJxhFN68ULJ.jpg', 
       'https://www.youtube.com/watch?v=qSu6i2iFMO0', 'Paramount+'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=qSu6i2iFMO0'
);

-- Movie 223: Skeleton Crew
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Skeleton Crew', 'tv', 'Action, Adventure, Sci-Fi', 'Four kids lost in a dangerous galaxy try to find their way home.', 
       2024, 7.6, 'https://image.tmdb.org/t/p/w500/srg3Sa6SWzk1rpkLgKQGGnqkrrv.jpg', 
       'https://www.youtube.com/watch?v=f19gfOMZTtg', 'Disney+'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=f19gfOMZTtg'
);

-- Movie 224: Beetlejuice Beetlejuice
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Beetlejuice Beetlejuice', 'movie', 'Comedy, Fantasy, Horror', 'The ghost with the most returns in this sequel to the 1988 classic.', 
       2024, 7.5, 'https://image.tmdb.org/t/p/w500/kKgQzkUCnQmeTPkyIwHly2t6ZFI.jpg', 
       'https://www.youtube.com/watch?v=EQSLmWK7ynU', 'Max'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=EQSLmWK7ynU'
);

-- Movie 225: Dune: Prophecy
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Dune: Prophecy', 'tv', 'Sci-Fi, Drama, Fantasy', 'A prequel series exploring the origins of the Bene Gesserit.', 
       2024, 7.5, 'https://image.tmdb.org/t/p/w500/dvZnZU5HXkT8uC1Dc59BqxPhMBj.jpg', 
       'https://www.youtube.com/watch?v=PjXi02P-Uqk', 'Max'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=PjXi02P-Uqk'
);

-- Movie 226: Rings of Power Season 2
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Rings of Power Season 2', 'tv', 'Action, Adventure, Drama', 'The epic drama set in J.R.R. Tolkien''s Middle-earth continues.', 
       2024, 7.5, 'https://image.tmdb.org/t/p/w500/NNC08YmJFFlLi1prBkK8quk3dp.jpg', 
       'https://www.youtube.com/watch?v=j54L4N7b0zo', 'Prime Video'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=j54L4N7b0zo'
);

-- Movie 227: Agatha All Along
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Agatha All Along', 'tv', 'Comedy, Fantasy, Horror', 'Agatha Harkness assembles a coven to walk the Witches'' Road.', 
       2024, 7.5, 'https://image.tmdb.org/t/p/w500/2uWj0vy1bymjfBJhdW8r4YKDRBv.jpg', 
       'https://www.youtube.com/watch?v=PLYD12nXPfg', 'Disney+'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=PLYD12nXPfg'
);

-- Movie 228: A Quiet Place: Day One
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'A Quiet Place: Day One', 'movie', 'Horror, Sci-Fi, Thriller', 'Experience the day the world went quiet.', 
       2024, 7.5, 'https://image.tmdb.org/t/p/w500/yrpPYKijwdMHyTGIOd1iK1h0Xno.jpg', 
       'https://www.youtube.com/watch?v=YPY7J-flzE8', 'Paramount+'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=YPY7J-flzE8'
);

-- Movie 230: The Fall Guy
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'The Fall Guy', 'movie', 'Action, Comedy', 'A stuntman is drawn into a mystery.', 
       2024, 7.4, 'https://image.tmdb.org/t/p/w500/tSz1qsmSJon0rqjHBxXZmrotuse.jpg', 
       'https://www.youtube.com/watch?v=j7jPnwVGdZ8', 'Peacock'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=j7jPnwVGdZ8'
);

-- Movie 231: Twisters
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Twisters', 'movie', 'Action, Adventure, Thriller', 'Storm chasers risk their lives to study unprecedented tornado events.', 
       2024, 7.3, 'https://image.tmdb.org/t/p/w500/pjnD08FlMAIXsfOLKQbvmO0f0MD.jpg', 
       'https://www.youtube.com/watch?v=AZrFPLygdSU', 'Peacock'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=AZrFPLygdSU'
);

-- Movie 232: Civil War
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Civil War', 'movie', 'Action, Drama, Thriller', 'Journalists document a civil war in a dystopian America.', 
       2024, 7.3, 'https://image.tmdb.org/t/p/w500/sh7Rg8Er3tFcN9BpKIPOMvALgZd.jpg', 
       'https://www.youtube.com/watch?v=c2G18nIVpNE', 'Apple TV+'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=c2G18nIVpNE'
);

-- Movie 234: Godzilla x Kong: The New Empire
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Godzilla x Kong: The New Empire', 'movie', 'Action, Sci-Fi, Adventure', 'Godzilla and Kong must unite against a colossal undiscovered threat.', 
       2024, 7.2, 'https://image.tmdb.org/t/p/w500/z1p34vh7dEOnLDmyCrlUVLuoDzd.jpg', 
       'https://www.youtube.com/watch?v=lV1OOlGwExM', 'Max'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=lV1OOlGwExM'
);

-- Movie 235: Monkey Man
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Monkey Man', 'movie', 'Action, Thriller', 'Dev Patel''s directorial debut about vengeance.', 
       2024, 7.2, 'https://image.tmdb.org/t/p/w500/b5bbMveRvCNTvHE87xBrJNVPKbi.jpg', 
       'https://www.youtube.com/watch?v=g8zxiB5Qhsc', 'Peacock'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=g8zxiB5Qhsc'
);

-- Movie 236: Bad Boys: Ride or Die
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Bad Boys: Ride or Die', 'movie', 'Action, Comedy, Crime', 'Mike and Marcus are on the run.', 
       2024, 7.1, 'https://image.tmdb.org/t/p/w500/nP6RliHjxsz4irTKsxe8FRhKZYl.jpg', 
       'https://www.youtube.com/watch?v=uGJnsvqoq0o', 'Netflix'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=uGJnsvqoq0o'
);

-- Movie 237: Despicable Me 4
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Despicable Me 4', 'movie', 'Animation, Family, Comedy', 'Gru and the Minions face a new villain in this animated sequel.', 
       2024, 7, 'https://image.tmdb.org/t/p/w500/wWba3TaojhK7NdycRhoQpsG0FaH.jpg', 
       'https://www.youtube.com/watch?v=qQlr9-rF32A', 'Peacock'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=qQlr9-rF32A'
);

-- Movie 238: Abigail
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Abigail', 'movie', 'Horror, Thriller', 'Kidnappers discover their captive is a vampire.', 
       2024, 7, 'https://image.tmdb.org/t/p/w500/5gKKSGHOTmTEBJ5mRVgKbPy1TA0.jpg', 
       'https://www.youtube.com/watch?v=m8x7pDi0z3Y', 'Peacock'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=m8x7pDi0z3Y'
);

-- Movie 239: Frieren: Beyond Journey's End
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Frieren: Beyond Journey''s End', 'tv', 'Animation, Action, Drama', 'Decades after her party defeated the Demon King, an old friend''s funeral launches the elf wizard Frieren on a journey of self-discovery.', 
       2023, 8.8, 'https://image.tmdb.org/t/p/w500/dqZENchTd7lp5zht7BdlqM7RBhD.jpg', 
       'https://www.youtube.com/watch?v=01WEqntM1NI', 'Netflix'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=01WEqntM1NI'
);

-- Movie 246: Hell's Paradise
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Hell''s Paradise', 'tv', 'Animation, Drama, Action', 'For a chance at a pardon, a ninja assassin joins other condemned criminals on a journey to a mysterious island to retrieve an elixir of immortality.', 
       2023, 8.1, 'https://image.tmdb.org/t/p/w500/1V9I7SvZbYoMbSvdtnlkkq9SB1k.jpg', 
       'https://www.youtube.com/watch?v=PkCcADlua1w', 'Netflix'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=PkCcADlua1w'
);

-- Movie 249: Past Lives
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Past Lives', 'movie', 'Drama, Romance', 'Two childhood friends reunite in New York.', 
       2023, 8, 'https://image.tmdb.org/t/p/w500/rfZ3n6PIYiVMaVIRN7O0SaY3BWo.jpg', 
       'https://www.youtube.com/watch?v=kA244xewjcI', 'Paramount+'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=kA244xewjcI'
);

-- Movie 250: Poor Things
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Poor Things', 'movie', 'Comedy, Drama, Romance', 'Emma Stone stars in this surreal Victorian tale.', 
       2023, 8, 'https://image.tmdb.org/t/p/w500/kCGlIMHnOm8JPXq3rXM6c5wMxcT.jpg', 
       'https://www.youtube.com/watch?v=RlbR5N6veqw', 'Hulu'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=RlbR5N6veqw'
);

-- Movie 251: The Holdovers
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'The Holdovers', 'movie', 'Comedy, Drama', 'A cranky teacher stays with a student over Christmas break.', 
       2023, 7.9, 'https://image.tmdb.org/t/p/w500/VHSzNBTwxV8vh7wylo7O9CLdac.jpg', 
       'https://www.youtube.com/watch?v=AhKLpJmHhIg', 'Peacock'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=AhKLpJmHhIg'
);

-- Movie 252: Shrinking
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Shrinking', 'tv', 'Drama, Comedy', 'Jimmy is struggling to grieve the loss of his wife while being a dad, friend, and therapist. He decides to try a new approach with everyone in his path: unfiltered, brutal honesty. Will it make things better—or unleash uproarious chaos?', 
       2023, 7.8, 'https://image.tmdb.org/t/p/w500/zEFKMNPBKq6JG7uuDkzTQ9WwErn.jpg', 
       'https://www.youtube.com/watch?v=YjHfjQDWl1A', 'Apple TV+'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=YjHfjQDWl1A'
);

-- Movie 254: Mission: Impossible – Dead Reckoning Part One
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Mission: Impossible – Dead Reckoning Part One', 'movie', 'Action, Adventure, Thriller', 'Ethan Hunt faces a dangerous enemy.', 
       2023, 7.8, 'https://image.tmdb.org/t/p/w500/NNxYkU70HPurnNCSiCjYAmacwm.jpg', 
       'https://www.youtube.com/watch?v=avz06PDqDbM', 'Paramount+'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=avz06PDqDbM'
);

-- Movie 255: Hijack
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Hijack', 'tv', 'Drama', 'Expert negotiator Sam Nelson is in for the ride of his life—and so is everyone on board with him—after a group of hijackers take control. Sam will try every move in his playbook to take them down...as the stakes grow higher by the second.', 
       2023, 7.6, 'https://image.tmdb.org/t/p/w500/2C51clnxQdiqPDeqQlXcUx70hse.jpg', 
       'https://www.youtube.com/watch?v=WxwKzsklvJo', 'Apple TV+'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=WxwKzsklvJo'
);

-- Movie 256: Drops of God
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Drops of God', 'tv', 'Drama, Mystery', 'While the world of wine mourns the death of Alexandre Léger, his estranged daughter, Camille, learns his extraordinary collection is now hers. But before she can claim her inheritance, Camille must best Alexandre''s protégé, Issei, in a test of their senses.', 
       2023, 7.6, 'https://image.tmdb.org/t/p/w500/t3OGrj5z0RSv7GaPxtcNneu2JCr.jpg', 
       'https://www.youtube.com/watch?v=3_y2j72Cfe4', 'Apple TV+'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=3_y2j72Cfe4'
);

-- Movie 258: The Color Purple
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'The Color Purple', 'movie', 'Drama, Musical', 'Musical adaptation of the beloved story.', 
       2023, 7.3, 'https://image.tmdb.org/t/p/w500/cij4dd21TrRp6zhBPdkwcuUVt8E.jpg', 
       'https://www.youtube.com/watch?v=JdPp2PQSiG8', 'Max'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=JdPp2PQSiG8'
);

-- Movie 259: Creed III
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Creed III', 'movie', 'Drama, Sport', 'Adonis Creed faces his childhood friend in the ring.', 
       2023, 7.3, 'https://image.tmdb.org/t/p/w500/cvsXj3I9Q2iyyIo95AecSd1tad7.jpg', 
       'https://www.youtube.com/watch?v=AHmCH7iB_wM', 'Prime Video'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=AHmCH7iB_wM'
);

-- Movie 261: Wonka
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Wonka', 'movie', 'Adventure, Comedy, Family', 'The origin story of Willy Wonka.', 
       2023, 7.2, 'https://image.tmdb.org/t/p/w500/qhb1qOilapbapxWQn9jtRCMwXJF.jpg', 
       'https://www.youtube.com/watch?v=otNh9bTjXWg', 'Max'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=otNh9bTjXWg'
);

-- Movie 262: Elemental
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Elemental', 'movie', 'Animation, Adventure, Comedy', 'In a city where fire, water, land and air residents live together.', 
       2023, 7, 'https://image.tmdb.org/t/p/w500/4Y1WNkd88JXmGfhtWR7dmDAo1T2.jpg', 
       'https://www.youtube.com/watch?v=hXzcyx9V0xw', 'Disney+'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=hXzcyx9V0xw'
);

-- Movie 263: Napoleon
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Napoleon', 'movie', 'Action, Biography, Drama', 'Ridley Scott''s epic about Napoleon Bonaparte.', 
       2023, 6.8, 'https://image.tmdb.org/t/p/w500/jE5o7y9K6pZtWNNMEws1LPKaWnc.jpg', 
       'https://www.youtube.com/watch?v=OAZWXUkrjPc', 'Apple TV+'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=OAZWXUkrjPc'
);

-- Movie 264: Blue Beetle
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Blue Beetle', 'movie', 'Action, Adventure, Sci-Fi', 'A teenager gains superpowers from an alien scarab.', 
       2023, 6.8, 'https://image.tmdb.org/t/p/w500/mXLOHHc1Zeq5yw7XoROW5m6Q3qR.jpg', 
       'https://www.youtube.com/watch?v=vS3_72Gb-bI', 'Max'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=vS3_72Gb-bI'
);

-- Movie 265: Anyone But You
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Anyone But You', 'movie', 'Comedy, Romance', 'Two people pretend to be a couple at a destination wedding.', 
       2023, 6.7, 'https://image.tmdb.org/t/p/w500/2hwXbPW5SJkXuSClUgTiScyBs45.jpg', 
       'https://www.youtube.com/watch?v=MllO2wlKNFM', 'Netflix'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=MllO2wlKNFM'
);

-- Movie 266: Indiana Jones and the Dial of Destiny
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Indiana Jones and the Dial of Destiny', 'movie', 'Action, Adventure', 'Indiana Jones races to find a legendary artifact.', 
       2023, 6.7, 'https://image.tmdb.org/t/p/w500/Af4bXE63pVsb2FtbW8uYIyPBadD.jpg', 
       'https://www.youtube.com/watch?v=ZfVYWWzcXYw', 'Disney+'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=ZfVYWWzcXYw'
);

-- Movie 267: The Marvels
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'The Marvels', 'movie', 'Action, Adventure, Sci-Fi', 'Captain Marvel, Ms. Marvel, and Monica Rambeau team up.', 
       2023, 6.5, 'https://image.tmdb.org/t/p/w500/9GBhzXMFjgcZ3FdR9w3bUmmMps6.jpg', 
       'https://www.youtube.com/watch?v=wS_qbDztgVY', 'Disney+'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=wS_qbDztgVY'
);

-- Movie 268: The Little Mermaid
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'The Little Mermaid', 'movie', 'Adventure, Family, Fantasy', 'Live-action remake of the Disney classic.', 
       2023, 6.4, 'https://image.tmdb.org/t/p/w500/ym1dxyOk4jFcSl4Q2zmRrA5BEEN.jpg', 
       'https://www.youtube.com/watch?v=kpGo2_d3oYE', 'Disney+'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=kpGo2_d3oYE'
);

-- Movie 269: Ant-Man and the Wasp: Quantumania
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Ant-Man and the Wasp: Quantumania', 'movie', 'Action, Adventure, Comedy', 'Ant-Man and the Wasp explore the Quantum Realm.', 
       2023, 6.4, 'https://image.tmdb.org/t/p/w500/ngl2FKBlU4fhbdsrtdom9LVLBXw.jpg', 
       'https://www.youtube.com/watch?v=ZlNFpri-Y40', 'Disney+'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=ZlNFpri-Y40'
);

-- Movie 270: No Hard Feelings
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'No Hard Feelings', 'movie', 'Comedy, Romance', 'Jennifer Lawrence stars in this raunchy comedy.', 
       2023, 6.4, 'https://image.tmdb.org/t/p/w500/gD72DhJ7NbfxvtxGiAzLaa0xaoj.jpg', 
       'https://www.youtube.com/watch?v=0gfAuEI4NxU', 'Netflix'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=0gfAuEI4NxU'
);

-- Movie 271: Aquaman and the Lost Kingdom
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Aquaman and the Lost Kingdom', 'movie', 'Action, Adventure, Fantasy', 'Aquaman must forge an uneasy alliance.', 
       2023, 6.3, 'https://image.tmdb.org/t/p/w500/7lTnXOy0iNtBAdRP3TZvaKJ77F6.jpg', 
       'https://www.youtube.com/watch?v=FV3bqvOHRQo', 'Max'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=FV3bqvOHRQo'
);

-- Movie 272: Fast X
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Fast X', 'movie', 'Action, Crime, Thriller', 'Dom Toretto and his family face a new threat.', 
       2023, 6, 'https://image.tmdb.org/t/p/w500/fiVW06jE7z9YnO4trhaMEdclSiC.jpg', 
       'https://www.youtube.com/watch?v=eoOaKN4qCKw', 'Peacock'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=eoOaKN4qCKw'
);

-- Movie 273: Cocaine Bear
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Cocaine Bear', 'movie', 'Comedy, Thriller', 'A bear ingests cocaine and goes on a rampage.', 
       2023, 6, 'https://image.tmdb.org/t/p/w500/gOnmaxHo0412UVr1QM5Nekv1xPi.jpg', 
       'https://www.youtube.com/watch?v=DuWEEKeJLMI', 'Peacock'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=DuWEEKeJLMI'
);

-- Movie 274: Wish
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Wish', 'movie', 'Animation, Adventure, Family', 'A girl wishes on a star that comes to life.', 
       2023, 5.8, 'https://image.tmdb.org/t/p/w500/AcoVfiv1rrWOmAdpnAMnM56ki19.jpg', 
       'https://www.youtube.com/watch?v=oyRxxpD3yNw', 'Disney+'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=oyRxxpD3yNw'
);

-- Movie 275: Meg 2: The Trench
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Meg 2: The Trench', 'movie', 'Action, Horror, Sci-Fi', 'Jason Statham battles massive prehistoric sharks.', 
       2023, 5.5, 'https://image.tmdb.org/t/p/w500/drCySc1LWJLe5sLlBNwMPVHVRF6.jpg', 
       'https://www.youtube.com/watch?v=dG91B3hHyY4', 'Max'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=dG91B3hHyY4'
);

-- Movie 280: Puss in Boots: The Last Wish
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Puss in Boots: The Last Wish', 'movie', 'Animation, Adventure, Comedy', 'Puss in Boots discovers he''s on his last life.', 
       2022, 7.9, 'https://image.tmdb.org/t/p/w500/kuf6dutpsT0vSVehic3EZIqkOBt.jpg', 
       'https://www.youtube.com/watch?v=RqrXhwS33yc', 'Peacock'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=RqrXhwS33yc'
);

-- Movie 283: Elvis
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Elvis', 'movie', 'Biography, Drama, Music', 'The life story of rock icon Elvis Presley.', 
       2022, 7.4, 'https://image.tmdb.org/t/p/w500/oJagOzBu9Rdd9BrciseCm3U3MCU.jpg', 
       'https://www.youtube.com/watch?v=vox7jLUuOLQ', 'Max'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=vox7jLUuOLQ'
);

-- Movie 284: Bullet Train
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Bullet Train', 'movie', 'Action, Comedy, Thriller', 'Brad Pitt stars as an assassin on a bullet train.', 
       2022, 7.3, 'https://image.tmdb.org/t/p/w500/tVxDe01Zy3kZqaZRNiXFGDICdZk.jpg', 
       'https://www.youtube.com/watch?v=0IOsk2Vlc4o', 'Netflix'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=0IOsk2Vlc4o'
);

-- Movie 287: Glass Onion: A Knives Out Mystery
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Glass Onion: A Knives Out Mystery', 'movie', 'Comedy, Crime, Drama', 'Detective Benoit Blanc investigates a new mystery.', 
       2022, 7.2, 'https://image.tmdb.org/t/p/w500/vDGr1YdrlfbU9wxTOdpf3zChmv9.jpg', 
       'https://www.youtube.com/watch?v=gj5ibYSz8C0', 'Netflix'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=gj5ibYSz8C0'
);

-- Movie 288: The Menu
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'The Menu', 'movie', 'Comedy, Horror, Thriller', 'A couple visits an exclusive restaurant with dark secrets.', 
       2022, 7.2, 'https://image.tmdb.org/t/p/w500/v31MsWhF9WFh7Qooq6xSBbmJxoG.jpg', 
       'https://www.youtube.com/watch?v=C_uTkUGcHv4', 'HBO Max'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=C_uTkUGcHv4'
);

-- Movie 289: Doctor Strange in the Multiverse of Madness
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Doctor Strange in the Multiverse of Madness', 'movie', 'Action, Adventure, Fantasy', 'Doctor Strange travels into the multiverse.', 
       2022, 7, 'https://image.tmdb.org/t/p/w500/9Gtg2DzBhmYamXBS1hKAhiwbBKS.jpg', 
       'https://www.youtube.com/watch?v=aWzlQ2N6qqg', 'Disney+'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=aWzlQ2N6qqg'
);

-- Movie 290: Smile
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Smile', 'movie', 'Horror, Mystery, Thriller', 'A therapist is haunted by a sinister curse.', 
       2022, 6.8, 'https://image.tmdb.org/t/p/w500/aPqcQwu4VGEewPhagWNncDbJ9Xp.jpg', 
       'https://www.youtube.com/watch?v=BcDK7lkzzsU', 'Paramount+'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=BcDK7lkzzsU'
);

-- Movie 291: Minions: The Rise of Gru
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Minions: The Rise of Gru', 'movie', 'Animation, Adventure, Comedy', 'The origin story of the Minions and young Gru.', 
       2022, 6.6, 'https://image.tmdb.org/t/p/w500/wKiOkZTN9lUUUNZLmtnwubZYONg.jpg', 
       'https://www.youtube.com/watch?v=6DxjJzmYsXo', 'Peacock'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=6DxjJzmYsXo'
);

-- Movie 292: Thor: Love and Thunder
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Thor: Love and Thunder', 'movie', 'Action, Adventure, Comedy', 'Thor teams up with Jane Foster and the Guardians.', 
       2022, 6.4, 'https://image.tmdb.org/t/p/w500/pIkRyD18kl4FhoCNQuWxWu5cBLM.jpg', 
       'https://www.youtube.com/watch?v=tgB1wUcmbbw', 'Disney+'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=tgB1wUcmbbw'
);

-- Movie 293: Don't Worry Darling
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Don''t Worry Darling', 'movie', 'Drama, Mystery, Thriller', 'A 1950s housewife uncovers disturbing truths.', 
       2022, 6.2, 'https://image.tmdb.org/t/p/w500/9BQqngPfwpeAfK7c2H3cwIFWIVR.jpg', 
       'https://www.youtube.com/watch?v=FgmnKsED-jU', 'Max'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=FgmnKsED-jU'
);

-- Movie 294: Amsterdam
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Amsterdam', 'movie', 'Comedy, Drama, History', 'Three friends witness a murder and become suspects.', 
       2022, 5.7, 'https://image.tmdb.org/t/p/w500/6sJcVzGCwrDCBMV0DU6eRzA2UxM.jpg', 
       'https://www.youtube.com/watch?v=GLs2xxM6s6U', 'Max'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=GLs2xxM6s6U'
);

-- Movie 295: Invincible
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Invincible', 'tv', 'Animation, Action, Drama', 'A teen discovers his father is a superhero.', 
       2021, 8.7, 'https://image.tmdb.org/t/p/w500/dMOpdkrDC5dQxqNydgKxXjBKyAc.jpg', 
       'https://www.youtube.com/watch?v=-bfAVpuko5o', 'Prime Video'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=-bfAVpuko5o'
);

-- Movie 297: No Way Home
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'No Way Home', 'movie', 'Action, Adventure, Sci-Fi', 'Spider-Man seeks help from Doctor Strange when his identity is revealed.', 
       2021, 8.4, 'https://image.tmdb.org/t/p/w500/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg', 
       'https://www.youtube.com/watch?v=JfVOs4VSpmA', 'Netflix'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=JfVOs4VSpmA'
);

-- Movie 298: Mare of Easttown
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Mare of Easttown', 'tv', 'Crime, Drama, Mystery', 'A detective investigates a murder in Pennsylvania.', 
       2021, 8.4, 'https://image.tmdb.org/t/p/w500/hkuX9y93O1tAukCU8ZE9t50EUzj.jpg', 
       'https://www.youtube.com/watch?v=5aWAHzKdidE', 'Max'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=5aWAHzKdidE'
);

-- Movie 302: Loki
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Loki', 'tv', 'Action, Adventure, Fantasy', 'Loki creates chaos across time.', 
       2021, 8.2, 'https://image.tmdb.org/t/p/w500/kEl2t3OhXc3Zb9FBh1AuYzRTgZp.jpg', 
       'https://www.youtube.com/watch?v=nW948Va-l10', 'Disney+'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=nW948Va-l10'
);

-- Movie 303: WandaVision
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'WandaVision', 'tv', 'Action, Comedy, Drama', 'Wanda and Vision live in sitcom reality.', 
       2021, 7.9, 'https://image.tmdb.org/t/p/w500/glKDfE6btIRcVB5zrjspRIs4r52.jpg', 
       'https://www.youtube.com/watch?v=sj9J2ecsSpo', 'Disney+'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=sj9J2ecsSpo'
);

-- Movie 304: Yellowjackets
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Yellowjackets', 'tv', 'Drama, Horror, Mystery', 'Survivors of a plane crash hide dark secrets.', 
       2021, 7.8, 'https://image.tmdb.org/t/p/w500/cOwaIzHj4cVpAuC57mD2SIvQPgC.jpg', 
       'https://www.youtube.com/watch?v=x6BZq6ufPGM', 'Paramount+'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=x6BZq6ufPGM'
);

-- Movie 305: Midnight Mass
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Midnight Mass', 'tv', 'Drama, Horror, Mystery', 'A small town experiences miracles and nightmares.', 
       2021, 7.7, 'https://image.tmdb.org/t/p/w500/bIp6TeEhgvE7BdXMw4fVcSTlAuq.jpg', 
       'https://www.youtube.com/watch?v=y-XIRcjf3l4', 'Netflix'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=y-XIRcjf3l4'
);

-- Movie 306: Shang-Chi and the Legend of the Ten Rings
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Shang-Chi and the Legend of the Ten Rings', 'movie', 'Action, Adventure, Fantasy', 'Shang-Chi must confront the past he thought he left behind.', 
       2021, 7.6, 'https://image.tmdb.org/t/p/w500/1BIoJGKbXjdFDAqUEiA2VHqkK1Z.jpg', 
       'https://www.youtube.com/watch?v=8YjFbMbfXaQ', 'Disney+'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=8YjFbMbfXaQ'
);

-- Movie 307: Luca
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Luca', 'movie', 'Animation, Adventure, Comedy', 'A sea monster discovers friendship above water.', 
       2021, 7.5, 'https://image.tmdb.org/t/p/w500/jTswp6KyDYKtvC52GbHagrZbGvD.jpg', 
       'https://www.youtube.com/watch?v=mYfJxlgR2jQ', 'Disney+'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=mYfJxlgR2jQ'
);

-- Movie 309: The Suicide Squad
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'The Suicide Squad', 'movie', 'Action, Adventure, Comedy', 'A new team of villains on a deadly mission.', 
       2021, 7.3, 'https://image.tmdb.org/t/p/w500/kb4s0ML0iVZlG6wAKbbs9NAm6X.jpg', 
       'https://www.youtube.com/watch?v=eg5ciqQzmK0', 'Max'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=eg5ciqQzmK0'
);

-- Movie 310: A Quiet Place Part II
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'A Quiet Place Part II', 'movie', 'Drama, Horror, Sci-Fi', 'The Abbott family faces new dangers.', 
       2021, 7.3, 'https://image.tmdb.org/t/p/w500/4q2hz2m8hubgvijz8Ez0T2Os2Yv.jpg', 
       'https://www.youtube.com/watch?v=BpdDN9d9Jio', 'Paramount+'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=BpdDN9d9Jio'
);

-- Movie 311: Free Guy
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Free Guy', 'movie', 'Action, Adventure, Comedy', 'An NPC in a video game becomes self-aware.', 
       2021, 7.2, 'https://image.tmdb.org/t/p/w500/xmbU4JTUm8rsdtn7Y3Fcm30GpeT.jpg', 
       'https://www.youtube.com/watch?v=X2m-08cOAbc', 'Disney+'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=X2m-08cOAbc'
);

-- Movie 312: Encanto
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Encanto', 'movie', 'Animation, Adventure, Comedy', 'A magical Colombian family faces challenges.', 
       2021, 7.2, 'https://image.tmdb.org/t/p/w500/4j0PNHkMr5ax3IA8tjtxcmPU3QT.jpg', 
       'https://www.youtube.com/watch?v=CaimKeDcudo', 'Disney+'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=CaimKeDcudo'
);

-- Movie 313: Don't Look Up
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Don''t Look Up', 'movie', 'Comedy, Drama, Sci-Fi', 'Scientists warn of a comet heading for Earth.', 
       2021, 7.2, 'https://image.tmdb.org/t/p/w500/th4E1yqsE8DGpAseLiUrI60WxSn.jpg', 
       'https://www.youtube.com/watch?v=RbIxYm3mKzI', 'Netflix'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=RbIxYm3mKzI'
);

-- Movie 314: Black Widow
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Black Widow', 'movie', 'Action, Adventure, Sci-Fi', 'Natasha Romanoff confronts her dark past.', 
       2021, 6.8, 'https://image.tmdb.org/t/p/w500/qAZ0pzat24kLdO3o8ejmbLxyOac.jpg', 
       'https://www.youtube.com/watch?v=Fp9pNPdNwjI', 'Disney+'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=Fp9pNPdNwjI'
);

-- Movie 315: Eternals
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Eternals', 'movie', 'Action, Adventure, Fantasy', 'The Eternals reunite to protect Earth.', 
       2021, 6.4, 'https://image.tmdb.org/t/p/w500/bcCBq9N1EMo3daNIjWJ8kYvrQm6.jpg', 
       'https://www.youtube.com/watch?v=0WVDKZJkGlY', 'Disney+'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=0WVDKZJkGlY'
);

-- Movie 316: Venom: Let There Be Carnage
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Venom: Let There Be Carnage', 'movie', 'Action, Sci-Fi, Thriller', 'Venom faces off against the deadly Carnage.', 
       2021, 6, 'https://image.tmdb.org/t/p/w500/rjkmN1dniUHVYAtwuV3Tji7FsDO.jpg', 
       'https://www.youtube.com/watch?v=-FmWuCgJmxo', 'Netflix'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=-FmWuCgJmxo'
);

-- Movie 317: The Matrix Resurrections
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'The Matrix Resurrections', 'movie', 'Action, Sci-Fi', 'Neo returns to The Matrix.', 
       2021, 5.7, 'https://image.tmdb.org/t/p/w500/8c4a8kE7PizaGQDnFGzJ2O6CtM8.jpg', 
       'https://www.youtube.com/watch?v=9ix7TUGVYIo', 'Max'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=9ix7TUGVYIo'
);

-- Movie 318: Ted Lasso
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Ted Lasso', 'tv', 'Comedy, Drama, Sport', 'An American coach leads a British soccer team.', 
       2020, 8.8, 'https://image.tmdb.org/t/p/w500/5fhZdwP1DVJ0FyVH6vrFdHwpXIn.jpg', 
       'https://www.youtube.com/watch?v=3u7EIiohs6U', 'Apple TV+'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=3u7EIiohs6U'
);

-- Movie 320: JUJUTSU KAISEN
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'JUJUTSU KAISEN', 'tv', 'Animation, Action', 'Yuji Itadori is a boy with tremendous physical strength, though he lives a completely ordinary high school life. One day, to save a classmate who has been attacked by curses, he eats the finger of Ryomen Sukuna, taking the curse into his own soul. From then on, he shares one body with Ryomen Sukuna. Guided by the most powerful of sorcerers, Satoru Gojo, Itadori is admitted to Tokyo Jujutsu High School, an organization that fights the curses... and thus begins the heroic tale of a boy who became a curse to exorcise a curse, a life from which he could never turn back.', 
       2020, 8.6, 'https://image.tmdb.org/t/p/w500/fHpKWq9ayzSk8nSwqRuaAUemRKh.jpg', 
       'https://www.youtube.com/watch?v=VpO6APNqY1c', 'Netflix'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=VpO6APNqY1c'
);

-- Movie 321: The Queen's Gambit
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'The Queen''s Gambit', 'tv', 'Drama', 'A chess prodigy rises to the top.', 
       2020, 8.6, 'https://image.tmdb.org/t/p/w500/zU0htwkhNvBQdVSIKB9s6hgVeFK.jpg', 
       'https://www.youtube.com/watch?v=CDrieqwSdgI', 'Netflix'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=CDrieqwSdgI'
);

-- Movie 323: Bridgerton
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Bridgerton', 'tv', 'Drama', 'Wealth, lust, and betrayal set in the backdrop of Regency era England, seen through the eyes of the powerful Bridgerton family.', 
       2020, 8.1, 'https://image.tmdb.org/t/p/w500/uXTg565ahu9RwonCX1V2Hex1NU6.jpg', 
       'https://www.youtube.com/watch?v=gpv7ayf_tyE', 'Netflix'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=gpv7ayf_tyE'
);

-- Movie 326: Onward
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Onward', 'movie', 'Animation, Adventure, Comedy', 'Two elf brothers embark on a magical quest.', 
       2020, 7.4, 'https://image.tmdb.org/t/p/w500/f4aul3FyD3jv3v4bul1IrkWZvzq.jpg', 
       'https://www.youtube.com/watch?v=x8DKg_fsacM', 'Disney+'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=x8DKg_fsacM'
);

-- Movie 328: Birds of Prey
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Birds of Prey', 'movie', 'Action, Adventure, Crime', 'Harley Quinn forms a team of antiheroes.', 
       2020, 6.1, 'https://image.tmdb.org/t/p/w500/h4VB6m0RwcicVEZvzftYZyKXs6K.jpg', 
       'https://www.youtube.com/watch?v=kGM4uYZzfu0', 'Max'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=kGM4uYZzfu0'
);

-- Movie 329: Spides
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Spides', 'tv', 'Sci-Fi, Fantasy, Drama', 'Young Nora from Berlin wakes up from a coma after taking a new party drug and can no longer remember anything. When investigators find out that numerous teenagers have disappeared as part of the spread of the party drug ''Bliss'', Nora begins to investigate. She uncovers an uncanny conspiracy: Aliens use the drug to use the bodies of their victims as hosts.', 
       2020, 6, 'https://image.tmdb.org/t/p/w500/s4hUDgAvqNh8dTvDW6yvMgKO0Lr.jpg', 
       'https://www.youtube.com/watch?v=mcXcXU7EnuI', 'Amazon Prime'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=mcXcXU7EnuI'
);

-- Movie 330: Wonder Woman 1984
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Wonder Woman 1984', 'movie', 'Action, Adventure, Fantasy', 'Wonder Woman faces new enemies in the 1980s.', 
       2020, 5.4, 'https://image.tmdb.org/t/p/w500/8UlWHLMpgZm9bx6QYh0NFoq67tx.jpg', 
       'https://www.youtube.com/watch?v=sfM7_JLk-84', 'Max'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=sfM7_JLk-84'
);

-- Movie 331: Chernobyl
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Chernobyl', 'tv', 'Drama, History, Thriller', 'The true story of the 1986 nuclear disaster.', 
       2019, 9.4, 'https://image.tmdb.org/t/p/w500/hlLXt2tOPT6RRnjiUmoxyG1LTFi.jpg', 
       'https://www.youtube.com/watch?v=s9APLXM9Ei8', 'Max'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=s9APLXM9Ei8'
);

-- Movie 332: The Boys
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'The Boys', 'tv', 'Action, Comedy, Crime', 'Vigilantes take on corrupt superheroes.', 
       2019, 8.7, 'https://image.tmdb.org/t/p/w500/stTEycfG9929HYGCNrLxbDaFhLz.jpg', 
       'https://www.youtube.com/watch?v=_PH8WvI8t_Q', 'Prime Video'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=_PH8WvI8t_Q'
);

-- Movie 333: Parasite
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Parasite', 'movie', 'Comedy, Drama, Thriller', 'A poor family infiltrates a wealthy household.', 
       2019, 8.5, 'https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg', 
       'https://www.youtube.com/watch?v=5xH0HfJHsaY', 'Hulu'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=5xH0HfJHsaY'
);

-- Movie 334: What We Do in the Shadows
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'What We Do in the Shadows', 'tv', 'Comedy, Fantasy, Horror', 'Vampire roommates in Staten Island.', 
       2019, 8.5, 'https://image.tmdb.org/t/p/w500/chMsEyVAXkK8rXYLT7NRt3DJv3W.jpg', 
       'https://www.youtube.com/watch?v=mfBbSwX6kEk', 'Hulu'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=mfBbSwX6kEk'
);

-- Movie 335: Avengers: Endgame
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Avengers: Endgame', 'movie', 'Action, Adventure, Drama', 'The Avengers take one final stand against Thanos.', 
       2019, 8.4, 'https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg', 
       'https://www.youtube.com/watch?v=TcMBFSGVi1c', 'Disney+'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=TcMBFSGVi1c'
);

-- Movie 336: Joker
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Joker', 'movie', 'Crime, Drama, Thriller', 'The origin story of the infamous Joker.', 
       2019, 8.4, 'https://image.tmdb.org/t/p/w500/udDclJoHjfjb8Ekgsd4FDteOkCU.jpg', 
       'https://www.youtube.com/watch?v=zAGVQLHvwOY', 'Max'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=zAGVQLHvwOY'
);

-- Movie 337: Euphoria
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Euphoria', 'tv', 'Drama', 'Teens navigate drugs, love, and identity.', 
       2019, 8.4, 'https://image.tmdb.org/t/p/w500/jtnfNzqZwN4E32FGGxx1YZaBWWf.jpg', 
       'https://www.youtube.com/watch?v=HZygoiKxvxw', 'Max'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=HZygoiKxvxw'
);

-- Movie 338: 1917
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT '1917', 'movie', 'Drama, War', 'Two soldiers race against time in WWI.', 
       2019, 8.3, 'https://image.tmdb.org/t/p/w500/iZf0KyrE25z1sage4SYFLCCrMi9.jpg', 
       'https://www.youtube.com/watch?v=YqNYrYUiMfg', 'Peacock'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=YqNYrYUiMfg'
);

-- Movie 339: Ford v Ferrari
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Ford v Ferrari', 'movie', 'Action, Biography, Drama', 'Ford challenges Ferrari at Le Mans 1966.', 
       2019, 8.1, 'https://image.tmdb.org/t/p/w500/6ApDtO7xaWAfPqfi2IARXIzj8QS.jpg', 
       'https://www.youtube.com/watch?v=zyYgDtY2AMY', 'Disney+'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=zyYgDtY2AMY'
);

-- Movie 340: The Witcher
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'The Witcher', 'tv', 'Action, Adventure, Drama', 'A monster hunter navigates a dangerous world.', 
       2019, 8, 'https://image.tmdb.org/t/p/w500/7vjaCdMw15FEbXyLQTVa04URsPm.jpg', 
       'https://www.youtube.com/watch?v=ndl1W4ltcmg', 'Netflix'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=ndl1W4ltcmg'
);

-- Movie 341: Knives Out
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Knives Out', 'movie', 'Comedy, Crime, Drama', 'A detective investigates a patriarch''s death.', 
       2019, 7.9, 'https://image.tmdb.org/t/p/w500/pThyQovXQrw2m0s9x82twj48Jq4.jpg', 
       'https://www.youtube.com/watch?v=qGqiHJTsRkQ', 'Prime Video'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=qGqiHJTsRkQ'
);

-- Movie 342: Once Upon a Time in Hollywood
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Once Upon a Time in Hollywood', 'movie', 'Comedy, Drama', 'Tarantino''s tribute to 1969 Hollywood.', 
       2019, 7.6, 'https://image.tmdb.org/t/p/w500/8j58iEBw9pOXFD2L0nt0ZXeHviB.jpg', 
       'https://www.youtube.com/watch?v=ELeMaP8EPAA', 'Netflix'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=ELeMaP8EPAA'
);

-- Movie 343: Aladdin
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Aladdin', 'movie', 'Adventure, Comedy, Family', 'Live-action remake of the Disney classic.', 
       2019, 6.9, 'https://image.tmdb.org/t/p/w500/3iYQTLGoy7QnjcUYRJy4YrAgGvp.jpg', 
       'https://www.youtube.com/watch?v=foyufD52aog', 'Disney+'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=foyufD52aog'
);

-- Movie 344: Captain Marvel
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Captain Marvel', 'movie', 'Action, Adventure, Sci-Fi', 'Carol Danvers becomes Captain Marvel.', 
       2019, 6.9, 'https://image.tmdb.org/t/p/w500/AtsgWhDnHTq68L0lLsUrCnM7TjG.jpg', 
       'https://www.youtube.com/watch?v=Z1BCujX3pw8', 'Disney+'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=Z1BCujX3pw8'
);

-- Movie 345: The Lion King
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'The Lion King', 'movie', 'Adventure, Animation, Drama', 'Photorealistic remake of the Disney classic.', 
       2019, 6.8, 'https://image.tmdb.org/t/p/w500/dzBtMocZuJbjLOXvrl4zGYigDzh.jpg', 
       'https://www.youtube.com/watch?v=7TavVZMewpY', 'Disney+'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=7TavVZMewpY'
);

-- Movie 346: Jumanji: The Next Level
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Jumanji: The Next Level', 'movie', 'Action, Adventure, Comedy', 'The game takes the gang to new territories.', 
       2019, 6.7, 'https://image.tmdb.org/t/p/w500/l4iknLOenijaB85Zyb5SxH1gGz8.jpg', 
       'https://www.youtube.com/watch?v=rBxcF-r9Ibs', 'Netflix'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=rBxcF-r9Ibs'
);

-- Movie 347: The Rookie
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'The Rookie', 'tv', 'Crime, Drama, Comedy', 'Starting over isn''t easy, especially for small-town guy John Nolan who, after a life-altering incident, is pursuing his dream of being an LAPD officer. As the force''s oldest rookie, he’s met with skepticism from some higher-ups who see him as just a walking midlife crisis.', 
       2018, 8.5, 'https://image.tmdb.org/t/p/w500/70kTz0OmjjZe7zHvIDrq2iKW7PJ.jpg', 
       'https://www.youtube.com/watch?v=8BPlx6eK1vc', 'Netflix'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=8BPlx6eK1vc'
);

-- Movie 348: Avengers: Infinity War
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Avengers: Infinity War', 'movie', 'Action, Adventure, Sci-Fi', 'The Avengers must stop Thanos from collecting all six Infinity Stones.', 
       2018, 8.5, 'https://image.tmdb.org/t/p/w500/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg', 
       'https://www.youtube.com/watch?v=6ZfuNTqbHE8', 'Disney+'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=6ZfuNTqbHE8'
);

-- Movie 349: 9-1-1
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT '9-1-1', 'tv', 'Drama, Crime, Action', 'Explore the high-pressure experiences of police officers, paramedics and firefighters who are thrust into the most frightening, shocking and heart-stopping situations. These emergency responders must try to balance saving those who are at their most vulnerable with solving the problems in their own lives.', 
       2018, 8.2, 'https://image.tmdb.org/t/p/w500/6njUqsd3By2mJsdZm1P0moPLzs3.jpg', 
       'https://www.youtube.com/watch?v=_8MHJfUMqPA', 'Disney+'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=_8MHJfUMqPA'
);

-- Movie 350: Killing Eve
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Killing Eve', 'tv', 'Action, Drama, Thriller', 'A spy and an assassin become obsessed.', 
       2018, 8.2, 'https://image.tmdb.org/t/p/w500/8haPwM8YpnLB7VMXBoefwj1oQbT.jpg', 
       'https://www.youtube.com/watch?v=SfZ_cEDmDLQ', 'Hulu'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=SfZ_cEDmDLQ'
);

-- Movie 351: The Queen of Flow
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'The Queen of Flow', 'tv', 'Drama', 'After spending seventeen years in prison unfairly, a talented songwriter seeks revenge on the men who sank her and killed her family.', 
       2018, 8, 'https://image.tmdb.org/t/p/w500/fuVuDYrs8sxvEolnYr0wCSvtyTi.jpg', 
       'https://www.youtube.com/watch?v=sZjBH4cuO5k', 'Netflix'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=sZjBH4cuO5k'
);

-- Movie 352: Black Panther
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Black Panther', 'movie', 'Action, Adventure, Sci-Fi', 'T''Challa returns home to Wakanda to take his rightful place as king.', 
       2018, 7.3, 'https://image.tmdb.org/t/p/w500/uxzzxijgPIY7slzFvMotPv8wjKA.jpg', 
       'https://www.youtube.com/watch?v=xjDjIWPwcPU', 'Disney+'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=xjDjIWPwcPU'
);

-- Movie 353: Dark
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Dark', 'tv', 'Crime, Drama, Mystery', 'A German sci-fi thriller about time travel.', 
       2017, 8.7, 'https://image.tmdb.org/t/p/w500/apbrbWs8M9lyOpJYU5WXrpFbk1Z.jpg', 
       'https://www.youtube.com/watch?v=rrwycJ08PSA', 'Netflix'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=rrwycJ08PSA'
);

-- Movie 354: Ozark
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Ozark', 'tv', 'Crime, Drama, Thriller', 'A family launders money in the Ozarks.', 
       2017, 8.5, 'https://image.tmdb.org/t/p/w500/m73bD8VjibMNYpKqPi6VyHEzBjG.jpg', 
       'https://www.youtube.com/watch?v=5hAXVqrljbs', 'Netflix'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=5hAXVqrljbs'
);

-- Movie 355: Fleabag
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Fleabag', 'tv', 'Comedy, Drama', 'A woman navigates life in London.', 
       2016, 8.7, 'https://image.tmdb.org/t/p/w500/27vEfv1CqFmjOaRlNiRPAod7cfX.jpg', 
       'https://www.youtube.com/watch?v=aX2ViKQFL_k', 'Prime Video'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=aX2ViKQFL_k'
);

-- Movie 356: Stranger Things
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Stranger Things', 'tv', 'Mystery, Action', 'When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces, and one strange little girl.', 
       2016, 8.6, 'https://image.tmdb.org/t/p/w500/uOOtwVbSr4QDjAGIifLDwpb2Pdl.jpg', 
       'https://www.youtube.com/watch?v=mnd7sFt5c3A', 'Netflix'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=mnd7sFt5c3A'
);

-- Movie 357: The Crown
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'The Crown', 'tv', 'Biography, Drama, History', 'The reign of Queen Elizabeth II.', 
       2016, 8.6, 'https://image.tmdb.org/t/p/w500/1M876KPjulVwppEpldhdc8V4o68.jpg', 
       'https://www.youtube.com/watch?v=JWtnJjn6ng0', 'Netflix'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=JWtnJjn6ng0'
);

-- Movie 358: Westworld
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Westworld', 'tv', 'Drama, Mystery, Sci-Fi', 'Robots in a Wild West theme park gain consciousness.', 
       2016, 8.5, 'https://image.tmdb.org/t/p/w500/y55oBgC298bVTZqbH9a3nDbz6TR.jpg', 
       'https://www.youtube.com/watch?v=9BErJiNIHkA', 'Max'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=9BErJiNIHkA'
);

-- Movie 359: Better Call Saul
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Better Call Saul', 'tv', 'Crime, Drama', 'The origin of Saul Goodman.', 
       2015, 8.9, 'https://image.tmdb.org/t/p/w500/fC2HDm5t0kHl7mTm7jxMR31b7by.jpg', 
       'https://www.youtube.com/watch?v=9q4qzYrHVmI', 'Netflix'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=9q4qzYrHVmI'
);

-- Movie 360: Mad Max: Fury Road
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Mad Max: Fury Road', 'movie', 'Action, Adventure, Sci-Fi', 'In a post-apocalyptic wasteland, Max teams up with Furiosa.', 
       2015, 8.1, 'https://image.tmdb.org/t/p/w500/8tZYtuWezp8JbcsvHYO0O46tFbo.jpg', 
       'https://www.youtube.com/watch?v=hEJnMQG9ev8', 'Max'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=hEJnMQG9ev8'
);

-- Movie 361: Interstellar
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Interstellar', 'movie', 'Adventure, Drama, Sci-Fi', 'Explorers travel through a wormhole in space to ensure humanity''s survival.', 
       2014, 8.7, 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg', 
       'https://www.youtube.com/watch?v=zSWdZVtXT7E', 'Paramount+'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=zSWdZVtXT7E'
);

-- Movie 362: The Flash
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'The Flash', 'tv', 'Drama', 'After being struck by lightning, CSI investigator Barry Allen awakens from a nine-month coma to discover he has been  granted the gift of super speed.  Teaming up with S.T.A.R. Labs, Barry takes on the persona of The Flash, the Fastest  Man Alive, to protect his city.', 
       2014, 7.8, 'https://image.tmdb.org/t/p/w500/yZevl2vHQgmosfwUdVNzviIfaWS.jpg', 
       'https://www.youtube.com/watch?v=IgVyroQjZbE', 'Netflix'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=IgVyroQjZbE'
);

-- Movie 363: Peaky Blinders
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Peaky Blinders', 'tv', 'Crime, Drama', 'A Birmingham crime family after WWI.', 
       2013, 8.8, 'https://image.tmdb.org/t/p/w500/vUUqzWa2LnHvVuDuXxZA6wJ6O5.jpg', 
       'https://www.youtube.com/watch?v=oVzVdvGIC7U', 'Netflix'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=oVzVdvGIC7U'
);

-- Movie 364: The Blacklist
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'The Blacklist', 'tv', 'Drama, Crime, Mystery', 'Raymond "Red" Reddington, one of the FBI''s most wanted fugitives, surrenders in person at FBI Headquarters in Washington, D.C. He claims that he and the FBI have the same interests: bringing down dangerous criminals and terrorists. In the last two decades, he''s made a list of criminals and terrorists that matter the most but the FBI cannot find because it does not know they exist. Reddington calls this "The Blacklist". Reddington will co-operate, but insists that he will speak only to Elizabeth Keen, a rookie FBI profiler.', 
       2013, 7.6, 'https://image.tmdb.org/t/p/w500/4HTfd1PhgFUenJxVuBDNdLmdr0c.jpg', 
       'https://www.youtube.com/watch?v=JGBIimq1I3A', 'Netflix'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=JGBIimq1I3A'
);

-- Movie 365: Chicago Fire
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Chicago Fire', 'tv', 'Drama', 'An edge-of-your-seat view into the lives of everyday heroes committed to one of America''s noblest professions. For the firefighters, rescue squad and paramedics of Chicago Firehouse 51, no occupation is more stressful or dangerous, yet so rewarding and exhilarating. These courageous men and women are among the elite who forge headfirst into danger when everyone else is running the other way and whose actions make the difference between life and death.', 
       2012, 8.4, 'https://image.tmdb.org/t/p/w500/r915sk2JpthZSjHEgZKifWxgo6L.jpg', 
       'https://www.youtube.com/watch?v=IIeSDILTE5M', 'Disney+'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=IIeSDILTE5M'
);

-- Movie 366: Shameless
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Shameless', 'tv', 'Drama, Comedy', 'Chicagoan Frank Gallagher is the proud single dad of six smart, industrious, independent kids, who without him would be... perhaps better off. When Frank''s not at the bar spending what little money they have, he''s passed out on the floor. But the kids have found ways to grow up in spite of him. They may not be like any family you know, but they make no apologies for being exactly who they are.', 
       2011, 8.2, 'https://image.tmdb.org/t/p/w500/ifo31fMWLmyOVpdak9K0kY4jldQ.jpg', 
       'https://www.youtube.com/watch?v=9tvkYS5cA58', 'Netflix'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=9tvkYS5cA58'
);

-- Movie 367: Homeland
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Homeland', 'tv', 'Drama, War, Crime', 'CIA officer Carrie Mathison is tops in her field despite being bipolar, which makes her volatile and unpredictable. With the help of her long-time mentor Saul Berenson, Carrie fearlessly risks everything, including her personal well-being and even sanity, at every turn.', 
       2011, 7.6, 'https://image.tmdb.org/t/p/w500/6GAvS2e6VIRsms9FpVt33PsCoEW.jpg', 
       'https://www.youtube.com/watch?v=KyFmS3wRPCQ', 'Netflix'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=KyFmS3wRPCQ'
);

-- Movie 368: Modern Family
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Modern Family', 'tv', 'Comedy', 'The Pritchett-Dunphy-Tucker clan is a wonderfully large and blended family. They give us an honest and often hilarious look into the sometimes warm, sometimes twisted, embrace of the modern family.', 
       2009, 7.9, 'https://image.tmdb.org/t/p/w500/k5Qg5rgPoKdh3yTJJrLtyoyYGwC.jpg', 
       'https://www.youtube.com/watch?v=rbpTUPisA78', 'Disney+'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=rbpTUPisA78'
);

-- Movie 369: Breaking Bad
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Breaking Bad', 'tv', 'Drama, Crime', 'Walter White, a New Mexico chemistry teacher, is diagnosed with Stage III cancer and given a prognosis of only two years left to live. He becomes filled with a sense of fearlessness and an unrelenting desire to secure his family''s financial future at any cost as he enters the dangerous world of drugs and crime.', 
       2008, 8.9, 'https://image.tmdb.org/t/p/w500/ztkUQFLlC19CCMYHW9o1zWhJRNq.jpg', 
       'https://www.youtube.com/watch?v=XZ8daibM3AE', 'Netflix'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=XZ8daibM3AE'
);

-- Movie 370: Dexter
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Dexter', 'tv', 'Crime, Drama, Mystery', 'Dexter Morgan, a blood spatter pattern analyst for the Miami Metro Police also leads a secret life as a serial killer, hunting down criminals who have slipped through the cracks of justice.', 
       2006, 8.2, 'https://image.tmdb.org/t/p/w500/q8dWfc4JwQuv3HayIZeO84jAXED.jpg', 
       'https://www.youtube.com/watch?v=YQeUmSD1c3g', 'Netflix'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=YQeUmSD1c3g'
);

-- Movie 371: The Office
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'The Office', 'tv', 'Comedy', 'The everyday lives of office employees in the Scranton, Pennsylvania branch of the fictional Dunder Mifflin Paper Company.', 
       2005, 8.6, 'https://image.tmdb.org/t/p/w500/dg9e5fPRRId8PoBE0F6jl5y85Eu.jpg', 
       'https://www.youtube.com/watch?v=-C2z-nshFts', 'Netflix'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=-C2z-nshFts'
);

-- Movie 372: Criminal Minds
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Criminal Minds', 'tv', 'Crime, Drama, Mystery', 'An elite team of FBI profilers analyze the country''s most twisted criminal minds, anticipating their next moves before they strike again. The Behavioral Analysis Unit''s most experienced agent is David Rossi, a founding member of the BAU who returns to help the team solve new cases.', 
       2005, 8.3, 'https://image.tmdb.org/t/p/w500/gigxjNnACiXAfrwoMox5WJFgc0I.jpg', 
       'https://www.youtube.com/watch?v=NTYxiJBbEZk', 'Disney+'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=NTYxiJBbEZk'
);

-- Movie 373: House
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'House', 'tv', 'Drama, Comedy, Mystery', 'Dr. Gregory House, a drug-addicted, unconventional, misanthropic medical genius, leads a team of diagnosticians at the fictional Princeton–Plainsboro Teaching Hospital in New Jersey.', 
       2004, 8.6, 'https://image.tmdb.org/t/p/w500/3Cz7ySOQJmqiuTdrc6CY0r65yDI.jpg', 
       'https://www.youtube.com/watch?v=MczMB8nU1sY', 'Netflix'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=MczMB8nU1sY'
);

-- Movie 374: Lost
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Lost', 'tv', 'Mystery, Action, Drama', 'Stripped of everything, the survivors of a horrific plane crash  must work together to stay alive. But the island holds many secrets.', 
       2004, 7.9, 'https://image.tmdb.org/t/p/w500/og6S0aTZU6YUJAbqxeKjCa3kY1E.jpg', 
       'https://www.youtube.com/watch?v=KTu8iDynwNc', 'Disney+'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=KTu8iDynwNc'
);

-- Movie 375: NCIS
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'NCIS', 'tv', 'Crime, Drama, Action', 'From murder and espionage to terrorism and stolen submarines, a team of special agents investigates any crime that has any connection to Navy and Marine Corps personnel, regardless of rank or position.', 
       2003, 7.6, 'https://image.tmdb.org/t/p/w500/mBcu8d6x6zB1el3MPNl7cZQEQ31.jpg', 
       'https://www.youtube.com/watch?v=BhtDgn31XZo', 'Paramount Plus'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=BhtDgn31XZo'
);

-- Movie 376: Smallville
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Smallville', 'tv', 'Action, Drama', 'The origins of the world’s greatest hero–from Krypton refugee Kal-el’s arrival on Earth through his tumultuous teen years to Clark Kent’s final steps toward embracing his destiny as the Man of Steel.', 
       2001, 8.2, 'https://image.tmdb.org/t/p/w500/azU5zRPEaiACTY6kAlEddIe8ypk.jpg', 
       'https://www.youtube.com/watch?v=70Y32si4yb8', 'Netflix'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=70Y32si4yb8'
);

-- Movie 377: CSI: Crime Scene Investigation
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'CSI: Crime Scene Investigation', 'tv', 'Crime, Drama, Mystery', 'A Las Vegas team of forensic investigators are trained to solve criminal cases by scouring the crime scene, collecting irrefutable evidence and finding the missing pieces that solve the mystery.', 
       2000, 7.6, 'https://image.tmdb.org/t/p/w500/i5hmoRjHNWady4AtAGICTUXknKH.jpg', 
       'https://www.youtube.com/watch?v=ApT1EYvrwuk', 'Paramount Plus'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=ApT1EYvrwuk'
);

-- Movie 378: Family Guy
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Family Guy', 'tv', 'Animation, Comedy', 'Sick, twisted, politically incorrect and Freakin'' Sweet animated series featuring the adventures of the dysfunctional Griffin family. Bumbling Peter and long-suffering Lois have three kids. Stewie (a brilliant but sadistic baby bent on killing his mother and taking over the world), Meg (the oldest, and is the most unpopular girl in town) and Chris (the middle kid, he''s not very bright but has a passion for movies). The final member of the family is Brian - a talking dog and much more than a pet, he keeps Stewie in check whilst sipping Martinis and sorting through his own life issues.', 
       1999, 7.4, 'https://image.tmdb.org/t/p/w500/3PFsEuAiyLkWsP4GG6dIV37Q6gu.jpg', 
       'https://www.youtube.com/watch?v=J32iwo65RMc', 'Disney+'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=J32iwo65RMc'
);

-- Movie 379: The X-Files
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'The X-Files', 'tv', 'Mystery, Crime', 'The exploits of FBI Special Agents Fox Mulder and Dana Scully who investigate X-Files: marginalized, unsolved cases involving paranormal phenomena. Mulder believes in the existence of aliens and the paranormal while Scully, a skeptic, is assigned to make scientific analyses of Mulder''s discoveries that debunk Mulder''s work and thus return him to mainstream cases.', 
       1993, 8.4, 'https://image.tmdb.org/t/p/w500/rcBx0p8h51LHceyhquYMxbspJQu.jpg', 
       'https://www.youtube.com/watch?v=_HTByz4RlqI', 'Disney+'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=_HTByz4RlqI'
);

-- Movie 380: Raw
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Raw', 'tv', 'Reality', 'A regularly scheduled, live, year-round program featuring some of the biggest WWE Superstars.', 
       1993, 6.8, 'https://image.tmdb.org/t/p/w500/pv5WNnLUo7mpT8k901Lo8UovrqI.jpg', 
       'https://www.youtube.com/watch?v=FVO6mUQMon8', 'Netflix'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=FVO6mUQMon8'
);

-- Movie 381: Law & Order
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'Law & Order', 'tv', 'Crime, Drama', 'In cases ripped from the headlines, police investigate serious and often deadly crimes, weighing the evidence and questioning the suspects until someone is taken into custody. The district attorney''s office then builds a case to convict the perpetrator by proving the person guilty beyond a reasonable doubt. Working together, these expert teams navigate all sides of the complex criminal justice system to make New York a safer place.', 
       1990, 7.4, 'https://image.tmdb.org/t/p/w500/haJ9eHytVO3H3JooMJG1DiWwDNm.jpg', 
       'https://www.youtube.com/watch?v=RzN8cPlcMTU', 'Disney+'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=RzN8cPlcMTU'
);

-- Movie 382: The Simpsons
INSERT INTO movies (title, type, genre, description, release_year, imdb_rating, poster_url, trailer_url, source)
SELECT 'The Simpsons', 'tv', 'Family, Animation, Comedy', 'Set in Springfield, the average American town, the show focuses on the antics and everyday adventures of the Simpson family; Homer, Marge, Bart, Lisa and Maggie, as well as a virtual cast of thousands. Since the beginning, the series has been a pop culture icon, attracting hundreds of celebrities to guest star. The show has also made name for itself in its fearless satirical take on politics, media and American life in general.', 
       1989, 8, 'https://image.tmdb.org/t/p/w500/uWpG7GqfKGQqX4YMAo3nv5OrglV.jpg', 
       'https://www.youtube.com/watch?v=_jgYEYERYFQ', 'Disney+'
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE trailer_url = 'https://www.youtube.com/watch?v=_jgYEYERYFQ'
);


-- ============================================
-- Summary
-- ============================================
-- Total INSERT statements: 282
-- Each INSERT checks if trailer_url already exists to prevent duplicates
-- Movies CAN have multiple different trailer URLs (distinct URLs are allowed)

SELECT CONCAT('Total movies in database: ', COUNT(*)) AS summary FROM movies;
