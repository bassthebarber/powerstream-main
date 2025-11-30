// src/components/feed/PowerCummin.jsx
import { useState } from 'react';

export default function PowerCummin({ postId }) {
  const [comment, setComment] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment) return;
    // Call backend (commentPost) API to submit
    // await commentPost(postId, comment);
    setComment('');
  };

  return (
    <form onSubmit={handleSubmit} className="comment-form">
      <input
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Add a comment..."
      />
      <button type="submit">Post</button>
    </form>
  );
}


