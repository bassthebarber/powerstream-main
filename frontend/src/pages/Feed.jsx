import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { fetchFeed, createFeedPost } from "../lib/api.js";
import PostForm from "../components/PostForm.jsx";
import PostCard from "../components/PostCard.jsx";
import StoryBar from "../components/StoryBar.jsx";
import PeopleYouMayKnow from "../components/PeopleYouMayKnow.jsx";
import "../styles/powerstream-social.css";

export default function Feed() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const data = await fetchFeed();
      if (Array.isArray(data)) {
        setPosts(data);
      } else if (Array.isArray(data.posts)) {
        setPosts(data.posts);
      } else if (Array.isArray(data.items)) {
        setPosts(data.items);
      }
    } catch (err) {
      console.error("Error loading feed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const displayName = useMemo(
    () => user?.name || user?.email || "Guest",
    [user]
  );

  const handleCreate = async ({ content, image }) => {
    const payload = {
      authorName: displayName,
      content,
      image,
    };
    const data = await createFeedPost(payload);
    if (data?.ok) {
      await loadPosts();
    }
  };

  return (
    <div className="ps-page">
      <h1>Feed</h1>
      <p className="ps-subtitle">
        Simple three-column feed powered by <code>/api/feed</code>
      </p>

      <div className="pf-shell">
        {/* LEFT: Profile / shortcuts */}
        <aside className="pf-sidebar">
          <div className="ps-card">
            <div className="pf-mini-profile">
              <div className="pf-avatar">
                {displayName[0]?.toUpperCase() || "P"}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>
                  {displayName}
                </div>
                <div
                  style={{ fontSize: 12, color: "var(--muted)" }}
                >
                  PowerStream Member
                </div>
              </div>
            </div>
          </div>

          <div className="ps-card">
            <nav className="pf-sidebar-nav">
              <div className="pf-nav-item pf-nav-item--active">
                <span>🏠</span>
                <span>Home Feed</span>
              </div>
              <div className="pf-nav-item">
                <span>🎛️</span>
                <span>Studio</span>
              </div>
              <div className="pf-nav-item">
                <span>📺</span>
                <span>TV Stations</span>
              </div>
              <div className="pf-nav-item">
                <span>🤝</span>
                <span>Communities</span>
              </div>
            </nav>
          </div>
        </aside>

        {/* MIDDLE: Stories + composer + posts */}
        <main className="pf-main-feed">
          <StoryBar />
          <PostForm onSubmit={handleCreate} />

          {loading ? (
            <div className="pf-loading">Loading posts…</div>
          ) : posts.length === 0 ? (
            <div className="pf-empty">
              No posts yet. Be the first to post!
            </div>
          ) : (
            <section className="pf-posts-section">
              <div className="pf-posts">
                {posts.map((post) => (
                  <PostCard key={post._id || post.id} post={post} />
                ))}
              </div>
            </section>
          )}
        </main>

        {/* RIGHT: People you may know */}
        <aside className="pf-right">
          <PeopleYouMayKnow />
        </aside>
      </div>
    </div>
  );
}


