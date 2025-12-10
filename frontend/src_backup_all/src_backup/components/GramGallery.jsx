import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

// Supabase client
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function GramGallery() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    async function fetchGram() {
      const { data, error } = await supabase
        .from("gram_gallery")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) console.error("Error loading gram gallery:", error);
      else setItems(data);
    }
    fetchGram();
  }, []);

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>📸 Gram Gallery</h2>
      <div style={styles.grid}>
        {items.map((item) => (
          <div key={item.id} style={styles.card}>
            <img src={item.media_url} alt="gram" style={styles.image} />
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: { padding: "20px", background: "#000", color: "#FFD700", minHeight: "100vh" },
  title: { textAlign: "center", fontSize: "24px", marginBottom: "20px" },
  grid: {
    columnCount: 3,
    columnGap: "10px",
  },
  card: {
    marginBottom: "10px",
    borderRadius: "10px",
    overflow: "hidden",
    breakInside: "avoid",
  },
  image: { width: "100%", display: "block", borderRadius: "10px" },
};


