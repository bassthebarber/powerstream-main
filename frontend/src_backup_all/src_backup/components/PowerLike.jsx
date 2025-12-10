// src/components/feed/PowerLike.jsx
import { useState } from 'react';
import { likePost } from '../../services/feedApi';

export default function PowerLike({ postId, initialLikes = 0 }) {
  const [likes, setLikes] = useState(initialLikes);
  const [liked, setLiked] = useState(false);

  const handleLike = async () => {
    if (liked) return;
    setLiked(true);
    setLikes(likes + 1);
    await likePost(postId); // async backend call
  };

  return (
    <button onClick={handleLike} className="like-btn">
      ❤️ {likes} Like{likes !== 1 ? 's' : ''}
    </button>
  );
}


