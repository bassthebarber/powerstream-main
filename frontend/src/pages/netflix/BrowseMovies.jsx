import React, { useEffect, useState } from "react";
import api from "../../lib/api";
import MovieRow from "../../components/netflix/MovieRow.jsx";
import { useNavigate } from "react-router-dom";
import "../../components/netflix/netflix.css";

const DEFAULT_CATEGORIES = [
  "Movies",
  "TV Shows",
  "Documentaries",
  "Music Videos",
  "Sports",
  "Comedy",
  "Podcasts",
];

export default function BrowseMovies() {
  const navigate = useNavigate();
  const [trending, setTrending] = useState([]);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [byCategory, setByCategory] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [trendRes, catRes] = await Promise.all([
          api.get("/movies/trending"),
          api.get("/movies/categories"),
        ]);

        setTrending(trendRes.data.movies || []);

        const cats = catRes.data.categories;
        if (cats && cats.length) {
          setCategories(cats);
        }

        // Load movies by category
        const categoryMap = {};
        const catsToLoad = cats && cats.length ? cats : DEFAULT_CATEGORIES;
        
        for (const cat of catsToLoad) {
          try {
            const res = await api.get("/movies", {
              params: { category: cat },
            });
            categoryMap[cat] = res.data.movies || [];
          } catch {
            // ignore individual category errors
          }
        }
        setByCategory(categoryMap);
      } catch (err) {
        console.error("[BrowseMovies] load error", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) {
    return (
      <div className="netflix-page">
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div className="spinner" style={{ margin: '0 auto 20px' }} />
          <p>Loading PowerStream TV…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="netflix-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 className="netflix-page-title">📺 PowerStream TV</h1>
          <p className="netflix-page-sub">
            Independent films, documentaries, sports, and music from around the world.
          </p>
        </div>
        <button 
          className="watch-btn"
          onClick={() => navigate("/tv/upload")}
          style={{ background: 'linear-gradient(90deg, #ffd700, #ffb700)', color: '#000' }}
        >
          ⬆ Upload
        </button>
      </div>

      <MovieRow title="🔥 Trending Now" movies={trending} />

      {categories.map((cat) => (
        <MovieRow
          key={cat}
          title={cat}
          movies={byCategory[cat] || []}
        />
      ))}

      {Object.keys(byCategory).length === 0 && trending.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
          <p>No movies yet. Be the first to upload!</p>
          <button 
            className="watch-btn"
            onClick={() => navigate("/tv/upload")}
            style={{ marginTop: '20px' }}
          >
            🎬 Upload First Movie
          </button>
        </div>
      )}
    </div>
  );
}



