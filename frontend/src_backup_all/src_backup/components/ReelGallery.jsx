import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

// Supabase client
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function ReelGallery() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    async function fetchReels() {
      const { data, error } = await supabase
        .from("reel_gallery")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) console.error("Error loading reels:", error);
      else setItems(data);
    }
    fetchReels();
  }, []);

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>🎬 Reels</h2>
      <div style={styles.reels}>
        {items.map((item) => (
          <div key={item.id} style={styles.reelCard}>
            <video
              src={item.media_url}
              style={styles.video}
              controls
              playsInline
              loop
            />
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: { padding: "20px", background: "#000", color: "#FFD700", minHeight: "100vh" },
  title: { textAlign: "center", fontSize: "24px", marginBottom: "20px" },
  reels: { display: "flex", flexDirection: "column", gap: "20px" },
  reelCard: { background: "#111", borderRadius: "12px", overflow: "hidden" },
  video: { width: "100%", borderRadius: "12px" },
};


