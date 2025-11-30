import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

// Supabase client (reads your VITE_ keys from .env.local)
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function GalleryBrowser() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMedia() {
      setLoading(true);

      let query = supabase.from("feed_gallery").select("*").order("created_at", { ascending: false });

      if (filter !== "all") {
        query = query.eq("media_type", filter); // filter "image" or "video"
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error loading media:", error);
      } else {
        setItems(data);
      }
      setLoading(false);
    }

    fetchMedia();
  }, [filter]);

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>🌍 Public Gallery</h2>

      {/* Filter Buttons */}
      <div style={styles.filters}>
        {["all", "image", "video"].map((type) => (
          <button
            key={type}
            style={{
              ...styles.button,
              backgroundColor: filter === type ? "#FFD700" : "#333",
              color: filter === type ? "#000" : "#FFD700",
            }}
            onClick={() => setFilter(type)}
          >
            {type.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Loading state */}
      {loading && <p style={styles.loading}>Loading...</p>}

      {/* Gallery Grid */}
      <div style={styles.grid}>
        {items.map((item) => (
          <div key={item.id} style={styles.card}>
            {item.media_type === "image" ? (
              <img src={item.media_url} alt="gallery" style={styles.media} />
            ) : (
              <video controls src={item.media_url} style={styles.media} />
            )}
            <p style={styles.caption}>Uploaded by: {item.user_id}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: { padding: "20px", background: "#000", color: "#FFD700", minHeight: "100vh" },
  title: { textAlign: "center", fontSize: "24px", marginBottom: "20px" },
  filters: { display: "flex", justifyContent: "center", gap: "10px", marginBottom: "20px" },
  button: { padding: "10px 20px", border: "none", borderRadius: "6px", cursor: "pointer" },
  loading: { textAlign: "center" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "15px" },
  card: { background: "#111", borderRadius: "10px", padding: "10px", textAlign: "center" },
  media: { maxWidth: "100%", borderRadius: "6px" },
  caption: { fontSize: "12px", marginTop: "8px", color: "#bbb" },
};


