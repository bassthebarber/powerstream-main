// src/components/feed/PostList.jsx
import { useEffect, useState } from "react";
import { listPosts, subscribePosts } from "../../services/feedApi";
import { listenForNewPosts } from "../../utils/RealTimePostSocket";
import PostCard from "./PostCard";

// Extra metrics and features
import PowerShare from "./PowerShare";
import PowerSave from "./PowerSave";
import PowerReport from "./PowerReport";
import PowerLike from "../PowerLike";
import PowerCummin from "../PowerCummin";
import PowerLiveCounter from "./PowerLiveCounter";
import PostMetrics from "./PostMetrics";

export default function PostList() {
  const [posts, setPosts] = useState([]);

  // Fetch post list
  const refresh = async () => {
    try {
      const data = await listPosts();
      setPosts(data);
    } catch (err) {
      console.error("Failed to fetch posts:", err);
    }
  };

  // Live updates
  useEffect(() => {
    refresh();

    const postSub = subscribePosts(() => refresh());

    // Real-time socket listener
    const socketSub = listenForNewPosts((newPost) => {
      setPosts((prev) => [newPost, ...prev]);
    });

    return () => {
      try { postSub.unsubscribe(); } catch {}
      try { socketSub.unsubscribe?.(); } catch {}
    };
  }, []);

  if (!posts.length) {
    return <p style={{ textAlign: "center", opacity: 0.7 }}>Be the first to post.</p>;
  }

  return (
    <>
      {posts.map((post) => (
        <div key={post.id} className="post-wrapper">
          <PostCard post={post} onChanged={refresh} />

          {/* Real-time metrics and counters */}
          <PostMetrics post={post} />
          <PowerLiveCounter postId={post.id} />
          <PowerLike postId={post.id} initialLikes={post.likes || 0} />
          <PowerCummin postId={post.id} />

          {/* Share/Save/Report actions */}
          <div className="post-actions">
            <PowerShare postId={post.id} />
            <PowerSave postId={post.id} />
            <PowerReport postId={post.id} />
          </div>
        </div>
      ))}
    </>
  );
}


