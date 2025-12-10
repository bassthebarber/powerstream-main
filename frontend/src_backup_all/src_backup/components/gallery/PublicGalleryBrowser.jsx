publimport React, { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";

// --- Supabase client (browser-safe keys) ---
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// Resolve a public URL for a storage path
async function toPublicUrl(path) {
  // Preferred: use the bucket env and Supabase helper
  const bucket = import.meta.env.VITE_SUPABASE_BUCKET || "media";
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  if (data?.publicUrl) return data.publicUrl;

  // Fallback: use full public base if you set it
  const base = import.meta.env.VITE_SUPABASE_MEDIA_PUBLIC_URL;
  return base ? `${base}/${path}` : path; // last resort
}

// Pull recent media from a single table
async function fetchFromTable(table, typeFilter, limit = 60) {
  let q = supabase
    .from(table)
    .select("id, media_url, media_type, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (typeFilter !== "all") q = q.eq("media_type", typeFilter);

  const { data, error } = await q;
  if (error) {
    console.error(`[${table}] fetch error`, error);
    return [];
  }

  // attach module label + public URL
  const label =
    table === "feed_gallery" ? "feed" :
    table === "gram_gallery" ? "gram" :
    table === "reel_gallery" ? "reel" : table;

  const out = [];
  for (const row of data || []) {
    out.push({
      id: `${table}:${row.id}`,
      module: label,
      media_type: row.media_type,
      created_at: row.created_at,
      // resolve URL later in parallel to avoid serial awaits
      _path: row.media_url,
    });
  }
  return out;
}

export default function PublicGalleryBrowser() {
  const [moduleFilter, setModuleFilter] = useState("all"); // all|feed|gram|reel
  const [typeFilter, setTypeFilter] = useState("all");     // all|image|video
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch on mount & whenever filters change
  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);

      // which tables to hit
      const tables =
        moduleFilter === "all"
          ? ["feed_gallery", "gram_gallery", "reel_gallery"]
          : moduleFilter === "feed"
          ? ["feed_gallery"]
          : moduleFilter === "gram"
          ? ["gram_gallery"]
          : ["reel_gallery"];

      // parallel fetch per table, merge, sort
      const batches = await Promise.all(
        tables.map((t) => fetchFromTable(t, typeFilter))
      );
      let merged = batches.flat();

      // get all public URLs in parallel
      const urls = await Promise.all(merged.map((m) => toPublicUrl(m._path)));
      merged = merged
        .map((m, i) => ({ ...m, url: urls[i] }))
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      if (alive) setItems(merged);
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, [moduleFilter, typeFilter]);

  const counts = useMemo(() => {
    const c = { total: items.length, image: 0, video: 0 };
    for (const it of items) {
      if (it.media_type === "image") c.image++;
      else if (it.media_type === "video") c.video++;
    }
    return c;
  }, [items]);

  return (
    <div style={{ padding: "16px" }}>
      <h2 style={{ color: "gold", marginBottom: 12 }}>Public Gallery</h2>

      {/* Filters */}
      <div
        style={{
          display: "flex",
          gap: 12,
          alignItems: "center",
          marginBottom: 16,
          flexWrap: "wrap",
        }}
      >
        <label>
          Module:&nbsp;
          <select
            value={moduleFilter}
            onChange={(e) => setModuleFilter(e.target.value)}
          >
            <option value="all">All</option>
            <option value="feed">PowerFeed</option>
            <option value="gram">PowerGram</option>
            <option value="reel">PowerReel</option>
          </select>
        </label>

        <label>
          Type:&nbsp;
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="all">All</option>
            <option value="image">Images</option>
            <option value="video">Videos</option>
          </select>
        </label>

        <span style={{ opacity: 0.8 }}>
          {loading ? "Loading…" : `Total: ${counts.total} (🖼 ${counts.image} • 🎬 ${counts.video})`}
        </span>
      </div>

      {/* Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: 14,
        }}
      >
        {items.map((m) => (
          <div
            key={m.id}
            style={{
              border: "1px solid #444",
              borderRadius: 12,
              overflow: "hidden",
              background: "#111",
            }}
          >
            <div style={{ aspectRatio: "1/1", background: "#000" }}>
              {m.media_type === "image" ? (
                <img
                  src={m.url}
                  alt={m.id}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  loading="lazy"
                />
              ) : (
                <video
                  src={m.url}
                  controls
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              )}
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "8px 10px",
                color: "#ddd",
                fontSize: 12,
              }}
            >
              <span style={{ textTransform: "capitalize" }}>{m.module}</span>
              <span>{new Date(m.created_at).toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>

      {!loading && items.length === 0 && (
        <p style={{ marginTop: 16, opacity: 0.75 }}>
          Nothing here yet. Be the first to upload!
        </p>
      )}
    </div>
  );
}


