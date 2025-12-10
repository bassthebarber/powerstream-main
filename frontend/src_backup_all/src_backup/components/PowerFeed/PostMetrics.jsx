// frontend/src/components/powerfeed/PostMetrics.js
import React from 'react';

export default function PostMetrics({ post }) {
  return (
    <div className="text-xs text-gray-500 mb-1">
      <span>{post.likes} Likes</span> · <span>{post.comments} Comments</span>
    </div>
  );
}


