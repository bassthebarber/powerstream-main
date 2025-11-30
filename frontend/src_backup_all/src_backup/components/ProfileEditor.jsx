import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

export default function ProfileEditor() {
  const [profile, setProfile] = useState({ username: "", bio: "", avatar_url: "" });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("username, bio, avatar_url")
        .eq("id", user.id)
        .single();

      if (error) console.error(error);
      else setProfile(data || { username: "", bio: "", avatar_url: "" });
      setLoading(false);
    };
    loadProfile();
  }, []);

  const handleUpdate = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const updates = {
      id: user.id,
      username: profile.username,
      bio: profile.bio,
      avatar_url: profile.avatar_url,
    };

    const { error } = await supabase.from("profiles").upsert(updates);
    if (error) {
      console.error(error);
      setMessage("Error saving profile.");
    } else {
      setMessage("Profile updated!");
    }
    setLoading(false);
  };

  return (
    <div style={{ background: "#111", padding: "20px", borderRadius: "10px", color: "#FFD700" }}>
      <h2>Edit Profile</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <label>Username</label>
          <input
            type="text"
            value={profile.username || ""}
            onChange={(e) => setProfile({ ...profile, username: e.target.value })}
            style={styles.input}
          />

          <label>Bio</label>
          <textarea
            value={profile.bio || ""}
            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
            style={styles.textarea}
          />

          <label>Avatar URL</label>
          <input
            type="text"
            value={profile.avatar_url || ""}
            onChange={(e) => setProfile({ ...profile, avatar_url: e.target.value })}
            style={styles.input}
          />

          <button onClick={handleUpdate} style={styles.button}>Save</button>
          <p>{message}</p>
        </>
      )}
    </div>
  );
}

const styles = {
  input: { width: "100%", marginBottom: "10px", padding: "8px", borderRadius: "6px" },
  textarea: { width: "100%", marginBottom: "10px", padding: "8px", borderRadius: "6px", minHeight: "60px" },
  button: { background: "#FFD700", color: "#000", padding: "10px 20px", border: "none", borderRadius: "6px", cursor: "pointer" },
};


