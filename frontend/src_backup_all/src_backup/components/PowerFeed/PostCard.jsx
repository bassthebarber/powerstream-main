import React from "react";
import PowerComment from "./PowerComment.jsx";
import PowerLike from "./PowerLike.jsx";
import PowerShare from "./PowerShare.jsx";
import PowerLiveCounter from "./PowerLiveCounter.jsx";
import PowerReport from "./PowerReport.jsx";

export default function PostCard({ post }) {
  return (
    <div className="post-card">
      <h3>{post.author}</h3>
      <p>{post.content}</p>
      <PowerLike postId={post.id} />
      <PowerComment postId={post.id} />
      <PowerShare postContent={post.content} />
      <PowerReport postId={post.id} />
      <PowerLiveCounter postId={post.id} />
    </div>
  );
}


