/**
 * Add more classic content from 2015-2024
 */

const fs = require('fs');

const existingDb = JSON.parse(fs.readFileSync('movies-database.json', 'utf-8'));
const existingTitles = new Set(existingDb.items.map(i => i.title));

const moreContent = [
  // 2020-2024 Movies
  { title: "A Quiet Place: Day One", type: "movie", year: "2024", rating: "7.5", genres: ["Horror", "Sci-Fi", "Thriller"], source: "Paramount+", trailerUrl: "https://www.youtube.com/watch?v=YPY7J-flzE8", posterUrl: "https://image.tmdb.org/t/p/w500/yrpPYKijwdMHyTGIOd1iK1h0Xno.jpg", description: "Experience the day the world went quiet.", nowPlaying: [] },
  { title: "Challengers", type: "movie", year: "2024", rating: "7.4", genres: ["Drama", "Romance", "Sport"], source: "Prime Video", trailerUrl: "https://www.youtube.com/watch?v=VuQrUwFn6bU", posterUrl: "https://image.tmdb.org/t/p/w500/H6vke7zGiuLsz4v4RPhaUW4epFb.jpg", description: "Zendaya stars in this tennis rivalry drama.", nowPlaying: [] },
  { title: "Civil War", type: "movie", year: "2024", rating: "7.3", genres: ["Action", "Drama", "Thriller"], source: "Apple TV+", trailerUrl: "https://www.youtube.com/watch?v=c2G18nIVpNE", posterUrl: "https://image.tmdb.org/t/p/w500/sh7Rg8Er3tFcN9BpKIPOMvALgZd.jpg", description: "Journalists document a civil war in a dystopian America.", nowPlaying: [] },
  { title: "The Fall Guy", type: "movie", year: "2024", rating: "7.4", genres: ["Action", "Comedy"], source: "Peacock", trailerUrl: "https://www.youtube.com/watch?v=j7jPnwVGdZ8", posterUrl: "https://image.tmdb.org/t/p/w500/tSz1qsmSJon0rqjHBxXZmrotuse.jpg", description: "A stuntman is drawn into a mystery.", nowPlaying: [] },
  { title: "Bad Boys: Ride or Die", type: "movie", year: "2024", rating: "7.1", genres: ["Action", "Comedy", "Crime"], source: "Netflix", trailerUrl: "https://www.youtube.com/watch?v=uGJnsvqoq0o", posterUrl: "https://image.tmdb.org/t/p/w500/nP6RliHjxsz4irTKsxe8FRhKZYl.jpg", description: "Mike and Marcus are on the run.", nowPlaying: [] },
  { title: "Abigail", type: "movie", year: "2024", rating: "7.0", genres: ["Horror", "Thriller"], source: "Peacock", trailerUrl: "https://www.youtube.com/watch?v=m8x7pDi0z3Y", posterUrl: "https://image.tmdb.org/t/p/w500/5gKKSGHOTmTEBJ5mRVgKbPy1TA0.jpg", description: "Kidnappers discover their captive is a vampire.", nowPlaying: [] },
  { title: "Monkey Man", type: "movie", year: "2024", rating: "7.2", genres: ["Action", "Thriller"], source: "Peacock", trailerUrl: "https://www.youtube.com/watch?v=g8zxiB5Qhsc", posterUrl: "https://image.tmdb.org/t/p/w500/b5bbMveRvCNTvHE87xBrJNVPKbi.jpg", description: "Dev Patel's directorial debut about vengeance.", nowPlaying: [] },
  { title: "The Marvels", type: "movie", year: "2023", rating: "6.5", genres: ["Action", "Adventure", "Sci-Fi"], source: "Disney+", trailerUrl: "https://www.youtube.com/watch?v=wS_qbDztgVY", posterUrl: "https://image.tmdb.org/t/p/w500/9GBhzXMFjgcZ3FdR9w3bUmmMps6.jpg", description: "Captain Marvel, Ms. Marvel, and Monica Rambeau team up.", nowPlaying: [] },
  { title: "Aquaman and the Lost Kingdom", type: "movie", year: "2023", rating: "6.3", genres: ["Action", "Adventure", "Fantasy"], source: "Max", trailerUrl: "https://www.youtube.com/watch?v=FV3bqvOHRQo", posterUrl: "https://image.tmdb.org/t/p/w500/7lTnXOy0iNtBAdRP3TZvaKJ77F6.jpg", description: "Aquaman must forge an uneasy alliance.", nowPlaying: [] },
  { title: "Napoleon", type: "movie", year: "2023", rating: "6.8", genres: ["Action", "Biography", "Drama"], source: "Apple TV+", trailerUrl: "https://www.youtube.com/watch?v=OAZWXUkrjPc", posterUrl: "https://image.tmdb.org/t/p/w500/jE5o7y9K6pZtWNNMEws1LPKaWnc.jpg", description: "Ridley Scott's epic about Napoleon Bonaparte.", nowPlaying: [] },
  { title: "Wonka", type: "movie", year: "2023", rating: "7.2", genres: ["Adventure", "Comedy", "Family"], source: "Max", trailerUrl: "https://www.youtube.com/watch?v=otNh9bTjXWg", posterUrl: "https://image.tmdb.org/t/p/w500/qhb1qOilapbapxWQn9jtRCMwXJF.jpg", description: "The origin story of Willy Wonka.", nowPlaying: [] },
  { title: "Anyone But You", type: "movie", year: "2023", rating: "6.7", genres: ["Comedy", "Romance"], source: "Netflix", trailerUrl: "https://www.youtube.com/watch?v=MllO2wlKNFM", posterUrl: "https://image.tmdb.org/t/p/w500/2hwXbPW5SJkXuSClUgTiScyBs45.jpg", description: "Two people pretend to be a couple at a destination wedding.", nowPlaying: [] },
  { title: "The Color Purple", type: "movie", year: "2023", rating: "7.3", genres: ["Drama", "Musical"], source: "Max", trailerUrl: "https://www.youtube.com/watch?v=JdPp2PQSiG8", posterUrl: "https://image.tmdb.org/t/p/w500/cij4dd21TrRp6zhBPdkwcuUVt8E.jpg", description: "Musical adaptation of the beloved story.", nowPlaying: [] },
  { title: "Wish", type: "movie", year: "2023", rating: "5.8", genres: ["Animation", "Adventure", "Family"], source: "Disney+", trailerUrl: "https://www.youtube.com/watch?v=oyRxxpD3yNw", posterUrl: "https://image.tmdb.org/t/p/w500/AcoVfiv1rrWOmAdpnAMnM56ki19.jpg", description: "A girl wishes on a star that comes to life.", nowPlaying: [] },
  { title: "Elemental", type: "movie", year: "2023", rating: "7.0", genres: ["Animation", "Adventure", "Comedy"], source: "Disney+", trailerUrl: "https://www.youtube.com/watch?v=hXzcyx9V0xw", posterUrl: "https://image.tmdb.org/t/p/w500/4Y1WNkd88JXmGfhtWR7dmDAo1T2.jpg", description: "In a city where fire, water, land and air residents live together.", nowPlaying: [] },
  { title: "Past Lives", type: "movie", year: "2023", rating: "8.0", genres: ["Drama", "Romance"], source: "Paramount+", trailerUrl: "https://www.youtube.com/watch?v=kA244xewjcI", posterUrl: "https://image.tmdb.org/t/p/w500/rfZ3n6PIYiVMaVIRN7O0SaY3BWo.jpg", description: "Two childhood friends reunite in New York.", nowPlaying: [] },
  { title: "The Holdovers", type: "movie", year: "2023", rating: "7.9", genres: ["Comedy", "Drama"], source: "Peacock", trailerUrl: "https://www.youtube.com/watch?v=AhKLpJmHhIg", posterUrl: "https://image.tmdb.org/t/p/w500/VHSzNBTwxV8vh7wylo7O9CLdac.jpg", description: "A cranky teacher stays with a student over Christmas break.", nowPlaying: [] },
  { title: "Poor Things", type: "movie", year: "2023", rating: "8.0", genres: ["Comedy", "Drama", "Romance"], source: "Hulu", trailerUrl: "https://www.youtube.com/watch?v=RlbR5N6veqw", posterUrl: "https://image.tmdb.org/t/p/w500/kCGlIMHnOm8JPXq3rXM6c5wMxcT.jpg", description: "Emma Stone stars in this surreal Victorian tale.", nowPlaying: [] },
  { title: "Mission: Impossible – Dead Reckoning Part One", type: "movie", year: "2023", rating: "7.8", genres: ["Action", "Adventure", "Thriller"], source: "Paramount+", trailerUrl: "https://www.youtube.com/watch?v=avz06PDqDbM", posterUrl: "https://image.tmdb.org/t/p/w500/NNxYkU70HPurnNCSiCjYAmacwm.jpg", description: "Ethan Hunt faces a dangerous enemy.", nowPlaying: [] },
  { title: "Fast X", type: "movie", year: "2023", rating: "6.0", genres: ["Action", "Crime", "Thriller"], source: "Peacock", trailerUrl: "https://www.youtube.com/watch?v=eoOaKN4qCKw", posterUrl: "https://image.tmdb.org/t/p/w500/fiVW06jE7z9YnO4trhaMEdclSiC.jpg", description: "Dom Toretto and his family face a new threat.", nowPlaying: [] },
  { title: "Indiana Jones and the Dial of Destiny", type: "movie", year: "2023", rating: "6.7", genres: ["Action", "Adventure"], source: "Disney+", trailerUrl: "https://www.youtube.com/watch?v=ZfVYWWzcXYw", posterUrl: "https://image.tmdb.org/t/p/w500/Af4bXE63pVsb2FtbW8uYIyPBadD.jpg", description: "Indiana Jones races to find a legendary artifact.", nowPlaying: [] },
  { title: "Creed III", type: "movie", year: "2023", rating: "7.3", genres: ["Drama", "Sport"], source: "Prime Video", trailerUrl: "https://www.youtube.com/watch?v=AHmCH7iB_wM", posterUrl: "https://image.tmdb.org/t/p/w500/cvsXj3I9Q2iyyIo95AecSd1tad7.jpg", description: "Adonis Creed faces his childhood friend in the ring.", nowPlaying: [] },
  { title: "Blue Beetle", type: "movie", year: "2023", rating: "6.8", genres: ["Action", "Adventure", "Sci-Fi"], source: "Max", trailerUrl: "https://www.youtube.com/watch?v=vS3_72Gb-bI", posterUrl: "https://image.tmdb.org/t/p/w500/mXLOHHc1Zeq5yw7XoROW5m6Q3qR.jpg", description: "A teenager gains superpowers from an alien scarab.", nowPlaying: [] },
  { title: "Meg 2: The Trench", type: "movie", year: "2023", rating: "5.5", genres: ["Action", "Horror", "Sci-Fi"], source: "Max", trailerUrl: "https://www.youtube.com/watch?v=dG91B3hHyY4", posterUrl: "https://image.tmdb.org/t/p/w500/drCySc1LWJLe5sLlBNwMPVHVRF6.jpg", description: "Jason Statham battles massive prehistoric sharks.", nowPlaying: [] },
  { title: "The Little Mermaid", type: "movie", year: "2023", rating: "6.4", genres: ["Adventure", "Family", "Fantasy"], source: "Disney+", trailerUrl: "https://www.youtube.com/watch?v=kpGo2_d3oYE", posterUrl: "https://image.tmdb.org/t/p/w500/ym1dxyOk4jFcSl4Q2zmRrA5BEEN.jpg", description: "Live-action remake of the Disney classic.", nowPlaying: [] },
  { title: "Ant-Man and the Wasp: Quantumania", type: "movie", year: "2023", rating: "6.4", genres: ["Action", "Adventure", "Comedy"], source: "Disney+", trailerUrl: "https://www.youtube.com/watch?v=ZlNFpri-Y40", posterUrl: "https://image.tmdb.org/t/p/w500/ngl2FKBlU4fhbdsrtdom9LVLBXw.jpg", description: "Ant-Man and the Wasp explore the Quantum Realm.", nowPlaying: [] },
  { title: "Cocaine Bear", type: "movie", year: "2023", rating: "6.0", genres: ["Comedy", "Thriller"], source: "Peacock", trailerUrl: "https://www.youtube.com/watch?v=DuWEEKeJLMI", posterUrl: "https://image.tmdb.org/t/p/w500/gOnmaxHo0412UVr1QM5Nekv1xPi.jpg", description: "A bear ingests cocaine and goes on a rampage.", nowPlaying: [] },
  { title: "No Hard Feelings", type: "movie", year: "2023", rating: "6.4", genres: ["Comedy", "Romance"], source: "Netflix", trailerUrl: "https://www.youtube.com/watch?v=0gfAuEI4NxU", posterUrl: "https://image.tmdb.org/t/p/w500/gD72DhJ7NbfxvtxGiAzLaa0xaoj.jpg", description: "Jennifer Lawrence stars in this raunchy comedy.", nowPlaying: [] },
  
  // 2022 Movies
  { title: "Glass Onion: A Knives Out Mystery", type: "movie", year: "2022", rating: "7.2", genres: ["Comedy", "Crime", "Drama"], source: "Netflix", trailerUrl: "https://www.youtube.com/watch?v=gj5ibYSz8C0", posterUrl: "https://image.tmdb.org/t/p/w500/vDGr1YdrlfbU9wxTOdpf3zChmv9.jpg", description: "Detective Benoit Blanc investigates a new mystery.", nowPlaying: [] },
  { title: "Nope", type: "movie", year: "2022", rating: "7.0", genres: ["Horror", "Mystery", "Sci-Fi"], source: "Peacock", trailerUrl: "https://www.youtube.com/watch?v=In8fuzj3gck", posterUrl: "https://image.tmdb.org/t/p/w500/AcKVlWaNVVVFQwro3nLXqPljcYA.jpg", description: "Jordan Peele's sci-fi thriller about UFOs.", nowPlaying: [] },
  { title: "The Menu", type: "movie", year: "2022", rating: "7.2", genres: ["Comedy", "Horror", "Thriller"], source: "HBO Max", trailerUrl: "https://www.youtube.com/watch?v=C_uTkUGcHv4", posterUrl: "https://image.tmdb.org/t/p/w500/v31MsWhF9WFh7Qooq6xSBbmJxoG.jpg", description: "A couple visits an exclusive restaurant with dark secrets.", nowPlaying: [] },
  { title: "Minions: The Rise of Gru", type: "movie", year: "2022", rating: "6.6", genres: ["Animation", "Adventure", "Comedy"], source: "Peacock", trailerUrl: "https://www.youtube.com/watch?v=6DxjJzmYsXo", posterUrl: "https://image.tmdb.org/t/p/w500/wKiOkZTN9lUUUNZLmtnwubZYONg.jpg", description: "The origin story of the Minions and young Gru.", nowPlaying: [] },
  { title: "Bullet Train", type: "movie", year: "2022", rating: "7.3", genres: ["Action", "Comedy", "Thriller"], source: "Netflix", trailerUrl: "https://www.youtube.com/watch?v=0IOsk2Vlc4o", posterUrl: "https://image.tmdb.org/t/p/w500/tVxDe01Zy3kZqaZRNiXFGDICdZk.jpg", description: "Brad Pitt stars as an assassin on a bullet train.", nowPlaying: [] },
  { title: "Thor: Love and Thunder", type: "movie", year: "2022", rating: "6.4", genres: ["Action", "Adventure", "Comedy"], source: "Disney+", trailerUrl: "https://www.youtube.com/watch?v=tgB1wUcmbbw", posterUrl: "https://image.tmdb.org/t/p/w500/pIkRyD18kl4FhoCNQuWxWu5cBLM.jpg", description: "Thor teams up with Jane Foster and the Guardians.", nowPlaying: [] },
  { title: "Doctor Strange in the Multiverse of Madness", type: "movie", year: "2022", rating: "7.0", genres: ["Action", "Adventure", "Fantasy"], source: "Disney+", trailerUrl: "https://www.youtube.com/watch?v=aWzlQ2N6qqg", posterUrl: "https://image.tmdb.org/t/p/w500/9Gtg2DzBhmYamXBS1hKAhiwbBKS.jpg", description: "Doctor Strange travels into the multiverse.", nowPlaying: [] },
  { title: "Puss in Boots: The Last Wish", type: "movie", year: "2022", rating: "7.9", genres: ["Animation", "Adventure", "Comedy"], source: "Peacock", trailerUrl: "https://www.youtube.com/watch?v=RqrXhwS33yc", posterUrl: "https://image.tmdb.org/t/p/w500/kuf6dutpsT0vSVehic3EZIqkOBt.jpg", description: "Puss in Boots discovers he's on his last life.", nowPlaying: [] },
  { title: "Don't Worry Darling", type: "movie", year: "2022", rating: "6.2", genres: ["Drama", "Mystery", "Thriller"], source: "Max", trailerUrl: "https://www.youtube.com/watch?v=FgmnKsED-jU", posterUrl: "https://image.tmdb.org/t/p/w500/9BQqngPfwpeAfK7c2H3cwIFWIVR.jpg", description: "A 1950s housewife uncovers disturbing truths.", nowPlaying: [] },
  { title: "Elvis", type: "movie", year: "2022", rating: "7.4", genres: ["Biography", "Drama", "Music"], source: "Max", trailerUrl: "https://www.youtube.com/watch?v=vox7jLUuOLQ", posterUrl: "https://image.tmdb.org/t/p/w500/oJagOzBu9Rdd9BrciseCm3U3MCU.jpg", description: "The life story of rock icon Elvis Presley.", nowPlaying: [] },
  { title: "Smile", type: "movie", year: "2022", rating: "6.8", genres: ["Horror", "Mystery", "Thriller"], source: "Paramount+", trailerUrl: "https://www.youtube.com/watch?v=BcDK7lkzzsU", posterUrl: "https://image.tmdb.org/t/p/w500/aPqcQwu4VGEewPhagWNncDbJ9Xp.jpg", description: "A therapist is haunted by a sinister curse.", nowPlaying: [] },
  { title: "Amsterdam", type: "movie", year: "2022", rating: "5.7", genres: ["Comedy", "Drama", "History"], source: "Max", trailerUrl: "https://www.youtube.com/watch?v=GLs2xxM6s6U", posterUrl: "https://image.tmdb.org/t/p/w500/6sJcVzGCwrDCBMV0DU6eRzA2UxM.jpg", description: "Three friends witness a murder and become suspects.", nowPlaying: [] },
  
  // 2021 Movies
  { title: "Eternals", type: "movie", year: "2021", rating: "6.4", genres: ["Action", "Adventure", "Fantasy"], source: "Disney+", trailerUrl: "https://www.youtube.com/watch?v=0WVDKZJkGlY", posterUrl: "https://image.tmdb.org/t/p/w500/bcCBq9N1EMo3daNIjWJ8kYvrQm6.jpg", description: "The Eternals reunite to protect Earth.", nowPlaying: [] },
  { title: "Free Guy", type: "movie", year: "2021", rating: "7.2", genres: ["Action", "Adventure", "Comedy"], source: "Disney+", trailerUrl: "https://www.youtube.com/watch?v=X2m-08cOAbc", posterUrl: "https://image.tmdb.org/t/p/w500/xmbU4JTUm8rsdtn7Y3Fcm30GpeT.jpg", description: "An NPC in a video game becomes self-aware.", nowPlaying: [] },
  { title: "Black Widow", type: "movie", year: "2021", rating: "6.8", genres: ["Action", "Adventure", "Sci-Fi"], source: "Disney+", trailerUrl: "https://www.youtube.com/watch?v=Fp9pNPdNwjI", posterUrl: "https://image.tmdb.org/t/p/w500/qAZ0pzat24kLdO3o8ejmbLxyOac.jpg", description: "Natasha Romanoff confronts her dark past.", nowPlaying: [] },
  { title: "Venom: Let There Be Carnage", type: "movie", year: "2021", rating: "6.0", genres: ["Action", "Sci-Fi", "Thriller"], source: "Netflix", trailerUrl: "https://www.youtube.com/watch?v=-FmWuCgJmxo", posterUrl: "https://image.tmdb.org/t/p/w500/rjkmN1dniUHVYAtwuV3Tji7FsDO.jpg", description: "Venom faces off against the deadly Carnage.", nowPlaying: [] },
  { title: "Encanto", type: "movie", year: "2021", rating: "7.2", genres: ["Animation", "Adventure", "Comedy"], source: "Disney+", trailerUrl: "https://www.youtube.com/watch?v=CaimKeDcudo", posterUrl: "https://image.tmdb.org/t/p/w500/4j0PNHkMr5ax3IA8tjtxcmPU3QT.jpg", description: "A magical Colombian family faces challenges.", nowPlaying: [] },
  { title: "The Suicide Squad", type: "movie", year: "2021", rating: "7.3", genres: ["Action", "Adventure", "Comedy"], source: "Max", trailerUrl: "https://www.youtube.com/watch?v=eg5ciqQzmK0", posterUrl: "https://image.tmdb.org/t/p/w500/kb4s0ML0iVZlG6wAKbbs9NAm6X.jpg", description: "A new team of villains on a deadly mission.", nowPlaying: [] },
  { title: "A Quiet Place Part II", type: "movie", year: "2021", rating: "7.3", genres: ["Drama", "Horror", "Sci-Fi"], source: "Paramount+", trailerUrl: "https://www.youtube.com/watch?v=BpdDN9d9Jio", posterUrl: "https://image.tmdb.org/t/p/w500/4q2hz2m8hubgvijz8Ez0T2Os2Yv.jpg", description: "The Abbott family faces new dangers.", nowPlaying: [] },
  { title: "Luca", type: "movie", year: "2021", rating: "7.5", genres: ["Animation", "Adventure", "Comedy"], source: "Disney+", trailerUrl: "https://www.youtube.com/watch?v=mYfJxlgR2jQ", posterUrl: "https://image.tmdb.org/t/p/w500/jTswp6KyDYKtvC52GbHagrZbGvD.jpg", description: "A sea monster discovers friendship above water.", nowPlaying: [] },
  { title: "Don't Look Up", type: "movie", year: "2021", rating: "7.2", genres: ["Comedy", "Drama", "Sci-Fi"], source: "Netflix", trailerUrl: "https://www.youtube.com/watch?v=RbIxYm3mKzI", posterUrl: "https://image.tmdb.org/t/p/w500/th4E1yqsE8DGpAseLiUrI60WxSn.jpg", description: "Scientists warn of a comet heading for Earth.", nowPlaying: [] },
  { title: "The Matrix Resurrections", type: "movie", year: "2021", rating: "5.7", genres: ["Action", "Sci-Fi"], source: "Max", trailerUrl: "https://www.youtube.com/watch?v=9ix7TUGVYIo", posterUrl: "https://image.tmdb.org/t/p/w500/8c4a8kE7PizaGQDnFGzJ2O6CtM8.jpg", description: "Neo returns to The Matrix.", nowPlaying: [] },
  
  // 2020 Movies
  { title: "Soul", type: "movie", year: "2020", rating: "8.1", genres: ["Animation", "Adventure", "Comedy"], source: "Disney+", trailerUrl: "https://www.youtube.com/watch?v=xOsLIiBStEs", posterUrl: "https://image.tmdb.org/t/p/w500/hm58Jw4Lw8OIeECIq5qyPYhAeRJ.jpg", description: "A musician discovers what makes life worth living.", nowPlaying: [] },
  { title: "Wonder Woman 1984", type: "movie", year: "2020", rating: "5.4", genres: ["Action", "Adventure", "Fantasy"], source: "Max", trailerUrl: "https://www.youtube.com/watch?v=sfM7_JLk-84", posterUrl: "https://image.tmdb.org/t/p/w500/8UlWHLMpgZm9bx6QYh0NFoq67tx.jpg", description: "Wonder Woman faces new enemies in the 1980s.", nowPlaying: [] },
  { title: "Tenet", type: "movie", year: "2020", rating: "7.3", genres: ["Action", "Sci-Fi", "Thriller"], source: "Max", trailerUrl: "https://www.youtube.com/watch?v=LdOM0x0XDMo", posterUrl: "https://image.tmdb.org/t/p/w500/k68nPLbIST6NP96JmTxmZijEvCA.jpg", description: "Christopher Nolan's mind-bending time thriller.", nowPlaying: [] },
  { title: "Onward", type: "movie", year: "2020", rating: "7.4", genres: ["Animation", "Adventure", "Comedy"], source: "Disney+", trailerUrl: "https://www.youtube.com/watch?v=x8DKg_fsacM", posterUrl: "https://image.tmdb.org/t/p/w500/f4aul3FyD3jv3v4bul1IrkWZvzq.jpg", description: "Two elf brothers embark on a magical quest.", nowPlaying: [] },
  { title: "The Invisible Man", type: "movie", year: "2020", rating: "7.1", genres: ["Horror", "Mystery", "Sci-Fi"], source: "Peacock", trailerUrl: "https://www.youtube.com/watch?v=Kk7NbHl9tvI", posterUrl: "https://image.tmdb.org/t/p/w500/5ElPNk4FPrKgCL5VLv6QwTVAWXp.jpg", description: "A woman is terrorized by her invisible ex.", nowPlaying: [] },
  { title: "Birds of Prey", type: "movie", year: "2020", rating: "6.1", genres: ["Action", "Adventure", "Crime"], source: "Max", trailerUrl: "https://www.youtube.com/watch?v=kGM4uYZzfu0", posterUrl: "https://image.tmdb.org/t/p/w500/h4VB6m0RwcicVEZvzftYZyKXs6K.jpg", description: "Harley Quinn forms a team of antiheroes.", nowPlaying: [] },
  
  // 2019 and earlier Movies
  { title: "Joker", type: "movie", year: "2019", rating: "8.4", genres: ["Crime", "Drama", "Thriller"], source: "Max", trailerUrl: "https://www.youtube.com/watch?v=zAGVQLHvwOY", posterUrl: "https://image.tmdb.org/t/p/w500/udDclJoHjfjb8Ekgsd4FDteOkCU.jpg", description: "The origin story of the infamous Joker.", nowPlaying: [] },
  { title: "Once Upon a Time in Hollywood", type: "movie", year: "2019", rating: "7.6", genres: ["Comedy", "Drama"], source: "Netflix", trailerUrl: "https://www.youtube.com/watch?v=ELeMaP8EPAA", posterUrl: "https://image.tmdb.org/t/p/w500/8j58iEBw9pOXFD2L0nt0ZXeHviB.jpg", description: "Tarantino's tribute to 1969 Hollywood.", nowPlaying: [] },
  { title: "Parasite", type: "movie", year: "2019", rating: "8.5", genres: ["Comedy", "Drama", "Thriller"], source: "Hulu", trailerUrl: "https://www.youtube.com/watch?v=5xH0HfJHsaY", posterUrl: "https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg", description: "A poor family infiltrates a wealthy household.", nowPlaying: [] },
  { title: "1917", type: "movie", year: "2019", rating: "8.3", genres: ["Drama", "War"], source: "Peacock", trailerUrl: "https://www.youtube.com/watch?v=YqNYrYUiMfg", posterUrl: "https://image.tmdb.org/t/p/w500/iZf0KyrE25z1sage4SYFLCCrMi9.jpg", description: "Two soldiers race against time in WWI.", nowPlaying: [] },
  { title: "Knives Out", type: "movie", year: "2019", rating: "7.9", genres: ["Comedy", "Crime", "Drama"], source: "Prime Video", trailerUrl: "https://www.youtube.com/watch?v=qGqiHJTsRkQ", posterUrl: "https://image.tmdb.org/t/p/w500/pThyQovXQrw2m0s9x82twj48Jq4.jpg", description: "A detective investigates a patriarch's death.", nowPlaying: [] },
  { title: "The Lion King", type: "movie", year: "2019", rating: "6.8", genres: ["Adventure", "Animation", "Drama"], source: "Disney+", trailerUrl: "https://www.youtube.com/watch?v=7TavVZMewpY", posterUrl: "https://image.tmdb.org/t/p/w500/dzBtMocZuJbjLOXvrl4zGYigDzh.jpg", description: "Photorealistic remake of the Disney classic.", nowPlaying: [] },
  { title: "Aladdin", type: "movie", year: "2019", rating: "6.9", genres: ["Adventure", "Comedy", "Family"], source: "Disney+", trailerUrl: "https://www.youtube.com/watch?v=foyufD52aog", posterUrl: "https://image.tmdb.org/t/p/w500/3iYQTLGoy7QnjcUYRJy4YrAgGvp.jpg", description: "Live-action remake of the Disney classic.", nowPlaying: [] },
  { title: "Captain Marvel", type: "movie", year: "2019", rating: "6.9", genres: ["Action", "Adventure", "Sci-Fi"], source: "Disney+", trailerUrl: "https://www.youtube.com/watch?v=Z1BCujX3pw8", posterUrl: "https://image.tmdb.org/t/p/w500/AtsgWhDnHTq68L0lLsUrCnM7TjG.jpg", description: "Carol Danvers becomes Captain Marvel.", nowPlaying: [] },
  { title: "Ford v Ferrari", type: "movie", year: "2019", rating: "8.1", genres: ["Action", "Biography", "Drama"], source: "Disney+", trailerUrl: "https://www.youtube.com/watch?v=zyYgDtY2AMY", posterUrl: "https://image.tmdb.org/t/p/w500/6ApDtO7xaWAfPqfi2IARXIzj8QS.jpg", description: "Ford challenges Ferrari at Le Mans 1966.", nowPlaying: [] },
  { title: "Jumanji: The Next Level", type: "movie", year: "2019", rating: "6.7", genres: ["Action", "Adventure", "Comedy"], source: "Netflix", trailerUrl: "https://www.youtube.com/watch?v=rBxcF-r9Ibs", posterUrl: "https://image.tmdb.org/t/p/w500/l4iknLOenijaB85Zyb5SxH1gGz8.jpg", description: "The game takes the gang to new territories.", nowPlaying: [] },
  
  // Classic TV Shows
  { title: "Breaking Bad", type: "tv", year: "2008", rating: "9.5", genres: ["Crime", "Drama", "Thriller"], source: "Netflix", trailerUrl: "https://www.youtube.com/watch?v=HhesaQXLuRY", posterUrl: "https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizRGt.jpg", description: "A chemistry teacher turns to making meth.", nowPlaying: [] },
  { title: "Game of Thrones", type: "tv", year: "2011", rating: "9.2", genres: ["Action", "Adventure", "Drama"], source: "Max", trailerUrl: "https://www.youtube.com/watch?v=KPLWWIOCOOQ", posterUrl: "https://image.tmdb.org/t/p/w500/u3bZgnGQ9T01sWNhyveQz0wH0Hl.jpg", description: "Noble families fight for the Iron Throne.", nowPlaying: [] },
  { title: "The Office", type: "tv", year: "2005", rating: "8.9", genres: ["Comedy"], source: "Peacock", trailerUrl: "https://www.youtube.com/watch?v=LHOtME2DL4g", posterUrl: "https://image.tmdb.org/t/p/w500/qWnJzyZhyy74gjpSjIXWmuk0ifX.jpg", description: "A mockumentary about office life.", nowPlaying: [] },
  { title: "Friends", type: "tv", year: "1994", rating: "8.9", genres: ["Comedy", "Romance"], source: "Max", trailerUrl: "https://www.youtube.com/watch?v=hDNNmeeJs1Q", posterUrl: "https://image.tmdb.org/t/p/w500/f496cm9enuEsZkSPzCwnTESEK5s.jpg", description: "Six friends navigate life in New York City.", nowPlaying: [] },
  { title: "The Crown", type: "tv", year: "2016", rating: "8.6", genres: ["Biography", "Drama", "History"], source: "Netflix", trailerUrl: "https://www.youtube.com/watch?v=JWtnJjn6ng0", posterUrl: "https://image.tmdb.org/t/p/w500/1M876KPjulVwppEpldhdc8V4o68.jpg", description: "The reign of Queen Elizabeth II.", nowPlaying: [] },
  { title: "Better Call Saul", type: "tv", year: "2015", rating: "8.9", genres: ["Crime", "Drama"], source: "Netflix", trailerUrl: "https://www.youtube.com/watch?v=9q4qzYrHVmI", posterUrl: "https://image.tmdb.org/t/p/w500/fC2HDm5t0kHl7mTm7jxMR31b7by.jpg", description: "The origin of Saul Goodman.", nowPlaying: [] },
  { title: "Succession", type: "tv", year: "2018", rating: "8.8", genres: ["Comedy", "Drama"], source: "Max", trailerUrl: "https://www.youtube.com/watch?v=OzYxJV_rmE8", posterUrl: "https://image.tmdb.org/t/p/w500/7HW47XbkNQ5fiwQFYGWdw9gs144.jpg", description: "A wealthy family fights over their media empire.", nowPlaying: [] },
  { title: "Ted Lasso", type: "tv", year: "2020", rating: "8.8", genres: ["Comedy", "Drama", "Sport"], source: "Apple TV+", trailerUrl: "https://www.youtube.com/watch?v=3u7EIiohs6U", posterUrl: "https://image.tmdb.org/t/p/w500/5fhZdwP1DVJ0FyVH6vrFdHwpXIn.jpg", description: "An American coach leads a British soccer team.", nowPlaying: [] },
  { title: "The Mandalorian", type: "tv", year: "2019", rating: "8.7", genres: ["Action", "Adventure", "Sci-Fi"], source: "Disney+", trailerUrl: "https://www.youtube.com/watch?v=aOC8E8z_ifw", posterUrl: "https://image.tmdb.org/t/p/w500/sWgBv7LV2PRoQgkxwlibdGXKz1S.jpg", description: "A bounty hunter protects a mysterious child.", nowPlaying: [] },
  { title: "The Witcher", type: "tv", year: "2019", rating: "8.0", genres: ["Action", "Adventure", "Drama"], source: "Netflix", trailerUrl: "https://www.youtube.com/watch?v=ndl1W4ltcmg", posterUrl: "https://image.tmdb.org/t/p/w500/7vjaCdMw15FEbXyLQTVa04URsPm.jpg", description: "A monster hunter navigates a dangerous world.", nowPlaying: [] },
  { title: "The Boys", type: "tv", year: "2019", rating: "8.7", genres: ["Action", "Comedy", "Crime"], source: "Prime Video", trailerUrl: "https://www.youtube.com/watch?v=_PH8WvI8t_Q", posterUrl: "https://image.tmdb.org/t/p/w500/stTEycfG9929HYGCNrLxbDaFhLz.jpg", description: "Vigilantes take on corrupt superheroes.", nowPlaying: [] },
  { title: "Ozark", type: "tv", year: "2017", rating: "8.5", genres: ["Crime", "Drama", "Thriller"], source: "Netflix", trailerUrl: "https://www.youtube.com/watch?v=5hAXVqrljbs", posterUrl: "https://image.tmdb.org/t/p/w500/m73bD8VjibMNYpKqPi6VyHEzBjG.jpg", description: "A family launders money in the Ozarks.", nowPlaying: [] },
  { title: "Chernobyl", type: "tv", year: "2019", rating: "9.4", genres: ["Drama", "History", "Thriller"], source: "Max", trailerUrl: "https://www.youtube.com/watch?v=s9APLXM9Ei8", posterUrl: "https://image.tmdb.org/t/p/w500/hlLXt2tOPT6RRnjiUmoxyG1LTFi.jpg", description: "The true story of the 1986 nuclear disaster.", nowPlaying: [] },
  { title: "Peaky Blinders", type: "tv", year: "2013", rating: "8.8", genres: ["Crime", "Drama"], source: "Netflix", trailerUrl: "https://www.youtube.com/watch?v=oVzVdvGIC7U", posterUrl: "https://image.tmdb.org/t/p/w500/vUUqzWa2LnHvVuDuXxZA6wJ6O5.jpg", description: "A Birmingham crime family after WWI.", nowPlaying: [] },
  { title: "Loki", type: "tv", year: "2021", rating: "8.2", genres: ["Action", "Adventure", "Fantasy"], source: "Disney+", trailerUrl: "https://www.youtube.com/watch?v=nW948Va-l10", posterUrl: "https://image.tmdb.org/t/p/w500/kEl2t3OhXc3Zb9FBh1AuYzRTgZp.jpg", description: "Loki creates chaos across time.", nowPlaying: [] },
  { title: "WandaVision", type: "tv", year: "2021", rating: "7.9", genres: ["Action", "Comedy", "Drama"], source: "Disney+", trailerUrl: "https://www.youtube.com/watch?v=sj9J2ecsSpo", posterUrl: "https://image.tmdb.org/t/p/w500/glKDfE6btIRcVB5zrjspRIs4r52.jpg", description: "Wanda and Vision live in sitcom reality.", nowPlaying: [] },
  { title: "Mare of Easttown", type: "tv", year: "2021", rating: "8.4", genres: ["Crime", "Drama", "Mystery"], source: "Max", trailerUrl: "https://www.youtube.com/watch?v=5aWAHzKdidE", posterUrl: "https://image.tmdb.org/t/p/w500/hkuX9y93O1tAukCU8ZE9t50EUzj.jpg", description: "A detective investigates a murder in Pennsylvania.", nowPlaying: [] },
  { title: "Yellowjackets", type: "tv", year: "2021", rating: "7.8", genres: ["Drama", "Horror", "Mystery"], source: "Paramount+", trailerUrl: "https://www.youtube.com/watch?v=x6BZq6ufPGM", posterUrl: "https://image.tmdb.org/t/p/w500/cOwaIzHj4cVpAuC57mD2SIvQPgC.jpg", description: "Survivors of a plane crash hide dark secrets.", nowPlaying: [] },
  { title: "Midnight Mass", type: "tv", year: "2021", rating: "7.7", genres: ["Drama", "Horror", "Mystery"], source: "Netflix", trailerUrl: "https://www.youtube.com/watch?v=y-XIRcjf3l4", posterUrl: "https://image.tmdb.org/t/p/w500/bIp6TeEhgvE7BdXMw4fVcSTlAuq.jpg", description: "A small town experiences miracles and nightmares.", nowPlaying: [] },
  { title: "Invincible", type: "tv", year: "2021", rating: "8.7", genres: ["Animation", "Action", "Drama"], source: "Prime Video", trailerUrl: "https://www.youtube.com/watch?v=-bfAVpuko5o", posterUrl: "https://image.tmdb.org/t/p/w500/dMOpdkrDC5dQxqNydgKxXjBKyAc.jpg", description: "A teen discovers his father is a superhero.", nowPlaying: [] },
  { title: "Bridgerton", type: "tv", year: "2020", rating: "7.3", genres: ["Drama", "Romance"], source: "Netflix", trailerUrl: "https://www.youtube.com/watch?v=gpv7ayf_tyE", posterUrl: "https://image.tmdb.org/t/p/w500/luoKpgVwi1E5nQsi7W0UuKHu2Rq.jpg", description: "A Regency-era romance drama.", nowPlaying: [] },
  { title: "The Queen's Gambit", type: "tv", year: "2020", rating: "8.6", genres: ["Drama"], source: "Netflix", trailerUrl: "https://www.youtube.com/watch?v=CDrieqwSdgI", posterUrl: "https://image.tmdb.org/t/p/w500/zU0htwkhNvBQdVSIKB9s6hgVeFK.jpg", description: "A chess prodigy rises to the top.", nowPlaying: [] },
  { title: "What We Do in the Shadows", type: "tv", year: "2019", rating: "8.5", genres: ["Comedy", "Fantasy", "Horror"], source: "Hulu", trailerUrl: "https://www.youtube.com/watch?v=mfBbSwX6kEk", posterUrl: "https://image.tmdb.org/t/p/w500/chMsEyVAXkK8rXYLT7NRt3DJv3W.jpg", description: "Vampire roommates in Staten Island.", nowPlaying: [] },
  { title: "Fleabag", type: "tv", year: "2016", rating: "8.7", genres: ["Comedy", "Drama"], source: "Prime Video", trailerUrl: "https://www.youtube.com/watch?v=aX2ViKQFL_k", posterUrl: "https://image.tmdb.org/t/p/w500/27vEfv1CqFmjOaRlNiRPAod7cfX.jpg", description: "A woman navigates life in London.", nowPlaying: [] },
  { title: "Killing Eve", type: "tv", year: "2018", rating: "8.2", genres: ["Action", "Drama", "Thriller"], source: "Hulu", trailerUrl: "https://www.youtube.com/watch?v=SfZ_cEDmDLQ", posterUrl: "https://image.tmdb.org/t/p/w500/8haPwM8YpnLB7VMXBoefwj1oQbT.jpg", description: "A spy and an assassin become obsessed.", nowPlaying: [] },
  { title: "Euphoria", type: "tv", year: "2019", rating: "8.4", genres: ["Drama"], source: "Max", trailerUrl: "https://www.youtube.com/watch?v=HZygoiKxvxw", posterUrl: "https://image.tmdb.org/t/p/w500/jtnfNzqZwN4E32FGGxx1YZaBWWf.jpg", description: "Teens navigate drugs, love, and identity.", nowPlaying: [] },
  { title: "Dark", type: "tv", year: "2017", rating: "8.7", genres: ["Crime", "Drama", "Mystery"], source: "Netflix", trailerUrl: "https://www.youtube.com/watch?v=rrwycJ08PSA", posterUrl: "https://image.tmdb.org/t/p/w500/apbrbWs8M9lyOpJYU5WXrpFbk1Z.jpg", description: "A German sci-fi thriller about time travel.", nowPlaying: [] },
  { title: "Westworld", type: "tv", year: "2016", rating: "8.5", genres: ["Drama", "Mystery", "Sci-Fi"], source: "Max", trailerUrl: "https://www.youtube.com/watch?v=9BErJiNIHkA", posterUrl: "https://image.tmdb.org/t/p/w500/y55oBgC298bVTZqbH9a3nDbz6TR.jpg", description: "Robots in a Wild West theme park gain consciousness.", nowPlaying: [] },
];

