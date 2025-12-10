import React, { useEffect, useState } from 'react';
import axios from 'axios';
import PostForm from '../components/PostForm';
import PostCard from '../components/PostCard';
import styles from '../styles/feed.module.css';

const FeedPage = () => {
  const [posts, setPosts] = useState([]);

  const fetchPosts = async () => {
    try {
      const res = await axios.get('http://localhost:5001/api/feed');
      setPosts(res.data);
    } catch (err) {
      console.error('Error fetching posts:', err);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <div className={styles.feedContainer}>
      <h1 className={styles.title}>PowerFeed</h1>
      <PostForm onPostCreated={fetchPosts} />
      <div className={styles.postsContainer}>
        {posts.map((post) => (
          <PostCard key={post._id} post={post} />
        ))}
      </div>
    </div>
  );
};

export default FeedPage;
