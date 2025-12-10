// frontend/src/pages/Profile.jsx
// User Profile Page - Instagram/Facebook Hybrid Style
import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../lib/api.js";
import "../styles/powerstream-social.css";

// Tab options
const TABS = [
  { id: "posts", label: "Posts", icon: "📱" },
  { id: "photos", label: "Photos", icon: "📸" },
  { id: "reels", label: "Reels", icon: "🎬" },
  { id: "saved", label: "Saved", icon: "🔖" },
];

export default function Profile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  
  // Profile data
  const [profileUser, setProfileUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Content
  const [activeTab, setActiveTab] = useState("posts");
  const [posts, setPosts] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [reels, setReels] = useState([]);
  const [contentLoading, setContentLoading] = useState(false);
  
  // Stats
  const [stats, setStats] = useState({
    posts: 0,
    followers: 0,
    following: 0,
  });
  
  // Is this the current user's profile?
  const isOwnProfile = useMemo(() => {
    if (!currentUser || !profileUser) return false;
    return String(currentUser._id || currentUser.id) === String(profileUser._id || profileUser.id);
  }, [currentUser, profileUser]);
  
  // Is current user following this profile?
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  // Load user profile
  useEffect(() => {
    // If no ID in URL, use current user's ID
    const profileId = id || (currentUser?._id || currentUser?.id);
    if (profileId) {
      loadProfile(profileId);
    }
  }, [id, currentUser]);

  // Load content when tab changes
  useEffect(() => {
    if (profileUser) {
      loadContent(activeTab);
    }
  }, [activeTab, profileUser]);

  const loadProfile = async (userId) => {
    try {
      setLoading(true);
      setError("");
      
      const res = await api.get(`/users/${userId}`);
      
      if (res.data?.ok && res.data?.user) {
        setProfileUser(res.data.user);
        
        // Calculate stats
        const user = res.data.user;
        setStats({
          posts: user.postsCount || 0,
          followers: user.followers?.length || user.followersCount || 0,
          following: user.following?.length || user.followingCount || 0,
        });
        
        // Check if current user is following
        if (currentUser && user.followers) {
          const isFollowingUser = user.followers.some(
            f => String(f) === String(currentUser._id || currentUser.id)
          );
          setIsFollowing(isFollowingUser);
        }
      } else {
        setError("User not found");
      }
    } catch (err) {
      console.error("Profile load error:", err);
      setError("Could not load profile");
    } finally {
      setLoading(false);
    }
  };

  const loadContent = async (tab) => {
    if (!profileUser) return;
    
    setContentLoading(true);
    try {
      const userId = profileUser._id || profileUser.id;
      
      switch (tab) {
        case "posts":
          const postsRes = await api.get(`/powerfeed/posts?userId=${userId}&limit=30`);
          setPosts(postsRes.data?.posts || []);
          break;
          
        case "photos":
          const photosRes = await api.get(`/powergram?userId=${userId}&limit=30`);
          setPhotos(photosRes.data?.posts || photosRes.data?.items || []);
          break;
          
        case "reels":
          const reelsRes = await api.get(`/powerreel?userId=${userId}&limit=30`);
          setReels(reelsRes.data?.reels || reelsRes.data?.items || []);
          break;
          
        case "saved":
          // Only load saved for own profile
          if (isOwnProfile) {
            const savedRes = await api.get(`/users/saved`);
            // Combine different saved content types
            setPosts(savedRes.data?.saved || []);
          }
          break;
      }
    } catch (err) {
      console.warn("Content load error:", err);
    } finally {
      setContentLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!currentUser || !profileUser) return;
    
    setFollowLoading(true);
    try {
      const userId = profileUser._id || profileUser.id;
      const res = await api.post(`/users/${userId}/follow`);
      
      if (res.data?.ok) {
        setIsFollowing(res.data.following);
        setStats(prev => ({
          ...prev,
          followers: res.data.followersCount || prev.followers + (res.data.following ? 1 : -1),
        }));
      }
    } catch (err) {
      console.error("Follow error:", err);
    } finally {
      setFollowLoading(false);
    }
  };

  const handleEditProfile = () => {
    navigate("/settings/profile");
  };

  // Get user initials
  const getInitials = (name) => {
    if (!name) return "U";
    const parts = name.split(" ");
    return parts.map(p => p[0]).join("").toUpperCase().slice(0, 2);
  };

  // Format number (1000 -> 1K)
  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  if (loading) {
    return (
      <div className="ps-page" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
        <div style={{ textAlign: "center", color: "var(--ps-gold)" }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>⚡</div>
          <div>Loading profile...</div>
        </div>
      </div>
    );
  }

  if (error || !profileUser) {
    return (
      <div className="ps-page" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>👤</div>
          <h2 style={{ color: "#fff", marginBottom: 8 }}>User Not Found</h2>
          <p style={{ color: "#888", marginBottom: 24 }}>{error || "This profile doesn't exist"}</p>
          <button
            onClick={() => navigate(-1)}
            style={{
              padding: "10px 24px",
              background: "var(--ps-gold)",
              color: "#000",
              border: "none",
              borderRadius: 8,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="ps-page" style={{ paddingBottom: 80 }}>
      {/* Profile Header */}
      <div
        style={{
          background: "linear-gradient(135deg, rgba(255,184,77,0.1), rgba(0,0,0,0.8))",
          borderRadius: 16,
          padding: 24,
          marginBottom: 24,
        }}
      >
        <div style={{ display: "flex", gap: 24, alignItems: "flex-start", flexWrap: "wrap" }}>
          {/* Avatar */}
          <div
            style={{
              width: 120,
              height: 120,
              borderRadius: "50%",
              background: profileUser.avatarUrl 
                ? `url(${profileUser.avatarUrl}) center/cover`
                : "linear-gradient(135deg, var(--ps-gold), #c9a000)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 40,
              fontWeight: 700,
              color: "#000",
              border: "4px solid var(--ps-gold)",
              boxShadow: "0 0 20px rgba(255,184,77,0.3)",
              flexShrink: 0,
            }}
          >
            {!profileUser.avatarUrl && getInitials(profileUser.name)}
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 12, flexWrap: "wrap" }}>
              <h1 style={{ fontSize: 24, fontWeight: 700, color: "#fff", margin: 0 }}>
                {profileUser.name || profileUser.displayName || "User"}
              </h1>
              
              {isOwnProfile ? (
                <button
                  onClick={handleEditProfile}
                  style={{
                    padding: "8px 20px",
                    background: "rgba(255,255,255,0.1)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: 8,
                    color: "#fff",
                    fontWeight: 600,
                    cursor: "pointer",
                    fontSize: 14,
                  }}
                >
                  ✏️ Edit Profile
                </button>
              ) : (
                <button
                  onClick={handleFollow}
                  disabled={followLoading || !currentUser}
                  style={{
                    padding: "8px 24px",
                    background: isFollowing ? "transparent" : "var(--ps-gold)",
                    border: isFollowing ? "1px solid var(--ps-gold)" : "none",
                    borderRadius: 8,
                    color: isFollowing ? "var(--ps-gold)" : "#000",
                    fontWeight: 600,
                    cursor: currentUser ? "pointer" : "not-allowed",
                    fontSize: 14,
                    opacity: followLoading ? 0.7 : 1,
                  }}
                >
                  {followLoading ? "..." : isFollowing ? "Following" : "Follow"}
                </button>
              )}
              
              {!isOwnProfile && currentUser && (
                <button
                  onClick={() => navigate(`/powerline?user=${profileUser._id || profileUser.id}`)}
                  style={{
                    padding: "8px 16px",
                    background: "rgba(255,255,255,0.1)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: 8,
                    color: "#fff",
                    fontWeight: 600,
                    cursor: "pointer",
                    fontSize: 14,
                  }}
                >
                  💬 Message
                </button>
              )}
            </div>

            {/* Stats */}
            <div style={{ display: "flex", gap: 32, marginBottom: 16 }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: "#fff" }}>{formatNumber(stats.posts)}</div>
                <div style={{ fontSize: 13, color: "#888" }}>Posts</div>
              </div>
              <div style={{ textAlign: "center", cursor: "pointer" }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: "#fff" }}>{formatNumber(stats.followers)}</div>
                <div style={{ fontSize: 13, color: "#888" }}>Followers</div>
              </div>
              <div style={{ textAlign: "center", cursor: "pointer" }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: "#fff" }}>{formatNumber(stats.following)}</div>
                <div style={{ fontSize: 13, color: "#888" }}>Following</div>
              </div>
            </div>

            {/* Bio */}
            <div style={{ color: "#ccc", fontSize: 14, lineHeight: 1.5 }}>
              {profileUser.bio || (isOwnProfile ? "Add a bio to tell people about yourself..." : "No bio yet")}
            </div>
            
            {profileUser.website && (
              <a
                href={profileUser.website}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "var(--ps-gold)", fontSize: 14, marginTop: 8, display: "inline-block" }}
              >
                🔗 {profileUser.website}
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
          marginBottom: 24,
          gap: 8,
        }}
      >
        {TABS.map((tab) => {
          // Only show saved tab for own profile
          if (tab.id === "saved" && !isOwnProfile) return null;
          
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                padding: "12px 16px",
                background: activeTab === tab.id ? "rgba(255,184,77,0.1)" : "transparent",
                border: "none",
                borderBottom: activeTab === tab.id ? "2px solid var(--ps-gold)" : "2px solid transparent",
                color: activeTab === tab.id ? "var(--ps-gold)" : "#888",
                fontWeight: 600,
                fontSize: 14,
                cursor: "pointer",
                transition: "all 0.2s",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content Grid */}
      {contentLoading ? (
        <div style={{ textAlign: "center", padding: 40, color: "#888" }}>
          <div style={{ fontSize: 24, marginBottom: 12 }}>⏳</div>
          <div>Loading {activeTab}...</div>
        </div>
      ) : (
        <div>
          {activeTab === "posts" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {posts.length === 0 ? (
                <EmptyState
                  icon="📱"
                  title="No Posts Yet"
                  message={isOwnProfile ? "Share your first post!" : "This user hasn't posted yet"}
                />
              ) : (
                posts.map((post) => (
                  <PostCard key={post._id || post.id} post={post} onUserClick={() => {}} />
                ))
              )}
            </div>
          )}

          {activeTab === "photos" && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 4,
              }}
            >
              {photos.length === 0 ? (
                <div style={{ gridColumn: "1 / -1" }}>
                  <EmptyState
                    icon="📸"
                    title="No Photos Yet"
                    message={isOwnProfile ? "Share your first photo!" : "No photos to display"}
                  />
                </div>
              ) : (
                photos.map((photo) => (
                  <div
                    key={photo._id || photo.id}
                    onClick={() => navigate(`/powergram/${photo._id || photo.id}`)}
                    style={{
                      aspectRatio: "1",
                      background: photo.imageUrl || photo.mediaUrl
                        ? `url(${photo.imageUrl || photo.mediaUrl}) center/cover`
                        : "#222",
                      borderRadius: 4,
                      cursor: "pointer",
                      position: "relative",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background: "rgba(0,0,0,0.5)",
                        opacity: 0,
                        transition: "opacity 0.2s",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 16,
                        color: "#fff",
                        fontWeight: 600,
                      }}
                      className="photo-hover"
                    >
                      <span>❤️ {photo.likes?.length || 0}</span>
                      <span>💬 {photo.comments?.length || 0}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "reels" && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 4,
              }}
            >
              {reels.length === 0 ? (
                <div style={{ gridColumn: "1 / -1" }}>
                  <EmptyState
                    icon="🎬"
                    title="No Reels Yet"
                    message={isOwnProfile ? "Create your first reel!" : "No reels to display"}
                  />
                </div>
              ) : (
                reels.map((reel) => (
                  <div
                    key={reel._id || reel.id}
                    onClick={() => navigate(`/powerreel?v=${reel._id || reel.id}`)}
                    style={{
                      aspectRatio: "9/16",
                      background: reel.thumbnailUrl || reel.posterUrl
                        ? `url(${reel.thumbnailUrl || reel.posterUrl}) center/cover`
                        : "#222",
                      borderRadius: 8,
                      cursor: "pointer",
                      position: "relative",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        bottom: 8,
                        left: 8,
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        color: "#fff",
                        fontSize: 12,
                        fontWeight: 600,
                        textShadow: "0 1px 3px rgba(0,0,0,0.8)",
                      }}
                    >
                      <span>▶</span>
                      <span>{reel.views || 0}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "saved" && isOwnProfile && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {posts.length === 0 ? (
                <EmptyState
                  icon="🔖"
                  title="No Saved Items"
                  message="Save posts to view them here later"
                />
              ) : (
                posts.map((post) => (
                  <PostCard key={post._id || post.id} post={post} onUserClick={() => {}} />
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* Hover styles */}
      <style>{`
        .photo-hover:hover {
          opacity: 1 !important;
        }
      `}</style>
    </div>
  );
}

// Empty state component
function EmptyState({ icon, title, message }) {
  return (
    <div style={{ textAlign: "center", padding: 60, color: "#888" }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>{icon}</div>
      <h3 style={{ color: "#fff", marginBottom: 8, fontSize: 18 }}>{title}</h3>
      <p style={{ fontSize: 14 }}>{message}</p>
    </div>
  );
}

// Simple post card for profile
function PostCard({ post, onUserClick }) {
  const navigate = useNavigate();
  
  const author = post.user || post.author || {};
  const authorName = author.name || post.authorName || "User";
  
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.03)",
        borderRadius: 12,
        padding: 16,
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: author.avatarUrl
              ? `url(${author.avatarUrl}) center/cover`
              : "var(--ps-gold)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#000",
            fontWeight: 700,
            fontSize: 14,
          }}
        >
          {!author.avatarUrl && (authorName[0] || "U")}
        </div>
        <div>
          <div style={{ fontWeight: 600, color: "#fff", fontSize: 14 }}>{authorName}</div>
          <div style={{ fontSize: 12, color: "#888" }}>
            {new Date(post.createdAt).toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Content */}
      {post.text && (
        <p style={{ color: "#ddd", fontSize: 14, lineHeight: 1.5, marginBottom: 12 }}>
          {post.text}
        </p>
      )}

      {/* Media */}
      {(post.imageUrl || post.mediaUrl) && (
        <div
          style={{
            borderRadius: 8,
            overflow: "hidden",
            marginBottom: 12,
          }}
        >
          <img
            src={post.imageUrl || post.mediaUrl}
            alt=""
            style={{ width: "100%", display: "block" }}
          />
        </div>
      )}

      {/* Stats */}
      <div style={{ display: "flex", gap: 16, color: "#888", fontSize: 13 }}>
        <span>❤️ {post.likes?.length || 0}</span>
        <span>💬 {post.comments?.length || 0}</span>
        <span>🔄 {post.shares || 0}</span>
      </div>
    </div>
  );
}