// Filter out existing titles
const itemsToAdd = moreContent.filter(item => !existingTitles.has(item.title));

console.log(`Adding ${itemsToAdd.length} more items...`);

// Merge
const mergedItems = [...existingDb.items, ...itemsToAdd];

// Sort
mergedItems.sort((a, b) => {
  const aNowPlaying = a.nowPlaying?.length > 0 || a.source === 'In Theatres' || a.source === 'Now Playing';
  const bNowPlaying = b.nowPlaying?.length > 0 || b.source === 'In Theatres' || b.source === 'Now Playing';
  if (aNowPlaying && !bNowPlaying) return -1;
  if (!aNowPlaying && bNowPlaying) return 1;
  
  const yearDiff = parseInt(b.year || '0') - parseInt(a.year || '0');
  if (yearDiff !== 0) return yearDiff;
  
  return parseFloat(b.rating || '0') - parseFloat(a.rating || '0');
});

// Stats
const movies = mergedItems.filter(i => i.type === 'movie');
const tvShows = mergedItems.filter(i => i.type === 'tv');
const nowPlayingItems = mergedItems.filter(i => 
  i.nowPlaying?.length > 0 || 
  i.source === 'In Theatres' || 
  i.source === 'Now Playing' || 
  i.source === 'Coming Soon'
);

const database = {
  exported: new Date().toISOString(),
  totalItems: mergedItems.length,
  movies: movies.length,
  tvShows: tvShows.length,
  nowPlaying: nowPlayingItems.length,
  items: mergedItems
};

fs.writeFileSync('movies-database.json', JSON.stringify(database, null, 2));

console.log('\n=== FINAL DATABASE ===');
console.log(`Total items: ${mergedItems.length}`);
console.log(`  Movies: ${movies.length}`);
console.log(`  TV Shows: ${tvShows.length}`);
console.log(`  Now Playing/Coming Soon: ${nowPlayingItems.length}`);

// Year breakdown
console.log('\nYear breakdown:');
const yearCounts = {};
mergedItems.forEach(i => {
  yearCounts[i.year] = (yearCounts[i.year] || 0) + 1;
});
Object.keys(yearCounts).sort((a, b) => b - a).forEach(year => {
  console.log(`  ${year}: ${yearCounts[year]} items`);
});
