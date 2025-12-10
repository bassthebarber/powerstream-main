import React, { useEffect, useState } from 'react';
import { listPosts, subscribePosts } from '../../services/feedApi';
import PostCard from './PostCard';

export default function PostList() {
  const [posts, setPosts] = useState([]);

  const refresh = async () => setPosts(await listPosts());

  useEffect(() => {
    refresh();
    const sub = subscribePosts(refresh);
    return () => { try { sub.unsubscribe(); } catch {} };
  }, []);

  return (
    <div className="post-list">
      {posts.length ? posts.map((post) => (
        <PostCard key={post.id} post={post} onChanged={refresh} />
      )) : <p>No posts yet.</p>}
    </div>
  );
}


