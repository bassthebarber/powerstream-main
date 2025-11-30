// src/components/feed/PostMetrics.jsx
export default function PostMetrics({ post }) {
  return (
    <div className="post-metrics">
      <p>❤️ {post.likes} likes | 💬 {post.comments?.length || 0} comments | 👁️ {post.views} views</p>
    </div>
  );
}


