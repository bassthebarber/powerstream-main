// frontend/src/pages/PowerFeed.jsx
// PowerFeed - Facebook-Class Social Feed with Complete Features
// Chief Engineer Edition - Full FB-Style Rebuild
import React, { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import api, { fetchSuggestedUsers as fetchSuggestedUsersApi } from "../lib/api.js";
import "../styles/powerfeed-fb.css";

// Reaction types with emojis
const REACTIONS = [
  { type: "like", emoji: "👍", label: "Like", color: "#2d88ff" },
  { type: "love", emoji: "❤️", label: "Love", color: "#f33e58" },
  { type: "haha", emoji: "😂", label: "Haha", color: "#f7b928" },
  { type: "wow", emoji: "😮", label: "Wow", color: "#f7b928" },
  { type: "sad", emoji: "😢", label: "Sad", color: "#f7b928" },
  { type: "angry", emoji: "😠", label: "Angry", color: "#e9710f" },
];

export default function PowerFeed() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const fileInputRef = useRef(null);
  const loadMoreRef = useRef(null);
  
  // Core state
  const [posts, setPosts] = useState([]);
  const [pinnedPosts, setPinnedPosts] = useState([]);
  const [stories, setStories] = useState([]);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [trendingTopics, setTrendingTopics] = useState([]);
  const [liveUsers, setLiveUsers] = useState([]);
  
  // Loading states
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  
  // Composer state
  const [newPost, setNewPost] = useState({ text: "", mediaUrl: "", mediaType: "none" });
  const [mediaPreview, setMediaPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [posting, setPosting] = useState(false);
  const [postError, setPostError] = useState(null);
  const [composerExpanded, setComposerExpanded] = useState(false);
  
  // Messenger dock state
  const [messengerOpen, setMessengerOpen] = useState(false);
  const [activeChats, setActiveChats] = useState([]);
  const [unreadCount, setUnreadCount] = useState(3);

  // User info memos
  const userId = useMemo(() => user?.id || user?._id || null, [user]);
  const displayName = useMemo(() => 
    user?.name || user?.displayName || user?.email?.split("@")[0] || "Guest", [user]);
  const avatarUrl = useMemo(() => user?.avatarUrl || user?.avatar || null, [user]);
  const initials = useMemo(() => {
    if (!displayName || displayName === "Guest") return "P";
    const parts = displayName.split(" ");
    return ((parts[0]?.[0] || "") + (parts[1]?.[0] || "")).toUpperCase() || "P";
  }, [displayName]);

  // Initial data fetch
  useEffect(() => {
    fetchPosts(1);
    fetchStories();
    fetchSuggestedUsers();
    fetchTrendingTopics();
    fetchLiveUsers();
  }, []);

  // Infinite scroll observer
  useEffect(() => {
    if (!loadMoreRef.current || !hasMore || loadingMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, page]);

  // Data fetching functions
  const fetchPosts = async (pageNum = 1, append = false) => {
    try {
      if (!append) setLoading(true);
      const res = await api.get(`/powerfeed/posts?limit=20&page=${pageNum}`);
      let fetchedPosts = res.data?.posts || res.data || [];
      
      // Separate pinned posts
      const pinned = fetchedPosts.filter(p => p.isPinned);
      const regular = fetchedPosts.filter(p => !p.isPinned);
      
      if (append) {
        setPosts(prev => [...prev, ...regular]);
      } else {
        setPinnedPosts(pinned);
        setPosts(regular);
      }
      setHasMore(fetchedPosts.length >= 20);
    } catch (err) {
      console.warn("Feed load error:", err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMore = useCallback(() => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPosts(nextPage, true);
  }, [page, loadingMore, hasMore]);

  const fetchStories = async () => {
    try {
      const res = await api.get("/stories?limit=15");
      if (res.data?.stories) setStories(res.data.stories);
    } catch {
      // Mock stories if endpoint unavailable
      setStories([
        { _id: "s1", user: { name: "Southern Power", avatarUrl: null }, hasNewStory: true },
        { _id: "s2", user: { name: "No Limit", avatarUrl: null }, hasNewStory: true },
        { _id: "s3", user: { name: "Studio Pro", avatarUrl: null }, hasNewStory: false },
        { _id: "s4", user: { name: "Texas Got Talent", avatarUrl: null }, hasNewStory: true },
        { _id: "s5", user: { name: "Beat Makers", avatarUrl: null }, hasNewStory: false },
      ]);
    }
  };

  const fetchSuggestedUsers = async () => {
    const result = await fetchSuggestedUsersApi(8);
    if (result?.users) {
      setSuggestedUsers(result.users);
    } else {
      // Mock data
      setSuggestedUsers([
        { _id: "u1", name: "Southern Power", role: "Artist", followers: 12400 },
        { _id: "u2", name: "No Limit Houston", role: "Producer", followers: 8900 },
        { _id: "u3", name: "Studio Pro", role: "Engineer", followers: 5600 },
        { _id: "u4", name: "Texas Beats", role: "Beatmaker", followers: 3200 },
      ]);
    }
  };

  const fetchTrendingTopics = async () => {
    try {
      const res = await api.get("/trending/topics?limit=5");
      if (res.data?.topics) setTrendingTopics(res.data.topics);
    } catch {
      setTrendingTopics([
        { _id: "t1", name: "#NewMusic", posts: 2400, trend: "up" },
        { _id: "t2", name: "#StudioSession", posts: 1800, trend: "up" },
        { _id: "t3", name: "#LiveNow", posts: 924, trend: "stable" },
        { _id: "t4", name: "#BeatsForSale", posts: 756, trend: "up" },
        { _id: "t5", name: "#Collab", posts: 543, trend: "down" },
      ]);
    }
  };

  const fetchLiveUsers = async () => {
    try {
      const res = await api.get("/live/active?limit=5");
      if (res.data?.users) setLiveUsers(res.data.users);
    } catch {
      setLiveUsers([
        { _id: "l1", name: "DJ SouthSide", viewers: 234, type: "music" },
        { _id: "l2", name: "Studio Session", viewers: 156, type: "recording" },
      ]);
    }
  };

  // Post actions
  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPost.text.trim() && !newPost.mediaUrl) return;
    if (!userId) {
      setPostError("Please log in to post");
      return;
    }

    setPosting(true);
    setPostError(null);

    try {
      const res = await api.post("/powerfeed/posts", {
        text: newPost.text,
        mediaUrl: newPost.mediaUrl,
        mediaType: newPost.mediaType,
      });
      
      if (res.data?.post || res.data?._id) {
        const newPostData = res.data.post || res.data;
        setPosts(prev => [{
          ...newPostData,
          user: { name: displayName, avatarUrl, _id: userId },
          createdAt: new Date().toISOString(),
          reactions: {},
          comments: [],
        }, ...prev]);
        setNewPost({ text: "", mediaUrl: "", mediaType: "none" });
        setMediaPreview(null);
        setComposerExpanded(false);
      }
    } catch (err) {
      setPostError("Failed to create post");
    } finally {
      setPosting(false);
    }
  };

  const handleReaction = async (postId, reactionType) => {
    try {
      await api.post(`/powerfeed/posts/${postId}/react`, { type: reactionType });
      setPosts(prev => prev.map(p => {
        if (p._id === postId) {
          const reactions = { ...p.reactions };
          // Toggle reaction
          if (reactions[userId] === reactionType) {
            delete reactions[userId];
          } else {
            reactions[userId] = reactionType;
          }
          return { ...p, reactions };
        }
        return p;
      }));
    } catch (err) {
      console.warn("Reaction error:", err);
    }
  };

  const handleComment = async (postId, text, parentId = null) => {
    if (!text.trim()) return;
    try {
      await api.post(`/powerfeed/posts/${postId}/comment`, { text, parentId });
      setPosts(prev => prev.map(p => {
        if (p._id === postId) {
          const newComment = {
            _id: Date.now().toString(),
            text,
            parentId,
            user: { name: displayName, avatarUrl },
            createdAt: new Date().toISOString(),
            replies: [],
          };
          return { ...p, comments: [...(p.comments || []), newComment] };
        }
        return p;
      }));
    } catch (err) {
      console.warn("Comment error:", err);
    }
  };

  const handleShare = async (postId, shareType) => {
    const post = posts.find(p => p._id === postId);
    if (!post) return;

    switch (shareType) {
      case "feed":
        // Share to own feed
        await api.post(`/powerfeed/posts/${postId}/share`);
        break;
      case "messenger":
        // Open messenger with post
        setActiveChats([{ type: "share", postId }]);
        setMessengerOpen(true);
        break;
      case "copy":
        navigator.clipboard?.writeText(`${window.location.origin}/post/${postId}`);
        break;
      case "reel":
        navigate("/powerreel", { state: { mode: "create", prefillMedia: post.mediaUrl } });
        break;
      default:
        break;
    }
  };

  const handleFollow = async (targetUserId) => {
    try {
      await api.post(`/users/${targetUserId}/follow`);
      setSuggestedUsers(prev => prev.filter(u => u._id !== targetUserId));
    } catch (err) {
      console.warn("Follow error:", err);
    }
  };

  // File upload
  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith("video/");
    const isImage = file.type.startsWith("image/");
    if (!isVideo && !isImage) return;

    const previewUrl = URL.createObjectURL(file);
    setMediaPreview({ url: previewUrl, type: isVideo ? "video" : "image" });
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await api.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data?.url) {
        setNewPost(prev => ({
          ...prev,
          mediaUrl: res.data.url,
          mediaType: isVideo ? "video" : "image",
        }));
      }
    } catch (err) {
      console.warn("Upload failed:", err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fb-feed">
      <input type="file" ref={fileInputRef} hidden accept="image/*,video/*" onChange={handleFileSelect} />

      {/* HEADER */}
      <header className="fb-header">
        <div className="fb-header-left">
          <div className="fb-logo">PowerStream</div>
          <div className="fb-search">
            <span className="fb-search-icon">🔍</span>
            <input type="text" placeholder="Search PowerStream" />
          </div>
        </div>
        <nav className="fb-header-nav">
          <button className="fb-nav-btn fb-nav-btn--active" title="Home">🏠</button>
          <button className="fb-nav-btn" title="Reels" onClick={() => navigate("/powerreel")}>🎬</button>
          <button className="fb-nav-btn" title="TV" onClick={() => navigate("/tv-stations")}>📺</button>
          <button className="fb-nav-btn" title="Studio" onClick={() => navigate("/studio")}>🎛️</button>
          <button className="fb-nav-btn" title="Groups">👥</button>
        </nav>
        <div className="fb-header-right">
          <button className="fb-icon-btn" onClick={() => navigate("/powergram")}>➕</button>
          <button className="fb-icon-btn fb-messenger-btn" onClick={() => setMessengerOpen(!messengerOpen)}>
            💬
            {unreadCount > 0 && <span className="fb-badge">{unreadCount}</span>}
          </button>
          <button className="fb-icon-btn">🔔<span className="fb-badge">5</span></button>
          <button className="fb-avatar-btn">
            {avatarUrl ? <img src={avatarUrl} alt="" /> : <span>{initials}</span>}
          </button>
        </div>
      </header>

      {/* MAIN LAYOUT */}
      <div className="fb-layout">
        {/* LEFT SIDEBAR */}
        <aside className="fb-sidebar-left">
          <div className="fb-profile-card" onClick={() => navigate("/profile")}>
            <div className="fb-profile-avatar">
              {avatarUrl ? <img src={avatarUrl} alt="" /> : <span>{initials}</span>}
            </div>
            <span className="fb-profile-name">{displayName}</span>
          </div>

          <nav className="fb-sidebar-nav">
            <a className="fb-sidebar-item fb-sidebar-item--active">
              <span className="fb-sidebar-icon">📱</span>
              <span>Feed</span>
            </a>
            <a className="fb-sidebar-item" onClick={() => navigate("/powergram")}>
              <span className="fb-sidebar-icon">📸</span>
              <span>PowerGram</span>
            </a>
            <a className="fb-sidebar-item" onClick={() => navigate("/powerreel")}>
              <span className="fb-sidebar-icon">🎞️</span>
              <span>PowerReel</span>
            </a>
            <a className="fb-sidebar-item" onClick={() => navigate("/powerline")}>
              <span className="fb-sidebar-icon">💬</span>
              <span>Messenger</span>
            </a>
            <a className="fb-sidebar-item" onClick={() => navigate("/tv-stations")}>
              <span className="fb-sidebar-icon">📺</span>
              <span>Watch</span>
            </a>
            <a className="fb-sidebar-item" onClick={() => navigate("/studio")}>
              <span className="fb-sidebar-icon">🎛️</span>
              <span>Studio</span>
            </a>
            <a className="fb-sidebar-item">
              <span className="fb-sidebar-icon">🛍️</span>
              <span>Marketplace</span>
            </a>
            <a className="fb-sidebar-item">
              <span className="fb-sidebar-icon">📅</span>
              <span>Events</span>
            </a>
            <a className="fb-sidebar-item">
              <span className="fb-sidebar-icon">💾</span>
              <span>Saved</span>
            </a>
          </nav>

          {/* Live Now Section */}
          {liveUsers.length > 0 && (
            <div className="fb-live-section">
              <h4>🔴 Live Now</h4>
              {liveUsers.map(live => (
                <div key={live._id} className="fb-live-item">
                  <div className="fb-live-indicator"></div>
                  <span className="fb-live-name">{live.name}</span>
                  <span className="fb-live-viewers">{live.viewers} watching</span>
                </div>
              ))}
            </div>
          )}
        </aside>

        {/* CENTER FEED */}
        <main className="fb-main">
          {/* Stories Bar */}
          <section className="fb-stories">
            <div className="fb-stories-scroll">
              {/* Create Story */}
              <div className="fb-story fb-story--create" onClick={() => navigate("/powergram", { state: { mode: "story" } })}>
                <div className="fb-story-avatar">
                  {avatarUrl ? <img src={avatarUrl} alt="" /> : <span>{initials}</span>}
                </div>
                <div className="fb-story-create-plus">+</div>
                <span className="fb-story-name">Create Story</span>
              </div>

              {/* User Stories */}
              {stories.map(story => (
                <div key={story._id} className={`fb-story ${story.hasNewStory ? "fb-story--new" : ""}`}>
                  <div className="fb-story-ring">
                    <div className="fb-story-avatar">
                      {story.user?.avatarUrl ? (
                        <img src={story.user.avatarUrl} alt="" />
                      ) : (
                        <span>{story.user?.name?.[0] || "U"}</span>
                      )}
                    </div>
                  </div>
                  <span className="fb-story-name">{story.user?.name || "User"}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Post Composer */}
          <section className="fb-composer">
            <div className="fb-composer-top">
              <div className="fb-composer-avatar">
                {avatarUrl ? <img src={avatarUrl} alt="" /> : <span>{initials}</span>}
              </div>
              <button 
                className="fb-composer-trigger"
                onClick={() => setComposerExpanded(true)}
              >
                What's on your mind, {displayName.split(" ")[0]}?
              </button>
            </div>
            <div className="fb-composer-divider"></div>
            <div className="fb-composer-actions">
              <button className="fb-composer-action" onClick={() => navigate("/powerharmony/live")}>
                <span className="fb-composer-action-icon fb-composer-action-icon--live">🔴</span>
                Live Video
              </button>
              <button className="fb-composer-action" onClick={() => fileInputRef.current?.click()}>
                <span className="fb-composer-action-icon fb-composer-action-icon--photo">🖼️</span>
                Photo/Video
              </button>
              <button className="fb-composer-action">
                <span className="fb-composer-action-icon fb-composer-action-icon--feeling">😊</span>
                Feeling/Activity
              </button>
            </div>
          </section>

          {/* Composer Modal */}
          {composerExpanded && (
            <div className="fb-composer-modal-overlay" onClick={() => setComposerExpanded(false)}>
              <div className="fb-composer-modal" onClick={e => e.stopPropagation()}>
                <div className="fb-composer-modal-header">
                  <h3>Create Post</h3>
                  <button className="fb-modal-close" onClick={() => setComposerExpanded(false)}>×</button>
                </div>
                <div className="fb-composer-modal-user">
                  <div className="fb-composer-avatar">
                    {avatarUrl ? <img src={avatarUrl} alt="" /> : <span>{initials}</span>}
                  </div>
                  <div>
                    <div className="fb-composer-modal-name">{displayName}</div>
                    <button className="fb-privacy-btn">🌍 Public ▾</button>
                  </div>
                </div>
                <form onSubmit={handleCreatePost}>
                  <textarea
                    className="fb-composer-textarea"
                    placeholder={`What's on your mind, ${displayName.split(" ")[0]}?`}
                    value={newPost.text}
                    onChange={e => setNewPost({ ...newPost, text: e.target.value })}
                    autoFocus
                  />
                  {mediaPreview && (
                    <div className="fb-composer-preview">
                      {mediaPreview.type === "video" ? (
                        <video src={mediaPreview.url} controls />
                      ) : (
                        <img src={mediaPreview.url} alt="Preview" />
                      )}
                      <button type="button" className="fb-preview-remove" onClick={() => {
                        setMediaPreview(null);
                        setNewPost(prev => ({ ...prev, mediaUrl: "", mediaType: "none" }));
                      }}>×</button>
                      {uploading && <div className="fb-upload-progress">Uploading...</div>}
                    </div>
                  )}
                  {postError && <div className="fb-error">{postError}</div>}
                  <div className="fb-composer-modal-footer">
                    <div className="fb-add-to-post">
                      <span>Add to your post</span>
                      <div className="fb-add-icons">
                        <button type="button" onClick={() => fileInputRef.current?.click()}>🖼️</button>
                        <button type="button">👤</button>
                        <button type="button">😊</button>
                        <button type="button">📍</button>
                        <button type="button">🎵</button>
                      </div>
                    </div>
                    <button 
                      type="submit" 
                      className="fb-post-submit"
                      disabled={posting || (!newPost.text.trim() && !newPost.mediaUrl)}
                    >
                      {posting ? "Posting..." : "Post"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Pinned Posts */}
          {pinnedPosts.map(post => (
            <PostCard 
              key={post._id}
              post={post}
              isPinned
              currentUserId={userId}
              onReaction={handleReaction}
              onComment={handleComment}
              onShare={handleShare}
              onNavigate={(path) => navigate(path)}
            />
          ))}

          {/* Feed Posts */}
          {loading ? (
            <div className="fb-loading">
              <div className="fb-spinner"></div>
            </div>
          ) : posts.length === 0 ? (
            <div className="fb-empty">
              <span>📭</span>
              <h3>No posts yet</h3>
              <p>Be the first to share something!</p>
            </div>
          ) : (
            posts.map(post => (
              <PostCard 
                key={post._id}
                post={post}
                currentUserId={userId}
                onReaction={handleReaction}
                onComment={handleComment}
                onShare={handleShare}
                onNavigate={(path) => navigate(path)}
              />
            ))
          )}

          {/* Load More */}
          <div ref={loadMoreRef} className="fb-load-more">
            {loadingMore && <div className="fb-spinner"></div>}
            {!hasMore && posts.length > 0 && (
              <div className="fb-end-of-feed">You're all caught up! 🎉</div>
            )}
          </div>
        </main>

        {/* RIGHT SIDEBAR */}
        <aside className="fb-sidebar-right">
          {/* Friend Suggestions */}
          <div className="fb-widget">
            <div className="fb-widget-header">
              <h4>People You May Know</h4>
              <button className="fb-see-all">See All</button>
            </div>
            {suggestedUsers.slice(0, 4).map(user => (
              <div key={user._id} className="fb-suggestion">
                <div className="fb-suggestion-avatar">
                  {user.avatarUrl ? <img src={user.avatarUrl} alt="" /> : <span>{user.name?.[0] || "U"}</span>}
                </div>
                <div className="fb-suggestion-info">
                  <div className="fb-suggestion-name">{user.name}</div>
                  <div className="fb-suggestion-meta">{user.role || "Artist"}</div>
                </div>
                <button className="fb-add-friend" onClick={() => handleFollow(user._id)}>
                  <span>+</span> Add
                </button>
              </div>
            ))}
          </div>

          {/* Trending Topics */}
          <div className="fb-widget">
            <div className="fb-widget-header">
              <h4>🔥 Trending</h4>
            </div>
            {trendingTopics.map(topic => (
              <div key={topic._id} className="fb-trending-item">
                <div className="fb-trending-name">{topic.name}</div>
                <div className="fb-trending-posts">{topic.posts?.toLocaleString()} posts</div>
                {topic.trend === "up" && <span className="fb-trend-up">📈</span>}
              </div>
            ))}
          </div>

          {/* Sponsored/Footer */}
          <div className="fb-footer-links">
            <a href="#">Privacy</a> · <a href="#">Terms</a> · <a href="#">Advertising</a> · <a href="#">Cookies</a>
            <div className="fb-copyright">PowerStream © 2024</div>
          </div>
        </aside>
      </div>

      {/* Messenger Dock */}
      <div className={`fb-messenger-dock ${messengerOpen ? "fb-messenger-dock--open" : ""}`}>
        <div className="fb-messenger-header" onClick={() => setMessengerOpen(!messengerOpen)}>
          <span>Chats</span>
          <div className="fb-messenger-icons">
            <button>⚙️</button>
            <button>✏️</button>
            <button>{messengerOpen ? "−" : "+"}</button>
          </div>
        </div>
        {messengerOpen && (
          <div className="fb-messenger-body">
            <input type="text" className="fb-messenger-search" placeholder="Search Messenger" />
            <div className="fb-messenger-chats">
              {activeChats.length === 0 ? (
                <div className="fb-messenger-empty">No recent chats</div>
              ) : (
                activeChats.map((chat, i) => (
                  <div key={i} className="fb-messenger-chat">
                    <div className="fb-messenger-chat-avatar">U</div>
                    <div className="fb-messenger-chat-info">
                      <div className="fb-messenger-chat-name">User {i + 1}</div>
                      <div className="fb-messenger-chat-preview">Last message...</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Post Card Component with FB-style features
function PostCard({ post, isPinned, currentUserId, onReaction, onComment, onShare, onNavigate }) {
  const [showReactions, setShowReactions] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const reactionTimeout = useRef(null);

  // Get author info
  const author = useMemo(() => {
    if (post.user && typeof post.user === "object") {
      return {
        id: post.user._id || post.user.id,
        name: post.user.name || post.user.displayName || "User",
        avatarUrl: post.user.avatarUrl || null,
      };
    }
    return { 
      id: post.userId || post.authorId,
      name: post.authorName || "User", 
      avatarUrl: post.authorAvatarUrl || null 
    };
  }, [post]);
  
  const goToProfile = () => {
    if (author.id && onNavigate) {
      onNavigate(`/profile/${author.id}`);
    }
  };

  const initials = author.name?.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || "U";

  // Time ago
  const timeAgo = useMemo(() => {
    if (!post.createdAt) return "";
    const diff = Date.now() - new Date(post.createdAt).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d`;
    return new Date(post.createdAt).toLocaleDateString();
  }, [post.createdAt]);

  // Reaction counts
  const reactionCounts = useMemo(() => {
    const counts = {};
    Object.values(post.reactions || {}).forEach(type => {
      counts[type] = (counts[type] || 0) + 1;
    });
    return counts;
  }, [post.reactions]);

  const totalReactions = Object.values(reactionCounts).reduce((a, b) => a + b, 0);
  const myReaction = post.reactions?.[currentUserId];
  const topReactions = Object.entries(reactionCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([type]) => REACTIONS.find(r => r.type === type)?.emoji);

  // Comment threads
  const rootComments = (post.comments || []).filter(c => !c.parentId);
  const getReplies = (parentId) => (post.comments || []).filter(c => c.parentId === parentId);

  const handleReactionHover = () => {
    reactionTimeout.current = setTimeout(() => setShowReactions(true), 500);
  };

  const handleReactionLeave = () => {
    clearTimeout(reactionTimeout.current);
    setShowReactions(false);
  };

  const handleSubmitComment = () => {
    if (commentText.trim()) {
      onComment(post._id, commentText, replyTo);
      setCommentText("");
      setReplyTo(null);
    }
  };

  return (
    <article className={`fb-post ${isPinned ? "fb-post--pinned" : ""}`}>
      {isPinned && (
        <div className="fb-post-pinned-badge">📌 Pinned Post</div>
      )}

      {/* Post Header */}
      <div className="fb-post-header">
        <div 
          className="fb-post-avatar"
          onClick={goToProfile}
          style={{ cursor: author.id ? "pointer" : "default" }}
        >
          {author.avatarUrl ? <img src={author.avatarUrl} alt="" /> : <span>{initials}</span>}
        </div>
        <div className="fb-post-meta">
          <div 
            className="fb-post-author"
            onClick={goToProfile}
            style={{ cursor: author.id ? "pointer" : "default" }}
          >
            {author.name}
          </div>
          <div className="fb-post-time">
            {timeAgo} · 🌍
            {post.isLive && <span className="fb-live-badge">🔴 LIVE</span>}
          </div>
        </div>
        <button className="fb-post-menu">···</button>
      </div>

      {/* Post Content */}
      {post.text && <div className="fb-post-text">{post.text}</div>}

      {/* Post Media */}
      {post.mediaUrl && (
        <div className="fb-post-media">
          {post.mediaType === "video" ? (
            <video src={post.mediaUrl} controls />
          ) : (
            <img src={post.mediaUrl} alt="" />
          )}
        </div>
      )}

      {/* Reaction & Comment Stats */}
      <div className="fb-post-stats">
        {totalReactions > 0 && (
          <div className="fb-post-reactions-count">
            <span className="fb-reaction-icons">{topReactions.join("")}</span>
            <span>{totalReactions}</span>
          </div>
        )}
        <div className="fb-post-engagement">
          {(post.comments?.length || 0) > 0 && (
            <span onClick={() => setShowComments(!showComments)}>
              {post.comments.length} comment{post.comments.length > 1 ? "s" : ""}
            </span>
          )}
          {(post.shares || 0) > 0 && <span>{post.shares} shares</span>}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="fb-post-actions">
        <div 
          className="fb-action-wrap"
          onMouseEnter={handleReactionHover}
          onMouseLeave={handleReactionLeave}
        >
          <button 
            className={`fb-action-btn ${myReaction ? "fb-action-btn--active" : ""}`}
            style={myReaction ? { color: REACTIONS.find(r => r.type === myReaction)?.color } : {}}
            onClick={() => onReaction(post._id, myReaction || "like")}
          >
            {myReaction ? REACTIONS.find(r => r.type === myReaction)?.emoji : "👍"} 
            {myReaction ? REACTIONS.find(r => r.type === myReaction)?.label : "Like"}
          </button>

          {/* Reaction Picker */}
          {showReactions && (
            <div className="fb-reaction-picker">
              {REACTIONS.map(r => (
                <button
                  key={r.type}
                  className="fb-reaction-option"
                  onClick={() => {
                    onReaction(post._id, r.type);
                    setShowReactions(false);
                  }}
                  title={r.label}
                >
                  {r.emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        <button className="fb-action-btn" onClick={() => setShowComments(!showComments)}>
          💬 Comment
        </button>

        <div className="fb-action-wrap">
          <button className="fb-action-btn" onClick={() => setShowShareMenu(!showShareMenu)}>
            ↗️ Share
          </button>
          {showShareMenu && (
            <div className="fb-share-menu">
              <button onClick={() => { onShare(post._id, "feed"); setShowShareMenu(false); }}>
                Share to Feed
              </button>
              <button onClick={() => { onShare(post._id, "messenger"); setShowShareMenu(false); }}>
                Send in Messenger
              </button>
              <button onClick={() => { onShare(post._id, "copy"); setShowShareMenu(false); }}>
                Copy Link
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="fb-comments">
          {/* Comment Input */}
          <div className="fb-comment-input">
            <div className="fb-comment-avatar">{currentUserId ? "Y" : "?"}</div>
            <div className="fb-comment-input-wrap">
              {replyTo && (
                <div className="fb-reply-indicator">
                  Replying to comment <button onClick={() => setReplyTo(null)}>×</button>
                </div>
              )}
              <input
                type="text"
                placeholder="Write a comment..."
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSubmitComment()}
              />
              <div className="fb-comment-actions">
                <button>😊</button>
                <button>📷</button>
                <button>GIF</button>
              </div>
            </div>
          </div>

          {/* Comment Threads */}
          {rootComments.map(comment => (
            <CommentThread
              key={comment._id}
              comment={comment}
              replies={getReplies(comment._id)}
              onReply={() => setReplyTo(comment._id)}
            />
          ))}
        </div>
      )}
    </article>
  );
}

// Comment Thread Component
function CommentThread({ comment, replies, onReply }) {
  const [showReplies, setShowReplies] = useState(false);

  const author = comment.user || {};
  const initials = author.name?.split(" ").map(w => w[0]).join("").slice(0, 2) || "U";

  return (
    <div className="fb-comment-thread">
      <div className="fb-comment">
        <div className="fb-comment-avatar">
          {author.avatarUrl ? <img src={author.avatarUrl} alt="" /> : <span>{initials}</span>}
        </div>
        <div className="fb-comment-content">
          <div className="fb-comment-bubble">
            <div className="fb-comment-author">{author.name || "User"}</div>
            <div className="fb-comment-text">{comment.text}</div>
          </div>
          <div className="fb-comment-meta">
            <button>Like</button>
            <button onClick={onReply}>Reply</button>
            <span>1h</span>
          </div>
        </div>
      </div>

      {/* Replies */}
      {replies.length > 0 && (
        <>
          {!showReplies && (
            <button className="fb-show-replies" onClick={() => setShowReplies(true)}>
              ↳ View {replies.length} {replies.length === 1 ? "reply" : "replies"}
            </button>
          )}
          {showReplies && (
            <div className="fb-replies">
              {replies.map(reply => (
                <div key={reply._id} className="fb-comment fb-comment--reply">
                  <div className="fb-comment-avatar">
                    {reply.user?.avatarUrl ? (
                      <img src={reply.user.avatarUrl} alt="" />
                    ) : (
                      <span>{reply.user?.name?.[0] || "U"}</span>
                    )}
                  </div>
                  <div className="fb-comment-content">
                    <div className="fb-comment-bubble">
                      <div className="fb-comment-author">{reply.user?.name || "User"}</div>
                      <div className="fb-comment-text">{reply.text}</div>
                    </div>
                    <div className="fb-comment-meta">
                      <button>Like</button>
                      <button>Reply</button>
                      <span>1h</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
