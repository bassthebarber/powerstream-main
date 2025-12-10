import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../../supabaseClient";

export default function ProfilePage() {
  const { userId } = useParams();
  const [tab, setTab] = useState("feed");
  const [profile, setProfile] = useState(null);
  const [feed, setFeed] = useState([]);
  const [gram, setGram] = useState([]);
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch profile info
  useEffect(() => {
    if (!userId) return;

    const loadProfile = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, avatar_url, bio")
        .eq("id", userId)
        .single();

      if (error) console.error(error);
      else setProfile(data);
    };

    loadProfile();
  }, [userId]);

  // Fetch tab content
  useEffect(() => {
    if (!userId) return;
    setLoading(true);

    const loadData = async () => {
      let table = tab === "feed" ? "feed_gallery" : tab === "gram" ? "gram_gallery" : "reel_gallery";

      const { data, error } = await supabase
        .from(table)
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error(error);
        setLoading(false);
        return;
      }

      if (tab === "feed") setFeed(data);
      if (tab === "gram") setGram(data);
      if (tab === "reels") setReels(data);
      setLoading(false);
    };

    loadData();
  }, [userId, tab]);

  return (
    <div style={{ padding: "20px", background: "#000", color: "#fff", minHeight: "100vh" }}>
      {/* Profile Header */}
      {profile && (
        <div style={{ display: "flex", alignItems: "center", marginBottom: "20px" }}>
          <img
            src={profile.avatar_url || "/default-avatar.png"}
            alt="avatar"
            style={{
              width: "100px",
              height: "100px",
              borderRadius: "50%",
              border: "3px solid gold",
              marginRight: "20px",
            }}
          />
          <div>
            <h2 style={{ margin: "0 0 10px 0" }}>{profile.username || "User"}</h2>
            <p style={{ color: "#aaa" }}>{profile.bio || "No bio yet."}</p>
            <div style={{ display: "flex", gap: "20px", marginTop: "10px" }}>
              <span>
                <strong>{feed.length + gram.length + reels.length}</strong> Posts
              </span>
              <span>
                <strong>0</strong> Followers
              </span>
              <span>
                <strong>0</strong> Following
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tab Bar */}
      <div style={{ display: "flex", justifyContent: "space-around", marginBottom: "20px" }}>
        {["feed", "gram", "reels"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              flex: 1,
              padding: "10px",
              background: tab === t ? "gold" : "transparent",
              color: tab === t ? "#000" : "#fff",
              border: "none",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            {t.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Gallery */}
      {loading ? (
        <p>Loading {tab}...</p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
            gap: "5px",
          }}
        >
          {tab === "feed" &&
            feed.map((item) => (
              <div key={item.id}>
                {item.media_type === "image" ? (
                  <img src={item.media_url} alt="" style={{ width: "100%", height: "120px", objectFit: "cover" }} />
                ) : (
                  <video src={item.media_url} style={{ width: "100%", height: "120px", objectFit: "cover" }} />
                )}
              </div>
            ))}
          {tab === "gram" &&
            gram.map((item) => (
              <div key={item.id}>
                {item.media_type === "image" ? (
                  <img src={item.media_url} alt="" style={{ width: "100%", height: "120px", objectFit: "cover" }} />
                ) : (
                  <video src={item.media_url} style={{ width: "100%", height: "120px", objectFit: "cover" }} />
                )}
              </div>
            ))}
          {tab === "reels" &&
            reels.map((item) => (
              <div key={item.id}>
                <video src={item.media_url} style={{ width: "100%", height: "200px", objectFit: "cover" }} controls />
              </div>
            ))}
        </div>
      )}
    </div>
  );
}


